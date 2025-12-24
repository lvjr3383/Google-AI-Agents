
import React from 'react';

interface StepCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ title, icon, children, active }) => {
  return (
    <div className={`transition-all duration-500 border rounded-2xl p-6 mb-6 ${active ? 'border-indigo-200 bg-white shadow-lg ring-1 ring-indigo-50' : 'border-slate-200 bg-slate-50/50'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="text-sm text-slate-600">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
