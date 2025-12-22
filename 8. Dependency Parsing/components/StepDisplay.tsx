
import React from 'react';
import { ParsingResult, StepType } from '../types';

interface StepDisplayProps {
  currentStep: number;
  data: ParsingResult;
  onProceed: () => void;
}

export const StepDisplay: React.FC<StepDisplayProps> = ({ currentStep, data, onProceed }) => {
  const steps = [
    {
      id: StepType.ANCHOR,
      title: "1. THE ANCHOR",
      subtitle: "Root Identification",
      description: "Identifying the central verb that anchors the sentence logic.",
      content: (
        <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in flex flex-col space-y-6">
          <div className="text-center pb-6 border-b border-slate-100">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Central Root Word</span>
            <h3 className="text-5xl font-black text-slate-900 mono tracking-tighter" aria-label={`The root word is ${data.anchor.word}`}>{data.anchor.word}</h3>
            <p className="text-blue-600 mt-2 font-bold uppercase text-xs tracking-widest bg-blue-50 inline-block px-3 py-1 rounded-full">{data.anchor.pos}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
            <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest block mb-2">Linguistic Context</span>
            <p>{data.anchor.explanation}</p>
          </div>
        </article>
      )
    },
    {
      id: StepType.LINKAGE,
      title: "2. THE LINKAGE",
      subtitle: "Relation Mapping",
      description: "Establishing dependency relations between heads and dependents.",
      content: (
        <section className="space-y-4 animate-fade-in flex flex-col" aria-label="Grammatical connections">
          <div className="flex flex-col space-y-3">
            {data.linkage.connections.map((conn, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col space-y-3 shadow-sm hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Head</span>
                    <span className="font-bold text-slate-800 text-lg">{conn.head}</span>
                  </div>
                  <div className="flex-1 px-8">
                    <div className="h-px bg-blue-100 relative">
                       <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 text-[10px] font-black text-blue-600 border border-blue-200 rounded uppercase">
                         {conn.relation}
                       </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Dependent</span>
                    <span className="font-bold text-blue-600 text-lg">{conn.dependent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 text-slate-100 p-6 rounded-2xl text-sm leading-relaxed shadow-md">
            <span className="font-black text-white uppercase text-[10px] tracking-widest block mb-2">System Insight</span>
            <p>{data.linkage.explanation}</p>
          </div>
        </section>
      )
    },
    {
      id: StepType.HIERARCHY,
      title: "3. THE HIERARCHY",
      subtitle: "Tree Construction",
      description: "Visualizing the vertical depth of dependency layers.",
      content: (
        <section className="space-y-4 animate-fade-in flex flex-col" aria-label="Structural hierarchy tree">
          <div 
            className="bg-slate-900 text-emerald-400 p-10 rounded-2xl mono text-base overflow-x-auto whitespace-pre shadow-xl border-4 border-slate-800 leading-relaxed"
            role="img" 
            aria-label="ASCII representation of the dependency tree"
          >
            {data.hierarchy.tree}
          </div>
          <div className="bg-white p-6 rounded-xl border-l-8 border-emerald-500 shadow-sm text-sm text-slate-700 leading-relaxed">
            <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest block mb-2">Structural Summary</span>
            <p>{data.hierarchy.explanation}</p>
          </div>
        </section>
      )
    },
    {
      id: StepType.REVELATION,
      title: "4. THE REVELATION",
      subtitle: "Action Extraction",
      description: "Distilling the sentence to its core logical triple.",
      content: (
        <section className="bg-blue-600 p-1 flex flex-col rounded-3xl shadow-xl animate-fade-in overflow-hidden" aria-label="Core logic triple">
           <div className="bg-white p-10 flex flex-col space-y-8">
              <div className="flex flex-col items-center space-y-2 group">
                <span className="text-[10px] uppercase font-black text-blue-400 tracking-[0.3em]">Actor</span>
                <div className="text-3xl font-black text-slate-800 py-4 px-10 rounded-2xl border-2 border-slate-100 group-hover:border-blue-500 transition-colors">{data.revelation.actor}</div>
              </div>
              
              <div className="flex flex-col items-center" aria-hidden="true">
                 <div className="w-0.5 h-10 bg-blue-100"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <div className="w-0.5 h-10 bg-blue-100"></div>
              </div>

              <div className="flex flex-col items-center space-y-2 group">
                <span className="text-[10px] uppercase font-black text-blue-400 tracking-[0.3em]">Action</span>
                <div className="text-3xl font-black text-blue-600 bg-blue-50 py-4 px-10 rounded-2xl border-2 border-blue-200 group-hover:bg-blue-100 transition-all">{data.revelation.action}</div>
              </div>

              <div className="flex flex-col items-center" aria-hidden="true">
                 <div className="w-0.5 h-10 bg-blue-100"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <div className="w-0.5 h-10 bg-blue-100"></div>
              </div>

              <div className="flex flex-col items-center space-y-2 group">
                <span className="text-[10px] uppercase font-black text-blue-400 tracking-[0.3em]">Recipient</span>
                <div className="text-3xl font-black text-slate-800 py-4 px-10 rounded-2xl border-2 border-slate-100 group-hover:border-blue-500 transition-colors">{data.revelation.recipient}</div>
              </div>
           </div>
           <div className="bg-blue-600 p-6">
              <p className="text-white text-center font-bold text-sm tracking-tight italic">
                "{data.revelation.explanation}"
              </p>
           </div>
        </section>
      )
    }
  ];

  return (
    <div className="flex flex-col space-y-12">
      {/* Stepper Header */}
      <nav aria-label="Analysis steps progress" className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {steps.map((step, idx) => (
          <div key={idx} className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${
                idx <= currentStep ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
              }`}
              aria-current={idx === currentStep ? 'step' : undefined}
            >
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded transition-all duration-700 ${
                idx < currentStep ? 'bg-blue-600' : 'bg-slate-100'
              }`} />
            )}
          </div>
        ))}
      </nav>

      {/* Active Step Content Stack */}
      <div className="flex flex-col space-y-16" role="region" aria-live="polite">
        {steps.map((step, idx) => (
          idx <= currentStep && (
            <div key={idx} className="flex flex-col space-y-6 animate-fade-in border-l-4 border-slate-100 pl-8 relative">
               <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-slate-200"></div>
               <div className="flex flex-col space-y-1">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{step.title}</h2>
                 <p className="text-blue-600 font-black tracking-widest uppercase text-xs">{step.subtitle}</p>
                 <p className="text-slate-500 text-sm mt-2 font-medium max-w-xl italic">{step.description}</p>
               </div>
               <div className="w-full">
                {step.content}
               </div>
            </div>
          )
        ))}
      </div>

      {/* Control Button */}
      {currentStep < steps.length - 1 ? (
        <div className="flex flex-col items-center pt-8">
          <button
            onClick={onProceed}
            className="group flex items-center space-x-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-12 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm focus:ring-4 focus:ring-blue-200 outline-none"
            aria-label="Proceed to the next parsing step"
          >
            <span>Proceed to Next Step</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="text-center pt-8 animate-bounce-subtle" role="status">
          <div className="text-emerald-600 font-black text-lg flex flex-col items-center space-y-2">
            <div className="bg-emerald-50 p-4 rounded-full shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="uppercase tracking-[0.2em]">Full Extraction Complete</span>
          </div>
        </div>
      )}
    </div>
  );
};