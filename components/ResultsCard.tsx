
import React, { useState } from 'react';
import { RagResult } from '../types';
import { Bot, Zap, FileText, AlertTriangle, Scale, CircleHelp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from 'recharts';

interface Props {
  result: RagResult;
  topK: number;
  onTopKChange: (k: number) => void;
  llmEnabled: boolean;
  onLlmToggle: () => void;
}

const ResultsCard: React.FC<Props> = ({ result, topK, onTopKChange, llmEnabled, onLlmToggle }) => {
  const [showPrompt, setShowPrompt] = useState<'none' | 'pre' | 'rag'>('none');

  const ragTokens = result.tokenCounts?.rag || 0;
  const contextTokens = result.tokenCounts?.context || 0;
  const preTokens = result.tokenCounts?.preRag || 0;
  
  // Calculate overhead (Instruction + User Question)
  const overheadTokens = Math.max(0, ragTokens - contextTokens);

  const chartData = [
    {
      name: 'Pre-RAG',
      Context: 0,
      Overhead: 0,
      Prompt: preTokens,
    },
    {
      name: 'RAG',
      Context: contextTokens,
      Overhead: overheadTokens,
      Prompt: 0,
    }
  ];

  // Default limit for Gemini 2.5 Flash
  const DEFAULT_LIMIT = 1000000;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
           <Zap className="w-5 h-5 text-amber-500" />
           <h3 className="font-semibold text-slate-800">3. Generation & Comparison</h3>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Top-K Selector */}
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-0.5 relative group/tooltip">
                    <label className="text-[10px] text-slate-500 font-bold">Context (Top-K)</label>
                    <CircleHelp className="w-3 h-3 text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 text-center font-normal leading-tight">
                        Controls how many text chunks are sent to the LLM. More chunks = more context but higher token usage.
                    </div>
                </div>
                <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={topK}
                    onChange={(e) => onTopKChange(parseInt(e.target.value))}
                    className="w-12 h-6 bg-white border border-slate-300 rounded text-center text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            
            {/* LLM Toggle */}
            <div className="flex flex-col justify-end h-full pt-4">
                <button 
                    onClick={onLlmToggle}
                    className={`text-xs px-2 py-1 rounded border transition-colors font-medium h-7 flex items-center ${llmEnabled ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'}`}
                >
                    {llmEnabled ? 'LLM: ON' : 'LLM: OFF'}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 bg-white">
        {/* Answer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Pre-RAG */}
            <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Bot className="w-3 h-3" /> Pre-RAG
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 h-full min-h-[150px] relative group shadow-sm">
                    {result.loading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-2 py-1">
                            <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-2 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {llmEnabled ? (result.preRagAnswer || "Waiting for question...") : (
                                <span className="text-slate-400 italic">Enable LLM to generate answer</span>
                            )}
                        </p>
                        <button 
                            onClick={() => setShowPrompt(showPrompt === 'pre' ? 'none' : 'pre')}
                            className="absolute bottom-2 right-2 text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                        >
                            {showPrompt === 'pre' ? 'Hide Prompt' : 'Show Prompt'}
                        </button>
                        </>
                    )}
                </div>
                {showPrompt === 'pre' && (
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-[10px] font-mono text-slate-300 whitespace-pre-wrap absolute z-10 top-10 left-4 w-64 shadow-2xl">
                         <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-600">
                            <span className="font-bold text-white">Pre-RAG Prompt</span>
                            <button onClick={() => setShowPrompt('none')} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        {result.promptUsed.preRag || "Prompt not available yet."}
                    </div>
                )}
            </div>

            {/* Column 2: Retrieved Context */}
            <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Retrieved ({result.retrievedChunks.length})
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 h-full min-h-[150px] overflow-y-auto max-h-[300px] shadow-inner">
                    {result.retrievedChunks.length === 0 ? (
                        <span className="text-xs text-slate-400 italic p-2">No chunks retrieved yet.</span>
                    ) : (
                        <div className="space-y-2">
                            {result.retrievedChunks.map((chunk, i) => (
                                <div key={i} className="bg-white p-2 rounded border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-mono text-indigo-600 font-bold">Chunk {chunk.id.split('-')[1]}</span>
                                        <span className="text-[10px] text-slate-400">Score: {chunk.similarity?.toFixed(3)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">
                                        {chunk.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Column 3: RAG Answer */}
            <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> RAG Answer
                </h4>
                <div className="bg-indigo-50/50 rounded-lg border border-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)] p-3 h-full min-h-[150px] relative group">
                    {result.loading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-2 py-1">
                            <div className="h-2 bg-indigo-200 rounded w-3/4"></div>
                            <div className="h-2 bg-indigo-200 rounded"></div>
                            <div className="h-2 bg-indigo-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                        {result.error && (
                            <div className="text-red-500 text-xs mb-2 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-3 h-3" /> {result.error}
                            </div>
                        )}
                        <p className={`text-sm whitespace-pre-wrap ${result.ragAnswer.includes("I do not know") ? "text-amber-700" : "text-slate-800"}`}>
                            {llmEnabled ? (result.ragAnswer || "Waiting for question...") : (
                                <span className="text-slate-400 italic">Enable LLM to generate answer</span>
                            )}
                        </p>
                         <button 
                            onClick={() => setShowPrompt(showPrompt === 'rag' ? 'none' : 'rag')}
                            className="absolute bottom-2 right-2 text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                        >
                            {showPrompt === 'rag' ? 'Hide Prompt' : 'Show Prompt'}
                        </button>
                        </>
                    )}
                </div>
                {showPrompt === 'rag' && (
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-[10px] font-mono text-slate-300 whitespace-pre-wrap absolute z-10 top-10 right-4 w-96 shadow-2xl max-h-80 overflow-y-auto">
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-600">
                            <span className="font-bold text-white">RAG Prompt</span>
                            <button onClick={() => setShowPrompt('none')} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        {result.promptUsed.rag || "Prompt not available yet."}
                    </div>
                )}
            </div>
        </div>

        {/* Token Count Visualization */}
        <div className="bg-slate-50 rounded border border-slate-200 p-3 mt-auto min-h-[200px] flex flex-col shadow-inner">
             <div className="flex items-center gap-2 mb-2 justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold text-slate-700">Token Usage Analysis</h4>
                </div>
             </div>
             
             <div className="flex-1 w-full text-xs">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        layout="vertical" 
                        data={chartData} 
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis 
                            type="number" 
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                            stroke="#cbd5e1"
                        />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} 
                            width={60}
                            stroke="#cbd5e1"
                        />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9', opacity: 0.5}}
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', fontSize: '12px', color: '#0f172a' }}
                            formatter={(value: number, name: string) => {
                                if (value === 0) return [0, name];
                                return [`${value}`, name];
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475569' }} />
                        
                        <Bar dataKey="Context" stackId="a" fill="#6366f1" name="Retrieved Context" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Overhead" stackId="a" fill="#f59e0b" name="Instruction & Overhead" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Prompt" stackId="a" fill="#94a3b8" name="Base Prompt" radius={[0, 4, 4, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
