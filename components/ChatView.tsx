import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { GenerateContentResponse, Chat } from "@google/genai";

interface ChatViewProps {
  chatSession: React.MutableRefObject<Chat | null>;
}

const ChatView: React.FC<ChatViewProps> = ({ chatSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Cyberfriend, your personal security assistant. \n\nI can help you understand common scams, give you tips on how to secure your accounts, or explain tricky technical terms. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatSession.current.sendMessageStream({ message: input });
      
      let fullText = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      // Add placeholder message
      setMessages(prev => [...prev, {
          id: modelMsgId,
          role: 'model',
          text: "",
          timestamp: new Date()
      }]);

      for await (const chunk of response) {
         const c = chunk as GenerateContentResponse;
         if (c.text) {
             fullText += c.text;
             setMessages(prev => prev.map(msg => 
                 msg.id === modelMsgId ? { ...msg, text: fullText } : msg
             ));
         }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the network right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-textMain">Cyberfriend</h2>
            <p className="text-xs text-textMuted">AI Security Assistant</p>
          </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
           {messages.map((msg) => (
             <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
             >
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-cyan-600'}
                `}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>

                <div className={`
                    max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user' 
                        ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-tr-sm' 
                        : 'bg-zinc-800/50 text-zinc-200 border border-white/5 rounded-tl-sm'}
                `}>
                    {msg.text || (
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-200"></span>
                        </span>
                    )}
                </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface/30 border-t border-border">
            <div className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about a suspicious email, password tips, etc..."
                    disabled={loading}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-textMain focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-textMuted"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 disabled:bg-transparent disabled:text-textMuted"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-textMuted">Cyberfriend can make mistakes. Always double check important information.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;