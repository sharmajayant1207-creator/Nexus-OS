import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useOSStore } from "../../store/useOSStore";
import { SystemState } from "../../types/os";
import {
  Terminal,
  Shield,
  Cpu,
  HardDrive,
  Zap,
  CheckCircle2,
} from "lucide-react";

const BOOT_STAGES = [
  { label: "Initializing Nexus Kernel v6.12-rt...", icon: Cpu, weight: 15 },
  {
    label: "Checking VFS Integrity & NVMe Block Devices...",
    icon: HardDrive,
    weight: 35,
  },
  {
    label: "Loading System Services & Security Enclave...",
    icon: Shield,
    weight: 60,
  },
  {
    label: "Starting Nexus Graphics Engine & Compositor...",
    icon: Zap,
    weight: 85,
  },
  {
    label: "Mounting User Subsystem & Preparing Desktop...",
    icon: CheckCircle2,
    weight: 100,
  },
];

const TERMINAL_LOGS = [
  "[  0.000000] Linux version 6.12.0-nexus-rt (gcc version 14.2.0)",
  "[  0.012490] Command line: BOOT_IMAGE=/vmlinuz-6.12-nexus root=UUID=nexus-sys quiet splash",
  '[  0.045210] x86/fpu: Supporting XSAVE feature 0x001: "x87 floating point registers"',
  '[  0.089120] ACPI: Added _OSI("Windows 2023")',
  "[  0.120450] Quantum Enclave: Hardware AES-256-GCM Acceleration Enabled",
  "[  0.210990] Memory: 32768MB RAM Available, Reserved 512MB for VRAM GPU",
  "[  0.342110] PCI: Initializing NVMe Controller 00:01.0",
  "[  0.490120] VFS: Mounted ext4 filesystem on /dev/nvme0n1p2",
  "[  0.612000] Systemd 256.4: Initializing System Core Daemons...",
  "[  0.781200] Display: Initializing Wayland Compositor (Nexus Render v2.0)",
  "[  0.910000] Audio: ALSA / PulseAudio Bus Active (24-bit 192kHz)",
  "[  1.020000] Network: Qualcomm Wi-Fi 6E Controller Online",
  "[  1.150000] Security: PIN Hash Validation Subsystem Ready",
  "[  1.280000] System state transition: BOOT -> LOGIN UI",
];

export const BootScreen: React.FC = () => {
  const setSystemState = useOSStore((state) => state.setSystemState);
  const userName = useOSStore(
    (state) => state.userName || state.currentUser?.name || "Jayant Sharma",
  );
  const [progress, setProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Keyboard listener for ESC to toggle terminal logs
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTerminal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Progress interval simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setSystemState(SystemState.LOGIN);
          }, 400);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 4) + 2;
        const target = Math.min(next, 100);

        // Update stage based on progress threshold
        if (target >= 85) setCurrentStageIdx(4);
        else if (target >= 60) setCurrentStageIdx(3);
        else if (target >= 35) setCurrentStageIdx(2);
        else if (target >= 15) setCurrentStageIdx(1);

        return target;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [setSystemState]);

  useEffect(() => {
    // Dynamically append logs as progress advances
    const logIndex = Math.min(
      Math.floor((progress / 100) * TERMINAL_LOGS.length),
      TERMINAL_LOGS.length - 1,
    );
    setLogs(TERMINAL_LOGS.slice(0, logIndex + 1));
  }, [progress]);

  const handleSkipBoot = () => {
    setProgress(100);
    setSystemState(SystemState.LOGIN);
  };

  const currentStage = BOOT_STAGES[currentStageIdx];
  const StageIcon = currentStage.icon;

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-8 select-none overflow-hidden font-sans">
      {/* Background ambient glowing mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0)_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />

      {/* Top Header info */}
      <div className="w-full flex justify-between items-center z-10 opacity-70 text-xs tracking-wider uppercase font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Nexus Boot Loader v4.2
        </span>
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5" />
          {showTerminal ? "Hide Console" : "Console (ESC)"}
        </button>
      </div>

      {/* Center Logo & Progress Area */}
      <div className="flex flex-col items-center justify-center z-10 w-full max-w-md my-auto">
        {/* Futuristic Animated SVG Logo */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30"
          />
          {/* Inner counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-blue-500/20"
          />

          {/* Pulse aura */}
          <motion.div
            animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-cyan-500/20 blur-xl"
          />

          {/* Core Logo Graphic */}
          <motion.svg
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            viewBox="0 0 100 100"
            className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
          >
            {/* Hexagon Outer Shield */}
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Inner Futuristic 'N' & Core Nodes */}
            <path
              d="M30 70 V30 L70 70 V30"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="4" fill="#38bdf8" />
          </motion.svg>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent mb-1"
        >
          NEXUS OS
        </motion.h1>
        <p className="text-xs text-slate-400 tracking-wider font-mono mb-3">
          QUANTUM ARCHITECTURE ENGINE
        </p>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-300 font-mono mb-6 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Welcome back, {userName}</span>
        </motion.div>

        {/* Dynamic Stage Info */}
        <div className="w-full flex items-center justify-between text-xs text-slate-300 mb-2 font-mono">
          <span className="flex items-center gap-2 truncate">
            <StageIcon className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="truncate">{currentStage.label}</span>
          </span>
          <span className="font-bold text-cyan-400 ml-2">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Skip button option */}
        <button
          onClick={handleSkipBoot}
          className="mt-6 text-xs text-slate-500 hover:text-cyan-400 transition-colors underline cursor-pointer"
        >
          Fast Boot (Skip Sequence)
        </button>
      </div>

      {/* Console Overlay (Optional Real-time Kernel Logs) */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-8 right-8 max-w-4xl mx-auto h-48 bg-slate-950/90 border border-cyan-900/40 rounded-lg p-4 font-mono text-[11px] text-cyan-300/90 shadow-2xl backdrop-blur-md overflow-y-auto z-30"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2 text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <Terminal className="w-3.5 h-3.5" /> Kernel Log Stream
              </span>
              <span>{logs.length} entries</span>
            </div>
            <div className="space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  {log}
                </div>
              ))}
              <div className="text-cyan-400/50 animate-pulse">_</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="w-full text-center text-[11px] text-slate-600 font-mono z-10">
        Nexus OS Kernel 6.12 • All Systems Nominal • Security Layer Active
      </div>
    </div>
  );
};
