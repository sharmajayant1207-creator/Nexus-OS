import { useEffect, useRef } from 'react';
import { get, set } from 'idb-keyval';
import { useVFSStore } from '../store/useVFSStore';
import { VFSNode } from '../types/vfs';

const IDB_VFS_KEY = 'nexus_vfs_nodes';

export function useVFSSync() {
  const nodes = useVFSStore((state) => state.nodes);
  const setNodes = useVFSStore((state) => state.setNodes);
  const isLoadedFromIDB = useVFSStore((state) => state.isLoadedFromIDB);
  const isInitialMount = useRef(true);

  // Load from IndexedDB on initial mount
  useEffect(() => {
    async function loadVFSFromIDB() {
      try {
        const savedNodes = await get<Record<string, VFSNode>>(IDB_VFS_KEY);
        if (savedNodes && Object.keys(savedNodes).length > 0) {
          setNodes(savedNodes);
        } else {
          // Store defaults to IDB
          await set(IDB_VFS_KEY, nodes);
          setNodes(nodes);
        }
      } catch (error) {
        console.warn('VFS IndexedDB load failed, falling back to default store:', error);
      }
    }

    loadVFSFromIDB();
  }, []);

  // Sync to IndexedDB whenever nodes update (skip initial unhydrated sync)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isLoadedFromIDB) return;

    const timeoutId = setTimeout(async () => {
      try {
        await set(IDB_VFS_KEY, nodes);
      } catch (error) {
        console.error('Failed to sync VFS to IndexedDB:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nodes, isLoadedFromIDB]);
}
