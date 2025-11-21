import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Loader2, Bold, RotateCcw, RotateCw, Download, Mail } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface GeneratedEmailProps {
  email: string;
  isLoading: boolean;
  error: string | null;
}

const GeneratedEmail: React.FC<GeneratedEmailProps> = ({ email, isLoading, error }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const isBoldOperationRef = useRef<boolean>(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const savedScrollTopRef = useRef<number>(0);

  useEffect(() => {
    if (email) {
      console.log('GeneratedEmail received email:', email.substring(0, 200));
      const parts = email.split('\n');
      console.log('First line (parts[0]):', parts[0]);
      console.log('First line length:', parts[0].length);
      console.log('First line char codes:', Array.from(parts[0]).map((c: string, i: number) => `${i}:${c}(${c.charCodeAt(0)})`).join(' '));
      if (parts[0].toLowerCase().startsWith('subject:')) {
        // Use replace instead of substring to avoid issues with special characters
        const extractedSubject = parts[0].replace(/^subject:\s*/i, '');
        console.log('Extracted subject:', extractedSubject);
        console.log('Extracted subject length:', extractedSubject.length);
        setSubject(extractedSubject);
        const newBody = parts.slice(2).join('\n');
        console.log('Body (first 200 chars):', newBody.substring(0, 200));
        setBody(newBody);
        historyRef.current = [newBody];
        historyIndexRef.current = 0;
      } else {
        setSubject('');
        setBody(email);
        historyRef.current = [email];
        historyIndexRef.current = 0;
      }
    } else {
        setSubject('');
        setBody('');
        historyRef.current = [''];
        historyIndexRef.current = 0;
    }
  }, [email]);
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    if (isBoldOperationRef.current && cursorPositionRef.current !== null && bodyRef.current) {
      requestAnimationFrame(() => {
        if (bodyRef.current && cursorPositionRef.current !== null) {
          const position = cursorPositionRef.current;
          const savedScroll = savedScrollTopRef.current;
          bodyRef.current.setSelectionRange(position, position);
          requestAnimationFrame(() => {
            if (bodyRef.current) {
              bodyRef.current.scrollTop = savedScroll;
              bodyRef.current.focus();
            }
          });
          cursorPositionRef.current = null;
          isBoldOperationRef.current = false;
        }
      });
    }
  }, [body]);

  const handleCopy = () => {
    if (subject || body) {
      const fullMessage = subject ? `Subject: ${subject}\n\n${body}` : body;
      navigator.clipboard.writeText(fullMessage);
      setIsCopied(true);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.text('Referral Email', margin, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: ${subject}`, margin, 35);

    doc.setFont('helvetica', 'normal');
    const splitBody = doc.splitTextToSize(body, maxLineWidth);
    doc.text(splitBody, margin, 50);

    doc.save('referral-email.pdf');
  };

  const convertToBold = (text: string): string => {
    const boldMap: { [key: string]: string } = {
      'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
      'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
      'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
      'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
      'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
      'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
      '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
    };
    return text.split('').map(char => boldMap[char] || char).join('');
  };

  const handleBold = () => {
    const textarea = bodyRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start !== end) {
            savedScrollTopRef.current = textarea.scrollTop;
            const selectedText = body.substring(start, end);
            const boldText = convertToBold(selectedText);
            const newBody = `${body.substring(0, start)}${boldText}${body.substring(end)}`;
            
            if (historyIndexRef.current < historyRef.current.length - 1) {
              historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
            }
            historyRef.current.push(newBody);
            if (historyRef.current.length > 50) {
              historyRef.current.shift();
            } else {
              historyIndexRef.current++;
            }
            
            isBoldOperationRef.current = true;
            cursorPositionRef.current = start + boldText.length;
            setBody(newBody);
        }
    }
  };

  const lastBodyRef = useRef<string>(body);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isUndoRedoRef.current || isBoldOperationRef.current) {
      lastBodyRef.current = body;
      return;
    }
    if (lastBodyRef.current === body) return;

    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);

    historyTimeoutRef.current = setTimeout(() => {
      if (lastBodyRef.current !== body && !isUndoRedoRef.current && !isBoldOperationRef.current) {
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      handleRedo();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-400">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400 relative z-10" />
              </div>
              <p className="mt-6 text-xl font-medium text-slate-300">Crafting your masterpiece...</p>
              <p className="text-sm text-slate-500 mt-2">This usually takes about 5-10 seconds</p>
          </div>
      );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-red-400">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <p className="font-semibold text-lg">Generation Failed</p>
                <p className="mt-2 text-sm text-center max-w-xs text-slate-400">{error}</p>
            </div>
        );
    }
    if (email) {
      return (
        <div className="space-y-4 h-full flex flex-col">
           <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1">
                  <button onClick={handleUndo} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Undo">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={handleRedo} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Redo">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-1" />
                  <button onClick={handleBold} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Bold (LinkedIn)">
                    <Bold className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                      onClick={handleDownloadPDF}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                      title="Download PDF"
                  >
                      <Download className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">PDF</span>
                  </button>
                  <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        isCopied 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                      }`}
                  >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs font-medium">{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
            </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase tracking-wider ml-1">Subject</label>
              <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>
             <div className="flex-1 flex flex-col">
              <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase tracking-wider ml-1">Body</label>
              <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full flex-1 min-h-[400px] bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-4 text-slate-200 font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none custom-scrollbar"
              />
            </div>
          </div>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
            <div className="p-4 bg-slate-800/50 rounded-full mb-4">
              <Mail className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg font-medium text-slate-400">Your generated email will appear here</p>
            <p className="text-sm mt-2 max-w-xs text-center">Fill out the form on the left and click "Generate" to create your personalized referral email.</p>
        </div>
    );
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Mail className="w-6 h-6 text-cyan-400" />
        Generated Email
      </h2>
      {renderContent()}
    </div>
  );
};

export default GeneratedEmail;
