import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  Download,
  Copy,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Info,
  Check,
  X,
  ExternalLink,
  Monitor,
  FolderOpen,
  Sparkles,
  Sliders,
  Grid,
} from "lucide-react";
import { useVFSStore, SYSTEM_FOLDERS } from "../../store/useVFSStore";
import { useOSStore } from "../../store/useOSStore";
import { VFSNode } from "../../types/vfs";

// Sample fallback wallpapers/photos for initial seeding or user addition
const SAMPLE_PHOTOS = [
  {
    name: "Cyberpunk_Neon_Street.jpg",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop",
    dimensions: "3840x2160",
    size: 8400000,
  },
  {
    name: "Deep_Space_Galaxy.jpg",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop",
    dimensions: "3840x2160",
    size: 12100000,
  },
  {
    name: "Quantum_Mesh_Abstract.jpg",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2560&auto=format&fit=crop",
    dimensions: "2560x1440",
    size: 6200000,
  },
  {
    name: "Monochrome_Architecture.jpg",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2560&auto=format&fit=crop",
    dimensions: "3840x2160",
    size: 9500000,
  },
  {
    name: "Aether_Sunset_Horizon.jpg",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop",
    dimensions: "3840x2160",
    size: 10400000,
  },
];

export const PhotoGalleryApp: React.FC = () => {
  const { nodes, getChildren, createFile, deleteItem } = useVFSStore();
  const { setWallpaper } = useOSStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Inspector Controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Photo Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoName, setNewPhotoName] = useState("");

  // 1. Fetch images from VFS /Pictures folder
  const pictureNodes = useMemo(() => {
    const rawNodes = getChildren(SYSTEM_FOLDERS.PICTURES);
    return rawNodes.filter((node) => {
      if (node.type !== "file") return false;
      const ext = node.metadata?.extension?.toLowerCase() || "";
      const isImg = ["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext);
      // Also match if URL content starts with http or data:image
      const isUrl =
        node.content?.startsWith("http") ||
        node.content?.startsWith("data:image");
      return isImg || isUrl;
    });
  }, [nodes, getChildren]);

  // Seed sample images into VFS /Pictures if currently empty
  useEffect(() => {
    if (pictureNodes.length === 0) {
      SAMPLE_PHOTOS.forEach((photo) => {
        createFile(
          SYSTEM_FOLDERS.PICTURES,
          photo.name,
          photo.url,
          "jpg",
          "Image",
        );
      });
    }
  }, [pictureNodes.length, createFile]);

  // Filter Photos
  const filteredPhotos = useMemo(() => {
    return pictureNodes.filter((photo) => {
      const matchesSearch =
        !searchQuery.trim() ||
        photo.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === "All") return matchesSearch;
      if (selectedCategory === "Wallpapers")
        return (
          (matchesSearch && photo.name.toLowerCase().includes("cyber")) ||
          photo.name.toLowerCase().includes("nebula")
        );
      if (selectedCategory === "Abstract")
        return (
          (matchesSearch && photo.name.toLowerCase().includes("mesh")) ||
          photo.name.toLowerCase().includes("aether")
        );
      return matchesSearch;
    });
  }, [pictureNodes, searchQuery, selectedCategory]);

  const activePhotoNode = pictureNodes[lightboxIndex] || pictureNodes[0];

  // Helper Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Open Lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setRotation(0);
    setIsLightboxOpen(true);
  };

  // Lightbox Navigation
  const handleNextPhoto = () => {
    setLightboxIndex((prev) => (prev + 1) % pictureNodes.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrevPhoto = () => {
    setLightboxIndex(
      (prev) => (prev - 1 + pictureNodes.length) % pictureNodes.length,
    );
    setZoomLevel(1);
    setRotation(0);
  };

  // Keyboard Shortcuts for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === " ") {
        e.preventDefault();
        setIsSlideshowPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, pictureNodes.length]);

  // Slideshow Timer Loop
  useEffect(() => {
    if (!isSlideshowPlaying || !isLightboxOpen) return;

    const timer = setInterval(() => {
      handleNextPhoto();
    }, 3000);

    return () => clearInterval(timer);
  }, [isSlideshowPlaying, isLightboxOpen, lightboxIndex]);

  // Set Wallpaper Action
  const handleSetAsWallpaper = (photoNode: VFSNode) => {
    if (photoNode.content) {
      setWallpaper(photoNode.content);
      triggerToast("Desktop Wallpaper updated successfully!");
    }
  };

  // Delete Photo Action
  const handleDeletePhoto = (id: string) => {
    deleteItem(id);
    triggerToast("Photo deleted from /Pictures");
    if (isLightboxOpen) {
      if (pictureNodes.length <= 1) {
        setIsLightboxOpen(false);
      } else {
        handleNextPhoto();
      }
    }
  };

  // Create New Photo Node
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const name = newPhotoName.trim() || `Photo_${Date.now()}.jpg`;
    createFile(
      SYSTEM_FOLDERS.PICTURES,
      name.endsWith(".jpg") || name.endsWith(".png") ? name : `${name}.jpg`,
      newPhotoUrl.trim(),
      "jpg",
      "Image",
    );

    setIsAddModalOpen(false);
    setNewPhotoUrl("");
    setNewPhotoName("");
    triggerToast("Added new photo to /Pictures");
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-100 select-none font-sans overflow-hidden">
      {/* Top Header & Search Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              Photo Gallery
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              {pictureNodes.length} Photos in /Pictures
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos by name..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-pink-500/50"
          />
        </div>

        {/* Category Filter Pills & Add Button */}
        <div className="flex items-center gap-2">
          {["All", "Wallpapers", "Abstract"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-pink-500/20 border border-pink-500/40 text-pink-300"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 my-auto" />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(236,72,153,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Viewport */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-950/40">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <FolderOpen className="w-12 h-12 stroke-[1.2] opacity-40" />
            <p className="text-xs italic">No photos found in /Pictures</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPhotos.map((photo, idx) => {
              const isSelected = selectedNodeId === photo.id;
              const imgSrc =
                photo.content ||
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400";

              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedNodeId(photo.id)}
                  onDoubleClick={() => handleOpenLightbox(idx)}
                  className={`group relative rounded-2xl overflow-hidden border bg-slate-900 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl ${
                    isSelected
                      ? "border-pink-500 ring-2 ring-pink-500/40"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                    <img
                      src={imgSrc}
                      alt={photo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Overlay Buttons */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLightbox(idx);
                        }}
                        className="p-2 rounded-xl bg-pink-500 text-slate-950 font-bold hover:scale-110 transition-transform shadow-lg cursor-pointer"
                        title="Open Lightbox Inspector"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsWallpaper(photo);
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:scale-110 transition-transform shadow-lg cursor-pointer"
                        title="Set as Desktop Wallpaper"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="p-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="truncate text-slate-200 font-medium text-[11px] flex-1">
                      {photo.name}
                    </span>
                    <span className="text-[9px] text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 ml-2 shrink-0">
                      {photo.metadata?.dimensions || "4K HD"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Inspector Modal Overlay */}
      <AnimatePresence>
        {isLightboxOpen && activePhotoNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10000 bg-black/90 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Top Lightbox Control Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-pink-400 font-mono">
                  {lightboxIndex + 1} / {pictureNodes.length}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-xs">
                  {activePhotoNode.name}
                </span>
              </div>

              {/* Toolbar Actions: Zoom, Rotate, Slideshow */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-800 my-auto" />

                <button
                  onClick={() => setIsSlideshowPlaying((prev) => !prev)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer border transition-colors ${
                    isSlideshowPlaying
                      ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100"
                  }`}
                >
                  {isSlideshowPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
                  </span>
                </button>

                <button
                  onClick={() => setShowInfoSidebar((s) => !s)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    showInfoSidebar
                      ? "bg-pink-500/20 text-pink-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Toggle Image Details Sidebar"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 ml-2 cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Center Stage + Details Sidebar Split */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Prev Button */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-pink-500 hover:text-slate-950 transition-all shadow-2xl cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Image Display */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-black/40">
                <motion.img
                  key={activePhotoNode.id}
                  src={activePhotoNode.content}
                  alt={activePhotoNode.name}
                  referrerPolicy="no-referrer"
                  style={{
                    scale: zoomLevel,
                    rotate: `${rotation}deg`,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-pink-500 hover:text-slate-950 transition-all shadow-2xl cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Right Side Info Inspector */}
              <AnimatePresence>
                {showInfoSidebar && (
                  <motion.div
                    initial={{ x: 280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 280, opacity: 0 }}
                    className="w-72 bg-slate-950/90 border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 font-sans text-xs"
                  >
                    <div className="space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="font-bold text-slate-100 text-sm truncate">
                          {activePhotoNode.name}
                        </h3>
                        <span className="text-[10px] text-pink-400 font-mono">
                          Image Properties
                        </span>
                      </div>

                      <div className="space-y-2.5 font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[10px]">
                            Path:
                          </span>
                          <span className="truncate block text-[11px] text-slate-300">
                            {activePhotoNode.path}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">
                            Resolution / Dimensions:
                          </span>
                          <span className="text-slate-200">
                            {activePhotoNode.metadata?.dimensions ||
                              "3840x2160 (4K UHD)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">
                            File Size:
                          </span>
                          <span className="text-slate-200">
                            {(
                              (activePhotoNode.size || 8400000) /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">
                            Date Added:
                          </span>
                          <span className="text-slate-200">
                            {new Date(
                              activePhotoNode.createdAt,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inspector Action Buttons */}
                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => handleSetAsWallpaper(activePhotoNode)}
                        className="w-full py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                      >
                        <Monitor className="w-4 h-4" />
                        <span>Set as Desktop Wallpaper</span>
                      </button>

                      <a
                        href={activePhotoNode.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Direct URL</span>
                      </a>

                      <button
                        onClick={() => handleDeletePhoto(activePhotoNode.id)}
                        className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Photo</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Photo Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10000 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-96 p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                  Add New Photo
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={handleAddPhotoSubmit}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                    Photo Name:
                  </label>
                  <input
                    type="text"
                    value={newPhotoName}
                    onChange={(e) => setNewPhotoName(e.target.value)}
                    placeholder="e.g. Neon_Cityscape.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                    Image URL / Data String:
                  </label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    required
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold"
                  >
                    Save Photo
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-10001 px-4 py-2.5 rounded-2xl bg-pink-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
