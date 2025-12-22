
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="flex flex-row min-h-screen h-screen overflow-hidden bg-white" role="application" aria-label="Structure Sentinel Application">
      {/* Chatbot Column - Left 35% */}
      <aside 
        className="w-[35%] min-w-[320px] bg-slate-50 flex flex-col border-r border-slate-200 h-full overflow-hidden shadow-sm z-20"
        role="complementary"
        aria-label="Linguistic Agent Chat"
      >
        {sidebar}
      </aside>
      
      {/* Workspace Column - Right 65% */}
      <main 
        className="w-[65%] bg-white flex flex-col h-full overflow-hidden"
        role="main"
        aria-label="Analysis Workspace"
      >
        <header className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Workspace</h1>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
            Linguistic Analysis Engine
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar focus:outline-none" tabIndex={0}>
          {children}
        </div>
      </main>
    </div>
  );
};