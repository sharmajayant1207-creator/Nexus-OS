import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface MockEvent {
  id: string;
  title: string;
  time: string;
  type: 'system' | 'meeting' | 'reminder';
}

const MOCK_EVENTS: Record<string, MockEvent[]> = {
  today: [
    { id: '1', title: 'Nexus OS Kernel Optimization Sync', time: '10:00 AM', type: 'meeting' },
    { id: '2', title: 'Automated VFS Backup Job', time: '02:30 PM', type: 'system' },
    { id: '3', title: 'Quantum Enclave PIN Renewal', time: '05:00 PM', type: 'reminder' },
  ],
  upcoming: [
    { id: '4', title: 'Security Protocol Audit', time: '11:00 AM', type: 'system' },
    { id: '5', title: 'System Performance Review', time: '04:00 PM', type: 'meeting' },
  ],
};

export const CalendarWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const widgetRef = useRef<HTMLDivElement>(null);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dismiss on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const days = [];
    // Prev month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d),
      });
    }
    // Next month padding
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(year, month + 1, d),
      });
    }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date: Date) =>
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  const selectedEvents = useMemo(() => {
    if (isToday(selectedDate)) {
      return MOCK_EVENTS.today;
    }
    return MOCK_EVENTS.upcoming;
  }, [selectedDate]);

  return (
    <div ref={widgetRef} className="relative">
      {/* Taskbar Clock Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex flex-col items-end px-2.5 py-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-all cursor-pointer text-right font-mono"
        title="Open Calendar & Schedule"
      >
        <span className="text-xs font-bold text-cyan-400 dark:text-cyan-400 leading-none">{formattedTime}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight mt-0.5">{formattedDate}</span>
      </button>

      {/* Popover Calendar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 w-80 p-4 rounded-2xl bg-[#0b0f17]/95 dark:bg-[#0b0f17]/95 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-[10000] text-slate-100"
          >
            {/* Header: Month / Year & Nav */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold tracking-wide">
                  {monthName} {year}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewDate(new Date())}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 cursor-pointer"
                  title="Jump to Today"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* 7x5 or 7x6 Date Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono mb-4">
              {calendarDays.map((item, idx) => {
                const todayClass = isToday(item.date);
                const selectedClass = isSelected(item.date);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(item.date)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                      !item.isCurrentMonth
                        ? 'text-slate-600 opacity-40'
                        : selectedClass
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-105'
                        : todayClass
                        ? 'bg-purple-500/30 border border-purple-400 text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{item.day}</span>
                    {todayClass && !selectedClass && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Schedule & Events Panel for Selected Date */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {selectedDate.toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedEvents.length} Events
                </span>
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            evt.type === 'system'
                              ? 'bg-cyan-400'
                              : evt.type === 'meeting'
                              ? 'bg-purple-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="truncate text-slate-200 text-[11px] font-medium">
                          {evt.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {evt.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-2">
                    No scheduled events for this date.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
