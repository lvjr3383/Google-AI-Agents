
import React from 'react';
import { motion } from 'framer-motion';
import { LANGUAGE_FAMILIES } from '../constants';
import { MapPin } from 'lucide-react';

interface Props {
  family: string;
  language: string;
}

const LanguageMap: React.FC<Props> = ({ family, language }) => {
  // Normalize family string
  const normalizedFamily = (Object.keys(LANGUAGE_FAMILIES).find(
    f => family.toLowerCase().includes(f.toLowerCase())
  ) || 'Other') as keyof typeof LANGUAGE_FAMILIES;

  const targetCoords = LANGUAGE_FAMILIES[normalizedFamily];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-video bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
        {/* Abstract Map Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Legend/Clusters */}
          {Object.entries(LANGUAGE_FAMILIES).map(([name, coords]) => (
            <g key={name}>
              <circle 
                cx={coords.x} 
                cy={coords.y} 
                r="40" 
                fill={coords.color} 
                className="opacity-10" 
              />
              <text 
                x={coords.x} 
                y={coords.y + 60} 
                textAnchor="middle" 
                className="fill-gray-400 text-[10px] font-bold uppercase tracking-tighter"
              >
                {name}
              </text>
            </g>
          ))}

          {/* Lines connecting clusters (Simplified relations) */}
          <path d="M150 150 L350 120 M350 120 L550 150" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" fill="none" />

          {/* The Animated Pin Drop */}
          <motion.g
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 120, delay: 0.5 }}
          >
            <motion.foreignObject
              x={targetCoords.x - 24}
              y={targetCoords.y - 48}
              width="48"
              height="48"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-500 text-blue-500">
                   <MapPin size={24} fill="currentColor" fillOpacity={0.2} />
                </div>
              </div>
            </motion.foreignObject>
            
            {/* Pulsing Ripple */}
            <motion.circle 
              cx={targetCoords.x} 
              cy={targetCoords.y} 
              r="20" 
              stroke="#3B82F6" 
              strokeWidth="2" 
              fill="none"
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.g>
        </svg>

        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-lg">
           <div className="w-3 h-3 rounded-full bg-blue-500" />
           <span className="text-sm font-bold text-gray-900">Detected Location: {family}</span>
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-lg">
        <p className="text-gray-600 leading-relaxed">
          Languages aren't random; they exist in neighborhoods. The agent analyzed the "sonic coordinates" of your text and found it belongs in the <span className="font-bold text-blue-600 underline decoration-blue-200">{family}</span> region.
        </p>
      </div>
    </div>
  );
};

export default LanguageMap;
