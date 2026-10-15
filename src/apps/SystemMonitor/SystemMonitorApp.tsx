import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  Activity,
  XCircle,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";
import { useWindowStore } from "../../store/useWindowStore";
import { useVFSStore } from "../../store/useVFSStore";
import { useOSStore } from "../../store/useOSStore";

export const SystemMonitorApp: React.FC = () => {
  const { windows, closeWindow, activeWindowId } = useWindowStore();
  const { nodes } = useVFSStore();
  const { userName } = useOSStore();

  const [cpuHistory, setCpuHistory] = useState<number[]>([
    20, 25, 18, 30, 22, 35, 28, 19, 24, 32,
  ]);
  const [ramUsage, setRamUsage] = useState<number>(2.4); // GB
  const [activeTab, setActiveTab] = useState<
    "overview" | "processes" | "storage"
  >("overview");

  // CPU and RAM live simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU load between 12% and 48%
      const newCpu = Math.floor(12 + Math.random() * 36 + windows.length * 2);
      setCpuHistory((prev) => [...prev.slice(1), newCpu]);

      // Simulate RAM fluctuation
      let baseRam = 2.1 + windows.length * 0.18 + Math.random() * 0.2;
      if (baseRam > 7.8) baseRam = 7.8;
      setRamUsage(parseFloat(baseRam.toFixed(2)));
    }, 1500);

    return () => clearInterval(interval);
  }, [windows.length]);

  const currentCpu = cpuHistory[cpuHistory.length - 1];
  const maxRam = 8.0;
  const ramPercent = Math.round((ramUsage / maxRam) * 100);

  // VFS Storage stats calculation
  const allNodes = Object.values(nodes);
  const fileNodes = allNodes.filter((n) => n.type === "file");
  const folderNodes = allNodes.filter((n) => n.type === "folder");
  const totalSizeBytes = fileNodes.reduce(
    (acc, curr) => acc + (curr.size || 0),
    0,
  );
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  // SVG Line path for CPU History graph
  const svgWidth = 300;
  const svgHeight = 60;
  const points = cpuHistory
    .map((val, idx) => {
      const x = (idx / (cpuHistory.length - 1)) * svgWidth;
      const y = svgHeight - (val / 100) * svgHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex-1 w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top App Header & Tabs */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-sm tracking-wide text-white">
            System Monitor
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("processes")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "processes"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Processes ({windows.length})
          </button>
          <button
            onClick={() => setActiveTab("storage")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "storage"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Storage (VFS)
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Top Cards: CPU & RAM Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU Usage Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    CPU Telemetry
                  </span>
                  <span className="text-lg font-mono font-extrabold text-cyan-400">
                    {currentCpu}%
                  </span>
                </div>

                {/* SVG Graph */}
                <div className="h-16 w-full my-2 relative flex items-center">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  >
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-linear-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${currentCpu}%` }}
                  />
                </div>
              </div>

              {/* Memory Allocation Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-purple-400" />
                    RAM Memory
                  </span>
                  <span className="text-lg font-mono font-extrabold text-purple-400">
                    {ramUsage} GB / 8 GB
                  </span>
                </div>

                <div className="py-3 font-mono text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Allocated Memory:</span>
                    <span className="text-white font-bold">{ramPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active System Tasks:</span>
                    <span className="text-white font-bold">
                      {windows.length + 3} Processes
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-linear-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${ramPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Process Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Active System Summary
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-lg font-bold text-white font-mono">
                    {windows.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Open Windows
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {allNodes.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    VFS Nodes
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {userName}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Active User
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "processes" && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">
                Active Windows & Task Processes
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {windows.length} Processes Running
              </span>
            </div>

            {windows.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No active application windows. All processes idle.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {windows.map((win, idx) => {
                  const isFocused = win.id === activeWindowId;
                  const pid = 1000 + idx * 42 + 7;
                  const estimatedMem = Math.round(
                    90 + win.title.length * 8 + idx * 15,
                  );

                  return (
                    <div
                      key={win.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 text-[11px] w-12">
                          PID {pid}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            {win.title}
                            {isFocused && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-mono">
                                Focused
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            App ID: {win.appId} • State:{" "}
                            {win.isMinimized ? "Minimized" : "Active"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-slate-400 text-[11px]">
                          {estimatedMem} MB
                        </span>
                        <button
                          onClick={() => closeWindow(win.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-all text-[11px] cursor-pointer"
                          title="Terminate process"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>End Task</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "storage" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  IndexedDB Virtual File System Storage
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 my-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-xs text-slate-400">Total VFS Files</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {fileNodes.length} Files
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-xs text-slate-400">
                    Total VFS Folders
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {folderNodes.length} Folders
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300 font-mono">
                <span>Calculated File Payload Size:</span>
                <span className="text-emerald-400 font-bold">
                  {totalSizeMB} MB
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
