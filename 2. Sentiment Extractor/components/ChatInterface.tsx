import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, User, Bot, Sparkles, Settings, Sliders, RefreshCw, MessageSquarePlus, ArrowRight, RotateCcw } from 'lucide-react';
import { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  confidenceThreshold: number;
  onThresholdChange: (value: number) => void;
  onReset: () => void;
  hasAnalysis: boolean;
  isWaitingForProceed: boolean;
  onProceed: () => void;
  suggestedQuestions?: string[];
}

export const ChatInterface: React.FC<Props> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  confidenceThreshold, 
  onThresholdChange,
  onReset,
  hasAnalysis,
  isWaitingForProceed,
  onProceed,
  suggestedQuestions = []
}) => {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="relative z-20">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Terminal size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-wide">SENTIMENT EXTRACTOR</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold">NLP PIPELINE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {hasAnalysis && (
               <button 
               onClick={onReset}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 bg-slate-100 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-bold border border-slate-200"
               title="Start Fresh"
             >
               <RotateCcw size={14} />
               <span>New Session</span>
             </button>
            )}
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 ${showSettings ? 'text-blue-600 bg-slate-50 border-slate-200' : 'text-slate-400'}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute w-full bg-white/95 backdrop-blur border-b border-slate-200 p-5 shadow-xl animate-in slide-in-from-top-2 duration-200 z-30">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Sliders size={14} />
                <span>Sensitivity Threshold</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono font-medium">
                  <span>Min Confidence</span>
                  <span className="text-blue-600">{(confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.95" 
                  step="0.05" 
                  value={confidenceThreshold} 
                  onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                />
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  If confidence falls below this value, the agent will flag the result as ambiguous.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm border ${
              msg.role === 'agent' ? 'bg-white border-slate-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {msg.role === 'agent' ? <Bot size={16} /> : <User size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-blue-600/10' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
               <Bot size={16} />
             </div>
             <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm">
               <div className="flex gap-1.5 items-center h-4">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        
        {/* Proceed Button - Primary Action when waiting */}
        {isWaitingForProceed && (
            <div className="mb-4 flex justify-center animate-in slide-in-from-bottom-2 fade-in">
                <button 
                    onClick={onProceed}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <span>Proceed to Next Step</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        )}

        {/* Dynamic Suggested Questions */}
        {!isLoading && suggestedQuestions.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(question)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-200 rounded-full text-xs text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Sparkles size={12} className="text-blue-500" />
                {question}
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          className="relative group"
        >
          <div className="relative bg-white rounded-xl flex items-center border border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasAnalysis ? "Ask a specific question..." : "Enter text to analyze..."}
              className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 px-4 py-3.5 max-h-32 min-h-[52px] focus:outline-none resize-none text-sm scrollbar-hide font-medium"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 mr-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2.5 font-medium">
          Press Enter to send
        </p>
      </div>
    </div>
  );
};