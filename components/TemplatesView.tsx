import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Play, Search, Plus } from 'lucide-react';
import type { FormData } from '../App';

interface TemplateItem {
  id: string;
  name: string;
  timestamp: number;
  data: FormData;
}

interface TemplatesViewProps {
  onApply: (data: FormData) => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ onApply }) => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedTemplates = localStorage.getItem('form_templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse templates', e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const newTemplates = templates.filter(item => item.id !== id);
    setTemplates(newTemplates);
    localStorage.setItem('form_templates', JSON.stringify(newTemplates));
  };

  const filteredTemplates = templates.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.data.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.data.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          Saved Templates
        </h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm mt-2">Save a template from the Generator form to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((item) => (
            <div key={item.id} className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-white text-lg mb-1">{item.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>{item.data.companyName || 'No Company'}</span>
                    <span>•</span>
                    <span>{item.data.role || 'No Role'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">
                    Saved {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <button
                    onClick={() => onApply(item.data)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors text-sm font-medium"
                >
                    <Play className="w-3 h-3" />
                    Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesView;
