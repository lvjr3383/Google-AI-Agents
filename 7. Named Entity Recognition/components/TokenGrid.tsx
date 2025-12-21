
import React from 'react';
import { Token } from '../types';

interface TokenGridProps {
  tokens: Token[];
}

export const TokenGrid: React.FC<TokenGridProps> = ({ tokens }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-white border-b border-slate-200 uppercase text-[10px] tracking-widest text-slate-500 font-bold">
            <th className="px-4 py-3">Token Index</th>
            <th className="px-4 py-3">Text</th>
            <th className="px-4 py-3">BIO Tag</th>
            <th className="px-4 py-3">Label</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => (
            <tr key={i} className="border-b border-slate-200 hover:bg-white transition-colors">
              <td className="px-4 py-3 font-mono text-slate-400">#{i.toString().padStart(2, '0')}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{token.text}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  token.bioTag === 'O' ? 'bg-slate-200 text-slate-600' :
                  token.bioTag.startsWith('B-') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  {token.bioTag}
                </span>
              </td>
              <td className="px-4 py-3">
                {token.label !== 'O' ? (
                  <span className="text-slate-500 italic text-xs">{token.label}</span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
