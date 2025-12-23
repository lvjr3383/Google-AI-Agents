
import React from 'react';
import { TreeNode } from '../types';
import { COLORS, TEXT_COLORS, TAG_LABELS } from '../constants';

interface TreeViewProps {
  node: TreeNode;
}

const TreeView: React.FC<TreeViewProps> = ({ node }) => {
  const renderNode = (item: TreeNode, depth: number) => {
    const colorClass = COLORS[item.label] || 'bg-slate-200';
    const textColorClass = TEXT_COLORS[item.label] || 'text-slate-800';
    const jobTitle = TAG_LABELS[item.label] || item.label;

    return (
      <div 
        key={item.id || `${item.label}-${depth}-${Math.random()}`}
        className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] transition-all duration-700 group border border-black/5 ${
          depth === 0 ? 'w-full max-w-6xl' : 'flex-1 min-w-[140px]'
        }`}
        style={{
          backgroundColor: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px -4px rgba(0,0,0,0.06)'
        }}
      >
        <div className={`px-5 py-2.5 rounded-2xl font-black shadow-xl ${colorClass} ${textColorClass} flex flex-col items-center transition-all group-hover:scale-110 cursor-default border border-white/20`}>
          <span className="text-[10px] uppercase tracking-wider leading-none">{jobTitle?.split(' (')[0]}</span>
          <span className="text-[8px] opacity-60 mt-0.5 font-mono">{item.label}</span>
        </div>
        
        {item.children && item.children.length > 0 ? (
          <div className="flex gap-8 w-full justify-center mt-2">
            {item.children.map(child => renderNode(child, depth + 1))}
          </div>
        ) : (
          <div className="text-3xl font-black text-slate-800 py-4 border-t-2 border-slate-100 w-full text-center mt-2 group-hover:text-indigo-600 transition-colors">
            {item.word}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-auto p-12 scrollbar-hide flex items-start justify-center animate-in fade-in duration-1000">
      <div className="w-full flex flex-col items-center py-8">
        <div className="mb-12 text-center">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Step 3: The Finished Pyramid</h3>
          <p className="text-sm text-slate-400 mt-2 italic">The structure is now complete and fully stable.</p>
        </div>
        {node ? renderNode(node, 0) : <div className="text-slate-400 font-bold uppercase tracking-widest">Building...</div>}
      </div>
    </div>
  );
};

export default TreeView;
