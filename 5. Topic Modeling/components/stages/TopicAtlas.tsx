
import React, { useState } from 'react';
import { TOPICS } from '../../constants';

const TopicAtlas: React.FC = () => {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center animate-in zoom-in duration-700">
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 border border-slate-200 rounded-full flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[85%] h-[85%] border border-slate-200 rounded-full"></div>
           <div className="w-[60%] h-[60%] border border-slate-200 rounded-full"></div>
           <div className="w-[35%] h-[35%] border border-slate-200 rounded-full"></div>
        </div>

        {/* Center Label */}
        <div className="z-0 text-center pointer-events-none">
           <div className="text-3xl font-black text-slate-800 tracking-tighter mb-1">MAPPING COMPLETE</div>
           <div className="text-[10px] text-sky-600 font-mono-code uppercase tracking-[0.3em]">5 Semantic Domains</div>
        </div>

        {/* Topic Bubbles Container */}
        {TOPICS.map((topic, i) => {
          // 5 topics = 72 degrees each
          const angle = (i * 72 * Math.PI) / 180 - Math.PI / 2;
          const radius = 210;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isHovered = hoveredTopic === topic.id;

          return (
            <div 
              key={topic.id}
              className="absolute transition-all duration-500 ease-out"
              style={{ 
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isHovered ? 50 : 10
              }}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
            >
              {/* The Bubble */}
              <div 
                className={`flex flex-col items-center justify-center rounded-full transition-all duration-300 cursor-help relative ${isHovered ? 'hover-pulse scale-110 shadow-2xl' : 'scale-100'}`}
                style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: isHovered ? `${topic.color}30` : `${topic.color}15`,
                  border: `2px solid ${isHovered ? topic.color : `${topic.color}50`}`,
                  boxShadow: isHovered 
                    ? `0 15px 45px ${topic.color}40, inset 0 0 15px ${topic.color}20` 
                    : `0 8px 20px ${topic.color}10`,
                }}
              >
                <div className={`text-slate-800 font-bold text-center px-2 leading-tight transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
                  {topic.name}
                </div>
                <div className="text-[9px] font-mono-code opacity-40 text-slate-500 uppercase mt-1">
                  {topic.id}
                </div>

                {/* Tooltip */}
                <div 
                  className={`absolute top-[105%] left-1/2 -translate-x-1/2 pt-2 w-56 pointer-events-none transition-all duration-300 origin-top ${
                    isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
                  }`}
                >
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-3">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: topic.color }}></div>
                    <div className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      Top Indicators
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords.slice(0, 6).map(kw => (
                        <span key={kw} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-600 font-mono-code">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-12 flex gap-8">
        <div className="px-8 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center shadow-sm">
          <div className="text-3xl font-black text-slate-800">20</div>
          <div className="text-[10px] text-slate-400 uppercase font-mono-code tracking-widest mt-1">Docs</div>
        </div>
        <div className="px-8 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center shadow-sm">
          <div className="text-3xl font-black text-slate-800">5</div>
          <div className="text-[10px] text-slate-400 uppercase font-mono-code tracking-widest mt-1">Topics</div>
        </div>
        <div className="px-8 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center shadow-sm border-b-4 border-b-emerald-400">
          <div className="text-3xl font-black text-emerald-500">96%</div>
          <div className="text-[10px] text-slate-400 uppercase font-mono-code tracking-widest mt-1">Confidence</div>
        </div>
      </div>
    </div>
  );
};

export default TopicAtlas;
