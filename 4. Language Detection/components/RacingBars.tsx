import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, HelpCircle, Trophy, Zap, Activity } from 'lucide-react';

interface Props {
  candidates: { name: string; score: number }[];
  isGibberish: boolean;
  threshold: number;
}

const RacingBars: React.FC<Props> = ({ candidates, isGibberish, threshold }) => {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  
  const topScore = sorted.length > 0 ? sorted[0].score : 0;
  const runnerUpScore = sorted.length > 1 ? sorted[1].score : 0;
  const isBelowThreshold = topScore < threshold;
  
  const scoreDiff = Math.abs(topScore - runnerUpScore);
  const isCloseRace = sorted.length > 1 && scoreDiff < 10;
  const isAmbiguous = sorted.length > 1 && scoreDiff < 15;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-10">
      {isCloseRace && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm"
        >
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0 animate-pulse">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="text-red-900 font-bold text-sm">Tight Race!</h4>
            <p className="text-red-700 text-xs font-medium">Suspects are within {Math.round(scoreDiff)}% of each other. High ambiguity detected.</p>
          </div>
        </motion.div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {sorted.map((c, i) => {
          const isRunnerInCloseRace = i === 1 && isCloseRace;
          
          return (
            <motion.div key={c.name} variants={itemVariants} className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-black tracking-tight ${i === 0 ? (isBelowThreshold ? 'text-orange-600' : 'text-blue-600') : (isRunnerInCloseRace ? 'text-red-500' : 'text-gray-400')}`}>
                    {c.name}
                  </span>
                  {i === 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded-full flex items-center gap-1 shadow-sm ${
                        isBelowThreshold ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {isBelowThreshold ? <HelpCircle size={10} /> : <Trophy size={10} />}
                      {isBelowThreshold ? 'Weak Match' : 'Primary Candidate'}
                    </motion.div>
                  )}
                  {isRunnerInCloseRace && (
                    <div className="px-3 py-1 bg-red-100 text-red-600 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                      Pulsing Uncertainty
                    </div>
                  )}
                </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className={`font-mono text-lg font-black ${isBelowThreshold && i === 0 ? 'text-orange-500' : (isRunnerInCloseRace ? 'text-red-500' : 'text-gray-500')}`}
                >
                  {Math.round(c.score)}%
                </motion.span>
              </div>
              
              <div className="h-6 bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner p-1">
                <div className="absolute inset-0 flex justify-between px-4 items-center opacity-10 pointer-events-none">
                  {[...Array(5)].map((_, idx) => <div key={idx} className="w-px h-3 bg-gray-400" />)}
                </div>

                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${c.score}%`,
                    // Smaller bar pulses in width/scale if race is close
                    scaleX: isRunnerInCloseRace ? [1, 1.02, 1] : 1 
                  }}
                  transition={{ 
                    width: { duration: 2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 + i * 0.1 },
                    scaleX: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  style={{ originX: 0 }}
                  className={`h-full rounded-xl relative shadow-lg ${
                    i === 0 ? (isBelowThreshold ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-600') : (isRunnerInCloseRace ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-red-100' : 'bg-gradient-to-r from-gray-300 to-gray-400')
                  }`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-50" />
                  
                  <motion.div 
                    animate={{ left: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />

                  {i === 0 && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80"
                    >
                      <Zap size={14} fill="currentColor" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {isGibberish ? (
          <motion.div 
            key="gibberish"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-lg">Gibberish Detected!</h3>
              <p className="text-red-700 text-sm mt-1 leading-relaxed">The evidence looks like random characters. No linguistic patterns detected.</p>
            </div>
          </motion.div>
        ) : isBelowThreshold ? (
          <motion.div 
            key="low-confidence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <HelpCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-orange-900 text-lg">Uncertain Result</h3>
              <p className="text-orange-700 text-sm mt-1 leading-relaxed">Confidence is below {threshold}%. Use caution with this identification.</p>
            </div>
          </motion.div>
        ) : isAmbiguous ? (
          <motion.div 
            key="ambiguous"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-yellow-50 border-2 border-yellow-100 rounded-3xl flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900">Close Tie-Breaker</h3>
              <p className="text-yellow-700 text-sm mt-1 leading-relaxed">The suspects have overlapping features. Short text snippets often cause this.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="certain"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-green-50 rounded-3xl border-2 border-green-100 flex items-center gap-4 shadow-sm"
          >
             <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
               <CheckCircle size={24} />
             </div>
             <div>
               <h3 className="font-bold text-green-900 text-lg">Decisive Win</h3>
               <p className="text-green-700 text-sm leading-relaxed">One candidate has pulled significantly ahead. Case identification is firm.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RacingBars;