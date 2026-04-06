import { MessageSquare, Plus, History, Settings, LogOut, User, Search, Pin, Trash2, Edit3, MoreVertical, PinOff } from "lucide-react";
import { cn } from "../lib/utils";
import { Chat } from "../types";
import { useState, useMemo } from "react";

interface SidebarProps {
  isOpen: boolean;
  onNewChat: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
}

export default function Sidebar({ 
  isOpen, 
  onNewChat, 
  chats, 
  activeChatId, 
  onSelectChat, 
  onDeleteChat, 
  onRenameChat, 
  onTogglePin 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [chats, searchQuery]);

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onRenameChat(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold text-white tracking-tight text-nowrap">SmartChat AI</span>
        </div>

        <button 
          onClick={onNewChat}
          className="flex items-center gap-3 w-full p-3 mb-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-brand-900/20"
        >
          <Plus size={20} />
          New Chat
        </button>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          <div className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Conversations
          </div>
          
          {filteredChats.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-slate-600">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-3 w-full p-3 rounded-xl transition-all cursor-pointer",
                  activeChatId === chat.id ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare size={18} className={cn(
                  "flex-shrink-0",
                  activeChatId === chat.id ? "text-brand-400" : "text-slate-500 group-hover:text-brand-400"
                )} />
                
                {editingId === chat.id ? (
                  <input 
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(chat.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(chat.id)}
                    className="flex-1 bg-slate-700 border-none rounded px-1 py-0.5 text-sm text-white focus:ring-1 focus:ring-brand-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-sm truncate pr-8">{chat.title}</span>
                )}

                <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }}
                    className={cn(
                      "p-1 rounded hover:bg-slate-700 transition-colors",
                      chat.isPinned ? "text-brand-400" : "text-slate-500"
                    )}
                    title={chat.isPinned ? "Unpin chat" : "Pin chat"}
                  >
                    {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(chat); }}
                    className="p-1 rounded hover:bg-slate-700 text-slate-500 transition-colors"
                    title="Rename chat"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {chat.isPinned && editingId !== chat.id && (
                  <Pin size={10} className="absolute right-2 text-brand-400 group-hover:hidden" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800 transition-colors text-left">
            <History size={18} />
            <span className="text-sm">History</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800 transition-colors text-left">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Guest User</p>
                <p className="text-xs text-slate-500 truncate">guest@smartchat.ai</p>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
