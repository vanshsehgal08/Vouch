import React from 'react';
import Sidebar, { View } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  return (
    <div className="flex h-screen bg-black overflow-hidden text-white">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
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
