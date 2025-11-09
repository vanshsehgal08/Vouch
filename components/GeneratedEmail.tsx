import React, { useState, useEffect, useRef } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import LoadingIcon from './icons/LoadingIcon';
import BoldIcon from './icons/BoldIcon';

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
      if (parts[0].toLowerCase().startsWith('subject:')) {
        setSubject(parts[0].substring(8).trim());
        const newBody = parts.slice(2).join('\n');
        setBody(newBody);
        // Reset history when new email is generated
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

  // Restore cursor position after body update (only for bold formatting)
  useEffect(() => {
    if (isBoldOperationRef.current && cursorPositionRef.current !== null && bodyRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated, then restore everything
      requestAnimationFrame(() => {
        if (bodyRef.current && cursorPositionRef.current !== null) {
          const position = cursorPositionRef.current;
          const textarea = bodyRef.current;
          const savedScroll = savedScrollTopRef.current;
          
          // Set cursor position
          textarea.setSelectionRange(position, position);
          
          // Immediately restore scroll position after setting selection
          // Use requestAnimationFrame again to override browser's auto-scroll
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

  // Convert text to LinkedIn bold (Unicode bold characters)
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
            // Save current scroll position BEFORE making changes
            savedScrollTopRef.current = textarea.scrollTop;
            
            const selectedText = body.substring(start, end);
            const boldText = convertToBold(selectedText);
            const newBody = `${body.substring(0, start)}${boldText}${body.substring(end)}`;
            
            // Add to history before making change
            if (historyIndexRef.current < historyRef.current.length - 1) {
              historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
            }
            historyRef.current.push(newBody);
            if (historyRef.current.length > 50) {
              historyRef.current.shift();
            } else {
              historyIndexRef.current++;
            }
            
            // Mark this as a bold operation
            isBoldOperationRef.current = true;
            // Store cursor position to restore after state update
            cursorPositionRef.current = start + boldText.length;
            setBody(newBody);
        }
    }
  };

  // Track body changes for history (debounced to avoid too many entries)
  const lastBodyRef = useRef<string>(body);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip history tracking for undo/redo, bold operations, or initial email load
    if (isUndoRedoRef.current || isBoldOperationRef.current) {
      lastBodyRef.current = body;
      return;
    }

    // Skip if body hasn't actually changed
    if (lastBodyRef.current === body) {
      return;
    }

    // Clear existing timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Debounce history updates (wait 500ms after user stops typing)
    historyTimeoutRef.current = setTimeout(() => {
      if (lastBodyRef.current !== body && !isUndoRedoRef.current && !isBoldOperationRef.current) {
        // Remove any forward history if we're not at the end
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }
        // Add new state to history (limit to 50 states)
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
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [body]);

  const handleUndo = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (historyIndexRef.current > 0) {
        isUndoRedoRef.current = true;
        historyIndexRef.current--;
        const previousBody = historyRef.current[historyIndexRef.current];
        const textarea = bodyRef.current;
        const cursorPos = textarea ? textarea.selectionStart : 0;
        setBody(previousBody);
        lastBodyRef.current = previousBody;
        // Restore cursor position after undo
        requestAnimationFrame(() => {
          if (bodyRef.current) {
            const newCursorPos = Math.min(cursorPos, previousBody.length);
            bodyRef.current.setSelectionRange(newCursorPos, newCursorPos);
            bodyRef.current.focus();
          }
          isUndoRedoRef.current = false;
        });
      }
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      e.preventDefault();
      if (historyIndexRef.current < historyRef.current.length - 1) {
        isUndoRedoRef.current = true;
        historyIndexRef.current++;
        const nextBody = historyRef.current[historyIndexRef.current];
        const textarea = bodyRef.current;
        const cursorPos = textarea ? textarea.selectionStart : 0;
        setBody(nextBody);
        lastBodyRef.current = nextBody;
        // Restore cursor position after redo
        requestAnimationFrame(() => {
          if (bodyRef.current) {
            const newCursorPos = Math.min(cursorPos, nextBody.length);
            bodyRef.current.setSelectionRange(newCursorPos, newCursorPos);
            bodyRef.current.focus();
          }
          isUndoRedoRef.current = false;
        });
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
              <LoadingIcon className="w-10 h-10 animate-spin text-cyan-500" />
              <p className="mt-4 text-lg">Generating your email...</p>
              <p className="text-sm">This may take a few seconds.</p>
          </div>
      );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-400">
                <p className="font-semibold">Generation Failed</p>
                <p className="mt-2 text-sm text-center">{error}</p>
            </div>
        );
    }
    if (email) {
      return (
        <div className="space-y-4">
           <div className="flex justify-end items-center gap-2 relative">
                {isCopied && (
                    <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-md">
                    Copied!
                    </span>
                )}
                <button
                    onClick={handleBold}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                    aria-label="Make selected text bold for LinkedIn"
                    title="Make selected text bold for LinkedIn (Unicode bold)"
                >
                    <BoldIcon className="w-5 h-5 text-slate-300" />
                </button>
                <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                    aria-label="Copy to clipboard"
                    title="Copy to clipboard"
                >
                    <ClipboardIcon className={`w-5 h-5 ${isCopied ? 'text-green-400' : 'text-slate-300'}`} />
                </button>
            </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
            <input
                type="text"
                readOnly
                value={subject}
                className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-300"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Body</label>
            <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleUndo}
                className="w-full h-96 bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-300 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-lg">Your generated email will appear here.</p>
            <p className="text-sm">Fill out the form and click "Generate".</p>
        </div>
    );
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Generated Email</h2>
      {renderContent()}
    </div>
  );
};

export default GeneratedEmail;
