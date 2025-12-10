import React, { useState, useMemo } from 'react';
import { Chunk, ChunkingSettings } from '../types';
import { Scissors, Play, FileText, AlignJustify, LayoutTemplate } from 'lucide-react';

interface Props {
  text: string;
  chunks: Chunk[];
  settings: ChunkingSettings;
  onSettingsChange: (newSettings: ChunkingSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

const ChunkingCard: React.FC<Props> = ({ text, chunks, settings, onSettingsChange, onProcess, isProcessing }) => {
  const [hoveredChunkId, setHoveredChunkId] = useState<string | null>(null);

  // Flatten text to words to match the chunking logic's index system
  const words = useMemo(() => {
    return text.replace(/\s+/g, ' ').trim().split(' ');
  }, [text]);

  const wordCount = words.length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
           <Scissors className="w-5 h-5 text-teal-600" />
           <h3 className="font-semibold text-slate-800">1. Chunking Strategy</h3>
        </div>
        <div className="text-xs text-slate-500">
           {wordCount} words total
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 bg-white items-end border-b border-slate-100 flex-shrink-0">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Chunk Size (words): <span className="text-teal-600 font-bold">{settings.chunkSize}</span>
          </label>
          <input
            type="range"
            min="50"
            max="400"
            step="10"
            disabled={isProcessing}
            value={settings.chunkSize}
            onChange={(e) => onSettingsChange({ ...settings, chunkSize: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Overlap (words): <span className="text-teal-600 font-bold">{settings.overlap}</span>
          </label>
          <input
            type="range"
            min="0"
            max={Math.min(150, settings.chunkSize - 10)}
            step="5"
            disabled={isProcessing}
            value={settings.overlap}
            onChange={(e) => onSettingsChange({ ...settings, overlap: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
        </div>
        <div>
            <button 
                onClick={onProcess}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
                <Play className="w-3 h-3 fill-current" /> Chunk Text
            </button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0 relative">
          
          {/* Left: Source Text Visualization */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200 relative group">
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-slate-50/95 p-2 -mx-2 -mt-2 backdrop-blur-sm z-10 border-b border-slate-100/50">
                   <AlignJustify className="w-3 h-3 text-slate-400" />
                   <h4 className="text-xs font-bold text-slate-500 uppercase">Corpus Visualization</h4>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed font-serif text-justify">
                  {words.map((word, i) => {
                      let isHighlighted = false;
                      // Check if this word index is inside the hovered chunk's range
                      if (hoveredChunkId) {
                          const chunk = chunks.find(c => c.id === hoveredChunkId);
                          if (chunk && i >= chunk.startWordIndex && i < chunk.endWordIndex) {
                              isHighlighted = true;
                          }
                      }
                      return (
                          <span 
                              key={i} 
                              className={`transition-all duration-150 rounded-sm px-[1px] ${isHighlighted ? 'bg-indigo-200 text-indigo-900 font-medium shadow-sm' : ''}`}
                          >
                              {word}{' '}
                          </span>
                      )
                  })}
              </div>
          </div>

          {/* Right: Chunks List */}
          <div className="flex-1 overflow-y-auto bg-white flex flex-col">
               <div className="p-2 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-2 pl-2">
                      <LayoutTemplate className="w-3 h-3 text-slate-400" />
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Generated Chunks</h4>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{chunks.length} total</span>
               </div>

               {chunks.length === 0 ? (
                   <div className="flex flex-col items-center justify-center flex-1 text-slate-400 p-8 text-center bg-slate-50/30">
                      <FileText className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium text-slate-500">No chunks generated</p>
                      <p className="text-xs max-w-[200px] mt-1">Adjust parameters above and click "Chunk Text" to see the results.</p>
                   </div>
               ) : (
                   <div className="divide-y divide-slate-50">
                      {chunks.map((chunk, idx) => (
                           <div 
                              key={chunk.id}
                              className={`p-3 cursor-pointer text-xs transition-all border-l-2 relative group ${hoveredChunkId === chunk.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-300'}`}
                              onMouseEnter={() => setHoveredChunkId(chunk.id)}
                              onMouseLeave={() => setHoveredChunkId(null)}
                           >
                              <div className="flex justify-between items-center mb-1">
                                  <span className={`font-bold ${hoveredChunkId === chunk.id ? 'text-indigo-700' : 'text-slate-700'}`}>Chunk {idx + 1}</span>
                                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                      {chunk.startWordIndex}-{chunk.endWordIndex}
                                  </span>
                              </div>
                              <p className="text-slate-500 line-clamp-2 leading-snug group-hover:text-slate-700">{chunk.text}</p>
                           </div>
                      ))}
                   </div>
               )}
          </div>
      </div>
      
      {/* Footer */}
      <div className="p-2 px-4 bg-slate-50 text-[10px] text-slate-500 border-t border-slate-200 flex-shrink-0 flex justify-between">
         <span>Hover over a chunk on the right to visualize its coverage.</span>
         {settings.overlap > 0 && <span className="text-indigo-600 font-medium">Overlap regions appear when switching between chunks.</span>}
      </div>
    </div>
  );
};

export default ChunkingCard;