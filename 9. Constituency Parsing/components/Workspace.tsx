
import React from 'react';
import { Step, TreeNode } from '../types';
import { TAG_LABELS, COLORS } from '../constants';
import MatrixView from './MatrixView';
import TreeView from './TreeView';

interface WorkspaceProps {
  step: Step;
  sentence: string;
  setSentence: (s: string) => void;
  parseData: any;
  treeNode: TreeNode | null;
  onNext: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ step, sentence, setSentence, parseData, treeNode, onNext }) => {
  const tokens = parseData?.tokens || sentence.split(/\s+/).filter(x => x).map(w => ({ word: w, tag: '?' }));

  return (
    <div className="h-full w-full flex flex-col p-8 overflow-hidden">
      <div className={`mb-6 flex flex-wrap gap-2 justify-center bg-white/80 p-3 rounded-2xl border border-white shadow-sm transition-all duration-500 ${step === Step.INPUT ? 'opacity-0 translate-y-2' : 'opacity-100'}`}>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center mr-4">Blueprint Code:</div>
        {['S', 'NP', 'VP', 'PP'].map(tag => (
          <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
            <div className={`w-2.5 h-2.5 rounded-full ${COLORS[tag] || 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {TAG_LABELS[tag]?.split('(')[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {step === Step.INPUT && (
          <div className="w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in zoom-in duration-500">
            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-indigo-50 rounded-3xl mb-2">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-800">Drafting Table</h3>
              <p className="text-slate-500 max-w-md mx-auto">Enter a sentence to build its architectural pyramid.</p>
            </div>
            <div className="relative group">
              <input 
                type="text"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Type something..."
                className="w-full text-2xl p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:border-indigo-500 focus:outline-none focus:bg-white transition-all pr-40 shadow-inner"
              />
              <button 
                onClick={onNext} 
                className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 uppercase tracking-widest text-sm"
              >
                Inspect
              </button>
            </div>
          </div>
        )}

        {step === Step.BLUEPRINT && (
          <div className="w-full max-w-4xl bg-white p-12 rounded-[3rem] shadow-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Step 1: The Material Sort</h3>
              <p className="text-slate-500 mt-2 italic">We classify every word to see what job it does.</p>
            </div>
            <div className="flex flex-wrap gap-8 justify-center items-end">
              {tokens.map((t: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-4 group transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`px-5 py-3 rounded-2xl font-black text-white shadow-xl ${COLORS[t.tag] || 'bg-slate-400'} transition-all group-hover:scale-110 group-hover:-translate-y-1 cursor-default flex flex-col items-center`}>
                    <span className="text-sm uppercase tracking-tight leading-none">{TAG_LABELS[t.tag]?.split(' (')[0] || t.tag}</span>
                    <span className="text-[9px] opacity-60 mt-1 font-mono uppercase">{t.tag}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{t.word}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === Step.MATRIX && (
          <MatrixView tokens={tokens.map((t: any) => t.word)} constituents={parseData?.constituents || []} />
        )}

        {step === Step.ASSEMBLY && treeNode && (
          <TreeView node={treeNode} />
        )}

        {step === Step.EXPORT && (
          <div className="w-full max-w-4xl space-y-10 animate-in zoom-in duration-700">
            <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-slate-100 font-black text-2xl uppercase tracking-wider">Step 4: Construction Manual</h3>
                    <p className="text-slate-500 text-sm mt-1 italic">The structure is flattened for shipment to other machines.</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
                    Verified
                  </div>
               </div>
               <div className="p-8 bg-black/40 rounded-3xl font-mono text-xl text-emerald-400 break-all leading-relaxed border border-emerald-900/40 shadow-inner group">
                  <span className="opacity-40 select-none mr-2">$</span>
                  {parseData?.linearized || "(S (Ready...))"}
               </div>
               <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Bricks</p>
                     <p className="text-slate-200 font-bold text-xl">{tokens.length}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Groups</p>
                     <p className="text-slate-200 font-bold text-xl">{parseData?.constituents?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Stability</p>
                     <p className="text-emerald-500 font-black text-xl uppercase tracking-tighter">Solid</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
