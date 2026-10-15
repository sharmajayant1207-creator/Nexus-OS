import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../../store/useOSStore';
import { SystemState } from '../../types/os';
import { Power, Moon, RotateCcw, Terminal, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export const PowerOverlay: React.FC = () => {
  const { systemState, setSystemState, wakeFromSleep, powerOn } = useOSStore();

  const [rebootStep, setRebootStep] = useState(0);
  const [rebootLogs, setRebootLogs] = useState<string[]>([]);

  // Sleep wake event listener (press any key or click)
  useEffect(() => {
    if (systemState === SystemState.SLEEP) {
      const handleWakeEvent = () => {
        wakeFromSleep();
      };

      window.addEventListener('keydown', handleWakeEvent);
      window.addEventListener('click', handleWakeEvent);

      return () => {
        window.removeEventListener('keydown', handleWakeEvent);
        window.removeEventListener('click', handleWakeEvent);
      };
    }
  }, [systemState, wakeFromSleep]);

  // Reboot sequence step runner
  useEffect(() => {
    if (systemState === SystemState.REBOOTING) {
      const REBOOT_MESSAGES = [
        '[SYSTEM] Terminating active user sessions and processes...',
        '[KERNEL] Flushing disk caches & unmounting virtual filesystems...',
        '[SYSTEM] Saving user preferences to NVMe encrypted storage...',
        '[HARDWARE] Sending ACPI Reboot signal to motherboard...',
        '[REBOOT] Hardware reset sequence complete. Executing cold boot...',
      ];

      setRebootStep(0);
      setRebootLogs([]);

      let step = 0;
      const interval = setInterval(() => {
        if (step < REBOOT_MESSAGES.length) {
          setRebootLogs((prev) => [...prev, REBOOT_MESSAGES[step]]);
          step++;
          setRebootStep(step);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setSystemState(SystemState.BOOTING);
          }, 800);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [systemState, setSystemState]);

  if (systemState === SystemState.SLEEP) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none font-sans cursor-pointer">
        {/* Low-power breathing LED glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.7, 0.2],
            boxShadow: [
              '0 0 20px rgba(34,211,238,0.2)',
              '0 0 80px rgba(34,211,238,0.8)',
              '0 0 20px rgba(34,211,238,0.2)',
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center mb-6"
        >
          <Moon className="w-10 h-10 text-cyan-300" />
        </motion.div>

        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-xs text-slate-400 font-mono tracking-widest uppercase"
        >
          System in Sleep Mode • Click or press any key to wake
        </motion.p>
      </div>
    );
  }

  if (systemState === SystemState.REBOOTING) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 select-none font-sans text-white">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          {/* Animated Spinner Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-amber-400 mb-6"
          />

          <h2 className="text-2xl font-bold tracking-wide mb-2 text-amber-300">
            Restarting Nexus OS...
          </h2>
          <p className="text-xs text-slate-400 font-mono mb-8">
            Please wait while the system shuts down safely.
          </p>

          {/* Terminal log window */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-amber-200/80 shadow-2xl space-y-2 min-h-40">
            {rebootLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="leading-relaxed"
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (systemState === SystemState.SHUTDOWN) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 select-none font-sans text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center max-w-lg"
        >
          {/* Powered off status indicator */}
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <Power className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">
            Nexus OS is turned off
          </h1>
          <p className="text-sm text-slate-400 font-mono mb-8">
            It is now safe to close your browser window or power on again below.
          </p>

          {/* Power On Switch */}
          <button
            onClick={powerOn}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Power className="w-5 h-5 stroke-[2.5]" />
            <span>Power On Nexus OS</span>
          </button>

          <div className="mt-12 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 font-mono">
            Nexus OS Session Closed • ACPI State: S5 (Soft Off)
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
