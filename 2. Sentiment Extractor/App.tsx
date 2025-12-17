import React, { useState, useEffect } from 'react';
import { analyzeSentiment, chatWithAgent } from './services/geminiService';
import { SentimentAnalysis, ChatMessage, AnalysisStep } from './types';
import { AnalysisResult } from './components/AnalysisResult';
import { ChatInterface } from './components/ChatInterface';
import { Cpu, LayoutTemplate } from 'lucide-react';

const SUGGESTED_QUESTIONS: Record<AnalysisStep, string[]> = {
  [AnalysisStep.IDLE]: [], // No suggestions, user must input text
  [AnalysisStep.TOKENIZATION]: [
    "Why are words converted to numbers?",
    "What are sub-words?",
    "Does punctuation matter?",
    "How does it handle emojis?"
  ],
  [AnalysisStep.VECTOR_SPACE]: [
    "What do the X and Y axes mean?",
    "Why is my sentence near that anchor?",
    "What is a 'semantic vector'?",
    "How is distance calculated?"
  ],
  [AnalysisStep.EXPLAINABILITY]: [
    "Why did the line drop there?",
    "Why is that specific word highlighted?",
    "How do you handle negation?",
    "What if the sentence was sarcastic?"
  ],
  [AnalysisStep.FINAL_SIGNAL]: [
    "How is the confidence score calculated?",
    "Why is this not 100% confident?",
    "What is the threshold for positive?",
    "How would a different model react?"
  ]
};

export const App = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: "System online. I am the Sentiment Extractor. Input any text (movie review, tweet, product feedback) and I will reverse-engineer the classification process step-by-step.",
      timestamp: Date.now()
    }
  ]);
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>(AnalysisStep.IDLE);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.65);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const resetAnalysis = () => {
    setAnalysis(null);
    setCurrentStep(AnalysisStep.IDLE);
    setWaitingForConfirmation(false);
    // Complete reset of history
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'agent',
      content: "System online. I am the Sentiment Extractor. Input any text (movie review, tweet, product feedback) and I will reverse-engineer the classification process step-by-step.",
      timestamp: Date.now()
    }]);
  };

  const advanceStep = (currentData: SentimentAnalysis) => {
    if (currentStep === AnalysisStep.TOKENIZATION) {
      setCurrentStep(AnalysisStep.VECTOR_SPACE);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "I've mapped your tokens into a high-dimensional vector space. The scatter plot on the right shows where your sentence 'lives' relative to other semantic anchors. \n\nYou can ask me questions about this map below, or click 'Proceed to Next Step' to see feature importance.",
        timestamp: Date.now()
      }]);
      setWaitingForConfirmation(true);
    } 
    else if (currentStep === AnalysisStep.VECTOR_SPACE) {
      setCurrentStep(AnalysisStep.EXPLAINABILITY);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Here is the breakdown of word importance. \n\nI've generated a heatmap of high-impact words AND a Sentiment Arc showing how the mood shifted as I read the sentence. \n\nClick 'Proceed to Next Step' to reveal the final classification.",
        timestamp: Date.now()
      }]);
      setWaitingForConfirmation(true);
    }
    else if (currentStep === AnalysisStep.EXPLAINABILITY) {
      setCurrentStep(AnalysisStep.FINAL_SIGNAL);
      
      // Check confidence against threshold
      if (currentData.signal.confidenceScore < threshold) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: `Analysis complete. However, my confidence is ${(currentData.signal.confidenceScore * 100).toFixed(0)}%, which is below your threshold of ${(threshold * 100).toFixed(0)}%. \n\nThe signal is ambiguous.`,
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: `Analysis complete. The signal is ${currentData.signal.label} (${(currentData.signal.confidenceScore * 100).toFixed(0)}% confidence).`,
          timestamp: Date.now()
        }]);
      }
      setWaitingForConfirmation(false); // End of flow
    }
  };

  const handleProceed = () => {
    if (analysis) {
        advanceStep(analysis);
    }
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    // 1. If we are waiting for confirmation (Next/Yes), check strictly for that.
    if (analysis && waitingForConfirmation && currentStep !== AnalysisStep.FINAL_SIGNAL) {
      const lowerText = text.toLowerCase();
      const isConfirmation = ['yes', 'y', 'next', 'proceed', 'go ahead', 'continue', 'ok', 'okay', 'sure'].some(w => lowerText.includes(w));

      if (isConfirmation) {
        advanceStep(analysis);
        return;
      }
      // If not confirmation, fall through to General Chat (below)
    }

    // 2. If we have an analysis active (or finished), treat input as CONVERSATION about the analysis.
    if (analysis) {
       setLoading(true);
       try {
        const reply = await chatWithAgent(text, analysis);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: reply,
          timestamp: Date.now()
        }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. If NO analysis is active, start a NEW Analysis.
    setLoading(true);
    setAnalysis(null);
    setCurrentStep(AnalysisStep.IDLE);
    setWaitingForConfirmation(false);

    try {
      const result = await analyzeSentiment(text);
      setAnalysis(result);
      
      // Start Step 1
      setCurrentStep(AnalysisStep.TOKENIZATION);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Process initiated. Step 1: Tokenization complete. I have segmented the input into vector-ready units. \n\nExamine the tokens on the right. When you are ready, click 'Proceed to Next Step' to enter the Vector Space.",
        timestamp: Date.now()
      }]);
      setWaitingForConfirmation(true);

    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Error processing input stream. Please retry.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Panel - Chat (30%) */}
      <div className="w-[30%] min-w-[320px] max-w-md h-full shrink-0 border-r border-slate-200">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={loading}
          confidenceThreshold={threshold}
          onThresholdChange={setThreshold}
          onReset={resetAnalysis}
          hasAnalysis={!!analysis}
          isWaitingForProceed={waitingForConfirmation}
          onProceed={handleProceed}
          suggestedQuestions={SUGGESTED_QUESTIONS[currentStep]}
        />
      </div>

      {/* Right Panel - Analysis (70%) */}
      <div className="flex-1 h-full relative bg-slate-50 overflow-hidden flex flex-col">
        {/* Top Bar for Right Panel */}
        <div className="h-16 border-b border-slate-200 bg-white/80 flex items-center px-8 justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono font-bold tracking-wide">
            <LayoutTemplate size={16} className="text-blue-600" />
            <span>VISUALIZATION_MATRIX</span>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Progress Indicators */}
             <div className="flex gap-1.5">
                {[AnalysisStep.TOKENIZATION, AnalysisStep.VECTOR_SPACE, AnalysisStep.EXPLAINABILITY, AnalysisStep.FINAL_SIGNAL].map((step) => (
                  <div 
                    key={step} 
                    className={`h-2 w-8 rounded-full transition-all duration-500 ${
                      currentStep >= step ? 'bg-blue-600' : 'bg-slate-200'
                    }`} 
                  />
                ))}
             </div>

             {loading && currentStep === AnalysisStep.IDLE && (
                <div className="flex items-center gap-2 text-blue-600 text-xs font-mono animate-pulse">
                  <Cpu size={16} />
                  <span>INITIALIZING...</span>
                </div>
             )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent scroll-smooth bg-slate-50/50">
          {analysis && currentStep > AnalysisStep.IDLE ? (
            <div className="max-w-5xl mx-auto pb-12">
              <AnalysisResult 
                data={analysis} 
                currentStep={currentStep} 
                confidenceThreshold={threshold} 
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <div className="relative mb-6">
                <div className="absolute -inset-8 bg-blue-100/50 blur-2xl rounded-full"></div>
                <Cpu size={64} className="text-slate-300 relative z-10" />
              </div>
              <p className="font-mono text-sm tracking-widest text-slate-500 font-semibold">AWAITING INPUT STREAM</p>
              <p className="text-sm mt-3 max-w-xs text-center text-slate-500">
                Use the chat on the left to begin your analysis.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};