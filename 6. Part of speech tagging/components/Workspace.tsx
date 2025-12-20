
import React, { useEffect, useRef } from 'react';
import { AnalysisResult, AnalysisStep } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface WorkspaceProps {
  analysis?: AnalysisResult;
  step: AnalysisStep;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#64748b', '#94a3b8'];

const POS_MAP: Record<string, string> = {
  'NOUN': 'Noun',
  'VERB': 'Verb',
  'ADJ': 'Adjective',
  'ADV': 'Adverb',
  'PRON': 'Pronoun',
  'DET': 'Determiner',
  'ADP': 'Preposition',
  'CONJ': 'Conjunction',
  'CCONJ': 'Conjunction',
  'SCONJ': 'Sub. Conjunction',
  'NUM': 'Number',
  'PART': 'Particle',
  'PROPN': 'Proper Noun',
  'PUNCT': 'Punctuation',
  'AUX': 'Auxiliary',
  'INTJ': 'Interjection'
};

const Workspace: React.FC<WorkspaceProps> = ({ analysis, step }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step]);

  if (!analysis || step === 'input') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Agent POS Workspace</h1>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          Waiting for your input... Agent POS will build your grammatical breakdown right here, step-by-step.
        </p>
      </div>
    );
  }

  const chartDataFormatted = analysis.chartData.labels.map((label, i) => ({
    name: label,
    count: analysis.chartData.counts[i]
  }));

  const showTokenTable = ['tokenize', 'tag', 'aggregate', 'present'].includes(step);
  const showFullTable = ['tag', 'aggregate', 'present'].includes(step);
  const showChart = ['aggregate', 'present'].includes(step);
  const showPresent = step === 'present';

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-8 bg-white scroll-smooth flex flex-col gap-12 pb-32">
      {/* Progress Header - Fixed Position relative to content */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 sticky top-0 bg-white z-20">
        {['tokenize', 'tag', 'aggregate', 'present'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              ['tokenize', 'tag', 'aggregate', 'present'].indexOf(step) >= i 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              ['tokenize', 'tag', 'aggregate', 'present'].indexOf(step) >= i 
                ? 'text-blue-600' 
                : 'text-slate-300'
            }`}>
              {s}
            </span>
            {i < 3 && <div className="w-4 h-[1px] bg-slate-100" />}
          </div>
        ))}
      </div>

      {/* SECTION 1: THE TABLE */}
      {showTokenTable && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {showFullTable ? "Grammatical Roles" : "Token Breakdown"}
            </h3>
          </div>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-4 border-b border-slate-100 w-12 text-center">#</th>
                  <th className="px-4 py-4 border-b border-slate-100">Token</th>
                  <th className="px-4 py-4 border-b border-slate-100">Base Form</th>
                  {showFullTable && (
                    <>
                      <th className="px-4 py-4 border-b border-slate-100">Part of Speech</th>
                      <th className="px-4 py-4 border-b border-slate-100">Head Word</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analysis.tokens.map((row) => (
                  <tr key={row.index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs text-center">{row.index}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{row.token}</td>
                    <td className="px-4 py-3 text-slate-500 italic">{row.lemma}</td>
                    {showFullTable && (
                      <>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50">
                            {POS_MAP[row.pos] || row.pos}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {row.head_token === row.token ? <span className="text-blue-500 font-bold uppercase tracking-tighter">Root</span> : row.head_token}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 2: THE GRAMMAR SPOTLIGHT (Step 2) */}
      {showFullTable && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-sm leading-relaxed shadow-xl border-l-4 border-blue-500">
            <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">Agent POS Spotlight</h4>
            <p className="text-slate-100 text-base">{analysis.tagExplanations}</p>
          </div>
        </section>
      )}

      {/* SECTION 3: THE CHART (Step 3) */}
      {showChart && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Part of Speech Balance</h3>
          <div className="h-[320px] w-full bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataFormatted} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: '700', fill: '#475569' }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartDataFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="right" offset={10} style={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* SECTION 4: THE GRAND FINALE (Step 4) */}
      {showPresent && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Final Mapped Sentence</h3>
          <div className="p-8 bg-white rounded-3xl leading-relaxed text-2xl shadow-2xl border border-slate-100 flex flex-wrap gap-x-2 gap-y-4 ring-1 ring-slate-100">
            {analysis.colorizedSpans.map((span, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 rounded-lg transition-all group relative cursor-help hover:scale-105"
                style={{ backgroundColor: `${span.color_hex}15`, borderBottom: `3px solid ${span.color_hex}` }}
              >
                {span.text}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs px-3 py-1 rounded-full pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-30 font-bold">
                  {span.pos}
                </span>
              </span>
            ))}
          </div>
          <div className="mt-8 p-6 bg-blue-600 rounded-2xl shadow-xl text-white">
            <h4 className="text-blue-200 font-bold text-xs uppercase tracking-widest mb-2">Structure Summary</h4>
            <p className="text-lg leading-relaxed font-medium">{analysis.markdownSummary}</p>
          </div>
        </section>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default Workspace;
