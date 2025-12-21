
import React from 'react';
import { Span } from '../types';

interface NERHighlighterProps {
  text: string;
  spans: Span[];
}

export const NERHighlighter: React.FC<NERHighlighterProps> = ({ text, spans }) => {
  const sortedSpans = [...spans].sort((a, b) => a.start - b.start);
  const elements = [];
  let lastIndex = 0;

  sortedSpans.forEach((span, idx) => {
    if (span.start > lastIndex) {
      elements.push(
        <span key={`text-${idx}`} className="text-slate-700 leading-relaxed">
          {text.substring(lastIndex, span.start)}
        </span>
      );
    }

    elements.push(
      <span key={`span-${idx}`} className="relative group inline-block mx-0.5">
        <span 
          className="px-1 py-0.5 rounded text-white font-medium text-sm transition-all duration-200 shadow-sm inline-flex items-center gap-1"
          style={{ backgroundColor: span.color }}
        >
          {span.text}
          <span className="text-[10px] opacity-70 uppercase tracking-tighter">
            {span.label}
          </span>
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 pointer-events-none">
          <div className="bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg">
            <div className="font-bold border-b border-slate-600 mb-1 pb-1">{span.label}</div>
            <div>Range: {span.start} - {span.end}</div>
          </div>
          <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1 shadow-lg" />
        </div>
      </span>
    );

    lastIndex = span.end;
  });

  if (lastIndex < text.length) {
    elements.push(
      <span key="text-end" className="text-slate-700 leading-relaxed">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm leading-8 text-lg min-h-[120px]">
      {elements.length > 0 ? elements : <span className="text-slate-400 italic">Processing entities...</span>}
    </div>
  );
};
