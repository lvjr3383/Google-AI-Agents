
import React from 'react';
import { AttentionMap } from '../types';

interface AttentionHeatmapProps {
  data: AttentionMap[];
}

const AttentionHeatmap: React.FC<AttentionHeatmapProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Extract source tokens from the first target token's weights
  const sourceTokens = data[0].weights.map(w => w.source_token);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="p-1"></th>
              {sourceTokens.map((src, i) => (
                <th key={i} className="p-1 text-[10px] font-bold text-slate-400 uppercase rotate-45 h-20 align-bottom pb-4 whitespace-nowrap">
                  {src}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="p-1 text-right text-xs font-bold text-slate-600 whitespace-nowrap pr-3">
                  {row.target_token}
                </td>
                {row.weights.map((cell, j) => (
                  <td 
                    key={j} 
                    className="p-0 w-8 h-8 rounded-sm relative group cursor-help transition-all hover:ring-2 hover:ring-indigo-400"
                    style={{ 
                      backgroundColor: `rgba(99, 102, 241, ${cell.weight})`,
                      border: cell.weight > 0.1 ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f1f5f9'
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                      <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {cell.source_token} ➔ {row.target_token}: {(cell.weight * 100).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-400 uppercase font-bold justify-center">
        <span>Low Attention</span>
        <div className="flex gap-1">
          {[0.1, 0.3, 0.5, 0.7, 1.0].map(w => (
            <div key={w} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${w})` }} />
          ))}
        </div>
        <span>High Attention</span>
      </div>
    </div>
  );
};

export default AttentionHeatmap;
