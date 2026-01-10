
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Plus, Image as ImageIcon, FileText, Bug, BrainCircuit, X, Copy, Check, MessageSquare, Clock, Edit2, Trash2, Calendar } from 'lucide-react';
import { ChatMessage, Session, Mood, UserProfile, ChatSessionData } from '../types';
import { generateCoachResponse } from '../services/geminiService';

interface AICoachProps {
  sessions: Session[];
  moods: { date: string; mood: Mood }[];
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string;
  name: string;
}

// Custom Message Component with Enhanced Rendering
const MessageContent: React.FC<{ text: string; role: 'user' | 'model' }> = ({ text, role }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper: Render inline text (Bold, Inline Code)
  const renderInline = (str: string) => {
    // Split by bold (**...**)
    return str.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      // Split by inline code (`...`)
      return part.split(/(`[^`]+`)/g).map((subPart, j) => {
        if (subPart.startsWith('`') && subPart.endsWith('`')) {
           return <code key={`${i}-${j}`} className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono opacity-90 border border-white/10 mx-0.5 align-middle">{subPart.slice(1, -1)}</code>;
        }
        return subPart;
      });
    });
  };

  // Helper: Render blocks (Headers, Lists, Paragraphs)
  const renderBlock = (blockText: string) => {
    return blockText.split('\n').map((line, i) => {
       const trimmed = line.trim();
       if (!trimmed) return <div key={i} className="h-2" />; 

       // Headers
       if (trimmed.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-3 mb-1">{renderInline(trimmed.slice(4))}</h3>;
       if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{renderInline(trimmed.slice(3))}</h2>;
       if (trimmed.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{renderInline(trimmed.slice(2))}</h1>;
       
       // Unordered Lists
       if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-1 mb-1">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${role === 'user' ? 'bg-white' : 'bg-primary'}`} />
              <span className="leading-relaxed opacity-90 break-words">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
       }
       
       // Numbered Lists
       if (/^\d+\.\s/.test(trimmed)) {
          const firstSpace = trimmed.indexOf(' ');
          const num = trimmed.substring(0, firstSpace);
          const rest = trimmed.substring(firstSpace + 1);
          return (
             <div key={i} className="flex items-start gap-2 ml-1 mb-1">
                <span className="font-bold opacity-80 min-w-[1.2rem]">{num}</span>
                <span className="leading-relaxed opacity-90 break-words">{renderInline(rest)}</span>
             </div>
          );
       }

       // Plain Paragraph - Use opacity for slight contrast instead of hardcoded color
       return <p key={i} className="mb-1 leading-relaxed opacity-95 break-words">{renderInline(line)}</p>;
    });
  };

  // Main Split: Code Blocks vs Text
  // We apply this logic for BOTH user and model now
  const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g);

  return (
    <div className="space-y-1 text-inherit w-full max-w-full">
      {parts.map((part, index) => {
        // Normal Text Section
        if (index % 3 === 0) {
          if (!part.trim()) return null;
          return <div key={index} className="max-w-full">{renderBlock(part)}</div>;
        }
        
        // Language Identifier (Skip)
        if (index % 3 === 1) return null;
        
        // Code Block Section
        if (index % 3 === 2) {
          const lang = parts[index - 1] || 'text';
          const code = part;
          return (
            <div key={index} className="relative mt-3 mb-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-lg group/code text-left w-full max-w-full">
              <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{lang}</span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const AICoach: React.FC<AICoachProps> = ({ sessions, moods, userProfile, setUserProfile }) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hi ${userProfile.name.split(' ')[0]}! I'm your FOCUSYNC coach. I'm here to help you stay productive without the burnout. How are you feeling about your code today? 💙`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'normal' | 'debug' | 'thinking'>('normal');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- History Management ---

  const persistChat = (newMessages: ChatMessage[], activeId: string) => {
    setUserProfile(prev => {
        const history = prev.chatHistory || [];
        const exists = history.some(chat => chat.id === activeId);
        
        let updatedHistory;

        if (exists) {
            updatedHistory = history.map(chat => 
                chat.id === activeId 
                ? { ...chat, messages: newMessages, lastModified: Date.now() }
                : chat
            );
        } else {
            const userMsg = newMessages.find(m => m.role === 'user');
            const title = userMsg ? userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? '...' : '') : 'New Conversation';
            
            updatedHistory = [{
                id: activeId,
                title: title,
                messages: newMessages,
                lastModified: Date.now()
            }, ...history];
        }
        updatedHistory.sort((a, b) => b.lastModified - a.lastModified);
        return { ...prev, chatHistory: updatedHistory };
    });
  };

  const handleLoadChat = (chat: ChatSessionData) => {
      setMessages(chat.messages);
      setCurrentChatId(chat.id);
      setActiveMode('normal'); // Reset mode on load
      scrollToBottom();
  };

  const handleNewChat = () => {
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: `New session started. What's on your mind? ⚡`,
        timestamp: Date.now(),
      }]);
      setCurrentChatId(null);
      setActiveMode('normal');
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setUserProfile(prev => ({
          ...prev,
          chatHistory: prev.chatHistory.filter(c => c.id !== id)
      }));
      if (currentChatId === id) {
          handleNewChat();
      }
  };

  const startEditing = (e: React.MouseEvent, chat: ChatSessionData) => {
      e.stopPropagation();
      setEditingTitleId(chat.id);
      setEditTitleValue(chat.title);
  };

  const saveTitle = (id: string) => {
      if (editTitleValue.trim()) {
          setUserProfile(prev => ({
              ...prev,
              chatHistory: prev.chatHistory.map(c => c.id === id ? { ...c, title: editTitleValue.trim() } : c)
          }));
      }
      setEditingTitleId(null);
  };

  // --- Messaging ---

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    setIsMenuOpen(false);
    
    let displayText = input;
    if (attachment) {
      displayText = `[Attached: ${attachment.name}] \n${input}`;
    }

    // Enhance text based on mode
    if (activeMode === 'debug') {
        const isCodeBlock = input.trim().startsWith('```');
        const prefix = `**[Debug Mode]**\n`;
        
        // Always wrap in code block if in debug mode and not already wrapped
        // detecting if user pasted raw code
        if (!attachment && !isCodeBlock) {
             displayText = `${prefix}\`\`\`\n${input}\n\`\`\``;
        } else {
             displayText = `${prefix}${displayText}`;
        }
    } else if (activeMode === 'thinking') {
        displayText = `**[Thinking Mode]** ${displayText}`;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: displayText,
      timestamp: Date.now(),
    };

    let activeChatId = currentChatId;
    if (!activeChatId) {
        activeChatId = Date.now().toString();
        setCurrentChatId(activeChatId);
    }

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    persistChat(updatedMessages, activeChatId); 

    setInput('');
    setIsLoading(true);

    try {
      const options = {
        mode: activeMode,
        attachment: attachment ? {
           mimeType: attachment.mimeType,
           data: attachment.data
        } : undefined
      };

      const responseText = await generateCoachResponse(updatedMessages, sessions, moods, userProfile, input || (attachment ? `Analyze this ${attachment.type}.` : "Hello"), options);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };
      
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      persistChat(finalMessages, activeChatId);

    } catch (error) {
      console.error("Failed to get response", error);
    } finally {
      setIsLoading(false);
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      if (type === 'image') {
        reader.onloadend = () => {
          setAttachment({ type: 'image', mimeType: file.type, data: reader.result as string, name: file.name });
          setIsMenuOpen(false);
        };
        reader.readAsDataURL(file);
      } else {
        const isPdf = file.type === 'application/pdf';
        reader.onloadend = () => {
             setAttachment({ 
                type: 'file', 
                mimeType: isPdf ? 'application/pdf' : 'text/plain', 
                data: reader.result as string, 
                name: file.name 
            });
            setIsMenuOpen(false);
        };
        isPdf ? reader.readAsDataURL(file) : reader.readAsText(file);
      }
    }
  };

  const toggleMode = (mode: 'debug' | 'thinking') => {
    setActiveMode(activeMode === mode ? 'normal' : mode);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
        {/* Main Chat Interface */}
        <div className="h-[calc(100vh-16rem)] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Bot size={20} className="text-secondary" />
            </div>
            <div>
                <h2 className="font-semibold text-white">Coach Sync</h2>
                <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span className="text-xs text-gray-400">Online & Ready</span>
                </div>
            </div>
            </div>
            <button 
                onClick={handleNewChat}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center gap-2 border border-transparent hover:border-white/5"
            >
                <Plus size={16} /> New Chat
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div
                className={`max-w-[85%] lg:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden ${
                    msg.role === 'user'
                    ? 'bg-primary/20 text-white rounded-br-none border border-primary/20 backdrop-blur-sm'
                    : 'bg-card text-gray-200 rounded-bl-none border border-white/5'
                }`}
                >
                <MessageContent text={msg.text} role={msg.role} />
                </div>
            </div>
            ))}
            {isLoading && (
            <div className="flex justify-start">
                <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1 items-center h-10">
                   <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/5 relative z-10">
            {attachment && (
            <div className="mb-2 flex items-center gap-2 bg-white/5 p-2 rounded-lg w-fit border border-white/10 animate-fade-in-up">
                {attachment.type === 'image' && <img src={attachment.data} alt="Attached" className="w-8 h-8 rounded object-cover" />}
                {attachment.type === 'file' && (
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center border border-green-500/30">
                    <FileText size={14} className="text-green-400" />
                </div>
                )}
                <span className="text-xs text-gray-300 max-w-[150px] truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"><X size={12} className="text-gray-400" /></button>
            </div>
            )}

            {activeMode !== 'normal' && (
            <div className="mb-2 flex items-center gap-2">
                {activeMode === 'debug' && <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center gap-1"><Bug size={12} /> Debug Mode</span>}
                {activeMode === 'thinking' && <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 flex items-center gap-1"><BrainCircuit size={12} /> Thinking</span>}
                <button onClick={() => setActiveMode('normal')} className="text-xs text-gray-500 hover:text-white underline">Clear Mode</button>
            </div>
            )}

            <div className="flex gap-2 items-end">
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-3 rounded-xl transition-all ${isMenuOpen ? 'bg-primary text-background rotate-45' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                <Plus size={20} />
                </button>
                {isMenuOpen && (
                <div className="absolute bottom-14 left-0 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up backdrop-blur-xl z-50">
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" className="hidden" />
                    <input type="file" ref={docInputRef} onChange={(e) => handleFileSelect(e, 'file')} accept=".pdf,.txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.md,.py,.java,.c,.cpp" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"><ImageIcon size={16} className="text-blue-400" /> Add Image</button>
                    <button onClick={() => docInputRef.current?.click()} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"><FileText size={16} className="text-green-400" /> Add File / PDF</button>
                    <button onClick={() => toggleMode('debug')} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${activeMode === 'debug' ? 'bg-red-500/10 text-red-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}><Bug size={16} className="text-red-400" /> Debug Code</button>
                    <button onClick={() => toggleMode('thinking')} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${activeMode === 'thinking' ? 'bg-purple-500/10 text-purple-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}><BrainCircuit size={16} className="text-purple-400" /> Thinking</button>
                </div>
                )}
            </div>

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeMode === 'debug' ? "Paste code to debug..." : activeMode === 'thinking' ? "What should I research?" : "Ask for advice, vent, or check stats..."}
                className={`flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors ${activeMode === 'debug' ? 'border-red-500/30' : activeMode === 'thinking' ? 'border-purple-500/30' : ''}`}
            />
            
            <button
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !attachment)}
                className={`font-bold p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-background ${activeMode === 'debug' ? 'bg-red-500 hover:bg-red-600' : activeMode === 'thinking' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-primary hover:bg-primary/80'}`}
            >
                {isLoading ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
            AI Coach can make mistakes. Prioritize your mental health. 🌿
            </p>
        </div>
        </div>

        {/* Previous Conversations Section */}
        {userProfile.chatHistory && userProfile.chatHistory.length > 0 && (
             <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" /> Previous Conversations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProfile.chatHistory.map((chat) => (
                        <div 
                           key={chat.id}
                           onClick={() => handleLoadChat(chat)}
                           className={`group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                               currentChatId === chat.id 
                               ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]' 
                               : 'bg-card/50 border-white/5 hover:bg-card hover:border-white/10'
                           }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                    {editingTitleId === chat.id ? (
                                        <input 
                                            type="text" 
                                            value={editTitleValue}
                                            onChange={(e) => setEditTitleValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveTitle(chat.id)}
                                            onBlur={() => saveTitle(chat.id)}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-black/40 border border-primary/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                        />
                                    ) : (
                                        <h4 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">
                                            {chat.title}
                                        </h4>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => startEditing(e, chat)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                        title="Rename"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                   <Calendar size={10} /> {new Date(chat.lastModified).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                   <Clock size={10} /> {new Date(chat.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Active Indicator */}
                            {currentChatId === chat.id && (
                                <div className="absolute -left-[1px] top-4 bottom-4 w-[3px] bg-primary rounded-r-full"></div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
        )}
    </div>
  );
};

export default AICoach;
