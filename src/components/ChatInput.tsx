import { Send, Image as ImageIcon, Loader2, X, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface ChatInputProps {
  onSend: (text: string, isImage: boolean) => void;
  isLoading: boolean;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isImageMode, setIsImageMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input, isImageMode);
    setInput("");
    setIsImageMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative group"
      >
        <div className={cn(
          "relative flex flex-col w-full bg-white rounded-2xl border transition-all duration-200 shadow-sm",
          isImageMode ? "border-pink-300 ring-4 ring-pink-50" : "border-slate-200 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50",
          isListening && "border-red-400 ring-4 ring-red-50"
        )}>
          {isImageMode && (
            <div className="flex items-center justify-between px-4 py-2 bg-pink-50 rounded-t-2xl border-b border-pink-100">
              <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider">
                <ImageIcon size={14} />
                Image Generation Mode
              </div>
              <button 
                type="button"
                onClick={() => setIsImageMode(false)}
                className="p-1 hover:bg-pink-100 rounded-full text-pink-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {isListening && (
            <div className="flex items-center justify-between px-4 py-2 bg-red-50 rounded-t-2xl border-b border-red-100">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider animate-pulse">
                <Mic size={14} />
                Listening...
              </div>
              <button 
                type="button"
                onClick={toggleListening}
                className="p-1 hover:bg-red-100 rounded-full text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <div className="flex items-end p-2">
            <button
              type="button"
              onClick={() => setIsImageMode(!isImageMode)}
              className={cn(
                "p-3 rounded-xl transition-all",
                isImageMode ? "bg-pink-500 text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
              title={isImageMode ? "Switch to text mode" : "Switch to image generation"}
            >
              <ImageIcon size={20} />
            </button>

            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-3 rounded-xl transition-all",
                isListening ? "bg-red-500 text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
              title={isListening ? "Stop listening" : "Start dictation"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isImageMode ? "Describe the image you want to create..." : "Ask SmartChat anything..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-700 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-3 rounded-xl transition-all flex items-center justify-center",
                input.trim() && !isLoading 
                  ? (isImageMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30" : "bg-brand-600 text-white shadow-lg shadow-brand-600/30")
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          SmartChat AI can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
