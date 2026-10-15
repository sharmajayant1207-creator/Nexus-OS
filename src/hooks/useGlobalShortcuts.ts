import { useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useWindowStore } from '../store/useWindowStore';
import { SystemState } from '../types/os';

export function useGlobalShortcuts() {
  const systemState = useOSStore((s) => s.systemState);
  const isStartMenuOpen = useOSStore((s) => s.isStartMenuOpen);
  const toggleStartMenu = useOSStore((s) => s.toggleStartMenu);

  useEffect(() => {
    if (systemState !== SystemState.DESKTOP) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows / Meta key -> Toggle Start Menu
      if (e.key === 'Meta') {
        e.preventDefault();
        toggleStartMenu();
        return;
      }

      // Escape -> Close Start Menu if open
      if (e.key === 'Escape') {
        if (isStartMenuOpen) {
          toggleStartMenu(false);
        }
        return;
      }

      // Alt + Tab -> Cycle Window Focus
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const { windows, activeWindowId, focusWindow, restoreWindow } = useWindowStore.getState();
        if (windows.length === 0) return;

        const currentIdx = windows.findIndex((w) => w.id === activeWindowId);
        const nextIdx = (currentIdx + 1) % windows.length;
        const nextWin = windows[nextIdx];

        if (nextWin) {
          if (nextWin.isMinimized) {
            restoreWindow(nextWin.id);
          }
          focusWindow(nextWin.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [systemState, isStartMenuOpen, toggleStartMenu]);
}
