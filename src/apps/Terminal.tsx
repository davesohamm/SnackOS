// Terminal Emulator with Virtual Filesystem
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FileNode } from '../core/types';
import './Terminal.css';

interface CommandHistory {
  command: string;
  output: string[];
  error?: boolean;
}

export const Terminal: React.FC = () => {
  const { fileSystem } = useStore();
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: '',
      output: [
        'SnackOS Terminal v1.0.0',
        'Type "help" for available commands.',
        '',
      ],
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getCurrentDirectory = (): FileNode => {
    let current = fileSystem;
    for (let i = 1; i < currentPath.length; i++) {
      const child = current.children?.find(c => c.id === currentPath[i]);
      if (child) current = child;
    }
    return current;
  };

  const resolvePath = (path: string): FileNode | null => {
    if (path === '/') return fileSystem;
    
    const parts = path.split('/').filter(p => p);
    let current = path.startsWith('/') ? fileSystem : getCurrentDirectory();
    
    for (const part of parts) {
      if (part === '..') {
        // Go up one directory - not implemented for simplicity
        return null;
      }
      const child = current.children?.find(c => c.name === part);
      if (!child) return null;
      current = child;
    }
    
    return current;
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      setHistory([...history, { command: '', output: [] }]);
      return;
    }

    setCommandHistory([...commandHistory, trimmedCmd]);
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string[] = [];
    let error = false;

    switch (command) {
      case 'help':
        output = [
          'Available commands:',
          '  help              - Show this help message',
          '  clear             - Clear terminal screen',
          '  ls                - List directory contents',
          '  cd [dir]          - Change directory',
          '  pwd               - Print working directory',
          '  cat [file]        - Display file contents',
          '  touch [file]      - Create new file',
          '  mkdir [dir]       - Create new directory',
          '  echo [text]       - Print text',
          '  neofetch          - Display system information',
          '  date              - Display current date/time',
          '  whoami            - Display current user',
          '  uname             - Display system info',
          '',
        ];
        break;

      case 'clear':
        setHistory([]);
        setCurrentCommand('');
        return;

      case 'ls':
        const currentDir = getCurrentDirectory();
        if (currentDir.children && currentDir.children.length > 0) {
          output = currentDir.children.map(child => {
            const icon = child.type === 'folder' ? '📁' : '📄';
            return `${icon}  ${child.name}`;
          });
        } else {
          output = ['(empty)'];
        }
        break;

      case 'pwd':
        output = ['/' + currentPath.slice(1).join('/')];
        break;

      case 'cd':
        if (args.length === 0) {
          setCurrentPath(['root']);
          output = [];
        } else {
          const targetDir = args[0];
          if (targetDir === '..') {
            if (currentPath.length > 1) {
              setCurrentPath(currentPath.slice(0, -1));
              output = [];
            } else {
              output = ['cd: already at root'];
              error = true;
            }
          } else {
            const dir = getCurrentDirectory().children?.find(c => c.name === targetDir && c.type === 'folder');
            if (dir) {
              setCurrentPath([...currentPath, dir.id]);
              output = [];
            } else {
              output = [`cd: ${targetDir}: No such directory`];
              error = true;
            }
          }
        }
        break;

      case 'cat':
        if (args.length === 0) {
          output = ['cat: missing file operand'];
          error = true;
        } else {
          const file = getCurrentDirectory().children?.find(c => c.name === args[0] && c.type === 'file');
          if (file) {
            output = file.content ? file.content.split('\n') : ['(empty file)'];
          } else {
            output = [`cat: ${args[0]}: No such file`];
            error = true;
          }
        }
        break;

      case 'echo':
        output = [args.join(' ')];
        break;

      case 'date':
        output = [new Date().toString()];
        break;

      case 'whoami':
        output = ['snackos-user'];
        break;

      case 'uname':
        output = ['SnackOS 1.0.0 (Web-based OS)'];
        break;

      case 'neofetch':
        output = [
          '                    ',
          '     ╭──────────╮   snackos-user@snackos',
          '     │  ◉    ◉  │   ──────────────────────',
          '     │    __    │   OS: SnackOS 1.0.0',
          '     │   \\__/   │   Kernel: Web Browser',
          '     ╰──────────╯   Shell: SnackShell',
          '                    Terminal: SnackTerm',
          `                    Platform: ${navigator.platform}`,
          `                    Browser: ${navigator.userAgent.split(' ').pop()}`,
          '                    Theme: Dark Mode',
          '                    ',
        ];
        break;

      case 'touch':
      case 'mkdir':
        output = ['File system is read-only in demo mode'];
        error = true;
        break;

      default:
        output = [`${command}: command not found. Type 'help' for available commands.`];
        error = true;
    }

    setHistory([...history, { command: trimmedCmd, output, error }]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete (basic implementation)
      const currentDir = getCurrentDirectory();
      const matches = currentDir.children?.filter(c => 
        c.name.startsWith(currentCommand)
      );
      if (matches && matches.length === 1) {
        setCurrentCommand(matches[0].name);
      }
    }
  };

  const getPrompt = () => {
    const pathStr = currentPath.length === 1 ? '~' : currentPath.slice(1).join('/');
    return `user@snackos:${pathStr}$`;
  };

  return (
    <div className="terminal-app" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <TerminalIcon size={16} />
        <span>SnackOS Terminal</span>
      </div>
      
      <div className="terminal-content">
        {history.map((entry, index) => (
          <div key={index} className="terminal-entry">
            {entry.command && (
              <div className="terminal-command">
                <span className="terminal-prompt">{getPrompt()}</span>
                <span className="terminal-input">{entry.command}</span>
              </div>
            )}
            {entry.output.length > 0 && (
              <div className={`terminal-output ${entry.error ? 'error' : ''}`}>
                {entry.output.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="terminal-input-line">
          <span className="terminal-prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        </div>
        
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

