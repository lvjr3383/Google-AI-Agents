
import React, { useState, useRef, useEffect } from 'react';
import { Message, AnalysisStep } from '../types';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onProceed: () => void;
  isLoading: boolean;
  currentStep: AnalysisStep;
  canProceed: boolean;
}

const EXAMPLES = [
  "The quick brown fox jumps over the lazy dog.",
  "Brilliant scientists discovered a mysterious planet orbiting a distant star last week.",
  "While the storm raged outside, the ancient library remained a peaceful sanctuary for scholars."
];

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  onProceed,
  isLoading, 
  currentStep,
  canProceed 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && (currentStep === 'input' || currentStep === 'present')) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isInputEnabled = currentStep === 'input' || currentStep === 'present';
  const placeholderText = isLoading 
    ? "Processing..." 
    : currentStep === 'present' 
      ? "Enter a new sentence to start again..." 
      : currentStep === 'input' 
        ? "Type an English sentence..." 
        : "Follow the steps to finish...";

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-200">AP</div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm leading-none">Agent POS</h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Educational Grammar AI</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
            } ${msg.isStepAction ? 'italic opacity-60 text-xs' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {currentStep === 'input' && messages.length === 1 && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 px-1">Try a Starter Sentence:</p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(ex)}
                  className="text-left text-xs p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all text-slate-500 shadow-sm"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {canProceed && !isLoading && (
          <div className="flex justify-start pt-2 animate-bounce">
            <button
              onClick={onProceed}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl shadow-blue-100 group"
            >
              Next: {currentStep === 'tokenize' ? 'Tagging' : currentStep === 'tag' ? 'Statistics' : 'Final Reveal'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-400 text-sm animate-pulse shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              Agent POS is analyzing...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] max-h-[150px] resize-none shadow-inner disabled:bg-slate-50 disabled:cursor-not-allowed text-slate-700"
            disabled={isLoading || !isInputEnabled}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden sm:inline">Enter to Send</span>
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isInputEnabled}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
