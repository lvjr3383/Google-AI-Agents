
import React, { useState, useEffect, useRef } from 'react';
import { DetectiveService } from './geminiService';
import { Message } from './types';
import { Search, Database, CheckCircle, ChevronRight, Loader2, Info, ArrowRight, Compass, Zap, Activity, Microscope, Fingerprint, Sparkles, MessageSquare, Terminal, ShieldCheck, Layers, Cpu, Target, Filter, BrainCircuit, Lightbulb } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); 
  const [detective] = useState(() => new DetectiveService());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      setIsTyping(true);
      const prompt = `System startup. Introduction: "Hi, I'm Agent QnA. I show you how AI thinks by breaking down answers into 4 diagnostic stages: Intent, Evidence, Logic, and Verdict. Ask me anything to start a logical scan!" No markdown.`;
      const response = await detective.sendMessage(prompt);
      const { chat, workspace } = DetectiveService.parseSplitContent(response);
      setMessages([{
        role: 'assistant',
        content: response,
        chatPart: chat.replace(/[*_#]/g, ''), 
        workspacePart: workspace
      }]);
      setIsTyping(false);
    };
    init();
  }, [detective]);

  const handleReset = () => {
    // Graceful state reset instead of page reload
    setMessages(prev => prev.length > 0 ? [prev[0]] : []);
    setCurrentStage(0);
    setInput('');
  };

  const handleSend = async (text?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const userText = text || input.trim();
    if (!userText || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    const response = await detective.sendMessage(userText);
    const { chat, workspace } = DetectiveService.parseSplitContent(response);

    const stageMatch = workspace.match(/STAGE:\s*(\d)/i);
    if (stageMatch) {
      setCurrentStage(parseInt(stageMatch[1]));
    } else if (userText.toLowerCase().includes('proceed')) {
      setCurrentStage(prev => Math.min(prev + 1, 4));
    } else if (currentStage === 0 && userText.toLowerCase() !== 'proceed') {
      setCurrentStage(1);
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      chatPart: chat.replace(/[*_#]/g, ''), 
      workspacePart: workspace
    }]);
    setIsTyping(false);
  };

  const getStageSuggestions = () => {
    if (isTyping) return [];
    switch (currentStage) {
      case 0: return ["How do stars form?", "Why is the sky blue?", "How does GPS work?"];
      case 1: return ["Proceed", "What is Neural Load?", "Show tokens"];
      case 2: return ["Proceed", "Verify sources", "Tell me more"];
      case 3: return ["Proceed", "What was filtered?", "Logic check"];
      case 4: return ["New Inquiry", "Explain the analogy", "Final recap"];
      default: return ["Proceed"];
    }
  };

  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const currentAssistantMessage = assistantMessages.slice(-1)[0];
  
  const activeWorkspace = assistantMessages
    .slice()
    .reverse()
    .find(m => m.workspacePart && 
              m.workspacePart.includes("STAGE:") &&
              m.workspacePart.length > 20)?.workspacePart || "";

  const isComplete = currentStage === 4;
  const showNextButton = !isComplete && !isTyping && messages.length > 1 && 
                        (currentAssistantMessage?.chatPart?.toLowerCase().includes("proceed") || 
                         currentAssistantMessage?.chatPart?.toLowerCase().includes("next") || 
                         currentStage > 0);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 selection:bg-indigo-100">
      {/* Sidebar - Visual Pipeline */}
      <div className="w-16 md:w-20 border-r border-slate-200 flex flex-col items-center py-6 bg-white z-20 shadow-sm">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 mb-10 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
          <BrainCircuit size={24} className="text-white" />
        </div>
        <div className="flex flex-col items-center space-y-10 flex-1">
          <PipelineIcon active={currentStage >= 1} icon={<Fingerprint size={22} />} label="Intent" />
          <PipelineIcon active={currentStage >= 2} icon={<Database size={22} />} label="Evidence" />
          <PipelineIcon active={currentStage >= 3} icon={<Layers size={22} />} label="Logic" />
          <PipelineIcon active={currentStage >= 4} icon={<ShieldCheck size={22} />} label="Verdict" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL - CHAT */}
        <div className="w-[35%] min-w-[360px] flex flex-col border-r border-slate-200 bg-white z-10 shadow-xl">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Agent QnA Console</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
                {msg.role === 'assistant' && (
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Agent QnA</span>
                )}
                <div className={`max-w-[90%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
                }`}>
                  {msg.role === 'user' ? msg.content : msg.chatPart}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Running Scan...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-5">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {getStageSuggestions().map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    disabled={isTyping}
                    className="px-4 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-xl text-[12px] font-semibold text-slate-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={(e) => handleSend(undefined, e)} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Agent QnA..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="absolute right-3 top-2.5 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL - WORKSPACE */}
        <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Microscope size={18} className="text-indigo-600" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 uppercase">Diagnostic Workspace</h2>
            </div>
            {currentStage > 0 && (
              <div className="px-5 py-2 bg-indigo-50 rounded-full border border-indigo-100 flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Stage {currentStage} of 4</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
            {(!activeWorkspace || (currentStage === 0 && !isTyping)) ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-32 h-32 bg-white border border-slate-200 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-slate-200/50 relative">
                   <div className="absolute inset-0 rounded-[3rem] border-2 border-dashed border-indigo-100 animate-[spin_10s_linear_infinite]" />
                   <Search size={52} className="text-slate-200" />
                </div>
                <div className="space-y-3">
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300">Awaiting Signal</p>
                </div>
              </div>
            ) : (
              <div key={activeWorkspace.length} className="max-w-2xl mx-auto pb-10">
                <WorkspaceContent content={activeWorkspace} />
              </div>
            )}
          </div>

          <div className="h-32 flex items-center justify-center bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-10">
            {showNextButton ? (
              <button
                onClick={() => handleSend('Proceed')}
                className="group flex items-center gap-5 bg-indigo-600 hover:bg-indigo-700 text-white px-20 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-indigo-200 transition-all active:scale-95 animate-in slide-in-from-bottom-4 duration-500"
              >
                Proceed to Stage {currentStage + 1}
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            ) : isComplete ? (
              <button 
                onClick={handleReset}
                className="flex items-center gap-4 px-14 py-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 font-black text-[12px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-xl shadow-emerald-100/30 active:scale-95 animate-in fade-in"
              >
                <CheckCircle size={22} />
                Clear for New Scan
              </button>
            ) : isTyping ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Processing Diagnostic</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-200">
                <Terminal size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.6em]">System Standby</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineIcon: React.FC<{ active: boolean; icon: React.ReactNode; label: string }> = ({ active, icon, label }) => (
  <div className="flex flex-col items-center group cursor-default">
    <div className={`p-4 rounded-2xl transition-all duration-700 ${active ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-200 border border-slate-100'}`}>
      {icon}
    </div>
    <span className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] transition-colors duration-500 ${active ? 'text-indigo-600' : 'text-slate-200'}`}>
      {label}
    </span>
  </div>
);

const WorkspaceContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  lines.forEach(line => {
    if (line.toUpperCase().startsWith('STAGE:')) {
      if (currentBlock.length > 0) blocks.push(currentBlock);
      currentBlock = [];
    } else {
      currentBlock.push(line);
    }
  });
  if (currentBlock.length > 0) blocks.push(currentBlock);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {blocks.map((blockLines, idx) => {
        // --- STAGE 1: INTENT MAPPING ---
        if (blockLines.some(l => l.includes('SALIENCY_MAP'))) {
          const saliencyLine = blockLines.find(l => l.includes('SALIENCY_MAP')) || "";
          const goalLine = blockLines.find(l => l.includes('PRIMARY_GOAL')) || "";
          const loadLine = blockLines.find(l => l.includes('NEURAL_LOAD')) || "";
          
          const tokens: {word: string, weight: number}[] = [];
          const matches = saliencyLine.matchAll(/([A-Za-z0-9]+):\s*(\d+)/g);
          for (const match of matches) {
            tokens.push({ word: match[1], weight: parseInt(match[2]) });
          }

          return (
            <div key={idx} className="space-y-6">
               <SectionHeader icon={<Fingerprint size={16}/>} text="Token Importance (The AI Focus)" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {tokens.map((t, i) => (
                   <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-1 transition-all hover:border-indigo-200">
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t.weight}%</span>
                     <span className="font-bold text-slate-800 text-[15px]">{t.word}</span>
                   </div>
                 ))}
               </div>
               <div className="flex gap-4">
                 <div className="flex-1 bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-200 block mb-2">Intent Objective</span>
                    <p className="text-lg font-bold leading-relaxed">{goalLine.split(':')[1]?.trim()}</p>
                 </div>
                 {loadLine && (
                   <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col items-center justify-center min-w-[120px]">
                      <Activity size={20} className="text-indigo-400 mb-2" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Neural Load</span>
                      <span className="font-black text-indigo-600 uppercase text-xs">{loadLine.split(':')[1]?.trim()}</span>
                   </div>
                 )}
               </div>
               <p className="text-[11px] text-slate-400 italic px-2">Educational Note: I convert your words into mathematical "vectors" to understand meaning over syntax.</p>
            </div>
          );
        }

        // --- STAGE 2: KNOWLEDGE FRAGMENTS ---
        if (blockLines.some(l => l.includes('FRAGMENT') || l.includes('STRENGTH'))) {
          return (
            <div key={idx} className="space-y-5">
              <SectionHeader icon={<Database size={16}/>} text="Knowledge Fragment Retrieval" />
              {blockLines.map((line, lidx) => {
                if (!line.includes('|')) return null;
                const [label, contentPart] = line.split('|').map(s => s.trim());
                const percentMatch = line.match(/(\d+)%/);
                const strength = percentMatch ? parseInt(percentMatch[1]) : 0;
                const textOnly = contentPart.split(/STRENGTH|RELEVANCE/i)[0].trim().replace(/^[:\s-]+/, '');

                return (
                  <div key={lidx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all hover:translate-x-1 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">{label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${strength}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{strength}% Strength</span>
                      </div>
                    </div>
                    <p className="text-[15px] text-slate-700 italic leading-relaxed font-medium">"{textOnly}"</p>
                  </div>
                );
              })}
            </div>
          );
        }

        // --- STAGE 3: ATTENTION DISTRIBUTION & FILTERING ---
        if (blockLines.some(l => l.includes('ATTENTION_DISTRIBUTION'))) {
          const distributionLine = blockLines.find(l => l.includes('ATTENTION_DISTRIBUTION')) || "";
          const logicLine = blockLines.find(l => l.includes('SYNTHESIS_LOGIC')) || "";
          const noiseLine = blockLines.find(l => l.includes('NOISE_FILTERED')) || "";
          
          const weights: {key: string, val: number}[] = [];
          const matches = distributionLine.matchAll(/([A-Za-z0-9\s]+):\s*(\d+)/g);
          for (const match of matches) {
            weights.push({ key: match[1].trim(), val: parseInt(match[2]) });
          }

          return (
            <div key={idx} className="space-y-6">
               <SectionHeader icon={<Target size={16}/>} text="Neural Attention (Focus Split)" />
               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                 <p className="text-[12px] text-slate-400 italic">
                   Total Attention = 100%. The bars below show how focus is distributed across fragments.
                 </p>
                 <div className="space-y-5">
                   {weights.map((w, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">{w.key} Focus</span>
                           <span className="text-[14px] font-black text-indigo-600">{w.val}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${w.val}%` }} />
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                     <div className="flex items-center gap-2 mb-3">
                        <Compass size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Synthesis Logic</span>
                     </div>
                     <p className="text-[13px] text-slate-700 font-semibold leading-relaxed">
                       {logicLine.split(':')[1]?.trim()}
                     </p>
                  </div>
                  <div className="bg-slate-100/50 border border-slate-200 p-6 rounded-3xl">
                     <div className="flex items-center gap-2 mb-3">
                        <Filter size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Noise Filtered</span>
                     </div>
                     <p className="text-[13px] text-slate-500 italic">
                       {noiseLine.split(':')[1]?.trim() || "No significant noise detected."}
                     </p>
                  </div>
               </div>
               <p className="text-[11px] text-slate-400 italic px-2 text-center">Educational Note: The "Attention Mechanism" allows me to weight relevant data higher than noise.</p>
            </div>
          );
        }

        // --- STAGE 4: GROUNDED VERDICT & ANALOGY ---
        if (blockLines.some(l => l.includes('VERDICT'))) {
          const verdictLine = blockLines.find(l => l.includes('VERDICT')) || "";
          const groundingLine = blockLines.find(l => l.includes('GROUNDING_CHECK')) || "";
          const analogyLine = blockLines.find(l => l.includes('ANALOGY')) || "";
          const confidenceLine = blockLines.find(l => l.includes('CONFIDENCE')) || "";
          
          const checks = groundingLine.split(':')[1]?.split(',').map(s => s.trim()) || [];

          return (
            <div key={idx} className="space-y-8">
               <div className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 border-4 border-white">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-indigo-300" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-200">Final Conclusion</span>
                  </div>
                  <p className="text-2xl font-bold leading-tight">{verdictLine.split(':')[1]?.trim()}</p>
                  <div className="mt-10 pt-8 border-t border-indigo-500/50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Logical Reliability</span>
                    <span className="text-2xl font-black text-white">{confidenceLine.split(':')[1]?.trim() || "100%"}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                    <SectionHeader icon={<CheckCircle size={16}/>} text="Grounding Audit" />
                    <div className="space-y-3 mt-4">
                      {checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-3 text-slate-600">
                          <CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" />
                          <span className="text-[13px] leading-relaxed italic">"{check}"</span>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
                      <Lightbulb size={60} className="text-indigo-600" />
                    </div>
                    <SectionHeader icon={<Lightbulb size={16}/>} text="Simple Analogy" />
                    <p className="mt-4 text-[15px] font-bold text-indigo-900 leading-relaxed italic">
                      {analogyLine.split(':')[1]?.trim()}
                    </p>
                 </div>
               </div>
            </div>
          );
        }

        return (
          <div key={idx} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-md text-center text-xl font-bold text-slate-800 leading-relaxed transition-all hover:shadow-xl">
            {blockLines.join(' ')}
          </div>
        );
      })}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3 mb-2 px-2">
    <div className="text-indigo-500">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{text}</span>
  </div>
);

export default App;
