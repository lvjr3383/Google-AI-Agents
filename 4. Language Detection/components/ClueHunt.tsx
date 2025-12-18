import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  clues: string[];
}

const ClueHunt: React.FC<Props> = ({ text, clues }) => {
  // Use Intl.Segmenter for proper character splitting (supports multi-byte characters better)
  const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text)) as any[];

  const isClue = (char: string) => clues.some(clue => 
    clue.toLowerCase() === char.toLowerCase() || 
    (clue.length > 1 && char.length > 0 && text.toLowerCase().includes(clue.toLowerCase()))
  );
  
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-1 gap-y-4 font-mono text-3xl leading-relaxed select-none">
        {segments.map((segment, i) => {
          const char = segment.segment;
          const matchedClue = clues.some(clue => clue.toLowerCase() === char.toLowerCase());
          
          return (
            <motion.span 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`relative inline-block px-0.5 ${matchedClue ? 'text-orange-500 font-bold' : 'text-gray-900'}`}
            >
              {char}
              {matchedClue && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-orange-100 rounded-md -z-10 ring-1 ring-orange-200"
                />
              )}
            </motion.span>
          );
        })}
      </div>

      <div className="pt-8 border-t border-gray-50">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Evidence Locker</h4>
        <div className="flex flex-wrap gap-3">
          {clues.map((clue, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2 group cursor-help relative"
            >
              <span className="font-mono font-bold text-orange-600">{clue}</span>
              <span className="text-xs text-orange-400 font-medium">Distinctive Marker</span>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl leading-relaxed">
                Found in {clue.length > 1 ? 'this specific pattern' : 'this specific script'}. This is a critical fingerprint the AI used for identification.
              </div>
            </motion.div>
          ))}
          {clues.length === 0 && (
            <p className="text-gray-400 italic text-sm">No script-specific characters found; classification based on overall text structure.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClueHunt;