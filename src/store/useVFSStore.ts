import { create } from 'zustand';
import { VFSNode, StorageUsage } from '../types/vfs';

const TOTAL_STORAGE_QUOTA = 10 * 1024 * 1024 * 1024; // 10 GB Virtual Disk Quota

export const SYSTEM_FOLDERS = {
  ROOT: 'root',
  DESKTOP: 'desktop',
  DOCUMENTS: 'documents',
  PICTURES: 'pictures',
  MUSIC: 'music',
  DOWNLOADS: 'downloads',
  TRASH: 'trash',
};

const INITIAL_NODES: Record<string, VFSNode> = {
  root: {
    id: 'root',
    name: 'root',
    path: '/',
    parentId: null,
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop',
    path: '/Desktop',
    parentId: 'root',
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
    icon: 'Monitor',
  },
  documents: {
    id: 'documents',
    name: 'Documents',
    path: '/Documents',
    parentId: 'root',
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
    icon: 'FolderText',
  },
  pictures: {
    id: 'pictures',
    name: 'Pictures',
    path: '/Pictures',
    parentId: 'root',
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
    icon: 'Image',
  },
  music: {
    id: 'music',
    name: 'Music',
    path: '/Music',
    parentId: 'root',
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
    icon: 'Music',
  },
  trash: {
    id: 'trash',
    name: 'Trash',
    path: '/Trash',
    parentId: 'root',
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
    icon: 'Trash2',
  },

  // Seed Files - Desktop
  'file-welcome': {
    id: 'file-welcome',
    name: 'Welcome_to_Nexus.txt',
    path: '/Desktop/Welcome_to_Nexus.txt',
    parentId: 'desktop',
    type: 'file',
    size: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `# Welcome to Nexus OS v2.5 Quantum Architecture Engine\n\nNexus OS is a next-generation web operating system designed with real-time kernel telemetry, isolated security enclave, and an extended virtual file system (VFS).\n\nKey System Features:\n- Persistent Virtual File System (VFS) with IndexedDB backing\n- Quantum Enclave PIN Security Subsystem\n- Control Center with Master Audio, Brightness, and Wallpaper Engine\n- Interactive Terminal Console & Power Diagnostics\n\nEnjoy the seamless desktop experience!`,
    icon: 'FileText',
    metadata: { extension: 'txt', mimeType: 'text/plain' },
  },
  'file-arch': {
    id: 'file-arch',
    name: 'System_Architecture.md',
    path: '/Desktop/System_Architecture.md',
    parentId: 'desktop',
    type: 'file',
    size: 2048,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `# Nexus OS Kernel Architecture\n\n## Subsystems Overview\n1. **VFS Engine**: Hierarchical tree node model with transactional CRUD operations.\n2. **State Compositor**: Zustand reactive store bound to high-performance Wayland render simulation.\n3. **Storage Sync**: Asynchronous IndexedDB key-value mirror for persistent state durability.\n4. **Security Subsystem**: SHA-based hardware enclave PIN validator.`,
    icon: 'FileCode',
    metadata: { extension: 'md', mimeType: 'text/markdown' },
  },

  // Seed Files - Documents
  'file-doc-spec': {
    id: 'file-doc-spec',
    name: 'Project_Nexus_Specification.pdf',
    path: '/Documents/Project_Nexus_Specification.pdf',
    parentId: 'documents',
    type: 'file',
    size: 4500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: 'Binary PDF Stream Data - Nexus OS NextGen Spec Document v2.5',
    icon: 'FileSpreadsheet',
    metadata: { extension: 'pdf', mimeType: 'application/pdf' },
  },
  'file-doc-audit': {
    id: 'file-doc-audit',
    name: 'Security_Audit_Log.txt',
    path: '/Documents/Security_Audit_Log.txt',
    parentId: 'documents',
    type: 'file',
    size: 3420,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `[00:01:12] ENCLAVE_INIT: Cryptographic hardware seed established.\n[00:02:45] AUTH_CHECK: Master user Alex Mercer verified via PIN.\n[00:05:00] VFS_INTEGRITY: 100% block checksum match. No corrupt sectors.`,
    icon: 'ShieldCheck',
    metadata: { extension: 'txt', mimeType: 'text/plain' },
  },

  // Seed Files - Pictures
  'file-pic-1': {
    id: 'file-pic-1',
    name: 'Cyberpunk_City_4K.jpg',
    path: '/Pictures/Cyberpunk_City_4K.jpg',
    parentId: 'pictures',
    type: 'file',
    size: 8400000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop',
    icon: 'Image',
    metadata: { extension: 'jpg', mimeType: 'image/jpeg', dimensions: '3840x2160' },
  },
  'file-pic-2': {
    id: 'file-pic-2',
    name: 'Deep_Space_Nebula.png',
    path: '/Pictures/Deep_Space_Nebula.png',
    parentId: 'pictures',
    type: 'file',
    size: 12100000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop',
    icon: 'Image',
    metadata: { extension: 'png', mimeType: 'image/png', dimensions: '3840x2160' },
  },

  // Seed Files - Music
  'file-music-1': {
    id: 'file-music-1',
    name: 'Cyber_Synthwave_Theme.mp3',
    path: '/Music/Cyber_Synthwave_Theme.mp3',
    parentId: 'music',
    type: 'file',
    size: 6500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
    icon: 'Music',
    metadata: { extension: 'mp3', mimeType: 'audio/mpeg', bitrate: '320kbps' },
  },

  // Seed Files - Trash
  'file-trash-old': {
    id: 'file-trash-old',
    name: 'Legacy_Config_Draft.tmp',
    path: '/Trash/Legacy_Config_Draft.tmp',
    parentId: 'trash',
    type: 'file',
    size: 512,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: 'TEMP_CONFIG_KEY=12345_DEPRECATED',
    icon: 'File',
    metadata: {
      extension: 'tmp',
      mimeType: 'text/plain',
      originalPath: '/Desktop/Legacy_Config_Draft.tmp',
      originalParentId: 'desktop',
    },
  },
};

/**
 * Helper: Generate unique file/folder name if duplicate exists in target parent
 */
function generateUniqueName(
  nodes: Record<string, VFSNode>,
  parentId: string,
  baseName: string
): string {
  const siblings = Object.values(nodes).filter((n) => n.parentId === parentId);
  const siblingNames = new Set(siblings.map((n) => n.name));

  if (!siblingNames.has(baseName)) return baseName;

  // Split extension if present
  const lastDotIndex = baseName.lastIndexOf('.');
  let nameWithoutExt = baseName;
  let ext = '';

  if (lastDotIndex > 0) {
    nameWithoutExt = baseName.substring(0, lastDotIndex);
    ext = baseName.substring(lastDotIndex);
  }

  let counter = 1;
  let candidate = `${nameWithoutExt} (${counter})${ext}`;

  while (siblingNames.has(candidate)) {
    counter++;
    candidate = `${nameWithoutExt} (${counter})${ext}`;
  }

  return candidate;
}

/**
 * Helper: Build exact absolute path for a node
 */
function resolveNodePath(nodes: Record<string, VFSNode>, nodeName: string, parentId: string | null): string {
  if (!parentId || parentId === 'root') return `/${nodeName}`;
  const parent = nodes[parentId];
  if (!parent) return `/${nodeName}`;
  return `${parent.path}/${nodeName}`;
}

/**
 * Helper: Recursively update paths for children when parent is moved or renamed
 */
function updateChildPaths(
  nodes: Record<string, VFSNode>,
  parentId: string,
  parentPath: string
): Record<string, VFSNode> {
  let updated = { ...nodes };
  const children = Object.values(updated).filter((n) => n.parentId === parentId);

  for (const child of children) {
    const newChildPath = `${parentPath}/${child.name}`;
    updated[child.id] = {
      ...child,
      path: newChildPath,
      updatedAt: new Date().toISOString(),
    };

    if (child.type === 'folder') {
      updated = updateChildPaths(updated, child.id, newChildPath);
    }
  }

  return updated;
}

export interface VFSClipboard {
  sourceId: string | null;
  action: 'copy' | 'cut' | null;
}

interface VFSState {
  nodes: Record<string, VFSNode>;
  isLoadedFromIDB: boolean;
  clipboard: VFSClipboard;

  // Selectors
  getNode: (id: string) => VFSNode | undefined;
  getNodeByPath: (path: string) => VFSNode | undefined;
  getChildren: (parentId: string) => VFSNode[];
  getStorageUsage: () => StorageUsage;

  // Actions
  setNodes: (nodes: Record<string, VFSNode>) => void;
  createFolder: (parentId: string, name: string) => VFSNode;
  createFile: (
    parentId: string,
    name: string,
    content?: string,
    extension?: string,
    icon?: string,
    metadata?: Record<string, any>,
    size?: number
  ) => VFSNode;
  deleteItem: (id: string, permanent?: boolean) => void;
  restoreItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  moveItem: (id: string, newParentId: string) => void;
  copyItem: (id: string, targetParentId?: string) => VFSNode | undefined;
  cutItem: (id: string) => void;
  pasteItem: (targetDirectoryPathOrId?: string) => VFSNode | undefined;
  updateFileContent: (id: string, content: string) => void;
  emptyTrash: () => void;
  resetToDefaults: () => void;
}

export const useVFSStore = create<VFSState>((set, get) => ({
  nodes: INITIAL_NODES,
  isLoadedFromIDB: false,
  clipboard: {
    sourceId: null,
    action: null,
  },

  getNode: (id) => get().nodes[id],

  getNodeByPath: (path) =>
    Object.values(get().nodes).find((n) => n.path === path),

  getChildren: (parentId) =>
    Object.values(get().nodes).filter((n) => n.parentId === parentId),

  getStorageUsage: () => {
    const nodes = get().nodes;
    const usedBytes = Object.values(nodes).reduce((acc, node) => acc + (node.size || 0), 0);
    const percentage = Number(((usedBytes / TOTAL_STORAGE_QUOTA) * 100).toFixed(2));

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      usedBytes,
      totalBytes: TOTAL_STORAGE_QUOTA,
      percentage,
      formattedUsed: formatBytes(usedBytes),
      formattedTotal: formatBytes(TOTAL_STORAGE_QUOTA),
    };
  },

  setNodes: (nodes) => set({ nodes, isLoadedFromIDB: true }),

  createFolder: (parentId, name) => {
    const { nodes } = get();
    const uniqueName = generateUniqueName(nodes, parentId, name || 'New Folder');
    const path = resolveNodePath(nodes, uniqueName, parentId);
    const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newFolder: VFSNode = {
      id,
      name: uniqueName,
      path,
      parentId,
      type: 'folder',
      size: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: 'Folder',
    };

    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: newFolder,
      },
    }));

    return newFolder;
  },

  createFile: (
    parentId,
    name,
    content = '',
    extension = 'txt',
    icon = 'FileText',
    metadata = {},
    customSize
  ) => {
    const { nodes } = get();
    const defaultName = name.includes('.') ? name : `${name}.${extension}`;
    const uniqueName = generateUniqueName(nodes, parentId, defaultName);
    const path = resolveNodePath(nodes, uniqueName, parentId);
    const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const size = customSize || (content ? new Blob([content]).size : 512);

    const extLower = (extension || name.split('.').pop() || 'txt').toLowerCase();

    const newFile: VFSNode = {
      id,
      name: uniqueName,
      path,
      parentId,
      type: 'file',
      size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content,
      icon,
      metadata: {
        extension: extLower,
        mimeType: metadata?.mimeType || 'text/plain',
        ...metadata,
      },
    };

    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: newFile,
      },
    }));

    return newFile;
  },

  deleteItem: (id, permanent = false) => {
    const { nodes } = get();
    const item = nodes[id];
    if (!item || item.isSystem) return;

    if (permanent || item.parentId === SYSTEM_FOLDERS.TRASH) {
      // Recursively delete folder & children
      const toDelete = new Set<string>([id]);
      const findDescendants = (folderId: string) => {
        Object.values(nodes)
          .filter((n) => n.parentId === folderId)
          .forEach((child) => {
            toDelete.add(child.id);
            if (child.type === 'folder') findDescendants(child.id);
          });
      };

      if (item.type === 'folder') findDescendants(id);

      const nextNodes = { ...nodes };
      toDelete.forEach((delId) => delete nextNodes[delId]);

      set({ nodes: nextNodes });
    } else {
      // Move item to /Trash folder
      const trashName = generateUniqueName(nodes, SYSTEM_FOLDERS.TRASH, item.name);
      const trashPath = `/Trash/${trashName}`;

      const updatedItem: VFSNode = {
        ...item,
        name: trashName,
        path: trashPath,
        parentId: SYSTEM_FOLDERS.TRASH,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...item.metadata,
          originalPath: item.path,
          originalParentId: item.parentId || 'root',
        },
      };

      let nextNodes = { ...nodes, [id]: updatedItem };
      if (item.type === 'folder') {
        nextNodes = updateChildPaths(nextNodes, id, trashPath);
      }

      set({ nodes: nextNodes });
    }
  },

  restoreItem: (id) => {
    const { nodes } = get();
    const item = nodes[id];
    if (!item || item.parentId !== SYSTEM_FOLDERS.TRASH) return;

    const targetParentId = item.metadata?.originalParentId || SYSTEM_FOLDERS.DESKTOP;
    const targetParent = nodes[targetParentId] ? targetParentId : SYSTEM_FOLDERS.DESKTOP;

    const restoredName = generateUniqueName(nodes, targetParent, item.name);
    const restoredPath = resolveNodePath(nodes, restoredName, targetParent);

    const restoredItem: VFSNode = {
      ...item,
      name: restoredName,
      path: restoredPath,
      parentId: targetParent,
      updatedAt: new Date().toISOString(),
    };

    let nextNodes = { ...nodes, [id]: restoredItem };
    if (item.type === 'folder') {
      nextNodes = updateChildPaths(nextNodes, id, restoredPath);
    }

    set({ nodes: nextNodes });
  },

  renameItem: (id, newName) => {
    const { nodes } = get();
    const item = nodes[id];
    if (!item || item.isSystem || !newName.trim()) return;

    const parentId = item.parentId || 'root';
    const uniqueName = generateUniqueName(nodes, parentId, newName.trim());
    const newPath = resolveNodePath(nodes, uniqueName, parentId);

    const renamedItem: VFSNode = {
      ...item,
      name: uniqueName,
      path: newPath,
      updatedAt: new Date().toISOString(),
    };

    let nextNodes = { ...nodes, [id]: renamedItem };
    if (item.type === 'folder') {
      nextNodes = updateChildPaths(nextNodes, id, newPath);
    }

    set({ nodes: nextNodes });
  },

  moveItem: (id, newParentId) => {
    const { nodes } = get();
    const item = nodes[id];
    const targetParent = nodes[newParentId];

    if (!item || !targetParent || targetParent.type !== 'folder' || item.parentId === newParentId) {
      return;
    }

    // Prevent moving folder into itself
    let checkParent: VFSNode | undefined = targetParent;
    while (checkParent) {
      if (checkParent.id === id) return;
      checkParent = checkParent.parentId ? nodes[checkParent.parentId] : undefined;
    }

    const uniqueName = generateUniqueName(nodes, newParentId, item.name);
    const newPath = resolveNodePath(nodes, uniqueName, newParentId);

    const movedItem: VFSNode = {
      ...item,
      name: uniqueName,
      path: newPath,
      parentId: newParentId,
      updatedAt: new Date().toISOString(),
    };

    let nextNodes = { ...nodes, [id]: movedItem };
    if (item.type === 'folder') {
      nextNodes = updateChildPaths(nextNodes, id, newPath);
    }

    set({ nodes: nextNodes });
  },

  copyItem: (id, targetParentId) => {
    set({ clipboard: { sourceId: id, action: 'copy' } });

    if (!targetParentId) return undefined;

    const { nodes } = get();
    const sourceNode = nodes[id];
    const targetParent = nodes[targetParentId];

    if (!sourceNode || !targetParent || targetParent.type !== 'folder') return undefined;

    const copyNodeRecursive = (
      nodeToCopy: VFSNode,
      parentId: string,
      currentNodes: Record<string, VFSNode>
    ): { newId: string; updatedNodes: Record<string, VFSNode> } => {
      const copyName = generateUniqueName(currentNodes, parentId, nodeToCopy.name);
      const copyPath = resolveNodePath(currentNodes, copyName, parentId);
      const newId = `${nodeToCopy.type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const copiedNode: VFSNode = {
        ...nodeToCopy,
        id: newId,
        name: copyName,
        path: copyPath,
        parentId,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updated = { ...currentNodes, [newId]: copiedNode };

      if (nodeToCopy.type === 'folder') {
        const children = Object.values(currentNodes).filter((n) => n.parentId === nodeToCopy.id);
        for (const child of children) {
          const res = copyNodeRecursive(child, newId, updated);
          updated = res.updatedNodes;
        }
      }

      return { newId, updatedNodes: updated };
    };

    const result = copyNodeRecursive(sourceNode, targetParentId, nodes);
    set({ nodes: result.updatedNodes });
    return result.updatedNodes[result.newId];
  },

  cutItem: (id) => {
    set({ clipboard: { sourceId: id, action: 'cut' } });
  },

  pasteItem: (targetDirectoryPathOrId) => {
    const { clipboard, nodes, copyItem, moveItem, getNodeByPath } = get();
    if (!clipboard.sourceId || !clipboard.action) return undefined;

    const sourceNode = nodes[clipboard.sourceId];
    if (!sourceNode) return undefined;

    let targetParentId = 'desktop';
    if (targetDirectoryPathOrId) {
      if (nodes[targetDirectoryPathOrId] && nodes[targetDirectoryPathOrId].type === 'folder') {
        targetParentId = targetDirectoryPathOrId;
      } else {
        const folderNode = getNodeByPath(targetDirectoryPathOrId);
        if (folderNode && folderNode.type === 'folder') {
          targetParentId = folderNode.id;
        } else if (targetDirectoryPathOrId === 'desktop' || targetDirectoryPathOrId.toLowerCase().includes('desktop')) {
          targetParentId = 'desktop';
        }
      }
    }

    if (clipboard.action === 'copy') {
      const copiedNode = copyItem(sourceNode.id, targetParentId);
      return copiedNode;
    } else if (clipboard.action === 'cut') {
      moveItem(sourceNode.id, targetParentId);
      set({ clipboard: { sourceId: null, action: null } });
      return get().nodes[sourceNode.id];
    }

    return undefined;
  },

  updateFileContent: (id, content) => {
    const { nodes } = get();
    const item = nodes[id];
    if (!item || item.type !== 'file') return;

    const size = new Blob([content]).size;

    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: {
          ...item,
          content,
          size,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  emptyTrash: () => {
    const { nodes } = get();
    const trashItems = Object.values(nodes).filter((n) => n.parentId === SYSTEM_FOLDERS.TRASH);

    const toDelete = new Set<string>();
    const findDescendants = (folderId: string) => {
      Object.values(nodes)
        .filter((n) => n.parentId === folderId)
        .forEach((child) => {
          toDelete.add(child.id);
          if (child.type === 'folder') findDescendants(child.id);
        });
    };

    trashItems.forEach((item) => {
      toDelete.add(item.id);
      if (item.type === 'folder') findDescendants(item.id);
    });

    const nextNodes = { ...nodes };
    toDelete.forEach((delId) => delete nextNodes[delId]);

    set({ nodes: nextNodes });
  },

  resetToDefaults: () => {
    set({ nodes: INITIAL_NODES });
  },
}));
