// Minimal Notes App with Auto-save
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, Download, Upload, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Note } from '../core/types';
import './Notes.css';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'title'>('modified');

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'created') return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    });

  // Create new note
  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      dateCreated: new Date(),
      dateModified: new Date(),
    };
    addNote(newNote);
    setSelectedNoteId(newNote.id);
  }, [addNote]);

  // Delete note with confirmation
  const handleDeleteNote = useCallback((id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      const noteIndex = notes.findIndex(n => n.id === id);
      deleteNote(id);
      
      if (selectedNoteId === id) {
        if (notes.length > 1) {
          const newIndex = noteIndex > 0 ? noteIndex - 1 : noteIndex + 1;
          setSelectedNoteId(notes[newIndex === noteIndex ? noteIndex + 1 : newIndex].id);
        } else if (notes.length === 1) {
          setSelectedNoteId(null);
        }
      }
    }
  }, [notes, selectedNoteId, deleteNote]);

  // Auto-save note content
  const handleContentChange = useCallback((content: string) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { content });
    }
  }, [selectedNoteId, updateNote]);

  // Update note title
  const handleTitleChange = useCallback((title: string) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title: title || 'Untitled Note' });
    }
  }, [selectedNoteId, updateNote]);

  // Export note as text file
  const handleExportNote = useCallback(() => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedNote]);

  // Word count
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Character count
  const getCharCount = (text: string) => {
    return text.length;
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now.getTime() - noteDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return noteDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: noteDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get note preview
  const getNotePreview = (content: string) => {
    const firstLine = content.split('\n')[0];
    return firstLine.slice(0, 60) + (firstLine.length > 60 ? '...' : '');
  };

  // Create first note if none exist
  useEffect(() => {
    if (notes.length === 0) {
      handleCreateNote();
    }
  }, [notes.length, handleCreateNote]);

  return (
    <div className="notes-app">
      {/* Sidebar */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="new-note-btn" onClick={handleCreateNote} title="New Note">
            <Plus size={18} />
          </button>
        </div>

        <div className="sort-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="modified">Last Modified</option>
            <option value="created">Date Created</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p>No notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNoteId === note.id ? 'active' : ''}`}
                onClick={() => setSelectedNoteId(note.id)}
              >
                <div className="note-item-header">
                  <h4>{note.title}</h4>
                  <button
                    className="delete-note-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id, note.title);
                    }}
                    title="Delete Note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="note-preview">{getNotePreview(note.content)}</p>
                <span className="note-date">{formatDate(note.dateModified)}</span>
              </div>
            ))
          )}
        </div>

        <div className="notes-count">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        </div>
      </div>

      {/* Editor */}
      <div className="notes-editor">
        {selectedNote ? (
          <>
            <div className="editor-header">
              <div className="editor-title-section">
                {editingTitle ? (
                  <input
                    type="text"
                    className="title-input"
                    value={selectedNote.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingTitle(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <h2 className="editor-title" onClick={() => setEditingTitle(true)}>
                    {selectedNote.title}
                  </h2>
                )}
                <span className="editor-date">
                  Last edited {formatDate(selectedNote.dateModified)}
                </span>
              </div>
              <div className="editor-actions">
                <button className="action-btn" onClick={handleExportNote} title="Export as TXT">
                  <Download size={16} />
                </button>
              </div>
            </div>

            <textarea
              className="editor-textarea"
              value={selectedNote.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              spellCheck
            />

            <div className="editor-footer">
              <span className="word-count">
                {getWordCount(selectedNote.content)} words · {getCharCount(selectedNote.content)} characters
              </span>
            </div>
          </>
        ) : (
          <div className="editor-empty">
            <h3>No Note Selected</h3>
            <p>Create a new note or select one from the sidebar</p>
            <button className="create-note-btn" onClick={handleCreateNote}>
              <Plus size={18} />
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

