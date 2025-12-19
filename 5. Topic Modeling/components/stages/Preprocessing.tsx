
import React from 'react';
import { REVIEWS_DATASET, STOP_WORDS, TOPICS } from '../../constants';

const Preprocessing: React.FC = () => {
  // Helper to find which topic a word belongs to
  const getWordTopic = (word: string) => {
    const cleaned = word.toLowerCase().replace(/[.,!]/g, '');
    return TOPICS.find(t => t.keywords.includes(cleaned));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto pr-2 scrollbar-hide p-1">
      {REVIEWS_DATASET.map((review) => (
        <div key={review.id} className="p-4 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all shadow-sm group">
          <div className="text-[10px] text-slate-400 mb-2 font-mono-code uppercase">Doc ID: {review.id}</div>
          <div className="flex flex-wrap gap-x-1 gap-y-1">
            {review.text.split(' ').map((word, i) => {
              const cleanedWord = word.toLowerCase().replace(/[.,!]/g, '');
              const isStopWord = STOP_WORDS.has(cleanedWord);
              const topic = getWordTopic(cleanedWord);
              
              return (
                <span 
                  key={i} 
                  title={topic ? `Key word for: ${topic.name}` : undefined}
                  className={`text-sm transition-all duration-1000 relative ${
                    isStopWord 
                      ? 'text-slate-300 opacity-40 select-none' 
                      : 'text-slate-800 font-semibold cursor-help hover:text-sky-600'
                  }`}
                  style={!isStopWord && topic ? { textDecoration: `underline dotted ${topic.color}80` } : {}}
                >
                  {word}
                  {!isStopWord && topic && (
                    <span className="absolute -top-1 -right-1 w-1 h-1 rounded-full" style={{ backgroundColor: topic.color }}></span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Preprocessing;
