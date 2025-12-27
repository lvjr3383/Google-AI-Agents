
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, FlavorType, PipelineStep } from '../types';
import { textToSpeech } from '../services/geminiService';

interface ChatPanelProps {
  history: ChatMessage[];
  isLoading: boolean;
  onNext: () => void;
  onAsk: (q: string) => void;
  showNext: boolean;
  isInitial: boolean;
  onStart: (text: string, flavor: FlavorType) => void;
  currentStep: PipelineStep;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ history, isLoading, onNext, onAsk, showNext, isInitial, onStart, currentStep }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [inputText, setInputText] = useState('');
  const [question, setQuestion] = useState('');
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleSpeak = async (text: string, id: string) => {
    if (isSpeakingId === id) {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
      }
      setIsSpeakingId(null);
      return;
    }

    // Stop existing playback
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    setIsSpeakingId(id);

    try {
      const audioBase64 = await textToSpeech(text);
      if (audioBase64) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        const audioBuffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          if (currentSourceRef.current === source) {
            setIsSpeakingId(null);
          }
        };
        currentSourceRef.current = source;
        source.start();
      } else {
        setIsSpeakingId(null);
      }
    } catch (e) {
      console.error("TTS Error:", e);
      setIsSpeakingId(null);
    }
  };

  const samples: Record<FlavorType, { title: string, text: string, icon: string, desc: string }> = {
    article: {
      title: "News Stream",
      icon: "📰",
      desc: "Facts & Chronology",
      text: "Global semiconductor shortages are expected to ease by late 2025 as new manufacturing plants in Ohio and Germany come online. The industry has faced three years of supply chain volatility since the pandemic, leading to price spikes in consumer electronics and automotive delays. Analysts suggest that while capacity is increasing, the demand for AI-specific chips continues to outpace current silicon growth."
    },
    email: {
      title: "Inbox Flow",
      icon: "📧",
      desc: "Intent & Actions",
      text: "From: Sarah (Manager) - 'Are we on track for the Tuesday launch?' \nFrom: Mike (Dev) - 'No, the API is still returning 500s. I need at least 2 more days.' \nFrom: Chloe (Design) - 'I've finished the assets but Sarah, we need your sign-off on the logo color by EOD today or we miss the print window.' \nFrom: Sarah - 'Okay, I'll review at 4pm. Mike, keep me posted on the API status.'"
    },
    paper: {
      title: "Research Log",
      icon: "🧬",
      desc: "Systems & Theory",
      text: "The Transformer architecture utilizes a multi-head self-attention mechanism to capture global dependencies in sequence-to-sequence tasks. Unlike recurrent neural networks, Transformers allow for massive parallelization during training by eliminating the sequential nature of hidden state propagation. The positional encoding layer ensures that the model retains structural context of token order without traditional recurrent loops."
    },
    custom: {
      title: "Raw Data",
      icon: "✍️",
      desc: "Paste & Process",
      text: ""
    }
  };

  const suggestions: Record<number, string[]> = {
    1: ["Explain tokens", "Calculation logic", "What is complexity?"],
    2: ["Defining Salience", "Heat zone logic", "Entity detection"],
    3: ["How abstraction works", "Merging logic", "Information loss"],
    4: ["Accuracy score info", "The sacrifice", "Review full text"]
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onAsk(question);
    setQuestion('');
  };

  const introText = "Welcome. I am Agent Summarizer. I help users navigate the trade-off between volume and value. I will show you exactly how AI compresses information into its most essential state.";

  return (
    <div className="w-[35%] h-full flex flex-col border-r border-slate-200 bg-white overflow-hidden shadow-2xl z-10">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">A</div>
            AGENT SUMMARIZER
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.3em] font-bold">Compression Lab v4.1</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 scroll-smooth">
        {isInitial && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-600 relative group transition-all hover:border-indigo-300">
              <button 
                onClick={() => handleSpeak(introText, 'intro')}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isSpeakingId === 'intro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-600'}`}
                title="Hear Agent Intro"
              >
                {isSpeakingId === 'intro' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
              </button>
              <p className="text-slate-800 leading-relaxed text-sm font-semibold pr-10">
                {introText}
              </p>
              <p className="text-slate-400 text-xs mt-2 font-medium">Select a context flow to begin.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(samples) as FlavorType[]).filter(f => f !== 'custom').map((key) => (
                <button 
                  key={key}
                  onClick={() => onStart(samples[key].text, key)}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm"
                >
                  <span className="text-2xl">{samples[key].icon}</span>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">{samples[key].title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{samples[key].desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Or paste custom data here..."
                className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border-t-4 border-t-slate-800 transition-all"
              />
              <button 
                disabled={!inputText.trim()}
                onClick={() => onStart(inputText, 'custom')}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white py-4 rounded-xl font-bold transition-all shadow-xl text-[10px] tracking-[0.2em] uppercase"
              >
                Sync Data
              </button>
            </div>
          </div>
        )}

        {history.map((msg, i) => {
          const msgId = `msg-${i}`;
          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`
                relative max-w-[90%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed group transition-all
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}
              `}>
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => handleSpeak(msg.content, msgId)}
                      className={`
                        absolute -right-10 top-0 p-2 rounded-full transition-all
                        ${isSpeakingId === msgId ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600'}
                      `}
                    >
                      {isSpeakingId === msgId ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 18L18 6M6 6l12 12"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                      )}
                    </button>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 text-indigo-600 font-bold text-[10px] tracking-widest">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
               AGENT_PROCESSING...
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-1/4 animate-[loading_1s_infinite]"></div>
            </div>
          </div>
        )}
        
        {!isLoading && !isInitial && suggestions[currentStep] && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions[currentStep].map((s, idx) => (
              <button 
                key={idx} 
                onClick={() => onAsk(s)}
                className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isInitial && (
        <div className="p-4 border-t border-slate-100 bg-white">
          {showNext && !isLoading && (
             <button 
              onClick={onNext}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-3 mb-4 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase text-[10px] tracking-widest"
             >
               Next Stage
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
             </button>
          )}
          <form onSubmit={handleQuestionSubmit} className="relative">
            <input 
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me a question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
            <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
