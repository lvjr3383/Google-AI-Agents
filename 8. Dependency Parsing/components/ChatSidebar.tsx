
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askQuestion } from '../services/geminiService';

interface ChatSidebarProps {
  onAnalyze: (sentence: string) => void;
  currentSentence: string;
  suggestedQuestions: string[];
  isAnalyzing: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  onAnalyze, 
  currentSentence,
  suggestedQuestions,
  isAnalyzing
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const examples = [
    "Although the rain was heavy, the hikers reached the summit and took several photos.",
    "The ancient scroll was carefully translated by a group of linguists.",
    "Success and failure are often determined by persistence and strategy.",
    "The chef who won the competition prepared a meal that surprised everyone.",
    "Neither the captain nor the crew expected the massive iceberg to appear so suddenly."
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatting]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Check if the input looks like a command to analyze or just a question
    const isNewSentence = trimmed.length > 15 && !trimmed.includes('?');

    if (isNewSentence && !currentSentence) {
      onAnalyze(trimmed);
      setMessages(prev => [...prev, { role: 'user', text: `Analyze this: "${trimmed}"` }]);
      setInputValue('');
      return;
    }

    if (!currentSentence) {
      setMessages(prev => [...prev, 
        { role: 'user', text: trimmed },
        { role: 'model', text: "Please provide a sentence to analyze first, or select one of the examples above!" }
      ]);
      setInputValue('');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsChatting(true);

    try {
      const response = await askQuestion(currentSentence, trimmed, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Linguistic uplink interrupted." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chatbot Header */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Structure Sentinel</h2>
            <div className="flex items-center space-x-1.5">
              <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Agent</span>
            </div>
          </div>
        </div>

        <nav aria-label="Example sentences">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Logic Seed</p>
          <div className="grid grid-cols-1 gap-2">
            {examples.slice(0, 3).map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  onAnalyze(ex);
                  setMessages(prev => [...prev, { role: 'model', text: `Analyzing example: "${ex}"` }]);
                }}
                className="w-full text-left p-2.5 rounded bg-white hover:bg-blue-50 transition-all text-[11px] border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 group truncate"
                aria-label={`Analyze example: ${ex}`}
              >
                "{ex}"
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Message History */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="text-center py-10 space-y-4">
            <div className="text-slate-300" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm italic px-4">
              "Greeting, scholar. Input a sentence to begin the extraction of logic, or select a seed above."
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div 
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}
                aria-label={`${m.role === 'user' ? 'You' : 'Sentinel'}: ${m.text}`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        {isChatting && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 text-xs text-slate-400 border border-slate-200" aria-busy="true">
              Agent is decoding...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deep Questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-[10px] bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition-all active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-6 bg-white border-t border-slate-200">
        <div className="relative group">
          <label htmlFor="chat-input" className="sr-only">Type a message</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentSentence ? "Analyze structure..." : "Enter sentence..."}
            disabled={isAnalyzing || isChatting}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 text-slate-800 placeholder-slate-400 resize-none transition-all"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={isAnalyzing || isChatting || !inputValue.trim()}
            className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-30 shadow-md active:scale-90"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-3 text-[9px] text-slate-400 text-center font-medium">
          Shift+Enter for new line. Enter to send.
        </p>
      </div>
    </div>
  );
};