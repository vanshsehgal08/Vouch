import React, { useState, useEffect } from 'react';
import { Clock, Trash2, RotateCcw, Search, FileText } from 'lucide-react';
import { useNotification } from './Notification';

export interface HistoryItem {
  id: string;
  timestamp: number;
  email: string;
  subject: string;
  companyName: string;
  role: string;
  type?: 'email' | 'cover-letter';
}

interface HistoryViewProps {
  onRestore: (item: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showWarning } = useNotification();

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
    showSuccess('History item deleted!');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('email_history');
    showWarning('History cleared!');
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
          <Clock className="w-6 h-6" />
          Generation History
        </h2>
        <button 
          onClick={handleClearHistory}
          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-bold"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 pl-10 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">No history found</p>
          <p className="text-sm mt-2">Generated emails will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="glass-light border-2 border-gray-300 rounded-lg p-5 hover:border-black transition-all group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-black truncate">{item.companyName}</h3>
                    <span className="text-gray-500">•</span>
                    <span className="text-black text-sm font-semibold">{item.role}</span>
                    {item.type === 'cover-letter' && (
                      <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ml-2">
                        Cover Letter
                      </span>
                    )}
                    {(!item.type || item.type === 'email') && (
                      <span className="bg-gray-200 text-gray-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ml-2">
                        Referral
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2 truncate">{item.subject || 'No Subject'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.email.length} chars
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRestore(item)}
                    className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Restore to Editor"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
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
