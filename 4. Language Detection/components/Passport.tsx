
import React from 'react';
import { motion } from 'framer-motion';
import { DetectionResult } from '../types';
import { ShieldCheck, Calendar, Type as TypeIcon, Keyboard, Award, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  result: DetectionResult;
}

const Passport: React.FC<Props> = ({ result }) => {
  const { actionPacket, confidence } = result;

  // Define visual states based on confidence levels
  const getConfidenceProfile = (score: number) => {
    if (score >= 85) return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      glow: 'shadow-green-100',
      label: 'Certified Match',
      icon: <CheckCircle2 size={16} />,
      tint: 'from-green-50/30'
    };
    if (score >= 60) return {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      glow: 'shadow-blue-100',
      label: 'High Probability',
      icon: <ShieldCheck size={16} />,
      tint: 'from-blue-50/30'
    };
    return {
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      glow: 'shadow-orange-100',
      label: 'Tentative Match',
      icon: <AlertCircle size={16} />,
      tint: 'from-orange-50/30'
    };
  };

  const profile = getConfidenceProfile(confidence);

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        className={`w-full max-w-md bg-[#FFF9F2] border-[12px] border-white shadow-2xl rounded-[40px] p-8 relative overflow-hidden bg-gradient-to-br ${profile.tint} to-transparent`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-tr-full pointer-events-none" />

        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Investigation Report</p>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${profile.bg} ${profile.color} ${profile.border} text-[9px] font-black uppercase tracking-tighter shadow-sm ${profile.glow}`}
              >
                {profile.icon}
                {profile.label}
              </motion.div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              {result.language}
            </h2>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-5xl"
          >
            {actionPacket.flag}
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-white/80">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ISO Code</p>
                <p className="font-mono text-lg font-bold text-gray-900">{actionPacket.isoCode}</p>
              </div>
            </div>
            {/* Confidence Score Visualized */}
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Confidence</p>
              <div className="flex items-center gap-1 justify-end">
                <span className={`text-xl font-black ${profile.color}`}>{Math.round(confidence)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/60 p-4 rounded-2xl border border-white/80 flex flex-col gap-2">
                <TypeIcon size={18} className="text-purple-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Direction</p>
                  <p className="font-bold text-gray-900">{actionPacket.direction}</p>
                </div>
             </div>
             <div className="bg-white/60 p-4 rounded-2xl border border-white/80 flex flex-col gap-2">
                <Calendar size={18} className="text-green-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Local Rule</p>
                  <p className="font-bold text-gray-900 text-xs truncate" title={actionPacket.formattingRule}>
                    {actionPacket.formattingRule}
                  </p>
                </div>
             </div>
          </div>

          <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard size={18} />
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Automation Hook</p>
            </div>
            <p className="font-bold text-sm leading-relaxed">{actionPacket.actionDescription}</p>
          </div>
        </div>

        {/* The Stamp */}
        <motion.div 
          initial={{ scale: 2, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: -15 }}
          transition={{ delay: 1, type: 'spring', damping: 8, stiffness: 100 }}
          className="absolute -bottom-2 -right-2 border-4 border-red-500/30 rounded-2xl p-4 rotate-[-15deg] pointer-events-none"
        >
          <div className="border-2 border-red-500/30 rounded-lg px-4 py-2">
             <span className="font-black text-red-500/30 text-2xl uppercase tracking-tighter">IDENTIFIED</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-8 text-center bg-blue-50 p-6 rounded-3xl border border-blue-100 max-w-lg">
        <p className="text-blue-800 text-sm font-medium leading-relaxed italic">
          "Knowing the language is just the start. Now, we've updated the UI, switched text flow to {actionPacket.direction}, and ensured the date format follows local customs."
        </p>
      </div>
    </div>
  );
};

export default Passport;
