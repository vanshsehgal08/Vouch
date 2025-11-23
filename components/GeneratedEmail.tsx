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
      const parts = email.split('\n');
      const subjectLineIndex = parts.findIndex(line => line.toLowerCase().startsWith('subject:'));
      
      if (subjectLineIndex !== -1) {
        const extractedSubject = parts[subjectLineIndex].replace(/^subject:\s*/i, '');
        setSubject(extractedSubject);
        
        // Body is everything after the subject line
        // We remove leading empty lines to ensure "Hi Sir," isn't lost if spacing varies
        const bodyParts = parts.slice(subjectLineIndex + 1);
        while (bodyParts.length > 0 && bodyParts[0].trim() === '') {
          bodyParts.shift();
        }
        const newBody = bodyParts.join('\n');
        
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
    // Ctrl+B or Cmd+B for Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      handleBold();
    }
    // Ctrl+Z for Undo
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
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
              <p className="mt-6 text-xl font-bold text-black">Crafting your masterpiece...</p>
              <p className="text-sm text-gray-500 mt-2">This usually takes about 5-10 seconds</p>
          </div>
      );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-red-600">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg">Generation Failed</p>
                <p className="mt-2 text-sm text-center max-w-xs text-gray-600">{error}</p>
            </div>
        );
    }
    if (email) {
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
                  <div className="w-px h-4 bg-gray-400 mx-1" />
                  <button onClick={handleBold} className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors" title="Bold (Ctrl+B)">
                    <Bold className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                      onClick={() => {
                        const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&source=mailto&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(gmailUrl, '_blank');
                      }}
                      className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                      title="Open in Gmail"
                  >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold hidden sm:inline">Gmail</span>
                  </button>
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
            <div>
              <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide ml-1">Subject</label>
              <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
             <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide ml-1">Body</label>
              <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  readOnly={false}
                  spellCheck={true}
                  className="w-full flex-1 min-h-[400px] bg-white border-2 border-gray-300 rounded-lg py-4 px-4 text-black font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none custom-scrollbar"
              />
            </div>
          </div>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="p-4 bg-gray-200 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-700">Your generated email will appear here</p>
            <p className="text-sm mt-2 max-w-xs text-center text-gray-500">Fill out the form and click "Generate" to create your personalized referral email.</p>
        </div>
    );
  };

  return (
    <div className="glass-light p-6 sm:p-8 rounded-lg shadow-xl h-full">
      <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2 pb-4 border-b-2 border-black">
        <Mail className="w-6 h-6" />
        Generated Email
      </h2>
      {renderContent()}
    </div>
  );
};

export default GeneratedEmail;
