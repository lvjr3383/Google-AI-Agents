
import React, { useRef, useEffect } from 'react';

export interface Message {
  role: 'user' | 'explorer';
  text: string;
}

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  suggestedQuestions: string[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ messages, onSendMessage, loading, suggestedQuestions }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-96 flex-shrink-0 bg-slate-50/50 border-r border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-white">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tutor Module</h2>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-white text-slate-600 rounded-bl-none border border-slate-100'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm">
              <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 space-y-4">
        {suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(q)}
                className="text-[11px] bg-slate-50 text-slate-500 px-3 py-2 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-left font-bold"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300"
            placeholder="Ask your tutor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
