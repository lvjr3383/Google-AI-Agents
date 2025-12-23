
import React, { useEffect, useState } from 'react';
import { COLORS, TAG_LABELS } from '../constants';

interface MatrixViewProps {
  tokens: string[];
  constituents: any[];
}

const MatrixView: React.FC<MatrixViewProps> = ({ tokens, constituents }) => {
  const n = tokens.length;
  const [revealedLevel, setRevealedLevel] = useState(0);
  const [hoveredSpan, setHoveredSpan] = useState<{start: number, end: number} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealedLevel(prev => (prev < n ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [n]);

  const getCellLabel = (start: number, end: number) => {
    const matches = constituents.filter(c => c.start === start && c.end === end);
    return matches.map(m => m.label);
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in duration-700 max-h-full overflow-auto scrollbar-hide">
      <div className="mb-10 text-center">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Step 2: The Fusion Grid</h3>
        <p className="text-sm text-slate-400 mt-2 italic">Hover over a colored block to see which words 'click' together.</p>
      </div>

      <div className="relative">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, 64px)` }}>
          {Array.from({ length: n }).map((_, r) => (
            Array.from({ length: n }).map((_, c) => {
              const start = r;
              const end = c;
              const spanLength = end - start + 1;
              const isVisible = end >= start;
              const isFilled = revealedLevel >= spanLength;
              const labels = getCellLabel(start, end);

              return (
                <div 
                  key={`${r}-${c}`}
                  onMouseEnter={() => labels.length > 0 && setHoveredSpan({start, end})}
                  onMouseLeave={() => setHoveredSpan(null)}
                  className={`h-16 w-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 relative group cursor-default ${
                    !isVisible ? 'opacity-0 pointer-events-none' : 
                    isFilled ? 'bg-slate-50 border-slate-200 shadow-sm scale-100' : 'bg-transparent border-slate-100 scale-95'
                  } ${hoveredSpan?.start === start && hoveredSpan?.end === end ? 'ring-4 ring-indigo-500/20 border-indigo-200' : ''}`}
                >
                  {isFilled && labels.length > 0 && (
                    <div className="flex flex-col gap-1 w-full p-1 overflow-hidden items-center">
                      {labels.map((l, idx) => (
                        <div key={idx} className={`px-1.5 py-1 rounded-lg text-[9px] font-black text-white ${COLORS[l] || 'bg-slate-400'} uppercase tracking-tight truncate w-full text-center shadow-sm`}>
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                  {isVisible && isFilled && labels.length === 0 && (
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  )}
                </div>
              );
            })
          ))}
        </div>
        
        {/* Token Labels with Highlight logic */}
        <div className="grid gap-2 mt-10" style={{ gridTemplateColumns: `repeat(${n}, 64px)` }}>
          {tokens.map((t, i) => {
            const isHighlighted = hoveredSpan && i >= hoveredSpan.start && i <= hoveredSpan.end;
            return (
              <div 
                key={i} 
                className={`text-[11px] font-black text-center uppercase truncate px-1 transition-all duration-300 py-2 rounded-lg ${
                  isHighlighted ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'text-slate-400'
                }`}
              >
                {t}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 flex gap-10">
        <div className="flex items-center gap-3">
           <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-md"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fused Blocks</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-3 h-3 rounded-full bg-slate-200"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Fit</span>
        </div>
      </div>
    </div>
  );
};

export default MatrixView;
