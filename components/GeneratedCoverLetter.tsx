import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Loader2, Download, FileText, RotateCcw, RotateCw, Bold } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface GeneratedCoverLetterProps {
  content: string;
  isLoading: boolean;
  error: string | null;
}

const GeneratedCoverLetter: React.FC<GeneratedCoverLetterProps> = ({ content, isLoading, error }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [body, setBody] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const savedScrollTopRef = useRef<number>(0);

  useEffect(() => {
    if (content) {
      setBody(content);
      historyRef.current = [content];
      historyIndexRef.current = 0;
    } else {
        setBody('');
        historyRef.current = [''];
        historyIndexRef.current = 0;
    }
  }, [content]);
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (body) {
      navigator.clipboard.writeText(body);
      setIsCopied(true);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const splitBody = doc.splitTextToSize(body, maxLineWidth);
    doc.text(splitBody, margin, 20);

    doc.save('cover-letter.pdf');
  };

  const lastBodyRef = useRef<string>(body);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isUndoRedoRef.current) {
      lastBodyRef.current = body;
      return;
    }
    if (lastBodyRef.current === body) return;

    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);

    historyTimeoutRef.current = setTimeout(() => {
      if (lastBodyRef.current !== body && !isUndoRedoRef.current) {
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }
        historyRef.current.push(body);
        if (historyRef.current.length > 50) {
          historyRef.current.shift();
        } else {
          historyIndexRef.current++;
        }
        lastBodyRef.current = body;
      }
    }, 500);

    return () => {
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    };
  }, [body]);

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const previousBody = historyRef.current[historyIndexRef.current];
      setBody(previousBody);
      lastBodyRef.current = previousBody;
      setTimeout(() => isUndoRedoRef.current = false, 0);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const nextBody = historyRef.current[historyIndexRef.current];
      setBody(nextBody);
      lastBodyRef.current = nextBody;
      setTimeout(() => isUndoRedoRef.current = false, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Z for Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    // Ctrl+Shift+Z or Ctrl+Y for Redo
    else if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      handleRedo();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-600">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-black relative z-10" />
              </div>
              <p className="mt-6 text-xl font-bold text-black">Writing your cover letter...</p>
              <p className="text-sm text-gray-500 mt-2">This usually takes about 5-10 seconds</p>
          </div>
      );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-red-600">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg">Generation Failed</p>
                <p className="mt-2 text-sm text-center max-w-xs text-gray-600">{error}</p>
            </div>
        );
    }
    if (content) {
      return (
        <div className="space-y-4 h-full flex flex-col">
           <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg border-2 border-gray-300">
                <div className="flex items-center gap-1">
                  <button onClick={handleUndo} className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors" title="Undo">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={handleRedo} className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors" title="Redo">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                      onClick={handleDownloadPDF}
                      className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                      title="Download PDF"
                  >
                      <Download className="w-4 h-4" />
                      <span className="text-xs font-bold hidden sm:inline">PDF</span>
                  </button>
                  <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 font-bold ${
                        isCopied 
                          ? 'bg-black text-white' 
                          : 'bg-gray-800 text-white hover:bg-black'
                      }`}
                  >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs">{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
            </div>

          <div className="space-y-4 flex-1 flex flex-col">
             <div className="flex-1 flex flex-col">
              <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  readOnly={false}
                  spellCheck={true}
                  className="w-full flex-1 min-h-[500px] bg-white border-2 border-gray-300 rounded-lg py-4 px-4 text-black font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none custom-scrollbar"
              />
            </div>
          </div>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="p-4 bg-gray-200 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-700">Your cover letter will appear here</p>
            <p className="text-sm mt-2 max-w-xs text-center text-gray-500">Fill out the form and click "Generate" to create your professional cover letter.</p>
        </div>
    );
  };

  return (
    <div className="glass-light p-6 sm:p-8 rounded-lg shadow-xl h-full">
      <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2 pb-4 border-b-2 border-black">
        <FileText className="w-6 h-6" />
        Generated Cover Letter
      </h2>
      {renderContent()}
    </div>
  );
};

export default GeneratedCoverLetter;
