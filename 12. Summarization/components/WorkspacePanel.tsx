
import React, { useState } from 'react';
import { PipelineStep } from '../types';

interface WorkspacePanelProps {
  currentStep: PipelineStep;
  data: any;
  inputText: string;
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ currentStep, data, inputText }) => {
  const [hoveredOrb, setHoveredOrb] = useState<any>(null);

  if (!data && currentStep !== PipelineStep.INITIALIZATION) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold text-[10px] animate-pulse tracking-[0.4em] uppercase">Calculating_Matrix</div>
      </div>
    );
  }

  const renderInitialization = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="relative group">
        <div className="w-64 h-64 border border-slate-100 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute inset-4 border-2 border-indigo-500/10 rounded-full border-t-indigo-500 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700">🔎</div>
      </div>
      <div className="space-y-3 relative z-10">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Agent Standby</h2>
        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.6em]">Awaiting Data Injection</p>
      </div>
    </div>
  );

  const renderScope = () => (
    <div className="p-8 space-y-6 bg-white h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
           PHASE 01: DATA SCAN
        </h3>
        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">NOMINAL</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Input Complexity', value: data?.complexity_score || '...', sub: 'Score', color: data?.complexity_score === 'High' ? 'text-rose-600' : 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Target Output', value: data?.input_physics?.target_tokens || 0, sub: 'Tokens', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'Original Size', value: data?.input_physics?.tokens || 0, sub: 'Tokens', color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Reader Context', value: data?.audience_dial || '...', sub: 'Profile', color: 'text-sky-600', bg: 'bg-sky-50/50' }
        ].map((item, i) => (
          <div key={i} className={`${item.bg} p-6 rounded-2xl border border-slate-100 flex flex-col justify-center`}>
             <p className="text-slate-400 text-[9px] mb-1 uppercase tracking-widest font-black">{item.label}</p>
             <p className={`text-4xl font-black flex items-baseline gap-2 ${item.color}`}>
               {item.value}
               <span className="text-[9px] text-slate-400 font-bold uppercase">{item.sub}</span>
             </p>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100 space-y-8 flex-1 flex flex-col justify-center relative shadow-sm">
         <h4 className="text-indigo-600 font-black uppercase text-[9px] tracking-[0.5em] text-center">Reading Time Analytics</h4>
         <div className="grid grid-cols-2 gap-12">
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-[9px] text-slate-500 font-black uppercase">Standard Input</span>
                 <span className="text-xl font-black text-slate-800">{data?.input_physics?.reading_time_original}</span>
               </div>
               <div className="w-full h-2.5 bg-slate-100 rounded-full"><div className="h-full bg-slate-300 w-full rounded-full"></div></div>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-[9px] text-indigo-600 font-black uppercase">Agent Summary</span>
                 <span className="text-xl font-black text-indigo-500">{data?.input_physics?.reading_time_summary}</span>
               </div>
               <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[25%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div></div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderFilter = () => (
    <div className="p-8 space-y-8 bg-white h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">PHASE 02: VALUE SCAN</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> High Value</div>
          <div className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Core Context</div>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase"><div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Background</div>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-50/50 rounded-[3rem] border border-slate-100 p-8 overflow-hidden">
        <div className="grid grid-cols-3 gap-8 h-full items-center justify-items-center">
          {(data?.heatmap_segments || []).map((seg: any, i: number) => {
            const score = seg.score || 0;
            const size = 100 + score * 80;
            const isHot = score > 0.8;
            const isCore = score > 0.5 && score <= 0.8;
            const color = isHot ? 'bg-rose-500' : isCore ? 'bg-indigo-500' : 'bg-slate-300';

            return (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredOrb(seg)}
                onMouseLeave={() => setHoveredOrb(null)}
                className={`
                  relative rounded-full cursor-help transition-all duration-500 hover:scale-110 shadow-lg flex items-center justify-center text-center p-4 border-2 border-white
                  ${color} animate-orbit
                `}
                style={{ width: `${size}px`, height: `${size}px`, animationDelay: `${i * 0.4}s` }}
              >
                <div className="pointer-events-none">
                  <p className="text-[8px] font-black uppercase text-white/50 tracking-widest">N_0{i+1}</p>
                  <p className="text-lg font-black text-white">{(score * 100).toFixed(0)}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {hoveredOrb && (
          <div className="absolute inset-x-8 bottom-8 animate-in slide-in-from-bottom-2 duration-300 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-50 p-6 rounded-[2rem] shadow-2xl flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shrink-0 ${hoveredOrb.score > 0.8 ? 'bg-rose-500' : hoveredOrb.score > 0.5 ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                 <span className="text-xl">{(hoveredOrb.score * 100).toFixed(0)}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Node Data: {hoveredOrb.importance}</p>
                <p className="text-sm text-slate-700 font-bold leading-relaxed truncate">"{hoveredOrb.text}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Identified Nodes</span>
          <div className="flex flex-wrap gap-1.5">
            {(data?.top_3_entities || []).map((entity: string, i: number) => (
              <span key={i} className="bg-white border border-slate-200 text-slate-700 px-4 py-1 rounded-full text-[10px] font-bold">
                 {entity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSynthesis = () => (
    <div className="p-10 space-y-10 bg-white h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
           <span className="w-2 h-10 bg-indigo-600 rounded-full"></span>
           PHASE 03: CONCEPT SYNTHESIS
        </h3>
        <span className="text-xs text-slate-400 font-black uppercase tracking-widest">MERGING ACTIVE</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="w-full max-w-4xl grid grid-cols-1 gap-4">
          {(data?.bottleneck?.input || []).map((seg: string, i: number) => (
            <div key={i} className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-lg hover:border-indigo-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">SOURCE CONTEXT 0{i+1}</p>
              <p className="text-lg text-slate-600 font-semibold leading-relaxed italic">
                "{seg}"
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 relative w-full">
           <div className="w-0.5 h-12 bg-gradient-to-b from-slate-100 to-indigo-500"></div>
           <div className="bg-indigo-600 text-white text-xs font-black px-8 py-3 rounded-full tracking-widest uppercase shadow-xl transform transition-transform hover:scale-105">
              {data?.bottleneck?.process || 'FUSING_CONCEPTS'}
           </div>
           <div className="w-0.5 h-12 bg-gradient-to-t from-slate-100 to-indigo-500"></div>
        </div>

        <div className="w-full max-w-4xl bg-white border-4 border-indigo-50 p-12 rounded-[3rem] shadow-sm text-center relative overflow-hidden ring-1 ring-indigo-100">
            <p className="text-xs text-slate-400 uppercase font-black mb-6 tracking-[0.5em]">SYNTHETIC OUTPUT</p>
            <p className="text-4xl text-slate-900 font-black leading-tight tracking-tight italic">
              "{data?.bottleneck?.output || '...'}"
            </p>
        </div>
      </div>
    </div>
  );

  const renderEssence = () => {
    const lossIcons: Record<string, { icon: string, color: string, bg: string }> = {
      'Detail': { icon: '🔍', color: 'text-rose-600', bg: 'bg-rose-50/50' },
      'Descriptive words': { icon: '✨', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
      'Side-story': { icon: '📖', color: 'text-amber-600', bg: 'bg-amber-50/50' },
      'Background': { icon: '☁️', color: 'text-sky-600', bg: 'bg-sky-50/50' }
    };

    return (
      <div className="p-10 space-y-10 bg-white h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">PHASE 04: THE ESSENCE</h3>
          <div className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md">FINALIZED</div>
        </div>
        
        <div className="bg-slate-50/50 p-14 rounded-[4rem] border border-slate-100 relative group flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
          <div className="absolute top-0 left-0 w-3 h-full bg-indigo-600/10"></div>
          <p className="text-3xl text-slate-900 font-extrabold leading-snug tracking-tight italic text-center z-10 max-w-4xl">
             {data?.final_summary}
          </p>
          <div className="absolute bottom-6 right-10 opacity-5 pointer-events-none">
            <span className="text-9xl font-black text-indigo-900">”</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 flex-1 min-h-0">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] flex flex-col shadow-sm">
             <h4 className="text-slate-900 text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
               </div>
               CONTEXT REMOVED
             </h4>
             <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
               {(data?.cutting_room_floor || []).map((item: any, i: number) => {
                 const config = lossIcons[item.type] || { icon: '🔸', color: 'text-slate-500', bg: 'bg-slate-50' };
                 return (
                   <div key={i} className={`flex items-start gap-5 ${config.bg} p-6 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md`}>
                      <span className="text-2xl shrink-0">{config.icon}</span>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${config.color}`}>{item.type}</p>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed italic">
                          "{item.content}"
                        </p>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
          
          <div className="bg-indigo-50/20 border border-indigo-100 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center">
             <h4 className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-10">ACCURACY RANKING</h4>
             <div className="relative flex items-center justify-center group">
               <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
               <svg className="w-56 h-56 transform -rotate-90 relative">
                  <circle cx="112" cy="112" r="95" stroke="#eef2ff" strokeWidth="18" fill="transparent" />
                  <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="18" fill="transparent" 
                          strokeDasharray={597} strokeDashoffset={597 - ((data?.faithfulness_score || 0) / 100) * 597}
                          strokeLinecap="round"
                          className="text-indigo-600 transition-all duration-[2000ms]" />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">{data?.faithfulness_score || 0}%</span>
                 <span className="text-[10px] text-indigo-400 font-black tracking-[0.3em] mt-2 uppercase">Integrity</span>
               </div>
             </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-3xl font-black transition-all uppercase tracking-widest text-xs shadow-xl transform active:scale-[0.98] mt-4"
        >
          RESET PIPELINE ENVIRONMENT
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white overflow-hidden shadow-inner border-l border-slate-100">
      {currentStep === PipelineStep.INITIALIZATION && renderInitialization()}
      {currentStep === PipelineStep.SCOPE_CONTEXT && renderScope()}
      {currentStep === PipelineStep.FILTER_HEATMAP && renderFilter()}
      {currentStep === PipelineStep.SYNTHESIS && renderSynthesis()}
      {currentStep === PipelineStep.ESSENCE && renderEssence()}
    </div>
  );
};

export default WorkspacePanel;
