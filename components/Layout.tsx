import React from 'react';
import Sidebar, { View } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden text-slate-200 selection:bg-cyan-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
