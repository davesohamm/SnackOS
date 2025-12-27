// Minimal File Explorer
import React, { useState } from 'react';
import { Folder, FileText, ChevronRight, Home, Search, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FileNode } from '../core/types';
import './Files.css';

export const Files: React.FC = () => {
  const { fileSystem, addFile, deleteFile } = useStore();
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current folder
  const getCurrentFolder = (): FileNode => {
    let current = fileSystem;
    for (let i = 1; i < currentPath.length; i++) {
      const child = current.children?.find(c => c.id === currentPath[i]);
      if (child) current = child;
    }
    return current;
  };

  const currentFolder = getCurrentFolder();

  // Navigate to folder
  const navigateToFolder = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
    setSelectedFile(null);
  };

  // Go back
  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
    }
  };

  // Go to root
  const goToRoot = () => {
    setCurrentPath(['root']);
    setSelectedFile(null);
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle file/folder click
  const handleItemClick = (item: FileNode) => {
    if (item.type === 'folder') {
      navigateToFolder(item.id);
    } else {
      setSelectedFile(item);
    }
  };

  // Filter items
  const filteredItems = currentFolder.children?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="files-app">
      {/* Toolbar */}
      <div className="files-toolbar">
        <div className="nav-buttons">
          <button
            className="tool-btn"
            onClick={goBack}
            disabled={currentPath.length === 1}
            title="Go Back"
          >
            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="tool-btn" onClick={goToRoot} title="Home">
            <Home size={18} />
          </button>
        </div>

        <div className="path-breadcrumb">
          {currentPath.map((id, index) => {
            const isLast = index === currentPath.length - 1;
            const folder = index === 0 ? fileSystem : getCurrentFolder();
            return (
              <React.Fragment key={id}>
                <button
                  className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                  onClick={() => {
                    if (!isLast) {
                      setCurrentPath(currentPath.slice(0, index + 1));
                    }
                  }}
                >
                  {folder.name}
                </button>
                {!isLast && <ChevronRight size={14} className="breadcrumb-separator" />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="files-content">
        {/* File List */}
        <div className="files-list">
          {filteredItems.length === 0 ? (
            <div className="empty-folder">
              <Folder size={48} />
              <p>This folder is empty</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={`file-item ${selectedFile?.id === item.id ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(item.id);
                  }
                }}
              >
                <div className="file-icon">
                  {item.type === 'folder' ? (
                    <Folder size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>
                <div className="file-info">
                  <div className="file-name">{item.name}</div>
                  <div className="file-meta">
                    {item.type === 'file' && item.size && formatSize(item.size)}
                    {item.type === 'folder' && `${item.children?.length || 0} items`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* File Preview */}
        {selectedFile && selectedFile.type === 'file' && (
          <div className="file-preview">
            <div className="preview-header">
              <div>
                <h3>{selectedFile.name}</h3>
                <p className="preview-meta">
                  {formatSize(selectedFile.size)} · Modified {formatDate(selectedFile.dateModified)}
                </p>
              </div>
              <button
                className="delete-btn"
                onClick={() => {
                  deleteFile(selectedFile.id);
                  setSelectedFile(null);
                }}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="preview-content">
              <pre>{selectedFile.content || 'No content'}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};






