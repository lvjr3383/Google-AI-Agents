
import React from 'react';
import { Token } from '../types';

interface TokenFlowProps {
  tokens: Token[];
}

export const TokenFlow: React.FC<TokenFlowProps> = ({ tokens }) => {
  return (
    <div className="flex flex-wrap gap-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {tokens.map((token, i) => (
        <div key={i} className="flex flex-col items-center group">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
            {token.text}
          </div>
          <div className="mt-1.5 flex flex-col items-center">
             <div className="w-px h-2 bg-slate-200" />
             <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                token.bioTag === 'O' ? 'bg-slate-100 text-slate-400' :
                token.bioTag.startsWith('B-') ? 'bg-blue-600 text-white' :
                'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {token.bioTag}
              </span>
          </div>
        </div>
      ))}
    </div>
  );
};
