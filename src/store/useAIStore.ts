import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { executeNexusAICommand } from '../services/simpleNexusAI';

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export type AIViewMode = 'docked' | 'floating' | 'expanded';

interface AIStoreState {
  isOpen: boolean;
  viewMode: AIViewMode;
  messages: AIMessage[];
  isProcessing: boolean;

  openAI: () => void;
  closeAI: () => void;
  toggleAI: () => void;
  setViewMode: (mode: AIViewMode) => void;
  sendMessage: (text: string) => void;
  clearHistory: () => void;
}

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'ai',
    text: '👋 Welcome to **Nexus AI Assistant** v2.5!\n\nI am your OS intelligence copilot. Ask me to launch apps, change themes, lock the screen, create notes, inspect system status, or run quick math calculations!',
    timestamp: 'Just now',
  },
];

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      viewMode: 'docked',
      messages: INITIAL_MESSAGES,
      isProcessing: false,

      openAI: () => set({ isOpen: true }),
      closeAI: () => set({ isOpen: false }),
      toggleAI: () => set((state) => ({ isOpen: !state.isOpen })),

      setViewMode: (mode) => set({ viewMode: mode }),

      sendMessage: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: AIMessage = {
          id: `msg-user-${Date.now()}`,
          sender: 'user',
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isProcessing: true,
        }));

        // Simulate intelligent response delay
        setTimeout(() => {
          const aiResponseText = executeNexusAICommand(trimmed);

          const aiMsg: AIMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          set((state) => ({
            messages: [...state.messages, aiMsg],
            isProcessing: false,
          }));
        }, 500);
      },

      clearHistory: () =>
        set({
          messages: [
            {
              id: `msg-reset-${Date.now()}`,
              sender: 'ai',
              text: 'Conversation history cleared. How can Nexus AI assist you now?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }),
    }),
    {
      name: 'nexus-ai-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        messages: state.messages,
      }),
    }
  )
);
