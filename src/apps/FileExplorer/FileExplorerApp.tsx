import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FileText,
  FileCode,
  FileSpreadsheet,
  FilePlus,
  Image as ImageIcon,
  Music,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  RotateCcw,
  Search,
  Grid,
  List as ListIcon,
  Copy,
  Scissors,
  Clipboard,
  Edit2,
  HardDrive,
  Download,
  Info,
  Check,
  Monitor,
  FolderOpen as FolderText,
  ShieldCheck,
  File,
  X,
  Upload,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useVFSStore, SYSTEM_FOLDERS } from "../../store/useVFSStore";
import { useWindowStore } from "../../store/useWindowStore";
import { useOSStore } from "../../store/useOSStore";
import { VFSNode } from "../../types/vfs";

interface FileExplorerAppProps {
  initialData?: {
    currentPath?: string;
    parentId?: string;
    folderId?: string;
  };
}

interface ContextMenuState {
  x: number;
  y: number;
  node: VFSNode | null;
}

const getTargetFolderId = (
  currentFolderId: string,
  fileName: string,
  mimeType: string,
): { targetFolderId: string; targetFolderName: string } => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const isAudio =
    ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext) ||
    mimeType.startsWith("audio/");
  const isImage =
    ["png", "jpg", "jpeg", "webp", "svg", "gif", "bmp", "ico"].includes(ext) ||
    mimeType.startsWith("image/");
  const isDoc =
    [
      "txt",
      "md",
      "pdf",
      "json",
      "docx",
      "xlsx",
      "pptx",
      "csv",
      "html",
      "css",
      "js",
      "ts",
    ].includes(ext) ||
    mimeType.startsWith("text/") ||
    mimeType.includes("pdf") ||
    mimeType.includes("document");

  const isGenericOverview =
    currentFolderId === SYSTEM_FOLDERS.ROOT ||
    currentFolderId === SYSTEM_FOLDERS.DESKTOP;

  if (!isGenericOverview) {
    const currentFolderNode = useVFSStore.getState().getNode(currentFolderId);
    return {
      targetFolderId: currentFolderId,
      targetFolderName: currentFolderNode?.name || "Current Folder",
    };
  }

  if (isAudio) {
    return { targetFolderId: SYSTEM_FOLDERS.MUSIC, targetFolderName: "/Music" };
  }
  if (isImage) {
    return {
      targetFolderId: SYSTEM_FOLDERS.PICTURES,
      targetFolderName: "/Pictures",
    };
  }
  if (isDoc) {
    return {
      targetFolderId: SYSTEM_FOLDERS.DOCUMENTS,
      targetFolderName: "/Documents",
    };
  }

  return {
    targetFolderId: currentFolderId,
    targetFolderName: "Current Directory",
  };
};

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({
  initialData,
}) => {
  const {
    nodes,
    getChildren,
    getNode,
    getNodeByPath,
    getStorageUsage,
    createFolder,
    createFile,
    deleteItem,
    restoreItem,
    renameItem,
    moveItem,
    copyItem,
    emptyTrash,
  } = useVFSStore();

  const { openApp } = useWindowStore();
  const { addNotification } = useOSStore();

  const initialFolderId = (() => {
    if (initialData?.folderId && nodes[initialData.folderId]) {
      return initialData.folderId;
    }
    if (initialData?.parentId && nodes[initialData.parentId]) {
      return initialData.parentId;
    }
    if (initialData?.currentPath) {
      const found = getNodeByPath(initialData.currentPath);
      if (found && found.type === "folder") return found.id;
    }
    return SYSTEM_FOLDERS.DESKTOP;
  })();

  const [currentFolderId, setCurrentFolderId] =
    useState<string>(initialFolderId);
  const [history, setHistory] = useState<string[]>([initialFolderId]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "size" | "date" | "type">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  const [clipboard, setClipboard] = useState<{
    nodeId: string;
    operation: "copy" | "cut";
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dialogState, setDialogState] = useState<{
    type: "newFolder" | "newFile" | "rename" | "properties" | null;
    targetNode?: VFSNode | null;
    inputValue?: string;
  }>({ type: null });

  const currentFolder =
    getNode(currentFolderId) || nodes[SYSTEM_FOLDERS.DESKTOP] || nodes["root"];
  const storageUsage = getStorageUsage();

  const navigateToFolder = (folderId: string) => {
    if (!nodes[folderId] || nodes[folderId].type !== "folder") return;
    if (folderId === currentFolderId) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedNodeId(null);
    setSearchQuery("");
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentFolderId(history[prevIdx]);
      setSelectedNodeId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentFolderId(history[nextIdx]);
      setSelectedNodeId(null);
    }
  };

  const handleUp = () => {
    if (currentFolder && currentFolder.parentId) {
      navigateToFolder(currentFolder.parentId);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAddress(false);
    const target = addressInput.trim();
    if (!target) return;

    const matchedNode =
      getNodeByPath(target) ||
      Object.values(nodes).find(
        (n) => n.path.toLowerCase() === target.toLowerCase(),
      );
    if (matchedNode && matchedNode.type === "folder") {
      navigateToFolder(matchedNode.id);
    } else {
      alert(`Directory "${target}" not found.`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const mimeType = file.type || "application/octet-stream";
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const { targetFolderId, targetFolderName } = getTargetFolderId(
        currentFolderId,
        file.name,
        mimeType,
      );

      const reader = new FileReader();

      const isText =
        mimeType.startsWith("text/") ||
        ["txt", "md", "json", "js", "ts", "html", "css", "csv", "svg"].includes(
          extension,
        );

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }

      reader.onload = () => {
        const fileContent = (reader.result as string) || "";

        let iconName = "FileText";
        if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(extension)) {
          iconName = "Image";
        } else if (["mp3", "wav", "ogg", "m4a", "flac"].includes(extension)) {
          iconName = "Music";
        } else if (
          ["md", "js", "ts", "py", "json", "html", "css"].includes(extension)
        ) {
          iconName = "FileCode";
        }

        createFile(
          targetFolderId,
          file.name,
          fileContent,
          extension,
          iconName,
          { mimeType, originalName: file.name },
          file.size,
        );

        addNotification({
          title: "File Uploaded",
          message: `Successfully uploaded ${file.name} to ${targetFolderName}`,
          app: "File Explorer",
          iconName: "Upload",
          priority: "normal",
        });

        setToastMsg(`Uploaded "${file.name}" to ${targetFolderName}`);
        setTimeout(() => setToastMsg(null), 3500);
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const folderChildren = getChildren(currentFolderId);

  const displayItems = useMemo(() => {
    const items = folderChildren.filter((node) => {
      if (!searchQuery.trim()) return true;
      return node.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "size") {
        comparison = (a.size || 0) - (b.size || 0);
      } else if (sortBy === "date") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === "type") {
        const extA = a.metadata?.extension || a.type;
        const extB = b.metadata?.extension || b.type;
        comparison = extA.localeCompare(extB);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [folderChildren, searchQuery, sortBy, sortOrder]);

  const handleItemDoubleClick = (node: VFSNode) => {
    if (node.type === "folder") {
      navigateToFolder(node.id);
    } else {
      const ext = node.metadata?.extension?.toLowerCase() || "";

      if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) {
        openApp("gallery", node.name, "Image", { node });
      } else if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) {
        openApp("music", node.name, "Music", { node });
      } else {
        openApp("notes", node.name, "FileText", {
          nodeId: node.id,
          content: node.content || "",
          title: node.name,
        });
      }
    }
  };

  const handlePaste = () => {
    if (!clipboard) return;
    if (clipboard.operation === "copy") {
      copyItem(clipboard.nodeId, currentFolderId);
    } else if (clipboard.operation === "cut") {
      moveItem(clipboard.nodeId, currentFolderId);
      setClipboard(null);
    }
  };

  const getNodeIcon = (node: VFSNode) => {
    if (node.type === "folder") {
      if (node.id === "desktop")
        return <Monitor className="w-5 h-5 text-amber-400" />;
      if (node.id === "documents")
        return <FolderText className="w-5 h-5 text-blue-400" />;
      if (node.id === "pictures")
        return <ImageIcon className="w-5 h-5 text-pink-400" />;
      if (node.id === "music")
        return <Music className="w-5 h-5 text-indigo-400" />;
      if (node.id === "trash")
        return <Trash2 className="w-5 h-5 text-rose-400" />;
      return <Folder className="w-5 h-5 text-amber-400" />;
    }

    const ext = node.metadata?.extension?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-pink-400" />;
    }
    if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) {
      return <Music className="w-5 h-5 text-indigo-400" />;
    }
    if (["md", "js", "ts", "py", "json", "html", "css"].includes(ext)) {
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    }
    if (["pdf", "csv", "xlsx"].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col h-full bg-[#0b0f17] text-slate-100 select-none font-sans overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node: null });
      }}
    >
      {/* 1. Top Action Bar with Upload, Search, Sort & View Toggles */}
      <div className="p-2.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Left Side: Search Input */}
        <div className="relative w-52 sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Center Cluster: Sort Dropdown, View Toggles, + Folder */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer pr-1"
            >
              <option value="name" className="bg-slate-900 text-slate-200">
                Name
              </option>
              <option value="date" className="bg-slate-900 text-slate-200">
                Date
              </option>
              <option value="size" className="bg-slate-900 text-slate-200">
                Size
              </option>
              <option value="type" className="bg-slate-900 text-slate-200">
                Type
              </option>
            </select>
            <button
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 ml-1 transition-colors cursor-pointer"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-3.5 h-3.5" />
              ) : (
                <SortDesc className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() =>
              setDialogState({ type: "newFolder", inputValue: "" })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-amber-300 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Folder</span>
          </button>
        </div>

        {/* Right Side: Primary Upload Action Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.55)] transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>↑ Upload</span>
          </button>
        </div>
      </div>

      {/* 2. Top Address & Navigation Toolbar */}
      <div className="p-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleUp}
            disabled={!currentFolder?.parentId}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
            title="Up One Directory"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />

          {isEditingAddress ? (
            <form onSubmit={handleAddressSubmit} className="flex-1">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onBlur={() => setIsEditingAddress(false)}
                autoFocus
                className="w-full bg-transparent text-cyan-300 border-none outline-none font-mono text-xs"
              />
            </form>
          ) : (
            <div
              onClick={() => {
                setAddressInput(currentFolder?.path || "/");
                setIsEditingAddress(true);
              }}
              className="flex-1 flex items-center gap-1 text-slate-300 cursor-text overflow-x-auto no-scrollbar"
            >
              {(currentFolder?.path || "/").split("/").map((part, index) => {
                if (!part)
                  return (
                    <span key={index} className="text-slate-500">
                      root
                    </span>
                  );
                return (
                  <React.Fragment key={index}>
                    <span className="text-slate-500">/</span>
                    <span className="hover:text-cyan-400 hover:underline">
                      {part}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Command Bar */}
      <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          {currentFolderId === SYSTEM_FOLDERS.TRASH ? (
            <>
              <button
                onClick={emptyTrash}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
              {selectedNodeId && (
                <button
                  onClick={() => restoreItem(selectedNodeId)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Item</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setDialogState({ type: "newFile", inputValue: "" })
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>New File</span>
              </button>

              {selectedNodeId && (
                <>
                  <button
                    onClick={() =>
                      setClipboard({
                        nodeId: selectedNodeId,
                        operation: "copy",
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() =>
                      setClipboard({ nodeId: selectedNodeId, operation: "cut" })
                    }
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cut</span>
                  </button>
                  <button
                    onClick={() => {
                      const sel = getNode(selectedNodeId);
                      setDialogState({
                        type: "rename",
                        targetNode: sel,
                        inputValue: sel?.name || "",
                      });
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => deleteItem(selectedNodeId)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}

              {clipboard && (
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          {displayItems.length} items
        </div>
      </div>

      {/* Main Body Split: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-48 bg-slate-950/60 border-r border-slate-800/80 p-2 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 py-1 block">
              Quick Access
            </span>

            {[
              {
                id: "desktop",
                name: "Desktop",
                icon: Monitor,
                color: "text-amber-400",
              },
              {
                id: "documents",
                name: "Documents",
                icon: FolderText,
                color: "text-blue-400",
              },
              {
                id: "pictures",
                name: "Pictures",
                icon: ImageIcon,
                color: "text-pink-400",
              },
              {
                id: "music",
                name: "Music",
                icon: Music,
                color: "text-indigo-400",
              },
              {
                id: "trash",
                name: "Trash",
                icon: Trash2,
                color: "text-rose-400",
              },
            ].map((shortcut) => {
              const Icon = shortcut.icon;
              const isActive = currentFolderId === shortcut.id;
              return (
                <button
                  key={shortcut.id}
                  onClick={() => navigateToFolder(shortcut.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${shortcut.color}`} />
                  <span>{shortcut.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" /> VFS Storage
              </span>
              <span>{storageUsage.formattedUsed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.max(2, storageUsage.percentage)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono block text-right">
              {storageUsage.formattedTotal} Quota
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div
          className="flex-1 p-4 overflow-y-auto custom-scrollbar relative"
          onClick={() => setSelectedNodeId(null)}
        >
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <FolderOpen className="w-12 h-12 stroke-[1.2] opacity-40" />
              <p className="text-xs italic">Folder is empty</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {displayItems.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onDoubleClick={() => handleItemDoubleClick(node)}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedNodeId(node.id);
                      setContextMenu({ x: e.clientX, y: e.clientY, node });
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-150 cursor-pointer group text-center ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "hover:bg-slate-900/60 border-transparent hover:border-slate-800"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-2 group-hover:scale-105 transition-transform shadow-md">
                      {getNodeIcon(node)}
                    </div>
                    <span className="text-xs font-medium text-slate-200 line-clamp-2 break-all leading-tight">
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <span className="col-span-6">Name</span>
                <span className="col-span-3">Type</span>
                <span className="col-span-3 text-right">Modified</span>
              </div>
              {displayItems.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onDoubleClick={() => handleItemDoubleClick(node)}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedNodeId(node.id);
                      setContextMenu({ x: e.clientX, y: e.clientY, node });
                    }}
                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                        : "hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                      {getNodeIcon(node)}
                      <span className="truncate font-medium">{node.name}</span>
                    </div>
                    <span className="col-span-3 text-slate-400 capitalize font-mono text-[11px]">
                      {node.type === "folder"
                        ? "Folder"
                        : node.metadata?.extension || "File"}
                    </span>
                    <span className="col-span-3 text-right text-slate-500 font-mono text-[10px]">
                      {new Date(node.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating System Upload Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-10001 px-4 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-9999 w-48 p-1 rounded-xl bg-[#0b0f17]/95 border border-slate-800 shadow-2xl backdrop-blur-xl text-xs space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.node ? (
              <>
                <button
                  onClick={() => {
                    handleItemDoubleClick(contextMenu.node!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Item</span>
                </button>
                <button
                  onClick={() => {
                    setClipboard({
                      nodeId: contextMenu.node!.id,
                      operation: "copy",
                    });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    setClipboard({
                      nodeId: contextMenu.node!.id,
                      operation: "cut",
                    });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cut</span>
                </button>
                <button
                  onClick={() => {
                    setDialogState({
                      type: "rename",
                      targetNode: contextMenu.node,
                      inputValue: contextMenu.node!.name,
                    });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setDialogState({
                      type: "properties",
                      targetNode: contextMenu.node,
                    });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Properties</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    deleteItem(contextMenu.node!.id);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setDialogState({ type: "newFolder", inputValue: "" });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Folder</span>
                </button>
                <button
                  onClick={() => {
                    setDialogState({ type: "newFile", inputValue: "" });
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New File</span>
                </button>
                <button
                  onClick={() => {
                    handleUploadClick();
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload File</span>
                </button>
                {clipboard && (
                  <button
                    onClick={() => {
                      handlePaste();
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Paste Item</span>
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input / Properties Dialog Modal */}
      <AnimatePresence>
        {dialogState.type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10000 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-96 p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {dialogState.type === "newFolder" && "Create New Folder"}
                  {dialogState.type === "newFile" && "Create New Text File"}
                  {dialogState.type === "rename" && "Rename Item"}
                  {dialogState.type === "properties" && "Item Properties"}
                </h4>
                <button
                  onClick={() => setDialogState({ type: null })}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {dialogState.type === "properties" && dialogState.targetNode ? (
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500">Name:</span>{" "}
                    {dialogState.targetNode.name}
                  </div>
                  <div>
                    <span className="text-slate-500">Path:</span>{" "}
                    {dialogState.targetNode.path}
                  </div>
                  <div>
                    <span className="text-slate-500">Type:</span>{" "}
                    {dialogState.targetNode.type}
                  </div>
                  <div>
                    <span className="text-slate-500">Size:</span>{" "}
                    {dialogState.targetNode.size || 0} bytes
                  </div>
                  <div>
                    <span className="text-slate-500">Created:</span>{" "}
                    {new Date(
                      dialogState.targetNode.createdAt,
                    ).toLocaleString()}
                  </div>
                  <button
                    onClick={() => setDialogState({ type: null })}
                    className="w-full mt-2 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={dialogState.inputValue || ""}
                    onChange={(e) =>
                      setDialogState({
                        ...dialogState,
                        inputValue: e.target.value,
                      })
                    }
                    autoFocus
                    placeholder="Enter name..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDialogState({ type: null })}
                      className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const val = dialogState.inputValue?.trim();
                        if (!val) return;
                        if (dialogState.type === "newFolder") {
                          createFolder(currentFolderId, val);
                        } else if (dialogState.type === "newFile") {
                          createFile(currentFolderId, val, "# New Document\n");
                        } else if (
                          dialogState.type === "rename" &&
                          dialogState.targetNode
                        ) {
                          renameItem(dialogState.targetNode.id, val);
                        }
                        setDialogState({ type: null });
                      }}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
