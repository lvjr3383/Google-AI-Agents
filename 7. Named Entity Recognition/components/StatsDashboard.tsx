
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Stats } from '../types';

interface StatsDashboardProps {
  stats: Stats;
}

const COLORS = {
  Person: '#ef4444',
  Organization: '#2563eb',
  Location: '#16a34a',
  Date: '#a855f7',
  Other: '#94a3b8'
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const entityData = Object.entries(stats).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name as keyof typeof COLORS] || '#64748b'
  }));

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Entity Type Frequency</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={entityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {entityData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <p className="text-xs text-slate-500 leading-relaxed">
          The chart above visualizes the distribution of different named entity types found in the text. 
          This help students identify patterns, such as whether a text is Person-heavy (narrative) or Organization-heavy (business/news).
        </p>
      </div>
    </div>
  );
};
