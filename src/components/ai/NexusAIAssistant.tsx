import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Trash2,
  PanelRight,
  Maximize2,
  Minimize2,
  Bot,
  User,
  Zap,
  Command,
} from "lucide-react";
import { useAIStore, AIViewMode } from "../../store/useAIStore";

const SUGGESTION_CHIPS = [
  "Dark Mode",
  "Open Weather",
  "Create Note",
  "Check Status",
  "Mute Sound",
  "Calculate 120 * 4",
  "Open Calculator",
  "Lock Screen",
  "Play Guess Game"
];

export const NexusAIAssistant: React.FC = () => {
  const {
    isOpen,
    closeAI,
    toggleAI,
    viewMode,
    setViewMode,
    messages,
    isProcessing,
    
    sendMessage,
    clearHistory,
  } = useAIStore();

  const [inputQuery, setInputQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Global Ctrl + Space hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleAI();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAI]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const query = inputQuery;
    setInputQuery("");
    sendMessage(query);
  };

  const handleChipClick = (chipText: string) => {
    if (isProcessing) return;
    sendMessage(chipText);
  };

  if (!isOpen) return null;

  // Layout mode classes mapping
  const modeClasses: Record<AIViewMode, string> = {
    docked:
      "fixed top-9 right-0 bottom-12 w-full max-w-md z-[9200] border-l border-cyan-500/30 rounded-l-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)]",
    floating:
      "fixed top-16 right-8 bottom-20 w-[450px] max-h-[700px] z-[9200] border border-cyan-500/30 rounded-3xl shadow-2xl",
    expanded:
      "fixed inset-6 md:inset-12 z-[9200] border border-cyan-500/30 rounded-3xl shadow-2xl max-w-5xl mx-auto my-auto max-h-[85vh]",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          x: viewMode === "docked" ? 100 : 0,
          scale: viewMode === "docked" ? 1 : 0.95,
        }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: viewMode === "docked" ? 100 : 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${modeClasses[viewMode]} flex flex-col bg-slate-950/90 backdrop-blur-2xl text-slate-100 overflow-hidden font-sans border-slate-800`}
      >
        {/* Header / Title Bar */}
        <div className="px-5 py-4 bg-linear-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-wide font-mono">
                  Nexus AI Engine
                </h2>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-semibold">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                OS Intelligence & Copilot
              </p>
            </div>
          </div>

          {/* Controls: Mode Switchers, Clear, Close */}
          <div className="flex items-center gap-1.5">
            {/* View Mode Buttons */}
            <button
              onClick={() => setViewMode("docked")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === "docked"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-800/60"
              }`}
              title="Dock Side Drawer"
            >
              <PanelRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode("floating")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === "floating"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-800/60"
              }`}
              title="Floating Window"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode("expanded")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === "expanded"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-800/60"
              }`}
              title="Expanded Workspace"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1" />

            <button
              onClick={clearHistory}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={closeAI}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Close Nexus AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow ${
                    isUser
                      ? "bg-cyan-600 text-slate-950 font-bold"
                      : "bg-slate-900 border border-slate-800 text-purple-400"
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] space-y-1 ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3.5 text-xs leading-relaxed whitespace-pre-wrap wrap-break-word ${
                      isUser
                        ? "bg-cyan-600/30 border border-cyan-500/40 text-cyan-50 rounded-2xl rounded-tr-sm shadow-md"
                        : "bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-2xl rounded-tl-sm shadow-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[10px] text-slate-500 block px-1 ${isUser ? "text-right" : "text-left"}`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 flex items-center justify-center shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-100" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-200" />
                <span className="text-[11px] text-slate-400 font-mono ml-1">
                  Evaluating intent...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/60 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Quick Actions:
            </span>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                disabled={isProcessing}
                className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-800/80 bg-slate-900/90 shrink-0"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Nexus AI or type a command... (Ctrl + Space)"
              className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500/60 text-xs font-sans text-slate-100 placeholder-slate-500 outline-none transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="absolute right-1.5 p-2 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md"
              title="Send Command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3 text-cyan-400" /> Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                Space
              </kbd>{" "}
              anytime
            </span>
            <span>Zero-Latency Kernel AI</span>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
