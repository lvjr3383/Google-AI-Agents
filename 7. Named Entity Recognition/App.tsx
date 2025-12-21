
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChatSidebar, Message } from './components/ChatSidebar';
import { NERHighlighter } from './components/NERHighlighter';
import { TokenFlow } from './components/TokenFlow';
import { StatsDashboard } from './components/StatsDashboard';
import { analyzeText, chatWithExplorer } from './geminiService';
import { NERAnalysis } from './types';

const INITIAL_TEXT = "The dedicated team at SpaceX successfully launched Starship in Boca Chica yesterday, and Elon Musk was absolutely thrilled with the results!";

const STEP_QUESTIONS: Record<number, string[]> = {
  0: ["How does NER work?", "Why is tokenization important?", "What are named entities?"],
  1: ["What are BIO tags?", "Why fracture text into tokens?", "Explain I- tags vs B- tags."],
  2: ["What do these colors mean?", "What is a GPE entity?", "How are spans detected?"],
  3: ["Which entity type is most common?", "What do statistics show?", "How is frequency calculated?"],
  4: ["Explain this linguistic insight.", "Can extractors make mistakes?", "How can I improve text for NER?"]
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState(INITIAL_TEXT);
  const [analysis, setAnalysis] = useState<NERAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(STEP_QUESTIONS[0]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'explorer', text: "Welcome to the Linguistic Lab. I'm your tutor. We'll explore how AI transforms raw sentences into structured data. Type a sentence above to begin our journey." }
  ]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setCurrentStep(0); 
    setAnalysis(null);
    
    try {
      const result = await analyzeText(inputText);
      setAnalysis(result);
      if (!result.isInputValid) {
        setError(result.validationMessage);
        setMessages(prev => [...prev, { role: 'explorer', text: `Stop: ${result.validationMessage}` }]);
      } else {
        setCurrentStep(1);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysis && currentStep > 0) {
      const stepKey = `step${currentStep}` as keyof typeof analysis.pipelineExplanations;
      const expl = analysis.pipelineExplanations[stepKey];
      if (expl) {
        setMessages(prev => [...prev, { 
          role: 'explorer', 
          text: `[PHASE ${currentStep}]: ${expl.title}. ${expl.explanation.replace(/[*_]/g, '')}` 
        }]);
      }
    }
    setSuggestedQuestions(STEP_QUESTIONS[currentStep] || []);
  }, [currentStep, analysis]);

  const handleUserChatMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setChatLoading(true);
    try {
      const response = await chatWithExplorer([], text);
      setMessages(prev => [...prev, { role: 'explorer', text: response || "I'm still thinking about that one." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'explorer', text: "My neural connection failed. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getStepData = () => {
    if (!analysis) return null;
    switch(currentStep) {
      case 1: return { 
        expl: analysis.pipelineExplanations.step1, 
        content: <TokenFlow tokens={analysis.tokens} /> 
      };
      case 2: return { 
        expl: analysis.pipelineExplanations.step2, 
        content: <NERHighlighter text={inputText} spans={analysis.spans} /> 
      };
      case 3: return { 
        expl: analysis.pipelineExplanations.step3, 
        content: (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <StatsDashboard stats={analysis.stats} />
          </div>
        )
      };
      case 4: return { 
        expl: analysis.pipelineExplanations.step4, 
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center">
               <h4 className="font-black text-slate-500 mb-2 uppercase text-[11px] tracking-widest">Synthesis</h4>
               <p className="text-xl font-bold leading-relaxed">"{analysis.summary.replace(/[*_]/g, '')}"</p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
               <h4 className="font-black text-slate-300 mb-3 uppercase text-[11px] tracking-widest">Linguistic Insight</h4>
               <p className="text-slate-500 leading-relaxed text-base font-medium">{analysis.insight.replace(/[*_]/g, '')}</p>
            </div>
          </div>
        )
      };
      default: return null;
    }
  };

  const stepInfo = getStepData();

  return (
    <Layout>
      <ChatSidebar 
        messages={messages} 
        onSendMessage={handleUserChatMessage} 
        loading={chatLoading} 
        suggestedQuestions={suggestedQuestions}
      />
      
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="w-full px-12 py-10 space-y-10">
          {/* Input Header - Wider and tighter */}
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black">AI</div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Lesson Context</h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1 w-12 rounded-full transition-all duration-700 ${currentStep >= s ? 'bg-blue-600' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>
            
            <textarea
              className="w-full h-24 p-0 bg-transparent text-4xl font-black text-slate-900 placeholder-slate-100 border-none focus:ring-0 resize-none leading-[1.1] tracking-tight"
              placeholder="Start typing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex justify-between items-end mt-8 pt-8 border-t border-slate-50">
              <div className="space-y-1">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pipeline Status</p>
                 <p className="text-xs text-slate-800 font-black uppercase">{analysis ? 'Analysis Active' : 'Waiting for Input'}</p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-4 shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Crunching Data' : 'Begin Analysis'}
              </button>
            </div>
          </section>

          {/* Pipeline Step Display */}
          {analysis && stepInfo ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-stretch">
                <div className="space-y-5 flex flex-col justify-center">
                  <div className="inline-flex w-fit items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    Phase 0{currentStep} / 04
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">
                    {stepInfo.expl.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-base font-medium max-w-lg">
                    {stepInfo.expl.explanation.replace(/[*_]/g, '')}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">State: Input</span>
                      <p className="text-lg text-slate-800 font-bold leading-tight">{stepInfo.expl.inputDescription}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">State: Extracted</span>
                      <p className="text-lg text-slate-800 font-bold leading-tight">{stepInfo.expl.outputDescription}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="transition-all duration-500">
                 {stepInfo.content}
              </div>

              <div className="flex justify-between items-center pt-10 border-t border-slate-100">
                <button 
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="group flex items-center gap-4 text-xs font-black text-slate-300 hover:text-slate-900 disabled:opacity-0 transition-all uppercase tracking-widest"
                >
                  <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-slate-900 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </div>
                  Previous Phase
                </button>
                <div className="text-[11px] font-black text-slate-200 uppercase tracking-[0.5em]">
                  {currentStep} / 4
                </div>
                <button 
                  disabled={currentStep === 4}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="group flex items-center gap-4 text-xs font-black text-blue-600 hover:text-blue-800 disabled:opacity-0 transition-all uppercase tracking-widest"
                >
                  Next Phase
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl shadow-blue-50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  </div>
                </button>
              </div>
            </div>
          ) : !loading && (
            <div className="bg-slate-50 border border-slate-100 rounded-[3rem] h-96 flex flex-col items-center justify-center p-10 text-center shadow-inner">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-black text-2xl mb-3 tracking-tighter">Engine Ready</h3>
              <p className="text-slate-400 font-medium text-sm max-w-sm leading-relaxed">
                The extraction engine is currently on standby. Input a target sentence and initiate analysis to reveal the entities within.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex items-center gap-6 text-red-600 animate-in slide-in-from-top-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="font-black text-xl tracking-tight leading-none">{error}</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
