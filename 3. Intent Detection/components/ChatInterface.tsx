import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Settings, Sliders, Sparkles } from 'lucide-react';
import { WizardStep, AnalysisResponse } from '../types';
import { chatWithContext } from '../services/geminiService';

interface ChatInterfaceProps {
  currentStep: WizardStep;
  analysisData: AnalysisResponse | null;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  onStartAnalysis: (text: string) => Promise<void>;
  isAnalyzing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  currentStep, 
  analysisData, 
  confidenceThreshold, 
  setConfidenceThreshold,
  onStartAnalysis,
  isAnalyzing
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { 
      role: 'model', 
      text: "Greetings. I am the Intent Detection Agent.\n\nI visualize how Natural Language Processing decodes human requests into actionable data points.\n\nPlease type a customer request (e.g., \"I suspect fraud on my account\") to initiate the classification pipeline." 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Reactive comments from the bot based on step changes
  useEffect(() => {
    if (!analysisData) return;

    let comment = "";
    if (currentStep === WizardStep.Signal) {
      comment = `I've detected potential intent triggers: ${analysisData.signal.triggers.map(t => `"${t}"`).join(', ')}. Ready to map this to vector space?`;
    } else if (currentStep === WizardStep.Landscape) {
      comment = `Plotting coordinates (${analysisData.landscape.x}, ${analysisData.landscape.y}). It looks like a ${analysisData.landscape.explanation}`;
    } else if (currentStep === WizardStep.Competition) {
      const top = analysisData.competition[0];
      comment = `Softmax complete. "${top.intent}" leads with ${(top.probability * 100).toFixed(0)}% probability.`;
    } else if (currentStep === WizardStep.Routing) {
      comment = "Routing payload generated. Check the final JSON structure.";
    }

    // Only add the comment if it's not the very first render of analysis data (handled by the analysis trigger)
    // We check if the last message is essentially the same to avoid dupes, or manage state flags.
    // For simplicity here, we append if it matches the current step logic.
    if (comment) {
       // Avoid duplicating if the last message is identical
       setMessages(prev => {
         if (prev[prev.length - 1].text === comment) return prev;
         return [...prev, { role: 'model', text: comment }];
       });
    }
  }, [currentStep, analysisData]);

  const handleSend = async () => {
    if (!input.trim() || isSending || isAnalyzing) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsSending(true);

    try {
      if (!analysisData) {
        // If no analysis data exists, treat this as the initial input to start the pipeline
        await onStartAnalysis(userText);
        // The App component will update analysisData, triggering the useEffect above to post the first result message
      } else {
        // Standard chat context
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        const response = await chatWithContext(history, currentStep, analysisData, userText);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error processing request. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (message: { role: 'user' | 'model', text: string }) => {
    // Only highlight in model messages and when we have analysis data
    if (message.role === 'user' || !analysisData?.signal?.triggers?.length) {
      return <div className="whitespace-pre-wrap">{message.text}</div>;
    }

    const triggers = analysisData.signal.triggers;
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex to match triggers as whole words, case-insensitive
    const pattern = new RegExp(`\\b(${triggers.map(escapeRegExp).join('|')})\\b`, 'gi');
    
    const parts = message.text.split(pattern);

    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          // Check if this part matches one of our triggers (case-insensitive)
          const isTrigger = triggers.some(t => t.toLowerCase() === part.toLowerCase());
          
          if (isTrigger) {
            return (
              <span 
                key={i} 
                className="inline-block font-mono font-bold text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded mx-0.5 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                title="Identified Trigger Signal"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-mono font-bold text-slate-700 tracking-tight">INTENT_AGENT</span>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${showSettings ? 'bg-slate-200 text-blue-600' : 'text-slate-500'}`}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-slate-100 border-b border-slate-200 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 text-slate-700 mb-2">
            <Sliders size={16} />
            <span className="text-sm font-semibold">Threshold Config</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Permissive (0.1)</span>
              <span>Strict (0.9)</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="0.9" 
              step="0.05" 
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-center font-mono text-xs text-blue-600 font-bold">
              CURRENT_VAL: {confidenceThreshold.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              <div className={`p-1.5 rounded border shadow-sm shrink-0 ${m.role === 'user' ? 'bg-white border-slate-200 text-slate-600' : 'bg-blue-600 border-blue-700 text-white'}`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-white border border-slate-200 text-slate-800' 
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}>
                {renderMessageContent(m)}
              </div>
            </div>
          </div>
        ))}
        {(isSending || isAnalyzing) && (
           <div className="flex justify-start">
             <div className="flex items-center space-x-2 bg-slate-100 text-slate-500 text-xs px-3 py-2 rounded-lg animate-pulse border border-slate-200">
               <Sparkles size={12} className="text-blue-500" />
               <span>{isAnalyzing ? 'Analyzing intent structure...' : 'Thinking...'}</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAnalyzing ? "Processing..." : analysisData ? "Ask about the results..." : "Type a request..."}
            disabled={isAnalyzing}
            className="w-full pl-3 pr-10 py-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-12 min-h-[48px] max-h-32 disabled:opacity-50 disabled:cursor-wait"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isSending || isAnalyzing}
            className="absolute right-2 top-2.5 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};