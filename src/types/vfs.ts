export type VFSNodeType = 'file' | 'folder';

export interface VFSNode {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  type: VFSNodeType;
  size: number; // in bytes
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
  content?: string;
  icon?: string;
  metadata?: {
    extension?: string;
    mimeType?: string;
    originalPath?: string;
    originalParentId?: string;
    [key: string]: any;
  };
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  percentage: number;
  formattedUsed: string;
  formattedTotal: string;
}
