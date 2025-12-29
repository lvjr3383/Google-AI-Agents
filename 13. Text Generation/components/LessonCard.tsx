
import React from 'react';

interface LessonCardProps {
  icon: string;
  title: string;
  text: string;
  color?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({ icon, title, text, color = "indigo" }) => {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
  };

  return (
    <div className={`${colorMap[color]} border-2 rounded-2xl p-5 flex gap-5 shadow-sm mt-8 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className={`${icon} text-6xl rotate-12`}></i>
      </div>
      <div className="text-3xl flex items-center">
        <i className={icon}></i>
      </div>
      <div className="relative z-10">
        <h4 className="font-kids font-bold text-lg mb-1">{title}</h4>
        <p className="text-sm leading-relaxed font-medium opacity-90">{text}</p>
      </div>
    </div>
  );
};

export default LessonCard;
