import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeIntent } from './services/geminiService';
import { AnalysisResponse, WizardStep } from './types';
import { RotateCcw, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Input);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  const handleStartAnalysis = async (text: string) => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setCurrentStep(WizardStep.Input); // Reset visual state
    
    try {
      const data = await analyzeIntent(text);
      setAnalysisData(data);
      setCurrentStep(WizardStep.Signal); // Start the wizard
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze intent. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, WizardStep.Routing));
  };

  const handleReset = () => {
    setAnalysisData(null);
    setCurrentStep(WizardStep.Input);
    // Note: We don't reset the chat history here to allow the user to see previous context, 
    // or we could trigger a chat reset if we lifted chat state up. 
    // For now, "New Analysis" just clears the board.
    window.location.reload(); // Simplest way to reset chat and state completely for a "clean" slate
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 bg-slate-50">
      
      {/* Sidebar: 30% */}
      <div className="w-[350px] lg:w-[400px] shrink-0 h-full">
        <ChatInterface 
          currentStep={currentStep}
          analysisData={analysisData}
          confidenceThreshold={confidenceThreshold}
          setConfidenceThreshold={setConfidenceThreshold}
          onStartAnalysis={handleStartAnalysis}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Main Content: 70% */}
      <div className="flex-1 h-full overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">The Intent Detection</h1>
          </div>
          {analysisData && (
             <button 
               onClick={handleReset}
               className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-sm font-medium transition-colors"
             >
               <RotateCcw size={14} />
               <span>New Analysis</span>
             </button>
          )}
        </header>

        <main className="p-8 min-h-[calc(100vh-80px)]">
          {!analysisData ? (
            <div className="h-[70vh] flex flex-col items-center justify-center text-slate-300 animate-in fade-in duration-1000">
               <div className="relative">
                 <div className="absolute -inset-4 bg-slate-200/50 rounded-full blur-xl animate-pulse"></div>
                 <Activity size={64} strokeWidth={1} className="relative text-slate-400" />
               </div>
               <h2 className="mt-8 text-2xl font-light text-slate-400">System Standby</h2>
               <p className="mt-2 text-slate-400 font-mono text-sm">Awaiting input stream from agent...</p>
               
               <div className="mt-12 flex items-center space-x-2 text-xs text-slate-300">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300/60"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300/30"></div>
               </div>
            </div>
          ) : (
            <AnalysisResult 
              data={analysisData}
              currentStep={currentStep}
              confidenceThreshold={confidenceThreshold}
              onNextStep={handleNextStep}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;