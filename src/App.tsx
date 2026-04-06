import { useState, useRef, useEffect } from "react";
import { Message, Chat } from "./types";
import { generateText, generateImage } from "./services/gemini";
import Sidebar from "./components/Sidebar";
import MessageItem from "./components/MessageItem";
import ChatInput from "./components/ChatInput";
import AbilityGrid from "./components/AbilityGrid";
import { Menu, X, Sparkles, Bot, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

const STORAGE_KEY = "smartchat_ai_chats";

export default function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string, isImage: boolean) => {
    if (!text.trim()) return;

    let currentChatId = activeChatId;
    let updatedChats = [...chats];

    // Create new chat if none active
    if (!currentChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      updatedChats = [newChat, ...chats];
      currentChatId = newChat.id;
      setActiveChatId(currentChatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      type: "text",
    };

    // Update chats with user message
    updatedChats = updatedChats.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            updatedAt: Date.now() 
          } 
        : chat
    );
    setChats(updatedChats);
    setIsLoading(true);

    try {
      let assistantMessage: Message;
      if (isImage) {
        const imageUrl = await generateImage(text);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: imageUrl ? `I've generated this image based on your prompt: "${text}"` : "I'm sorry, I couldn't generate that image.",
          timestamp: Date.now(),
          type: "image",
          imageUrl: imageUrl || undefined,
        };
      } else {
        const chatToProcess = updatedChats.find(c => c.id === currentChatId);
        const history = chatToProcess?.messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })) || [];
        
        const response = await generateText(text, history);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: Date.now(),
          type: "text",
        };
      }

      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, assistantMessage],
              updatedAt: Date.now() 
            } 
          : chat
      ));
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleTogglePin = (id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onNewChat={handleNewChat}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setIsSidebarOpen(false); }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePin={handleTogglePin}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden text-slate-600"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                <Bot size={18} />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">
                {activeChat ? activeChat.title : "SmartChat AI"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-100">
              <Zap size={12} fill="currentColor" />
              Pro Mode
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <Sparkles size={20} />
            </button>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {!activeChatId || messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-12"
              >
                <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-600/30 mx-auto mb-6">
                  <Bot size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-lg">
                  SmartChat AI is your professional assistant for writing, coding, learning, and more.
                </p>
              </motion.div>
              
              <AbilityGrid onSelect={(prompt, isImage) => handleSend(prompt, isImage || false)} />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex w-full py-8 px-4 md:px-8 gap-4 md:gap-6 bg-white border-y border-slate-100">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-sm">
                      <Bot size={20} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SmartChat AI</span>
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-32" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}
