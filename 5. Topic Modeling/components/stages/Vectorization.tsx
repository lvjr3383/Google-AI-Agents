
import React from 'react';
import { REVIEWS_DATASET, STOP_WORDS } from '../../constants';

const Vectorization: React.FC = () => {
  const keywordFreq: Record<string, number> = {};
  REVIEWS_DATASET.forEach(r => {
    r.text.toLowerCase().split(' ').forEach(w => {
      const cleaned = w.replace(/[.,!]/g, '');
      if (!STOP_WORDS.has(cleaned) && cleaned.length > 2) {
        keywordFreq[cleaned] = (keywordFreq[cleaned] || 0) + 1;
      }
    });
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(e => e[0]);

  return (
    <div className="h-full flex flex-col justify-center animate-in fade-in duration-700">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-8 h-px bg-sky-500/30"></span>
        Word Frequency Matrix
      </h3>
      
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="p-4 text-xs font-mono-code text-slate-500 uppercase tracking-widest">Doc_ID</th>
              {topKeywords.map(kw => (
                <th key={kw} className="p-4 text-xs font-mono-code text-sky-600 uppercase tracking-widest">{kw}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REVIEWS_DATASET.map(review => (
              <tr key={review.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-xs font-mono-code text-slate-400">#00{review.id}</td>
                {topKeywords.map(kw => {
                  const count = (review.text.toLowerCase().match(new RegExp(kw, 'g')) || []).length;
                  return (
                    <td key={kw} className={`p-4 text-center font-mono-code ${count > 0 ? 'text-sky-600 font-bold' : 'text-slate-300'}`}>
                      {count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 italic max-w-lg">
        * Every number represents how many times a specific word appears in that review.
      </p>
    </div>
  );
};

export default Vectorization;
