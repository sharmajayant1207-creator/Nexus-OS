import { create } from "zustand";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  url?: string;
}

interface AudioState {
  isPlaying: boolean;
  currentTrack: MusicTrack | null;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: MusicTrack | null) => void;
  togglePlay: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: true,
  currentTrack: {
    id: "sample-1",
    title: "Cyberpunk Synthwave",
    artist: "Nexus Soundworks",
    album: "Neon Horizon OS",
    cover:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // <-- ADD THIS
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
