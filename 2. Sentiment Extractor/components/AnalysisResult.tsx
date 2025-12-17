import React, { useEffect, useRef, useState } from 'react';
import { SentimentAnalysis, SentimentLabel, AnalysisStep, WordImpact } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area, ReferenceLine } from 'recharts';
import { Activity, Cpu, Search, BookOpen, Zap, AlertCircle, Layers, BarChart3, Hash, ArrowDown, CheckCircle2, XCircle, MousePointerClick, TrendingUp } from 'lucide-react';

interface Props {
  data: SentimentAnalysis;
  currentStep: AnalysisStep;
  confidenceThreshold: number;
}

const COLORS = {
  [SentimentLabel.POSITIVE]: '#10b981', // Emerald 500
  [SentimentLabel.NEGATIVE]: '#f43f5e', // Rose 500
  [SentimentLabel.NEUTRAL]: '#64748b',  // Slate 500
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs text-slate-700 min-w-[150px] z-50">
        <p className="font-bold text-blue-600 mb-1 border-b border-slate-100 pb-1">{data.label?.toUpperCase() || 'POINT'}</p>
        <div className="flex justify-between text-slate-500 font-mono mt-1">
          <span>Sent: {data.x.toFixed(1)}</span>
          <span>Intens: {data.y.toFixed(1)}</span>
        </div>
        {data.isCurrent ? (
          <div className="mt-2 text-[10px] text-yellow-700 font-bold bg-yellow-50 px-1 py-0.5 rounded text-center border border-yellow-100">
            CURRENT INPUT
          </div>
        ) : (
          <div className="mt-2 text-[10px] text-slate-500 font-semibold bg-slate-50 px-1 py-0.5 rounded text-center border border-slate-100">
            ANCHOR CONCEPT
          </div>
        )}
      </div>
    );
  }
  return null;
};

const FlowTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-2 rounded shadow-lg text-xs font-mono">
        <p className="font-bold text-slate-800 mb-1">Token: "{payload[0].payload.token}"</p>
        <p className={`${payload[0].value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          Sentiment: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const AnalysisResult: React.FC<Props> = ({ data, currentStep, confidenceThreshold }) => {
  const signalColor = COLORS[data.signal.label];
  const endRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<WordImpact | null>(null);
  
  const score = data.signal.confidenceScore;
  const isPassing = score >= confidenceThreshold;

  // Prepare data for the Sentiment Arc chart
  const arcData = data.mechanics.tokens.map((token, i) => ({
    token: token,
    score: data.why.sentimentArc ? data.why.sentimentArc[i] : 0,
    index: i
  }));

  // Auto scroll to bottom when step advances
  useEffect(() => {
    if (currentStep > 0) {
        setTimeout(() => {
            endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 300);
    }
  }, [currentStep]);

  // Helper to find impact for a token
  const getImpactForToken = (token: string) => {
    const cleanToken = token.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return data.why.highImpactWords.find(w => 
      w.word.toLowerCase().includes(cleanToken) || cleanToken.includes(w.word.toLowerCase())
    );
  };

  return (
    <div className="w-full space-y-8 pb-12">
      
      {/* PHASE 1: TOKENIZATION */}
      {currentStep >= AnalysisStep.TOKENIZATION && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center space-x-2 text-slate-500 mb-6 uppercase text-xs tracking-widest font-mono font-bold">
            <Cpu size={16} className="text-blue-600" />
            <span>Step 1: Input Processing // Tokenization</span>
          </div>
          
          <div className="flex-1 space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              The model converts raw text into computational units called "tokens". Notice how it handles punctuation and capitalization.
            </p>

            <div className="relative">
              {/* Layer 1: Raw Text */}
              <div className="mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono ml-1">Raw Input</span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-serif italic text-lg">
                  "{data.mechanics.tokens.join(' ')}"
                </div>
              </div>

              <div className="flex justify-center my-2">
                <ArrowDown size={16} className="text-slate-300" />
              </div>

              {/* Layer 2: Tokens */}
              <div className="mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono ml-1">Tokens</span>
                <div className="flex flex-wrap gap-2">
                  {data.mechanics.tokens.map((token, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded text-sm font-mono text-blue-700 shadow-sm">
                      {token}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center my-2">
                <ArrowDown size={16} className="text-slate-300" />
              </div>

              {/* Layer 3: IDs */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono ml-1 flex items-center gap-1">
                  <Hash size={12} /> Vector IDs
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.mechanics.tokenIds && data.mechanics.tokenIds.map((id, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500 min-w-[3rem] text-center">
                      {id}
                    </span>
                  ))}
                  {!data.mechanics.tokenIds && data.mechanics.tokens.map((_, idx) => (
                     <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500 min-w-[3rem] text-center">
                        {Math.floor(Math.random() * 5000)}
                     </span>
                  ))}
                </div>
              </div>
            </div>

            {data.mechanics.subwords.length > 0 && (
              <div className="bg-orange-50 rounded p-3 border border-orange-100 mt-4">
                <span className="text-xs text-orange-600 uppercase tracking-wide block mb-2 font-bold">Sub-word Splitting Detected</span>
                <div className="flex flex-wrap gap-2">
                   {data.mechanics.subwords.map((sub, idx) => (
                    <span key={idx} className="text-xs font-mono text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 shadow-sm">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PHASE 2: VECTOR SPACE */}
      {currentStep >= AnalysisStep.VECTOR_SPACE && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all min-h-[450px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center space-x-2 text-slate-500 mb-4 uppercase text-xs tracking-widest font-mono font-bold">
            <Layers size={16} className="text-blue-600" />
            <span>Step 2: The Vector Space</span>
          </div>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{data.mechanics.vectorSpaceDescription}</p>
          
          {/* Explicit height wrapper for Recharts */}
          <div className="flex-1 w-full min-h-[350px] bg-slate-50 rounded-lg border border-slate-200 p-2 relative">
             {/* Legend */}
             <div className="absolute top-3 right-3 bg-white/90 p-3 rounded border border-slate-200 z-10 text-[10px] font-mono text-slate-500 flex flex-col gap-2 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-2 ring-yellow-200"></div>
                  <span className="font-bold text-slate-700">Current Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                  <span>Semantic Anchor</span>
                </div>
                <div className="h-px bg-slate-200 my-0.5"></div>
                <div className="text-slate-400 italic">Dist. ≈ Semantic Similarity</div>
             </div>

             {/* Axes Labels */}
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">
                Sentiment Axis (Neg → Pos)
             </div>
             <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100 origin-center">
                Intensity / Abstract
             </div>


            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} horizontal={true} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="x" 
                  domain={[-12, 12]} 
                  tick={{fill: '#64748b', fontSize: 10}} 
                  tickLine={{stroke: '#cbd5e1'}}
                  axisLine={{stroke: '#cbd5e1'}}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="y" 
                  domain={[-12, 12]} 
                  tick={{fill: '#64748b', fontSize: 10}}
                  tickLine={{stroke: '#cbd5e1'}}
                  axisLine={{stroke: '#cbd5e1'}}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />
                <Scatter name="Vectors" data={data.mechanics.vectorCoordinates}>
                  {data.mechanics.vectorCoordinates.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#facc15' : '#94a3b8'} 
                      stroke={entry.isCurrent ? '#b45309' : '#64748b'}
                      strokeWidth={entry.isCurrent ? 2 : 1}
                    />
                  ))}
                  <LabelList 
                    dataKey="label" 
                    position="top" 
                    offset={10} 
                    style={{ 
                      fill: '#475569', 
                      fontSize: '11px', 
                      fontFamily: 'monospace', 
                      fontWeight: 600,
                      pointerEvents: 'none',
                      textShadow: '0 1px 2px white'
                    }} 
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* PHASE 3: EXPLAINABILITY (Interactive Heatmap) */}
      {currentStep >= AnalysisStep.EXPLAINABILITY && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center space-x-2 text-slate-500 mb-6 uppercase text-xs tracking-widest font-mono font-bold">
            <Search size={16} className="text-blue-600" />
            <span>Step 3: Feature Extraction & Flow</span>
          </div>

          <div className="space-y-8">
            {/* Heatmap Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MousePointerClick size={16} className="text-blue-500 animate-pulse" /> 
                Tap glowing words to reveal logic
              </h3>

              {/* Interactive Sentence Heatmap */}
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 leading-loose shadow-inner text-center">
                <div className="flex flex-wrap gap-3 items-center justify-center text-xl">
                  {data.mechanics.tokens.map((token, idx) => {
                    const impact = getImpactForToken(token);
                    // Determine intensity color for Light Mode
                    let bgClass = "bg-transparent text-slate-500";
                    let borderClass = "border-transparent";
                    
                    if (impact) {
                       if (data.signal.label === SentimentLabel.POSITIVE) {
                          bgClass = "bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200";
                          borderClass = "border-emerald-300";
                       } else if (data.signal.label === SentimentLabel.NEGATIVE) {
                          bgClass = "bg-rose-100 text-rose-800 shadow-sm hover:bg-rose-200";
                          borderClass = "border-rose-300";
                       } else {
                          bgClass = "bg-slate-200 text-slate-700 hover:bg-slate-300";
                          borderClass = "border-slate-300";
                       }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setHoveredWord(impact || null)}
                        onMouseEnter={() => setHoveredWord(impact || null)}
                        className={`
                          px-3 py-1 rounded-lg transition-all duration-300 border cursor-pointer font-serif
                          ${bgClass} ${borderClass}
                          ${impact ? 'scale-110 font-medium ring-2 ring-offset-2 ring-offset-slate-50 ring-transparent hover:ring-slate-200' : 'hover:text-slate-700'}
                        `}
                      >
                        {token}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Explanation Card */}
              <div className="min-h-[120px] mt-4">
                {hoveredWord ? (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-white rounded-xl p-5 border border-slate-200 flex items-start gap-4 shadow-lg shadow-slate-200/50">
                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 shrink-0 text-blue-600">
                       <BarChart3 size={24} />
                     </div>
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <span className="text-xl font-bold text-slate-800 font-serif">"{hoveredWord.word}"</span>
                         <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded font-bold">
                           IMPACT: {hoveredWord.impactScore}%
                         </span>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         {hoveredWord.reason}
                       </p>
                     </div>
                   </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    Hover over the highlighted words above to see why the model chose them.
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Sentiment Flow Chart */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                The Sentiment Arc (Time Dimension)
              </h3>
              <p className="text-xs text-slate-500 mb-2">See how the model's sentiment evaluation changes as it reads the sentence from left to right.</p>
              
              <div className="h-48 w-full bg-slate-50 rounded-lg border border-slate-200 p-2 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={arcData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis 
                          dataKey="token" 
                          tick={{ fontSize: 10, fill: '#64748b' }} 
                          axisLine={false}
                          tickLine={false}
                          interval={0} // Show all ticks if possible, might need adjustment for long sentences
                       />
                       <YAxis hide domain={[-10, 10]} />
                       <Tooltip content={<FlowTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />
                       <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                       <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>

            {data.why.nuanceExplanation && (
               <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 mt-4">
                 <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                 <p className="text-sm text-amber-900 leading-relaxed">
                   <span className="font-bold text-amber-700 text-xs uppercase tracking-wide block mb-1">Nuance Detected</span>
                   {data.why.nuanceExplanation}
                 </p>
               </div>
            )}
          </div>
        </section>
      )}

      {/* PHASE 4: FINAL SIGNAL */}
      {currentStep >= AnalysisStep.FINAL_SIGNAL && (
        <>
        <section className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden group hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity size={120} className="text-slate-900" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-slate-500 mb-4 uppercase text-xs tracking-widest font-mono font-bold">
              <Activity size={16} className="text-blue-600" />
              <span>Step 4: Final Signal Extraction</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-5xl font-extrabold tracking-tight mb-3" style={{ color: signalColor }}>
                  {data.signal.label}
                </h2>
                <p className="text-slate-500 text-base max-w-md italic font-serif">
                  "{data.signal.metaphor}"
                </p>
              </div>
              
              <div className="flex-1 max-w-xs space-y-3">
                 {/* Enhanced Confidence Meter */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Confidence Score</span>
                      <div className="flex items-center gap-1.5">
                        {isPassing ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <XCircle size={14} className="text-rose-500" />
                        )}
                        <span className={`text-lg font-bold font-mono ${isPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative h-6 w-full mt-2">
                        {/* Threshold Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-px bg-slate-400 z-20 flex flex-col items-center group cursor-help transition-all duration-500"
                          style={{ left: `${confidenceThreshold * 100}%` }}
                        >
                            <div className="absolute -top-5 text-[9px] font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                REQ: {(confidenceThreshold * 100).toFixed(0)}%
                            </div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full -mt-2.5"></div>
                        </div>

                        {/* Background Track */}
                        <div className="absolute inset-0 bg-slate-200 rounded-full"></div>

                        {/* Fill Bar */}
                        <div 
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out flex items-center justify-end overflow-hidden ${
                             isPassing 
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                              : 'bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          }`}
                          style={{ width: `${score * 100}%` }}
                        >
                           {/* Animated Glint */}
                           {isPassing && (
                             <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] -skew-x-12 translate-x-full"></div>
                           )}
                        </div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono font-medium">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                 </div>

                 {/* Status Text */}
                 <div className={`text-[10px] text-center font-mono py-1.5 rounded font-bold border ${
                    isPassing 
                      ? 'text-emerald-700 border-emerald-200 bg-emerald-50' 
                      : 'text-rose-700 border-rose-200 bg-rose-50'
                 }`}>
                    {isPassing ? 'SIGNAL LOCKED // THRESHOLD MET' : 'AMBIGUOUS SIGNAL // REQ. REVIEW'}
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-blue-300 mb-4 uppercase text-xs tracking-widest font-mono font-bold">
              <BookOpen size={16} />
              <span>Field Notes</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{data.lesson.title}</h3>
            <p className="text-slate-300 leading-relaxed max-w-3xl font-light">
              {data.lesson.content}
            </p>
            
            <div className="mt-6 flex items-center text-xs text-blue-400 font-mono gap-1 opacity-80">
              <Zap size={12} />
              <span>ARCHITECT_LOG_V1.0.4 // END_OF_ANALYSIS</span>
            </div>
          </div>
        </section>
        </>
      )}

      {/* Invisible element to scroll to */}
      <div ref={endRef} />
    </div>
  );
};