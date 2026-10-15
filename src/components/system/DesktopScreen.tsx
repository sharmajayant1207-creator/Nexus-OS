import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { useWindowStore } from '../../store/useWindowStore';
import { TopBar } from '../taskbar/TopBar';
import { ControlCenter } from './ControlCenter';
import { DesktopCanvas } from '../window/DesktopCanvas';
import { Taskbar } from '../shell/Taskbar';
import { StartMenu } from '../shell/StartMenu';
import { QuickSettings } from '../shell/QuickSettings';
import { NexusAIAssistant } from '../ai/NexusAIAssistant';
import {
  Folder,
  Terminal as TerminalIcon,
  FileText,
  Settings,
  Globe,
  Cpu,
  Lock,
  Moon,
  RotateCcw,
  Power,
  Sliders,
  X,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

export const DesktopScreen: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    lockSystem,
    sleep,
    reboot,
    shutdown,
    addNotification,
    toggleControlCenter,
  } = useOSStore();

  const { openApp, windows, focusWindow, restoreWindow } = useWindowStore();

  // User PIN Update Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinNotice, setPinNotice] = useState('');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinNotice('PIN must be at least 4 digits');
      return;
    }
    setCurrentUser({ pin: newPin });
    setPinNotice('Security PIN updated successfully!');
    setNewPin('');
    addNotification({
      title: 'Security Notice',
      message: 'System Security PIN was updated successfully.',
      app: 'Security Enclave',
      iconName: 'Lock',
      priority: 'high',
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans flex flex-col justify-between text-white pb-12">
      {/* Top System Status Bar */}
      <TopBar />

      {/* Start Menu Drawer / Popover */}
      <StartMenu />

      {/* Quick Settings Panel Drawer */}
      <QuickSettings />

      {/* Slide-out Control Center Overlay (legacy compatibility) */}
      <ControlCenter />

      {/* Main Desktop Canvas Workspace (Includes VFS Icons, Rubberband, Context Menu, Window Frames) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <DesktopCanvas />
      </div>

      {/* Bottom Taskbar Shell Component */}
      <Taskbar />

      {/* Nexus AI Assistant Overlay */}
      <NexusAIAssistant />

      {/* OS Settings / PIN Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Nexus Security Settings
                </h3>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setPinNotice('');
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Logged User
                  </label>
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-cyan-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdatePin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Update Security PIN
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new 4+ digit PIN"
                      className="w-full bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>

                  {pinNotice && (
                    <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-xl text-center">
                      {pinNotice}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Save Security PIN
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

