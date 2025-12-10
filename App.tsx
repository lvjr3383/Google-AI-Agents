
import React, { useState, useEffect, useCallback } from 'react';
import ChatPanel from './components/ChatPanel';
import Workspace from './components/Workspace';
import { TESLA_CORPUS } from './services/data';
import { chunkText, cosineSimilarity } from './services/ragUtils';
import { getEmbeddings, generateResponse, countTokens } from './services/geminiService';
import { Chunk, ChunkingSettings, Message, RagResult, RagStatus, AVAILABLE_MODELS, LlmModel } from './types';

function App() {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your RAG Visualizer for the Tesla Model X manual. Start by clicking 'Chunk Text' on the right to prepare the data, then ask me a question!",
      timestamp: Date.now(),
    },
  ]);

  const [chunkSettings, setChunkSettings] = useState<ChunkingSettings>({ chunkSize: 150, overlap: 30 });
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [topK, setTopK] = useState(4);
  const [selectedModel, setSelectedModel] = useState<LlmModel>(AVAILABLE_MODELS[0]);
  const [llmEnabled, setLlmEnabled] = useState(true);
  const [status, setStatus] = useState<RagStatus>(RagStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<RagResult>({
    question: '',
    preRagAnswer: '',
    ragAnswer: '',
    retrievedChunks: [],
    promptUsed: { preRag: '', rag: '' },
    loading: false
  });
  const [queryEmbedding, setQueryEmbedding] = useState<number[] | undefined>(undefined);

  // --- LOGIC ---

  // 1. Handle Chunking (Manual Trigger)
  const handleChunkText = useCallback(async () => {
    setStatus(RagStatus.CHUNKING);
    
    // Simulate a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    console.log("Chunking...");
    const newChunks = chunkText(TESLA_CORPUS, chunkSettings.chunkSize, chunkSettings.overlap);
    
    try {
        const texts = newChunks.map(c => c.text);
        const embeddings = await getEmbeddings(texts);
        newChunks.forEach((c, i) => c.embedding = embeddings[i]);
        setChunks(newChunks);
        
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Successfully created ${newChunks.length} chunks with size ${chunkSettings.chunkSize} and overlap ${chunkSettings.overlap}.`,
            timestamp: Date.now()
        }]);
    } catch (e) {
        console.error("Embedding generation failed for chunks", e);
        setChunks(newChunks);
    } finally {
        setStatus(RagStatus.IDLE);
    }

  }, [chunkSettings]);

  // 2. Handle User Message
  const handleSendMessage = async (text: string) => {
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    // Check for "System" commands (basic NLP simulation)
    const lower = text.toLowerCase();
    if (lower.includes('chunk size') && (lower.includes('increase') || lower.includes('decrease') || lower.includes('change'))) {
        handleSystemCommand(text);
        return;
    }

    if (chunks.length === 0) {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: "Please click the 'Chunk Text' button in the right panel first to prepare the documents.", 
            timestamp: Date.now() 
        }]);
        return;
    }

    // Assume QA
    await runRagPipeline(text);
  };

  const handleSystemCommand = (text: string) => {
     let newSize = chunkSettings.chunkSize;
     if (text.includes('250')) newSize = 250;
     else if (text.includes('100')) newSize = 100;
     else if (text.includes('increase')) newSize += 50;
     else if (text.includes('decrease')) newSize -= 50;

     setChunkSettings(prev => ({ ...prev, chunkSize: newSize }));
     
     const responseMsg: Message = {
         id: Date.now().toString(),
         role: 'assistant',
         content: `Updated settings to ${newSize} words. Click 'Chunk Text' to apply changes.`,
         timestamp: Date.now()
     };
     setMessages(prev => [...prev, responseMsg]);
  };

  // 3. RAG Pipeline
  const runRagPipeline = async (question: string) => {
    setStatus(RagStatus.EMBEDDING);
    setCurrentResult(prev => ({ ...prev, question, loading: true, error: undefined }));

    try {
        // A. Embed Query
        const [qEmb] = await getEmbeddings([question]);
        setQueryEmbedding(qEmb);

        // B. Calculate Similarities
        const scoredChunks = chunks.map(chunk => {
            if (!chunk.embedding) return { ...chunk, similarity: 0 };
            return {
                ...chunk,
                similarity: cosineSimilarity(qEmb, chunk.embedding)
            };
        });
        
        // Sort
        scoredChunks.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        
        // Update chunks state with similarity for visualization
        setChunks(scoredChunks);

        const retrieved = scoredChunks.slice(0, topK);

        // C. Construct Prompts
        const preRagPrompt = `Answer the following question as clearly and concisely as you can.\n\nQuestion: ${question}`;
        
        const contextText = retrieved.map((c, i) => `[Chunk ${i+1}] (Score: ${c.similarity?.toFixed(2)})\n${c.text}`).join('\n\n');
        
        // Updated Prompt: More explicit about strict grounding vs "I don't know"
        const ragPrompt = `You are a helpful assistant for a Tesla Model X owner. Answer the question based ONLY on the provided context chunks. Do not use outside knowledge. \n\nContext:\n${contextText}\n\nQuestion: ${question}\n\nIf the answer is not supported by the context, state "I do not know based on the provided documents."`;

        // Calculate Tokens
        let preRagTokens = 0;
        let ragTokens = 0;
        let contextTokens = 0;

        try {
            const [preCount, ragCount, ctxCount] = await Promise.all([
                countTokens(preRagPrompt),
                countTokens(ragPrompt),
                countTokens(contextText)
            ]);
            preRagTokens = preCount;
            ragTokens = ragCount;
            contextTokens = ctxCount;
        } catch (e) {
            console.warn("Token counting failed", e);
        }

        setCurrentResult(prev => ({
            ...prev,
            retrievedChunks: retrieved,
            promptUsed: { preRag: preRagPrompt, rag: ragPrompt },
            tokenCounts: { preRag: preRagTokens, rag: ragTokens, context: contextTokens }
        }));

        // D. Generation
        setStatus(RagStatus.GENERATING);
        let preAns = "";
        let ragAns = "";

        if (llmEnabled) {
            // Run in parallel
            const [preRes, ragRes] = await Promise.all([
                generateResponse(preRagPrompt),
                generateResponse(ragPrompt)
            ]);
            preAns = preRes;
            ragAns = ragRes;
        }

        setCurrentResult(prev => ({
            ...prev,
            preRagAnswer: preAns,
            ragAnswer: ragAns,
            loading: false
        }));

        // E. Chat Response Analysis
        let analysisText = "";
        const isRagUnknown = ragAns.toLowerCase().includes("i do not know");
        const isPreRagLong = preAns.length > 50;

        if (isRagUnknown && isPreRagLong) {
            analysisText = "Notice: The RAG model couldn't find the answer in the provided manual excerpts, so it correctly backed off ('I do not know'). The Pre-RAG model answered from its general training data, which might be correct but is technically a 'hallucination' relative to the provided source.";
        } else if (isRagUnknown) {
            analysisText = "The answer wasn't found in the retrieved chunks, so the model declined to answer.";
        } else {
            analysisText = "The model successfully found the answer in the retrieved context!";
        }

        const responseMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Pipeline complete.\n\n${analysisText}\n\n• Retrieved ${topK} chunks\n• Highest similarity: ${retrieved[0]?.similarity?.toFixed(2)}`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, responseMsg]);

    } catch (err) {
        console.error(err);
        setCurrentResult(prev => ({ ...prev, loading: false, error: "Pipeline failed. Check API configuration." }));
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Something went wrong during the RAG process.", timestamp: Date.now() }]);
    } finally {
        setStatus(RagStatus.IDLE);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* LEFT PANEL: Chat (30%) */}
      <div className="w-full md:w-[30%] h-[40vh] md:h-full flex-shrink-0 z-20 shadow-xl border-r border-slate-200">
        <ChatPanel 
            messages={messages} 
            onSendMessage={handleSendMessage}
            isProcessing={status !== RagStatus.IDLE}
        />
      </div>

      {/* RIGHT PANEL: Workspace (70%) */}
      <div className="w-full md:w-[70%] h-[60vh] md:h-full relative z-10 bg-slate-50">
        <Workspace 
            text={TESLA_CORPUS}
            chunks={chunks}
            chunkSettings={chunkSettings}
            onChunkSettingsChange={setChunkSettings}
            onChunkText={handleChunkText}
            result={currentResult}
            questionEmbedding={queryEmbedding}
            topK={topK}
            onTopKChange={setTopK}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            llmEnabled={llmEnabled}
            onLlmToggle={() => setLlmEnabled(!llmEnabled)}
            isProcessing={status !== RagStatus.IDLE}
        />
      </div>
    </div>
  );
}

export default App;
