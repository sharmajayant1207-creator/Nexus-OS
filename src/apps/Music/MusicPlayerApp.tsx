import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Disc,
  ListMusic,
  Plus,
  FolderOpen,
} from "lucide-react";
import { useVFSStore, SYSTEM_FOLDERS } from "../../store/useVFSStore";
import { useAudioStore } from "../../store/useAudioStore";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  formattedDuration: string;
  cover: string;
  url: string;
  isVFS?: boolean;
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: "sample-1",
    title: "Cyberpunk Synthwave",
    artist: "Nexus Soundworks",
    album: "Neon Horizon OS",
    duration: 225,
    formattedDuration: "03:45",
    cover:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=<chill-abstract-intention-1211></chill-abstract-intention-1211>.mp3",
  },
  {
    id: "sample-2",
    title: "Midnight City Ambient",
    artist: "Aether Resonance",
    album: "Quantum Nocturne",
    duration: 252,
    formattedDuration: "04:12",
    cover:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
  },
  {
    id: "sample-3",
    title: "Atmospheric Flow",
    artist: "Solar Pulse",
    album: "Cosmic Drift",
    duration: 198,
    formattedDuration: "03:18",
    cover:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7337a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
  },
];

export const MusicPlayerApp: React.FC = () => {
  const { nodes, getChildren } = useVFSStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Scan VFS /Music folder
  const vfsTracks = useMemo<Track[]>(() => {
    const musicNodes = getChildren(SYSTEM_FOLDERS.MUSIC);
    return musicNodes
      .filter((n) => {
        if (n.type !== "file") return false;
        const ext = n.metadata?.extension?.toLowerCase() || "";
        return (
          ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext) ||
          n.metadata?.mimeType?.startsWith("audio/")
        );
      })
      .map((node) => ({
        id: node.id,
        title: node.name.replace(/\.[^/.]+$/, ""),
        artist: "VFS Audio Library",
        album: "Local Workspace",
        duration: node.metadata?.duration || 180,
        formattedDuration: "VFS Audio",
        cover:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600",
        url: node.content || "",
        isVFS: true,
      }));
  }, [nodes, getChildren]);

  const playlist = useMemo(() => {
    if (vfsTracks.length > 0) return [...vfsTracks, ...SAMPLE_TRACKS];
    return SAMPLE_TRACKS;
  }, [vfsTracks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [showQueue, setShowQueue] = useState(false);

  const currentTrack = playlist[currentIndex] || playlist[0];
  const isSeekingRef = useRef(false);
  const {
    setIsPlaying: setGlobalIsPlaying,
    setCurrentTrack: setGlobalCurrentTrack,
  } = useAudioStore();

  useEffect(() => {
    setGlobalIsPlaying(isPlaying);
  }, [isPlaying, setGlobalIsPlaying]);

  useEffect(() => {
    if (currentTrack) {
      setGlobalCurrentTrack({
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        cover: currentTrack.cover,
        url: currentTrack.url,
      });
    }
  }, [currentTrack, setGlobalCurrentTrack]);

  // Update audio source when track changes
  useEffect(() => {
    let objectUrl: string | null = null;

    const loadAudio = async () => {
      if (!audioRef.current || !currentTrack?.url) return;

      try {
        const response = await fetch(currentTrack.url);

        if (!response.ok) {
          throw new Error(`Audio fetch failed: ${response.status}`);
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);

        audioRef.current.src = objectUrl;
        audioRef.current.load();

        if (isPlaying) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error("Audio loading error:", error);
        setIsPlaying(false);
      }
    };

    loadAudio();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentIndex, currentTrack?.url]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Playback error:", err);
      }
    }
  };
  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeekingRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);

    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };
  const handleSeekStart = () => {
    isSeekingRef.current = true;

    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    isSeekingRef.current = false;
    setIsSeeking(false);

    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !audioRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const totalWidth = rect.width;
    if (totalWidth <= 0) return;

    const totalDuration = audioRef.current.duration || duration || 100;
    const targetTime = Math.max(
      0,
      Math.min(totalDuration, (clickX / totalWidth) * totalDuration),
    );

    setCurrentTime(targetTime);
    audioRef.current.currentTime = targetTime;
  };

  const handleNext = () => {
    if (isShuffle) {
      const nextRand = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(nextRand);
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const handleTrackEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === "all" || currentIndex < playlist.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-100 font-sans p-4 select-none justify-between overflow-hidden">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />

      {/* Header Bar */}
      <div className="flex justify-between items-center text-xs text-slate-400 font-mono pb-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <Disc className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`} />
          <span>NEXUS HIGH-RES PLAYER</span>
        </div>
        <div className="flex items-center gap-2">
          {vfsTracks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
              {vfsTracks.length} VFS Track{vfsTracks.length > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setShowQueue((prev) => !prev)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showQueue
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Queue List"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Queue List or Vinyl Cover */}
      {showQueue ? (
        <div className="flex-1 my-3 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
          <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider px-1 mb-2">
            Playback Queue ({playlist.length} Tracks)
          </p>
          {playlist.map((tr, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={tr.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-2xl text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold shadow-lg"
                    : "hover:bg-slate-900/80 border border-transparent text-slate-300"
                }`}
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                  <img
                    src={tr.cover}
                    alt={tr.title}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && isPlaying && (
                    <div className="absolute inset-0 bg-indigo-950/60 flex items-center justify-center">
                      <Disc className="w-5 h-5 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-slate-100">{tr.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {tr.artist}
                  </p>
                </div>
                {tr.isVFS && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    VFS
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-mono">
                  {typeof tr.formattedDuration === "string"
                    ? tr.formattedDuration
                    : formatSeconds(tr.duration)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center space-y-3 my-auto py-2">
          {/* Cover Art / Vinyl Disc */}
          <div
            className={`relative w-40 h-40 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl transition-all duration-300 ${
              isPlaying
                ? "ring-4 ring-indigo-500/30 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                : ""
            }`}
          >
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
            {currentTrack.isVFS && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-500/80 text-slate-950 font-bold text-[9px] uppercase tracking-wider backdrop-blur">
                Local VFS
              </span>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100 truncate max-w-xs">
              {currentTrack.title}
            </h2>
            <p className="text-xs text-indigo-400 font-mono mt-0.5">
              {currentTrack.artist}
            </p>
            {currentTrack.album && (
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {currentTrack.album}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress & Seek Slider */}
      <div
        ref={timelineRef}
        className="space-y-1.5 my-2 shrink-0 cursor-pointer"
      >
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeek}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          style={{ accentColor: "var(--accent-color)" }}
          className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <span>
            {duration > 0
              ? formatSeconds(duration)
              : currentTrack.formattedDuration}
          </span>
        </div>
      </div>

      {/* Primary Controls & Volume Slider */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: Shuffle & Repeat */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsShuffle((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isShuffle
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Shuffle Playback"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                setRepeatMode((prev) =>
                  prev === "off" ? "all" : prev === "all" ? "one" : "off",
                )
              }
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                repeatMode !== "off"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Center: Play / Skip Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-bold shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume Control Slider */}
          <div className="flex items-center gap-1.5 w-28">
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
