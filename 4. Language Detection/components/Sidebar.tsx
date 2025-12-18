import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, MessageSquare } from 'lucide-react';
import { ChatMessage, DetectionResult, PipelineStep } from '../types';
import { getDetectiveLogResponse } from '../services/gemini';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentResult: DetectionResult | null;
  currentStep: PipelineStep;
  eli5: boolean;
}

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  // Simple markdown-ish formatter for bold and italics
  const formatText = (content: string) => {
    // Escape standard HTML chars
    let formatted = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace **bold** with <b>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *italic* with <i>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Handle newlines
    formatted = formatted.replace(/\n/g, '<br />');

    return { __html: formatted };
  };

  return <div className="text-inherit" dangerouslySetInnerHTML={formatText(text)} />;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, history, setHistory, currentResult, currentStep, eli5 }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getDetectiveLogResponse(input, newHistory, currentResult, currentStep, eli5);
      setHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'model', text: "Pardon me, my magnifying glass is a bit foggy. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-500" />
          <h2 className="font-bold text-gray-900">Detective's Log</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {history.length === 0 && (
          <div className="text-center py-12 px-4">
            <Bot size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm italic">Analyze some text to start the investigation, or ask me anything about languages!</p>
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none shadow-md shadow-blue-100' 
                : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-none'
            }`}>
              <div className={`flex items-center gap-1 mb-1 opacity-60 text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-blue-50' : 'text-gray-400'}`}>
                {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                {msg.role === 'user' ? 'You' : 'Detective'}
              </div>
              <div className="leading-relaxed">
                <MarkdownText text={msg.text} />
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the Detective..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner text-gray-900"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;