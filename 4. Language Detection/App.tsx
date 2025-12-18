import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Flag, 
  CheckCircle, 
  MessageSquare, 
  Settings as SettingsIcon, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Zap,
  Info,
  Globe,
  Sliders
} from 'lucide-react';
import { PipelineStep, DetectionResult, ChatMessage } from './types';
import { TRICKY_PHRASES, LANGUAGE_FAMILIES } from './constants';
import { detectLanguage, getDetectiveLogResponse } from './services/gemini';
import Sidebar from './components/Sidebar';
import PipelineVisualizer from './components/PipelineVisualizer';

const App: React.FC = () => {
  const [step, setStep] = useState<PipelineStep>(PipelineStep.INPUT);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [eli5, setEli5] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await detectLanguage(inputText, eli5);
      setResult(data);
      setStep(PipelineStep.CLUE_HUNT);
      // Start with a generic intrigue instead of giving it away
      setChatHistory([{ role: 'model', text: `Detective reporting for duty! I've started scanning your evidence. Let's look at the **clues** we've found in the characters first.` }]);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTrickyMode = () => {
    const random = TRICKY_PHRASES[Math.floor(Math.random() * TRICKY_PHRASES.length)];
    setInputText(random.text);
    setResult(null);
    setStep(PipelineStep.INPUT);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, PipelineStep.PASSPORT));
  const prevStep = () => setStep(s => Math.max(s - 1, PipelineStep.INPUT));

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar - Detective's Log (Now on the Left) */}
      <Sidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        history={chatHistory} 
        setHistory={setChatHistory}
        currentResult={result}
        currentStep={step}
        eli5={eli5}
      />

      {/* Main Content (Shifted to Right) */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-white relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Search size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">The Language Detection Agent</h1>
              <p className="text-sm text-gray-500">Uncovering the Digital DNA of Text</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-all"
              >
                <MessageSquare size={16} />
                Open Log
              </button>
            )}

            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors ${showSettings ? 'bg-blue-50 border-blue-200 text-blue-500' : 'text-gray-400'}`}
                title="Investigation Settings"
              >
                <SettingsIcon size={20} />
              </button>
              
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 z-30"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sliders size={16} className="text-blue-500" />
                      <h3 className="font-bold text-gray-900 text-sm">Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Threshold</label>
                          <span className="text-xs font-mono font-bold text-blue-600">{confidenceThreshold}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={confidenceThreshold}
                          onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-[10px] text-gray-400 leading-tight">Minimum confidence required for a "certain" result.</p>
                      </div>

                      <div className="pt-2 border-t border-gray-50">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={eli5}
                            onChange={() => setEli5(!eli5)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Explain Like I'm 5</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Pipeline Progress Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            {/* Step Indicators */}
            <div className="flex justify-between mb-12 relative px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10" />
              {[
                { icon: <Search size={18} />, label: "The Hunt" },
                { icon: <MapPin size={18} />, label: "Neighborhood" },
                { icon: <RotateCcw size={18} />, label: "Tie-Breaker" },
                { icon: <Flag size={18} />, label: "Passport" }
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    step > idx + 1 ? 'bg-green-500 text-white' :
                    step === idx + 1 ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                    {step > idx + 1 ? <CheckCircle size={18} /> : s.icon}
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${step === idx + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Render Current Step Component */}
            <AnimatePresence mode="wait">
              {step === PipelineStep.INPUT ? (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">What evidence do we have?</h2>
                    <p className="text-gray-500">Paste any text snippet, phrase, or word for the agent to investigate.</p>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type something here... e.g., 'Bonjour mon ami'"
                      className="w-full h-48 p-6 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-lg text-gray-900 resize-none outline-none transition-all placeholder:text-gray-300"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button 
                        onClick={handleTrickyMode}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Globe size={14} className="text-orange-500" />
                        Examine Samples
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="w-full mt-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      "Start Investigation"
                    )}
                  </button>
                </motion.div>
              ) : (
                <PipelineVisualizer 
                  step={step} 
                  result={result} 
                  inputText={inputText}
                  eli5={eli5}
                  confidenceThreshold={confidenceThreshold}
                  onNext={nextStep}
                  onPrev={prevStep}
                  onReset={() => { setStep(PipelineStep.INPUT); setInputText(''); setResult(null); }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;