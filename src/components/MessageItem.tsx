import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import { cn } from "../lib/utils";
import { User, Bot, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full py-8 px-4 md:px-8 gap-4 md:gap-6",
        isAssistant ? "bg-white border-y border-slate-100" : "bg-transparent"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-sm",
          isAssistant ? "bg-brand-500 text-white" : "bg-slate-800 text-white"
        )}>
          {isAssistant ? <Bot size={20} /> : <User size={20} />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isAssistant ? "SmartChat AI" : "You"}
          </span>
          {isAssistant && (
            <button 
              onClick={() => copyToClipboard(message.content)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400"
              title="Copy response"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        <div className="markdown-body">
          {message.type === "image" && message.imageUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="flex-1">{message.content}</p>
                <a 
                  href={message.imageUrl} 
                  download={`smartchat-ai-${Date.now()}.png`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
              <img 
                src={message.imageUrl} 
                alt="Generated AI" 
                className="rounded-2xl max-w-full h-auto shadow-lg border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(String(children))}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}
