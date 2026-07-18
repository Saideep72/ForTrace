import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, User, Zap, Activity, ShieldAlert,
  Paperclip, FileText, ArrowUp, X
} from 'lucide-react';

import HeaderBar from '../components/HeaderBar';
import { useSettings } from '../contexts/SettingsContext';

const SUGGESTED_QUERIES = [
  {
    icon: <Activity size={18} className="text-primary" />,
    text: "Check the status of Heat Exchanger E-201"
  },
  {
    icon: <ShieldAlert size={18} className="text-primary" />,
    text: "List recent critical failures in the plant"
  },
  {
    icon: <FileText size={18} className="text-primary" />,
    text: "Show the safety SOP for Pump P-305"
  }
];

const MOCK_BOT_RESPONSES = [
  {
    text: "Based on the telemetry data, Heat Exchanger E-201 is operating nominally. However, P-201 is showing a slight increase in vibration.",
    entities: [{ type: "Asset", value: "E-201" }, { type: "Asset", value: "P-201" }]
  },
  {
    text: "There have been 3 critical failures in the past week, mostly related to pressure drops in the secondary cooling loop.",
    entities: [{ type: "Event", value: "critical failures" }]
  },
  {
    entities: [{ type: "Document", value: "Safety SOP" }],
    confidence: 94
  }
];

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-assistant');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const { aiPrefs } = useSettings();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };
  
  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || inputValue;
    if (!text.trim()) return;
    
    // Add user message
    const newMsg = { id: Date.now(), sender: 'user', text, entities: [], attachedFile: attachedFile ? attachedFile.name : null };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    removeAttachment();
    setIsTyping(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockRes = MOCK_BOT_RESPONSES[Math.floor(Math.random() * MOCK_BOT_RESPONSES.length)];
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: mockRes.text,
        entities: mockRes.entities,
        confidence: mockRes.confidence || 98
      }]);
      setIsTyping(false);
    }, 1500);
  };
  
  const renderMessageText = (msg) => {
    if (!msg.entities || msg.entities.length === 0) return msg.text;
    
    let renderedText = msg.text;
    msg.entities.forEach(entity => {
      const regex = new RegExp(`(${entity.value})`, 'gi');
      renderedText = renderedText.replace(regex, '|||$1|||');
    });
    
    const parts = renderedText.split('|||');
    return parts.map((part, idx) => {
      const isEntity = msg.entities.some(e => e.value.toLowerCase() === part.toLowerCase());
      if (isEntity) {
        return (
          <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--c-primary)]/10 text-[var(--c-primary)] font-semibold mx-0.5 cursor-pointer hover:bg-[var(--c-primary)]/20 transition-colors">
            <Zap size={12} />
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>

      
      <main className="main-content font-inter pb-[100px]">
        {/* Header Bar is optional inside the chat, but we include it for consistency with other pages */}
        <HeaderBar />

        {/* Decorative gradient blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--c-primary)]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--c-accent)]/10 blur-[100px] pointer-events-none" />

        {/* Main Chat Area */}
        <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto px-6">
          
          {/* Initial Empty State (Matches Reference Image Layout exactly) */}
          <AnimatePresence>
            {!hasMessages && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center w-full mt-[-20px]"
              >
                {/* The Glowing Orb */}
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--c-primary)] via-transparent to-[var(--c-accent)] opacity-70 blur-md"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-2 rounded-full bg-[var(--c-surface)] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[var(--c-primary)]/20 to-transparent" />
                    <div className="w-16 h-8 rounded-[100%] bg-[var(--c-primary)]/80 blur-[8px] absolute top-12 opacity-80" />
                    <div className="w-24 h-12 rounded-[100%] bg-[var(--c-accent)]/50 blur-[12px] absolute bottom-8 opacity-60" />
                  </motion.div>
                </div>

                {/* Greeting Text */}
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-medium text-[var(--c-text-secondary)] mb-1">Hey Manager</h2>
                  <h1 className="text-4xl font-semibold text-[var(--c-text)] tracking-tight">How can I assist you?</h1>
                </div>

                {/* Suggestion Cards */}
                {aiPrefs.aiSuggestions && (
                  <div className="flex gap-4 w-full justify-center flex-wrap">
                    {SUGGESTED_QUERIES.map((q, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ y: -4, shadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSend(null, q.text)}
                        className="flex-1 min-w-[220px] max-w-[260px] h-[140px] bg-[var(--c-surface)] border border-[var(--c-border)] rounded-3xl p-5 flex flex-col items-start justify-between text-left transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)] group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--c-bg)] flex items-center justify-center group-hover:bg-[var(--c-primary)]/10 transition-colors">
                          {q.icon}
                        </div>
                        <span className="text-[0.95rem] font-medium text-[var(--c-text-secondary)] leading-snug group-hover:text-[var(--c-text)] transition-colors">
                          {q.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Chat State */}
          {hasMessages && (
            <div className="w-full flex-1 flex flex-col py-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-gradient-to-br from-[var(--c-primary)] to-[var(--c-secondary)] text-white shadow-md">
                        <Bot size={16} />
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-[0.95rem] ${
                      msg.sender === 'user'
                        ? 'bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-tr-sm'
                        : 'bg-transparent text-[var(--c-text)] border-none px-2' 
                    }`}>
                      {msg.attachedFile && (
                        <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] text-[0.8rem] text-[var(--c-text-secondary)]">
                          <FileText size={14} className="text-[var(--c-primary)]" />
                          <span className="font-medium">{msg.attachedFile}</span>
                        </div>
                      )}
                      {msg.sender === 'bot' ? renderMessageText(msg) : msg.text}
                      
                      {msg.sender === 'bot' && aiPrefs.confidenceScore && msg.confidence && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--c-success)]/10 text-[var(--c-success)] text-xs font-semibold border border-[var(--c-success)]/20">
                          <CheckCircle2 size={12} />
                          {msg.confidence}% Confidence
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex gap-4 max-w-[80%] items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--c-primary)] to-[var(--c-secondary)] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-2 flex items-center gap-1.5 h-[40px]">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-[var(--c-primary)]/60" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-[var(--c-primary)]/60" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-[var(--c-primary)]/60" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-24" />
            </div>
          )}
        </div>

        {/* Fixed Chat Input Area at the bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-[var(--c-bg)] via-[var(--c-bg)] to-transparent z-20 pointer-events-none">
          <form 
            onSubmit={handleSend}
            className="w-full max-w-3xl relative pointer-events-auto"
          >
            <div className="relative bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[24px] p-2 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              
              {/* Attachment Preview Area */}
              {attachedFile && (
                <div className="flex items-center gap-2 px-4 py-2 mt-1 mb-1 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-full self-start ml-2">
                  <FileText size={14} className="text-[var(--c-primary)]" />
                  <span className="text-xs font-medium text-[var(--c-text-secondary)] max-w-[200px] truncate">{attachedFile.name}</span>
                  <button type="button" onClick={removeAttachment} className="ml-1 text-[var(--c-text-muted)] hover:text-[var(--c-danger)] transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors">
                  <Paperclip size={20} />
                </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about assets, SOPs, or operations..."
                className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-[var(--c-text)] placeholder-[var(--c-text-muted)] font-medium text-[0.95rem]"
              />
              
              <div className="pr-1">
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-[var(--c-primary)] text-white flex items-center justify-center transition-all hover:bg-[var(--c-secondary)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[var(--c-primary)]"
                >
                  <ArrowUp size={20} />
                </button>
              </div>
              </div>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
