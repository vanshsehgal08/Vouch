import React, { useState, useEffect } from 'react';
import { Clock, Trash2, RotateCcw, Search, FileText } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: number;
  email: string;
  subject: string;
  companyName: string;
  role: string;
}

interface HistoryViewProps {
  onRestore: (email: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('email_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('email_history', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('email_history');
    }
  };

  const filteredHistory = history.filter(item => 
    item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" />
          Generation History
        </h2>
        <button 
          onClick={handleClearHistory}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No history found</p>
          <p className="text-sm mt-2">Generated emails will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{item.companyName}</h3>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-400 text-sm">{item.role}</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-2 truncate">{item.subject || 'No Subject'}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.email.length} chars
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRestore(item.email)}
                    className="p-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    title="Restore to Editor"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
