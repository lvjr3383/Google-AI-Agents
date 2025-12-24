
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Candidate } from '../types';

interface CandidateChartProps {
  candidates: Candidate[];
}

const CandidateChart: React.FC<CandidateChartProps> = ({ candidates }) => {
  const data = candidates.map(c => ({
    name: c.token,
    prob: parseFloat(c.prob.toFixed(3))
  }));

  return (
    <div className="h-40 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, 1]} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={70} 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#475569' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
          />
          <Bar dataKey="prob" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#cbd5e1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandidateChart;
