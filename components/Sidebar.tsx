import React from 'react';
import { PenTool, History, FileText, User } from 'lucide-react';

export type View = 'home' | 'cover-letter' | 'history' | 'templates' | 'profile';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'home', label: 'Referral Email', icon: PenTool },
    { id: 'cover-letter', label: 'Cover Letter', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white border-r-2 border-black flex flex-col items-center lg:items-stretch py-6 z-50 transition-all duration-300">
      <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">V</span>
        </div>
        <span className="hidden lg:block text-xl font-bold text-black">
          Vouch
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
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
              )}
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-black'}`} />
              <span className={`hidden lg:block font-medium ${isActive ? 'text-white' : ''}`}>
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
