
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Cpu, Layers, Maximize2, Terminal, Loader2, MessageSquare, 
  Sparkles, Globe, Activity, ChevronRight, Wand2, Info, Lightbulb, Zap
} from 'lucide-react';
import { TargetLanguage, AgentResponse } from './types';
import { translateAndVisualize } from './services/geminiService';
import StepCard from './components/StepCard';
import CandidateChart from './components/CandidateChart';
import AttentionHeatmap from './components/AttentionHeatmap';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>(TargetLanguage.SPANISH);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [chatSteps, setChatSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const workspaceRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const parseChatSteps = (text: string) => {
    if (!text) return ["Initialization complete."];
    let rawSteps = text.split(/###\s*Step\s*\d:?/i)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (rawSteps.length < 2) {
      rawSteps = text.split(/\n\n+/).filter(s => s.length > 20);
    }
    
    return rawSteps.length > 0 ? rawSteps : [text];
  };

  const scrollToStep = (stepIndex: number) => {
    // Small delay to ensure the DOM has rendered the new step if it was just unlocked
    setTimeout(() => {
      const element = document.getElementById(`workspace-step-${stepIndex}`);
      if (element && workspaceRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setCurrentStep(0);
    setChatSteps([]);
    
    try {
      const res = await translateAndVisualize(inputText, targetLang);
      const parsedSteps = parseChatSteps(res.chatText);
      setResponse(res);
      setChatSteps(parsedSteps);
      // Auto scroll to first step on start
      scrollToStep(0);
    } catch (err: any) {
      setError(err.message || 'The neural loom failed to engage.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    const totalPossibleSteps = 4;
    if (currentStep < totalPossibleSteps - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      scrollToStep(nextIdx);
    }
  };

  const handleQuestionClick = (question: string) => {
    // When a question is clicked, we highlight the current visualization 
    // and ensure the user is looking at the right place.
    scrollToStep(currentStep);
    
    // In a more complex app, this could trigger a specific "mini-weave" explanation.
    // For now, we provide immediate visual feedback.
    console.log(`The Weaver is analyzing: ${question}`);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentStep, chatSteps]);

  const currentQuestions = response?.workspace?.suggested_questions?.[(currentStep + 1).toString()] || [];

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* 1. Controller Sidebar */}
      <aside className="w-full md:w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col p-6 z-20 shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
            <Globe size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Agent</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Translator</span>
          </div>
        </div>

        <form onSubmit={handleTranslate} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Neural Input</label>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm resize-none transition-all outline-none shadow-inner"
              placeholder="e.g., The quick brown fox jumps over the lazy dog"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Language</label>
            <div className="relative">
              <select
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm pr-10"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
              >
                {Object.values(TargetLanguage).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="group w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:bg-slate-200 shadow-xl shadow-indigo-200 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="group-hover:animate-pulse" />}
            <span>{isLoading ? 'Processing...' : 'Visualize Weave'}</span>
          </button>
        </form>

        <div className="mt-auto p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
          <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-600/70 leading-relaxed font-medium">
            Analyzing 4-layers of neural deconstruction from English to {targetLang}.
          </p>
        </div>
      </aside>

      {/* 2. Visualization Workspace */}
      <main className="flex-grow flex flex-col h-full bg-slate-50 overflow-y-auto p-8 lg:p-12 scroll-smooth" ref={workspaceRef}>
        {!response && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="p-8 bg-white rounded-full shadow-2xl mb-6 relative">
               <Sparkles size={48} className="text-indigo-400" />
               <div className="absolute inset-0 bg-indigo-400 blur-2xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Awaiting Weaver Input</p>
          </div>
        )}

        {error && (
          <div className="h-full flex flex-col items-center justify-center">
             <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center max-w-md shadow-xl">
               <Activity size={32} className="mx-auto mb-3 opacity-50" />
               <p className="text-xs font-bold uppercase tracking-widest mb-1 text-red-700">Loom Error</p>
               <p className="text-sm font-medium">{error}</p>
             </div>
          </div>
        )}

        {response && (
          <div className="max-w-3xl mx-auto w-full space-y-12 pb-32">
            {/* Step 1: Context & Tokens */}
            <div id="workspace-step-0">
              <StepCard title="1. Semantic & Tokenization" icon={<Cpu size={20} />} active>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 tracking-wider">Semantic Intent</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {response.workspace?.step_1_input?.intent || "General"}
                      </p>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 tracking-wider">Translation Path</p>
                      <p className="font-bold text-indigo-600 text-sm uppercase">
                        English ➔ {targetLang}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-3 tracking-widest">Sub-word Tokens</p>
                    <div className="flex flex-wrap gap-2.5">
                      {response.workspace?.step_2_tokenization?.tokens?.map((t, i) => (
                        <span key={i} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-mono text-[12px] font-medium border border-indigo-100 shadow-sm transition-all hover:bg-white hover:border-indigo-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </StepCard>
            </div>

            {/* Step 2: Probabilities */}
            {currentStep >= 1 && (
              <div id="workspace-step-1">
                <StepCard title="2. Neural Decoding" icon={<Terminal size={20} />} active>
                  <div className="space-y-6">
                    {response.workspace?.step_3_decode_timeline?.slice(0, 3).map((step, i) => (
                      <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decode Pos {step.step}</span>
                          <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl shadow-sm">"{step.current_token}"</span>
                        </div>
                        <CandidateChart candidates={step.top_5_candidates || []} />
                      </div>
                    ))}
                  </div>
                </StepCard>
              </div>
            )}

            {/* Step 3: Attention Map */}
            {currentStep >= 2 && (
              <div id="workspace-step-2">
                <StepCard title="3. Attention Mechanism" icon={<Activity size={20} />} active>
                  {response.workspace.attention_map ? (
                    <AttentionHeatmap data={response.workspace.attention_map} />
                  ) : (
                    <div className="p-16 text-center bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 text-xs italic">
                      The model is focusing its internal weights...
                    </div>
                  )}
                </StepCard>
              </div>
            )}

            {/* Step 4: Final Weave */}
            {currentStep >= 3 && (
              <div id="workspace-step-3">
                <StepCard title="4. Final Transformation" icon={<Maximize2 size={20} />} active>
                  <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125 duration-500">
                        <Wand2 size={64} />
                      </div>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase mb-4 tracking-[0.4em]">Target Script</p>
                    <p className="text-4xl font-black leading-tight tracking-tight drop-shadow-md">
                      {response.workspace?.step_4_final_output?.translation_script}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Literal Back-Translation</p>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                          {response.workspace?.step_4_final_output?.literal_translation}
                        </p>
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Phonetics / Romanization</p>
                        <p className="text-sm text-slate-600 font-mono tracking-tighter bg-slate-50 p-2 rounded-lg">
                          {response.workspace?.step_4_final_output?.romanization}
                        </p>
                      </div>
                  </div>
                </StepCard>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Weaver Insights Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-30 relative">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl ring-4 ring-indigo-50">
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base tracking-tight">The Weaver</h2>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Neural Architect</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-8 bg-slate-50/10 custom-scrollbar" ref={chatRef}>
          {response && chatSteps.slice(0, currentStep + 1).map((step, i) => (
            <div key={i} className="animate-step">
              <div className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 relative transition-all hover:shadow-lg">
                <div className="chat-markdown text-[13.5px] leading-[1.6] text-slate-700 font-medium" 
                     dangerouslySetInnerHTML={{ 
                        __html: step
                          .replace(/^Step \d:?/i, '') 
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 font-bold">$1</strong>')
                          .replace(/\n/g, '<br/>') 
                     }} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-16 space-y-5">
               <div className="relative h-20 w-20 flex items-center justify-center">
                 <Loader2 className="animate-spin text-indigo-600 w-full h-full opacity-20" />
                 <Wand2 className="absolute text-indigo-600 animate-pulse" size={28} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 animate-pulse">Spinning Neural Loom...</span>
            </div>
          )}

          {/* Dynamic Questions (Royal Middle Path Enhancements) */}
          {response && !isLoading && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="p-1 bg-amber-100 rounded-lg">
                  <Lightbulb size={14} className="text-amber-600" />
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Step Insights</span>
              </div>
              <div className="flex flex-col gap-3">
                {currentQuestions.map((q, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleQuestionClick(q)}
                    className="text-left p-4 text-[12px] bg-white hover:bg-indigo-600 hover:text-white text-slate-600 rounded-2xl border border-slate-100 transition-all shadow-sm hover:shadow-indigo-100 hover:-translate-y-0.5 font-semibold group flex items-start gap-3"
                  >
                    <ChevronRight size={14} className="shrink-0 mt-0.5 text-indigo-300 group-hover:text-indigo-200" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Control */}
          {response && currentStep < 3 && (
            <button 
              onClick={nextStep}
              className="w-full py-5 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_rgba(79,70,229,0.4)] sticky bottom-4 border-4 border-white active:scale-95 z-10"
            >
              <span>Explore Layer {currentStep + 2}</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default App;
