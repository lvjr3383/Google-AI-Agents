
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ChatSidebar } from './components/ChatSidebar';
import { StepDisplay } from './components/StepDisplay';
import { parseSentence } from './services/geminiService';
import { ParsingResult } from './types';

function App() {
  const [currentSentence, setCurrentSentence] = useState('');
  const [parsingData, setParsingData] = useState<ParsingResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startAnalysis = async (sentence: string) => {
    if (!sentence.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setParsingData(null);
    setCurrentStep(0);
    setCurrentSentence(sentence);

    try {
      const result = await parseSentence(sentence);
      setParsingData(result);
    } catch (error) {
      console.error("Linguistic analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const proceed = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  return (
    <Layout 
      sidebar={
        <ChatSidebar 
          onAnalyze={startAnalysis} 
          currentSentence={currentSentence}
          suggestedQuestions={parsingData?.suggestedQuestions || []}
          isAnalyzing={isAnalyzing}
        />
      }
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Empty State */}
        {!currentSentence && !isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center pt-20 text-center space-y-8 animate-fade-in" role="status">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-600/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
            </div>
            <div className="max-w-md">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Logic Void Detected</h2>
              <p className="text-slate-500 text-lg mt-4 leading-relaxed">
                The workspace is dormant. Initiate a structural analysis from the <span className="text-blue-600 font-bold italic">Sentinel Chat</span> on the left to populate this area.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-sm font-bold uppercase tracking-widest" aria-hidden="true">
              <span className="w-8 h-px bg-slate-200"></span>
              <span>Waiting for Input</span>
              <span className="w-8 h-px bg-slate-200"></span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center pt-32 space-y-8" role="status" aria-label="Analyzing sentence">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full border-b-4 border-blue-600 animate-spin" />
              <div className="absolute inset-4 rounded-full border-t-4 border-emerald-400 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Deconstructing Logic...</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">The agent is mapping dependencies and identifying logical anchors.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {parsingData && !parsingData.isValid && !isAnalyzing && (
          <div className="animate-fade-in max-w-2xl mx-auto pt-10" role="alert">
             <div className="bg-white border-2 border-amber-200 rounded-3xl p-10 flex flex-col items-center text-center space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 -mr-10 -mt-10 rounded-full"></div>
                <div className="bg-amber-50 p-5 rounded-full border border-amber-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Extraction Failed</h3>
                  <p className="text-slate-500 italic font-medium">"{currentSentence}"</p>
                </div>
                <p className="text-slate-700 leading-relaxed max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {parsingData.validationMessage || "Linguistic ambiguity prevented successful extraction. Please provide a structurally sound sentence."}
                </p>
                <button 
                  onClick={() => { setParsingData(null); setCurrentSentence(''); }}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-md focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  CLEAR WORKSPACE
                </button>
             </div>
          </div>
        )}

        {/* Active Analysis Workspace */}
        {parsingData && parsingData.isValid && !isAnalyzing && (
          <div className="animate-fade-in pb-12">
             <div className="mb-10 p-8 bg-white rounded-3xl shadow-md border border-slate-200 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 transition-all duration-500 group-hover:w-3"></div>
               <div className="flex justify-between items-start">
                 <div className="space-y-1">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Structural Subject</span>
                   <p className="text-3xl font-bold text-slate-800 leading-tight">"{currentSentence}"</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100" aria-hidden="true">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                   </svg>
                 </div>
               </div>
             </div>
             
             <StepDisplay 
               currentStep={currentStep} 
               data={parsingData} 
               onProceed={proceed}
             />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
