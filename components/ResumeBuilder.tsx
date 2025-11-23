import React, { useState, useRef, useEffect } from 'react';
import { FileText, Send, Download, Copy, Check, Loader2 } from 'lucide-react';
import { modifyResume } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ResumeBuilder: React.FC = () => {
  const [latexCode, setLatexCode] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your LaTeX resume editor. Paste your resume code or use the template, then tell me what you\'d like to change. For example: "Add skill: Docker" or "Change CGPA to 9.2"'
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load LaTeX code from localStorage on mount
  useEffect(() => {
    const savedLatex = localStorage.getItem('resume_latex_code');
    if (savedLatex) {
      setLatexCode(savedLatex);
    }
  }, []);

  // Save LaTeX code to localStorage whenever it changes
  useEffect(() => {
    if (latexCode.trim()) {
      localStorage.setItem('resume_latex_code', latexCode);
    }
  }, [latexCode]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    if (!latexCode.trim()) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Please paste your LaTeX resume code in the editor first!'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newUserMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    const currentRequest = userInput;
    setUserInput('');
    setIsProcessing(true);

    try {
      const modifiedLatex = await modifyResume(latexCode, currentRequest);
      
      // Check if it's a clarification request
      if (modifiedLatex.startsWith('CLARIFICATION NEEDED:')) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: modifiedLatex.replace('CLARIFICATION NEEDED:', '').trim()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Update the LaTeX code
        setLatexCode(modifiedLatex);
        const assistantMessage: Message = {
          role: 'assistant',
          content: '✅ Done! I\'ve updated your resume. Check the editor on the right.'
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Failed to modify resume. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenInOverleaf = () => {
    if (!latexCode.trim()) {
      alert('Please paste your LaTeX code first!');
      return;
    }

    // Copy LaTeX code to clipboard
    navigator.clipboard.writeText(latexCode).then(() => {
      // Open Overleaf with a notification
      alert('✅ LaTeX code copied to clipboard!\n\nOverleaf will open in a new tab.\n\nSteps:\n1. Click "New Project" → "Blank Project"\n2. Paste (Ctrl+V) your code\n3. Click "Recompile"');
      
      // Open Overleaf
      window.open('https://www.overleaf.com/project', '_blank');
    }).catch(() => {
      // Fallback if clipboard fails
      alert('Please copy your LaTeX code manually and paste it in Overleaf');
      window.open('https://www.overleaf.com/project', '_blank');
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Resume Builder
        </h2>
      </div>

      {/* Main Content - 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left: Chat Interface */}
        <div className="flex flex-col glass-light rounded-lg shadow-xl overflow-hidden">
          <div className="bg-black text-white px-4 py-3 font-bold">
            AI Assistant
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-black rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t-2 border-gray-300 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your request..."
                className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !userInput.trim()}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle: LaTeX Editor */}
        <div className="flex flex-col glass-light rounded-lg shadow-xl overflow-hidden">
          <div className="bg-black text-white px-4 py-3 font-bold flex items-center justify-between">
            <span>LaTeX Code</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLatex}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy LaTeX"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownloadTex}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Download .tex"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <textarea
            value={latexCode}
            onChange={(e) => setLatexCode(e.target.value)}
            placeholder="Paste your LaTeX resume code here..."
            className="flex-1 bg-white text-black p-4 font-mono text-xs resize-none focus:outline-none custom-scrollbar"
            spellCheck={false}
          />
        </div>

        {/* Right: Overleaf Integration */}
        <div className="flex flex-col glass-light rounded-lg shadow-xl overflow-hidden">
          <div className="bg-black text-white px-4 py-3 font-bold flex items-center justify-between">
            <span>Compile & Preview</span>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadTex}
                disabled={!latexCode.trim()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Download .tex file"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">Download</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center">
            <div className="max-w-sm text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-black">Quick Overleaf Compile</h3>
              <p className="text-sm text-gray-600">
                One-click: Copies code to clipboard & opens Overleaf
              </p>

              <div className="bg-white rounded-lg p-4 text-left space-y-2 border-2 border-gray-200">
                <p className="text-xs font-bold text-black flex items-center gap-2">
                  <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">✓</span>
                  Auto-copies LaTeX to clipboard
                </p>
                <p className="text-xs font-bold text-black flex items-center gap-2">
                  <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">✓</span>
                  Opens Overleaf in new tab
                </p>
                <p className="text-xs font-bold text-black flex items-center gap-2">
                  <span className="bg-gray-300 text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                  New Project → Paste → Compile
                </p>
              </div>

              <button
                onClick={handleOpenInOverleaf}
                disabled={!latexCode.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                <FileText className="w-5 h-5" />
                <span className="text-base font-bold">Copy & Open Overleaf</span>
              </button>

              <p className="text-xs text-gray-500 italic">
                ⚡ Code is copied automatically - just paste in Overleaf!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
