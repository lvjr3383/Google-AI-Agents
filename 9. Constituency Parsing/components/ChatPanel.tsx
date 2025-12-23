
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  history: ChatMessage[];
  onBubbleClick: (action: string) => void;
  isTyping: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ history, onBubbleClick, isTyping }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
      {history.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] space-y-2`}>
            <div className={`p-4 rounded-2xl shadow-sm border ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white border-blue-500 rounded-br-none' 
                : 'bg-white text-slate-700 border-slate-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            
            {msg.bubbles && msg.bubbles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {msg.bubbles.map((bubble, i) => (
                  <button
                    key={i}
                    onClick={() => onBubbleClick(bubble)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    {bubble}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
