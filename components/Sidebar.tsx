import React from 'react';
import { PenTool, History, FileText } from 'lucide-react';

export type View = 'home' | 'history' | 'templates';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'home', label: 'Generator', icon: PenTool },
    { id: 'history', label: 'History', icon: History },
    { id: 'templates', label: 'Templates', icon: FileText },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col items-center lg:items-stretch py-6 z-50 transition-all duration-300">
      <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Referral<span className="text-cyan-400">.ai</span>
        </span>
      </div>

      <nav className="flex-1 w-full px-2 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-full" />
              )}
              <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-100'}`} />
              <span className={`hidden lg:block font-medium ${isActive ? 'text-cyan-100' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
