import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

const SUGGESTIONS = [
  "Where is the cabin camera located?",
  "How many USB ports does Model X have?",
  "Why does my Tesla hum when parked?",
  "Increase chunk size to 250",
];

const ChatPanel: React.FC<Props> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Sticky Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h1 className="font-bold text-lg text-slate-900">RAG Visualizer</h1>
        </div>
        <p className="text-xs text-slate-500">Tesla Model X Edition</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </span>
          </div>
        ))}
        {isProcessing && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing...
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
            {SUGGESTIONS.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => onSendMessage(s)}
                    disabled={isProcessing}
                    className="whitespace-nowrap px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs text-indigo-600 transition-colors flex-shrink-0"
                >
                    {s}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "Processing query..." : "Ask about Model X..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center gap-1 mt-2 justify-center">
             {!process.env.API_KEY && (
                <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> No API Key - using simulation mode
                </span>
             )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;