import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Copy,
  Download,
  Pin,
  Tag,
  Bold,
  Italic,
  List,
  CheckSquare,
  Code,
  Quote,
  Eye,
  Edit3,
  Sparkles,
  Calendar,
  Clock,
  FolderOpen,
  Share2,
  Check,
  Save,
  BookOpen,
} from 'lucide-react';
import { useVFSStore, SYSTEM_FOLDERS } from '../../store/useVFSStore';
import { VFSNode } from '../../types/vfs';

interface NoteItem {
  id: string;
  vfsNodeId: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Ideas' | 'System Logs' | 'General';
  isPinned: boolean;
  updatedAt: string;
  createdAt: string;
}

const CATEGORIES = ['All Notes', 'Work', 'Personal', 'Ideas', 'System Logs', 'General'] as const;

export const NotesApp: React.FC = () => {
  const { nodes, getChildren, createFile, updateFileContent, deleteItem, renameItem, copyItem } = useVFSStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Local draft states for title & content
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState<'Work' | 'Personal' | 'Ideas' | 'System Logs' | 'General'>('General');

  // Debounce ref for auto-saving
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch files in /Documents folder from VFS
  const docNodes = useMemo(() => {
    return getChildren(SYSTEM_FOLDERS.DOCUMENTS).filter(
      (node) => node.type === 'file' && !node.name.toLowerCase().endsWith('.pdf')
    );
  }, [nodes, getChildren]);

  // Convert VFS nodes to Note items
  const notesList: NoteItem[] = useMemo(() => {
    return docNodes.map((node) => {
      // Derive category or default based on filename or metadata
      let category: 'Work' | 'Personal' | 'Ideas' | 'System Logs' | 'General' = 'General';
      const nameLower = node.name.toLowerCase();
      if (nameLower.includes('audit') || nameLower.includes('log') || nameLower.includes('system')) {
        category = 'System Logs';
      } else if (nameLower.includes('spec') || nameLower.includes('project') || nameLower.includes('work')) {
        category = 'Work';
      } else if (nameLower.includes('idea') || nameLower.includes('brainstorm')) {
        category = 'Ideas';
      } else if (nameLower.includes('personal') || nameLower.includes('journal')) {
        category = 'Personal';
      }

      // Title without extension
      const title = node.name.replace(/\.(txt|md|json)$/i, '');

      return {
        id: node.id,
        vfsNodeId: node.id,
        title: title || 'Untitled Note',
        content: node.content || '',
        category,
        isPinned: !!pinnedIds[node.id],
        updatedAt: node.updatedAt,
        createdAt: node.createdAt,
      };
    });
  }, [docNodes, pinnedIds]);

  // Select initial note if activeNoteId is null or missing
  useEffect(() => {
    if (notesList.length > 0 && (!activeNoteId || !notesList.find((n) => n.id === activeNoteId))) {
      const firstNote = notesList[0];
      setActiveNoteId(firstNote.id);
      setTitleDraft(firstNote.title);
      setContentDraft(firstNote.content);
      setCategoryDraft(firstNote.category);
    }
  }, [notesList, activeNoteId]);

  // When activeNoteId changes, update draft inputs
  const handleSelectNote = (note: NoteItem) => {
    setActiveNoteId(note.id);
    setTitleDraft(note.title);
    setContentDraft(note.content);
    setCategoryDraft(note.category);
    setSaveStatus('saved');
  };

  // 2. Auto-Save Engine
  const triggerAutoSave = (newTitle: string, newContent: string) => {
    if (!activeNoteId) return;
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const currentNoteNode = nodes[activeNoteId];
      if (currentNoteNode) {
        // Update content in VFS
        updateFileContent(activeNoteId, newContent);

        // Update file name if title changed
        const sanitizedTitle = newTitle.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'Untitled_Note';
        const ext = currentNoteNode.metadata?.extension || 'md';
        const expectedFileName = `${sanitizedTitle}.${ext}`;

        if (currentNoteNode.name !== expectedFileName) {
          renameItem(activeNoteId, expectedFileName);
        }
      }
      setSaveStatus('saved');
    }, 400);
  };

  const handleTitleChange = (val: string) => {
    setTitleDraft(val);
    triggerAutoSave(val, contentDraft);
  };

  const handleContentChange = (val: string) => {
    setContentDraft(val);
    triggerAutoSave(titleDraft, val);
  };

  // 3. Create New Note
  const handleCreateNote = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaultTitle = `New Note ${notesList.length + 1}`;
    const defaultContent = `# ${defaultTitle}\nCreated at ${timestamp}\n\nStart typing your note here...`;

    const newNode = createFile(
      SYSTEM_FOLDERS.DOCUMENTS,
      `${defaultTitle}.md`,
      defaultContent,
      'md',
      'FileText'
    );

    setActiveNoteId(newNode.id);
    setTitleDraft(defaultTitle);
    setContentDraft(defaultContent);
    setCategoryDraft('General');
    setSaveStatus('saved');
  };

  // 4. Delete Note
  const handleDeleteActiveNote = () => {
    if (!activeNoteId) return;
    deleteItem(activeNoteId);
    setActiveNoteId(null);
  };

  // 5. Duplicate Note
  const handleDuplicateNote = () => {
    if (!activeNoteId) return;
    const duplicatedNode = copyItem(activeNoteId, SYSTEM_FOLDERS.DOCUMENTS);
    if (duplicatedNode) {
      setActiveNoteId(duplicatedNode.id);
      setTitleDraft(duplicatedNode.name.replace(/\.(txt|md|json)$/i, ''));
      setContentDraft(duplicatedNode.content || '');
    }
  };

  // 6. Export as Text File
  const handleExportNote = () => {
    const blob = new Blob([contentDraft], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titleDraft.trim() || 'note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // 7. Toggle Pin
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toolbar Quick Formatting Actions
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentDraft.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const updated = contentDraft.substring(0, start) + replacement + contentDraft.substring(end);
    setContentDraft(updated);
    triggerAutoSave(titleDraft, updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Filter Notes by Category & Search
  const filteredNotes = useMemo(() => {
    return notesList
      .filter((note) => {
        const matchesCat = selectedCategory === 'All Notes' || note.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notesList, selectedCategory, searchQuery]);

  // Word & Character Stats
  const wordCount = contentDraft.trim() ? contentDraft.trim().split(/\s+/).length : 0;
  const charCount = contentDraft.length;

  return (
    <div className="flex h-full bg-[#0b0f17] text-slate-100 font-sans overflow-hidden select-none">
      {/* Sidebar: Search, Categories, Note List */}
      <div className="w-80 bg-slate-950/80 border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 tracking-wide uppercase">Nexus Notes</h2>
              <span className="text-[10px] text-slate-500 font-mono">/Documents VFS Sync</span>
            </div>
          </div>

          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            title="Create New Note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="p-2 border-b border-slate-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto stroke-[1.2] opacity-40" />
              <p className="text-xs italic">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              const snippet = note.content
                .replace(/^#+\s+/gm, '')
                .replace(/[*_`]/g, '')
                .trim()
                .slice(0, 60);

              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-100 truncate flex-1">
                      {note.title}
                    </span>
                    <button
                      onClick={(e) => handleTogglePin(note.id, e)}
                      className={`p-0.5 rounded transition-colors ${
                        note.isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3 h-3 fill-current" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-mono">
                    {snippet || 'Empty note...'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {note.category}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Editor Viewport */}
      {activeNoteId ? (
        <div className="flex-1 flex flex-col bg-[#0b0f17] overflow-hidden">
          {/* Top Control Bar */}
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
            {/* Auto-save Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-ping'}`} />
              <span className="text-slate-400">{saveStatus === 'saved' ? 'Auto-Saved to VFS' : 'Saving changes...'}</span>
            </div>

            {/* View Mode Toggle & Note Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'edit' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'preview' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="h-4 w-px bg-slate-800 my-auto" />

              <button
                onClick={handleDuplicateNote}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Duplicate Note"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportNote}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Export as Markdown / Text"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteActiveNote}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Metadata Bar */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-800/50 space-y-3">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note Title..."
              className="w-full bg-transparent text-xl font-bold text-slate-100 placeholder-slate-600 outline-none"
            />

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 font-mono">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={categoryDraft}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    setCategoryDraft(cat);
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-0.5 outline-none focus:border-amber-500/50 text-xs font-sans"
                >
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Ideas">Ideas</option>
                  <option value="System Logs">System Logs</option>
                </select>
              </div>

              <span className="text-slate-700">•</span>
              <span className="font-mono text-[11px] text-slate-500">
                Saved in VFS: /Documents/{titleDraft || 'Untitled'}.md
              </span>
            </div>
          </div>

          {/* Quick Formatting Toolbar (In Edit Mode) */}
          {viewMode === 'edit' && (
            <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-1 text-slate-400 shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('# ')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer font-bold text-xs"
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => insertFormatting('## ')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer font-bold text-xs"
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => insertFormatting('- ')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('- [ ] ')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Task List"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('```\n', '\n```')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Code Block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('> ')}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {viewMode === 'edit' ? (
              <textarea
                id="note-editor-textarea"
                value={contentDraft}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your note in Markdown..."
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none placeholder-slate-700"
              />
            ) : (
              /* Simple Formatted Markdown Preview */
              <div className="prose prose-invert prose-amber max-w-none space-y-3 font-sans text-xs text-slate-200">
                {contentDraft.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-1 mt-2">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-base font-bold text-slate-100 mt-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('- [ ] ')) {
                    return (
                      <div key={idx} className="flex items-center gap-2 font-mono text-slate-300">
                        <input type="checkbox" disabled className="rounded border-slate-700" />
                        <span>{line.replace('- [ ] ', '')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-4 list-disc text-slate-300">
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.startsWith('> ')) {
                    return (
                      <blockquote key={idx} className="border-l-2 border-amber-500 pl-3 italic text-slate-400 my-1">
                        {line.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  if (!line.trim()) {
                    return <div key={idx} className="h-2" />;
                  }
                  return <p key={idx} className="leading-relaxed">{line}</p>;
                })}
              </div>
            )}
          </div>

          {/* Footer Stats Bar */}
          <div className="px-6 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>

            {copiedNotification && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" /> Exported Markdown File!
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-3">
          <BookOpen className="w-12 h-12 stroke-[1.2] opacity-40" />
          <p className="text-xs italic">Select or create a note to begin editing</p>
        </div>
      )}
    </div>
  );
};
