
import React, { useEffect, useRef, useState } from 'react';
import { Particle } from '../../types';
import { TOPICS } from '../../constants';

interface Props {
  isProcessing: boolean;
}

const LDAIteration: React.FC<Props> = ({ isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [converge, setConverge] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    const particles: Particle[] = [];
    const colors = TOPICS.map(t => t.color);
    
    for (let i = 0; i < 350; i++) {
      const topicIndex = i % TOPICS.length;
      const targetX = 100 + (topicIndex * 150);
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        targetX,
        targetY: 220,
        color: colors[topicIndex],
        size: Math.random() * 3 + 1.5
      });
    }
    particlesRef.current = particles;
  }, []);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach(p => {
      if (converge) {
        // High-precision attraction to target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.02;
        p.vy += dy * 0.02;
        p.vx *= 0.85;
        p.vy *= 0.85;
      } else {
        // Brownian-like motion for "searching" phase
        p.vx += (Math.random() - 0.5) * 0.8;
        p.vy += (Math.random() - 0.5) * 0.8;
        
        // Slight pull toward center to keep things contained
        p.vx += (400 - p.x) * 0.0001;
        p.vy += (225 - p.y) * 0.0001;
        
        p.vx *= 0.97;
        p.vy *= 0.97;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around logic
      if (p.x < -20) p.x = canvas.width + 10;
      if (p.x > canvas.width + 20) p.x = -10;
      if (p.y < -20) p.y = canvas.height + 10;
      if (p.y > canvas.height + 20) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = converge ? 0.9 : 0.6;
      ctx.fill();
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [converge]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-6 mb-6 font-mono-code text-[9px] tracking-widest">
        {TOPICS.map(topic => (
          <div key={topic.id} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: topic.color }}></span>
            <span className="text-slate-600 font-bold">{topic.id.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-4xl aspect-video bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={450} 
          className="w-full h-full"
        />
        
        {!converge && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-8 py-4 bg-white/90 border border-sky-100 text-sky-600 text-xs font-black animate-pulse shadow-xl rounded-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
              RECOGNIZING PATTERNS...
            </div>
          </div>
        )}

        <button 
          onClick={() => setConverge(true)}
          disabled={converge}
          className={`absolute bottom-8 right-8 px-8 py-3 rounded-2xl text-xs font-black tracking-widest transition-all shadow-lg ${
            converge 
              ? 'bg-slate-100 text-slate-400 cursor-default opacity-50' 
              : 'bg-sky-600 text-white hover:bg-sky-500 hover:scale-105 active:scale-95'
          }`}
        >
          {converge ? "CONVERGED" : "GROUP NOW"}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-5 gap-6 w-full max-w-4xl px-4">
         {TOPICS.map(t => (
           <div key={t.id} className="text-center group">
              <div className="text-[9px] font-black text-slate-400 mb-2 tracking-tighter group-hover:text-slate-600 transition-colors uppercase">
                {t.name}
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full transition-all duration-[3000ms] ease-out" 
                  style={{ 
                    width: converge ? '100%' : '12%', 
                    backgroundColor: t.color,
                    transitionDelay: `${Math.random() * 500}ms`
                  }}
                />
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default LDAIteration;
