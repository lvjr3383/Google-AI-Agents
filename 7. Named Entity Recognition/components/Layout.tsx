
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      <header className="bg-white border-b border-slate-100 shrink-0 h-12 flex items-center z-10">
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.663 17h4.674a1 1 0 00.908-.588l3.358-7.659a1 1 0 00-.908-1.403H14.11a1 1 0 01-.908-.588l-1.006-2.298a1 1 0 00-1.816 0l-1.006 2.298a1 1 0 01-.908.588H5.904a1 1 0 00-.908 1.403l3.358 7.659a1 1 0 00.908.588z" />
              </svg>
            </div>
            <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Entity Explorer</h1>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Linguistic Intelligence v2.1</span>
            <div className="h-3 w-px bg-slate-100" />
            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-sm tracking-widest">AGENT</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
};
