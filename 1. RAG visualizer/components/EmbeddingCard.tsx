import React, { useMemo, useState } from 'react';
import { Chunk } from '../types';
import { projectTo2D } from '../services/ragUtils';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { Database, CircleHelp, X, Network } from 'lucide-react';

interface Props {
  chunks: Chunk[];
  question: string;
  questionEmbedding?: number[];
  isProcessing: boolean;
}

const EmbeddingCard: React.FC<Props> = ({ chunks, question, questionEmbedding, isProcessing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const hasEmbeddings = chunks.length > 0 && !!chunks[0].embedding;

  // Prepare data for Scatter Plot (2D Projection)
  const scatterData = useMemo(() => {
    if (!hasEmbeddings) return [];
    
    const data = chunks.map((c, i) => {
        const proj = projectTo2D(c.embedding!, 42); // Seed 42 for consistency
        return {
            id: c.id,
            x: proj.x,
            y: proj.y,
            text: c.text.substring(0, 50) + "...",
            type: 'chunk',
            similarity: c.similarity || 0,
            index: i + 1
        };
    });

    if (questionEmbedding) {
        const qProj = projectTo2D(questionEmbedding, 42);
        data.push({
            id: 'question',
            x: qProj.x,
            y: qProj.y,
            text: `Q: ${question}`,
            type: 'question',
            similarity: 1,
            index: 0
        });
    }

    return data;
  }, [chunks, questionEmbedding, question, hasEmbeddings]);

  // Prepare data for Top K Bar Chart
  const topChunks = useMemo(() => {
    if (!hasEmbeddings || !questionEmbedding) return [];
    return [...chunks]
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 5)
      .map(c => ({
          name: `C${chunks.indexOf(c) + 1}`,
          score: c.similarity || 0,
          preview: c.text.substring(0, 30) + "..."
      }));
  }, [chunks, questionEmbedding, hasEmbeddings]);

  if (!hasEmbeddings) {
    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full items-center justify-center p-8 text-center opacity-75">
            <Network className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">Topic Map Pending</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">
                Chunk the text first, then ask a question to generate embeddings and calculate similarity.
            </p>
        </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Database className="w-5 h-5 text-indigo-600" />
           <h3 className="font-semibold text-slate-800">2. Vector Space & Similarity</h3>
        </div>
        <div className="flex items-center gap-2">
          {question && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200 font-medium">Query Active</span>}
          <button 
            onClick={() => setShowHelp(!showHelp)} 
            className={`text-slate-400 hover:text-indigo-600 transition-colors p-1 ${showHelp ? 'text-indigo-600' : ''}`}
            title="How to read this"
          >
            <CircleHelp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-slate-50 p-4 border-b border-slate-200 relative animate-in fade-in slide-in-from-top-2 duration-300">
           <button onClick={() => setShowHelp(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
             <X className="w-4 h-4" />
           </button>
           <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Understanding the Visualization</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600 leading-relaxed">
             <div>
               <strong className="text-slate-900 block mb-2 text-sm">Topic Map (The Scatter Plot)</strong>
               <p className="mb-2">
                 This chart represents the <strong>Embedding Space</strong>. Each dot is a text chunk.
               </p>
               <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-500">
                 <li><strong>Embedding:</strong> The AI converts text into a list of 768 numbers (a vector) representing its meaning.</li>
                 <li><strong>PCA (Principal Component Analysis):</strong> A mathematical technique used here to flatten those 768 dimensions down to just 2 dimensions (X and Y) so we can display them on your screen.</li>
               </ul>
               <p className="italic text-indigo-600">
                 Key Takeaway: Dots that are physically closer together are semantically similar. Your goal is for the red "Question" dot to land near blue "Answer" dots.
               </p>
             </div>
             <div>
               <strong className="text-slate-900 block mb-2 text-sm">Relevance Scores (Right Chart)</strong>
               <p className="mb-2">
                 This is a leaderboard calculated using <strong>Cosine Similarity</strong>.
               </p>
               <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-500">
                 <li>It measures the angle between the Question vector and each Chunk vector.</li>
                 <li><strong>1.0</strong> = Perfect match (Same meaning).</li>
                 <li><strong>0.0</strong> = Completely unrelated.</li>
               </ul>
               <p className="italic text-indigo-600">
                 RAG uses these scores to pick the "Top-K" winners to send to the LLM.
               </p>
             </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full min-h-[300px]">
        {/* Scatter Plot */}
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col shadow-inner">
            <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase text-center">Topic Map</h4>
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey="x" hide />
                        <YAxis type="number" dataKey="y" hide />
                        <ZAxis range={[60, 400]} />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} 
                            content={({ payload }) => {
                                if (payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white border border-slate-200 p-2 rounded shadow-xl text-xs z-50 max-w-[200px]">
                                            <p className="font-bold text-slate-800">{d.type === 'question' ? 'Question' : `Chunk ${d.index}`}</p>
                                            <p className="text-slate-600 line-clamp-3 my-1">{d.text}</p>
                                            {d.type !== 'question' && <p className="text-indigo-600 font-mono">Sim: {d.similarity.toFixed(3)}</p>}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Chunks" data={scatterData}>
                            {scatterData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.type === 'question' ? '#ef4444' : (entry.similarity > 0.65 ? '#6366f1' : '#94a3b8')} 
                                    stroke={entry.type === 'question' ? '#fff' : 'none'}
                                    strokeWidth={entry.type === 'question' ? 2 : 0}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center gap-1 mt-2">
                <div className="flex justify-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Corpus</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> High Match</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 border border-white"></span> Question</span>
                </div>
                <span className="text-[10px] text-slate-400 italic">"Closer together = More similar meaning"</span>
            </div>
        </div>

        {/* Top K Chart */}
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col shadow-inner">
            <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase text-center">Relevance Scores</h4>
             {topChunks.length > 0 ? (
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topChunks} margin={{ left: 0 }}>
                            <XAxis type="number" domain={[0, 1]} hide />
                            <YAxis type="category" dataKey="name" width={30} tick={{fontSize: 10, fill: '#64748b'}} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', fontSize: '12px', color: '#1e293b'}}
                                itemStyle={{color: '#1e293b'}}
                                cursor={{fill: '#f1f5f9'}}
                            />
                            <Bar dataKey="score" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20}>
                                {topChunks.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.15)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
                    Waiting for query...
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingCard;