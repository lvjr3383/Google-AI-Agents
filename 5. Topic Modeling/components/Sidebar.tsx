
import React, { useRef, useEffect } from 'react';
import { LabStage, ChatMessage } from '../types';
import { Terminal, Send, Zap, Database, Cpu, Compass, RefreshCw } from 'lucide-react';

interface SidebarProps {
  messages: ChatMessage[];
  currentStage: LabStage;
  onNext: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ messages, currentStage, onNext, onReset, isProcessing }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getButtonText = () => {
    switch(currentStage) {
      case LabStage.DISTILLATION: return "Clean Words";
      case LabStage.DICTIONARY: return "Analyze Keywords";
      case LabStage.ITERATION: return "Find Categories";
      case LabStage.ATLAS: return "Reset";
    }
  };

  const getStageIcon = () => {
    switch(currentStage) {
      case LabStage.DISTILLATION: return <Zap className="w-5 h-5 text-yellow-500" />;
      case LabStage.DICTIONARY: return <Database className="w-5 h-5 text-sky-500" />;
      case LabStage.ITERATION: return <Cpu className="w-5 h-5 text-indigo-500" />;
      case LabStage.ATLAS: return <Compass className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-sm">
          <Terminal className="text-sky-600" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">Topic Modeling Hub</h1>
          <p className="text-xs text-slate-500 font-mono-code uppercase">Simple Data Analysis</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-200 text-slate-800 rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
            <span className="text-[10px] mt-1 text-slate-400 font-mono-code">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-1 items-center p-2 text-sky-400">
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-2 py-1 rounded bg-white text-[10px] font-mono-code text-slate-500 border border-slate-200">
            STEP:
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            {getStageIcon()}
            {currentStage.replace('_', ' ')}
          </div>
        </div>

        <button 
          onClick={currentStage === LabStage.ATLAS ? onReset : onNext}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all active:scale-95 ${
            isProcessing 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {currentStage === LabStage.ATLAS ? <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} /> : <Send className="w-5 h-5" />}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
