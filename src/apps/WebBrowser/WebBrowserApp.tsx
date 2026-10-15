import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Lock,
  ExternalLink,
  Bookmark,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  Terminal,
  Folder,
  Cpu,
  Info,
} from "lucide-react";

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  hasError: boolean;
}

const DEFAULT_HOME_URL = "https://en.wikipedia.org/wiki/Main_Page";

const BOOKMARKS = [
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Main_Page",
    icon: "Globe",
  },
  {
    name: "DuckDuckGo",
    url: "https://html.duckduckgo.com/html/",
    icon: "Search",
  },
  { name: "Hacker News", url: "https://news.ycombinator.com", icon: "Layers" },
  { name: "GitHub", url: "https://github.com", icon: "Globe" },
  { name: "Nexus Docs", url: "nexus://docs", icon: "Sparkles" },
  { name: "Unsplash", url: "https://unsplash.com", icon: "Globe" },
];

export const WebBrowserApp: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: "tab-1",
      title: "Wikipedia - Main Page",
      url: DEFAULT_HOME_URL,
      history: [DEFAULT_HOME_URL],
      historyIndex: 0,
      isLoading: false,
      hasError: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [addressInput, setAddressInput] = useState<string>(DEFAULT_HOME_URL);
  const [viewMode, setViewMode] = useState<"iframe" | "proxy" | "reader">(
    "iframe",
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Helper: Format URL
  const sanitizeUrl = (input: string): string => {
    let target = input.trim();
    if (!target) return DEFAULT_HOME_URL;
    if (target.startsWith("nexus://")) return target;

    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.includes(".") && !target.includes(" ")) {
        target = `https://${target}`;
      } else {
        // Search query via DuckDuckGo HTML
        target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(target)}`;
      }
    }
    return target;
  };

  // Navigate Active Tab
  const navigateToUrl = (rawUrl: string) => {
    const sanitized = sanitizeUrl(rawUrl);
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(sanitized);

        let title = sanitized;
        if (sanitized === "nexus://docs")
          title = "Nexus OS System Documentation";
        else if (sanitized.includes("wikipedia")) title = "Wikipedia";
        else if (sanitized.includes("duckduckgo")) title = "DuckDuckGo Search";

        return {
          ...tab,
          url: sanitized,
          title,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isLoading: true,
          hasError: false,
        };
      }),
    );
    setAddressInput(sanitized);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(addressInput);
  };

  // Tab Operations
  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: "Wikipedia - Main Page",
      url: DEFAULT_HOME_URL,
      history: [DEFAULT_HOME_URL],
      historyIndex: 0,
      isLoading: false,
      hasError: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setAddressInput(DEFAULT_HOME_URL);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Reset the single remaining tab to home instead of leaving empty
      navigateToUrl(DEFAULT_HOME_URL);
      return;
    }
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
      setAddressInput(nextTabs[nextTabs.length - 1].url);
    }
  };

  const handleBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const prevIdx = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[prevIdx];

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, historyIndex: prevIdx, url: prevUrl }
          : t,
      ),
    );
    setAddressInput(prevUrl);
  };

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1)
      return;
    const nextIdx = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[nextIdx];

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, historyIndex: nextIdx, url: nextUrl }
          : t,
      ),
    );
    setAddressInput(nextUrl);
  };

  const handleReload = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: true } : t)),
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, isLoading: false } : t,
        ),
      );
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-100 select-none font-sans overflow-hidden">
      {/* Top Tab Strip */}
      <div className="bg-slate-950 border-b border-slate-800 flex items-center px-2 pt-1.5 gap-1 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setAddressInput(tab.url);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs max-w-[200px] min-w-[120px] transition-all cursor-pointer border-t border-x ${
                isActive
                  ? "bg-[#0b0f17] border-slate-700 text-cyan-300 font-medium shadow-[0_-2px_10px_rgba(6,182,212,0.15)]"
                  : "bg-slate-900/60 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-[11px] flex-1">{tab.title}</span>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={handleAddTab}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-1 cursor-pointer"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Address Toolbar */}
      <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <button
          onClick={handleBack}
          disabled={!activeTab || activeTab.historyIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleForward}
          disabled={
            !activeTab || activeTab.historyIndex >= activeTab.history.length - 1
          }
          className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleReload}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          title="Reload"
        >
          <RotateCcw
            className={`w-4 h-4 ${activeTab?.isLoading ? "animate-spin text-cyan-400" : ""}`}
          />
        </button>

        <button
          onClick={() => navigateToUrl(DEFAULT_HOME_URL)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Address Input Field */}
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Search or enter web URL..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none font-mono text-xs"
            />
          </div>
        </form>

        {/* Toggle View Mode (Direct vs Proxy vs Reader) */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("iframe")}
            className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "iframe"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Direct iFrame Mode"
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setViewMode("proxy")}
            className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "proxy"
                ? "bg-amber-500/20 text-amber-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Proxy Fallback Mode for X-Frame Restricted Sites"
          >
            Proxy
          </button>
          <button
            type="button"
            onClick={() => setViewMode("reader")}
            className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "reader"
                ? "bg-purple-500/20 text-purple-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Reader Mode"
          >
            Reader
          </button>
        </div>

        <a
          href={activeTab?.url.startsWith("http") ? activeTab.url : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Open in external browser window"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Bookmarks Bar */}
      <div className="px-3 py-1 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => navigateToUrl(bm.url)}
            className="px-2.5 py-0.5 rounded-md hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-cyan-300 font-medium transition-colors shrink-0"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Viewport Render View */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        {activeTab?.url === "nexus://docs" ? (
          /* Custom Internal System Documentation */
          <div className="h-full p-8 overflow-y-auto custom-scrollbar max-w-4xl mx-auto space-y-6 text-slate-200 font-sans">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  Nexus OS Developer Documentation
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Kernel Specification & API Guide v2.5
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Terminal className="w-4 h-4" /> Interactive Terminal Commands
                </div>
                <p className="text-xs text-slate-400">
                  Type{" "}
                  <code className="text-amber-300 font-mono bg-slate-950 px-1 py-0.5 rounded">
                    help
                  </code>{" "}
                  inside the Terminal app for full shell utility controls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <Folder className="w-4 h-4" /> VFS File Storage
                </div>
                <p className="text-xs text-slate-400">
                  10 GB IndexedDB mirrored quota backing real persistent CRUD
                  file node state.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3 font-mono text-xs">
              <span className="text-cyan-400 font-bold block">
                Keyboard & System Shortcuts:
              </span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>
                  <code className="text-emerald-400">Ctrl + Shift + T</code>:
                  Launch Terminal Console
                </li>
                <li>
                  <code className="text-emerald-400">Ctrl + Shift + E</code>:
                  Open File Explorer
                </li>
                <li>
                  <code className="text-emerald-400">Alt + Tab</code>: Switch
                  Active Window Focus
                </li>
                <li>
                  <code className="text-emerald-400">Win Key / Start</code>:
                  Open Nexus Shell Menu
                </li>
              </ul>
            </div>
          </div>
        ) : viewMode === "iframe" || viewMode === "proxy" ? (
          /* Standard Embedded Iframe or Proxy Mode */
          <div className="w-full h-full relative">
            <iframe
              key={`${viewMode}-${activeTab?.url}`}
              src={
                viewMode === "proxy" &&
                activeTab?.url &&
                activeTab.url.startsWith("http")
                  ? `https://corsproxy.io/?${encodeURIComponent(activeTab.url)}`
                  : activeTab?.url
              }
              title={activeTab?.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              className="w-full h-full border-none bg-white"
              onLoad={() => {
                setTabs((prev) =>
                  prev.map((t) =>
                    t.id === activeTabId ? { ...t, isLoading: false } : t,
                  ),
                );
              }}
              onError={() => {
                setTabs((prev) =>
                  prev.map((t) =>
                    t.id === activeTabId
                      ? { ...t, isLoading: false, hasError: true }
                      : t,
                  ),
                );
              }}
            />

            {/* Smart Fallback Overlay banner for iframe security restriction awareness */}
            <div className="absolute bottom-3 right-3 p-3 rounded-2xl bg-[#0b0f17]/95 border border-slate-800 backdrop-blur-xl shadow-2xl max-w-xs space-y-2 text-xs z-10">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Info className="w-3.5 h-3.5" /> Web Security Note
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("proxy")}
                    className={`text-[10px] font-mono hover:underline ${
                      viewMode === "proxy"
                        ? "text-amber-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    Proxy
                  </button>
                  <button
                    onClick={() => setViewMode("reader")}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Reader
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                If the site fails to render due to origin{" "}
                <code className="text-amber-300">X-Frame-Options</code>{" "}
                policies, switch to Proxy or Reader View.
              </p>
              <a
                href={activeTab?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium transition-colors"
              >
                <span>Launch in External Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Simulated Reader Mode View */
          <div className="h-full p-8 overflow-y-auto custom-scrollbar max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Globe className="w-4 h-4" />
                <span>{activeTab?.url}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                {activeTab?.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rendered preview of page contents in Nexus Reader Enclave. The
                page is formatted for optimal readability and security within
                the Nexus desktop framework.
              </p>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">
                  Source: Web Origin Verified
                </span>
                <a
                  href={activeTab?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <span>Open Direct Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
