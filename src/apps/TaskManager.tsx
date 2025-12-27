// System Task Manager - Process Monitor
import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import './TaskManager.css';

interface ProcessInfo {
  id: string;
  name: string;
  status: 'Running' | 'Idle';
  memory: number;
  cpu: number;
}

export const TaskManager: React.FC = () => {
  const { windows, closeWindow } = useStore();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage] = useState(42); // Static for demo
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const updateSystemStats = () => {
      // Simulate CPU usage with some randomness
      const baseCpu = windows.length * 8;
      const randomCpu = Math.random() * 15;
      setCpuUsage(Math.min(Math.round(baseCpu + randomCpu), 100));

      // Calculate memory based on open windows
      const baseMemory = 15; // Base OS memory
      const windowMemory = windows.length * 12;
      setMemoryUsage(Math.min(baseMemory + windowMemory + Math.random() * 5, 95));

      // Update uptime
      setUptime(Math.floor((Date.now() - startTime) / 1000));

      // Update processes
      const systemProcesses: ProcessInfo[] = [
        {
          id: 'system',
          name: 'System',
          status: 'Running',
          memory: 8.2,
          cpu: 2,
        },
        {
          id: 'desktop',
          name: 'Desktop Window Manager',
          status: 'Running',
          memory: 5.4,
          cpu: 1,
        },
        {
          id: 'menubar',
          name: 'Menu Bar',
          status: 'Running',
          memory: 2.1,
          cpu: 0,
        },
      ];

      const appProcesses: ProcessInfo[] = windows.map(win => ({
        id: win.id,
        name: win.title,
        status: win.isMinimized ? 'Idle' : 'Running',
        memory: Math.random() * 15 + 5,
        cpu: win.isMinimized ? 0 : Math.random() * 10 + 2,
      }));

      setProcesses([...systemProcesses, ...appProcesses]);
    };

    updateSystemStats();
    const interval = setInterval(updateSystemStats, 2000);

    return () => clearInterval(interval);
  }, [windows]);

  const handleKillProcess = (processId: string) => {
    if (['system', 'desktop', 'menubar'].includes(processId)) {
      return; // Can't kill system processes
    }
    closeWindow(processId);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatMemory = (mb: number) => {
    return `${mb.toFixed(1)} MB`;
  };

  const totalMemory = processes.reduce((sum, p) => sum + p.memory, 0);
  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0);

  return (
    <div className="taskmanager-app">
      {/* Header Stats */}
      <div className="taskmanager-header">
        <div className="stat-card">
          <div className="stat-icon cpu">
            <Cpu size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">CPU Usage</div>
            <div className="stat-value">{cpuUsage}%</div>
            <div className="stat-bar">
              <div className="stat-fill cpu" style={{ width: `${cpuUsage}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon memory">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Memory</div>
            <div className="stat-value">{memoryUsage.toFixed(1)}%</div>
            <div className="stat-bar">
              <div className="stat-fill memory" style={{ width: `${memoryUsage}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon disk">
            <HardDrive size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Disk</div>
            <div className="stat-value">{diskUsage}%</div>
            <div className="stat-bar">
              <div className="stat-fill disk" style={{ width: `${diskUsage}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon uptime">
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Uptime</div>
            <div className="stat-value-small">{formatUptime(uptime)}</div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="taskmanager-content">
        <div className="section-title">
          <h3>Processes ({processes.length})</h3>
          <div className="system-summary">
            CPU: {totalCpu.toFixed(1)}% | Memory: {formatMemory(totalMemory)}
          </div>
        </div>

        <div className="process-table">
          <div className="table-header">
            <div className="col-name">Name</div>
            <div className="col-status">Status</div>
            <div className="col-cpu">CPU</div>
            <div className="col-memory">Memory</div>
            <div className="col-action">Action</div>
          </div>

          <div className="table-body">
            {processes.map(process => (
              <div key={process.id} className="table-row">
                <div className="col-name">
                  <span className={process.status === 'Running' ? 'status-dot running' : 'status-dot idle'} />
                  {process.name}
                </div>
                <div className="col-status">
                  <span className={`status-badge ${process.status.toLowerCase()}`}>
                    {process.status}
                  </span>
                </div>
                <div className="col-cpu">{process.cpu.toFixed(1)}%</div>
                <div className="col-memory">{formatMemory(process.memory)}</div>
                <div className="col-action">
                  {!['system', 'desktop', 'menubar'].includes(process.id) ? (
                    <button
                      className="kill-btn"
                      onClick={() => handleKillProcess(process.id)}
                      title="End Process"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <span className="system-process">System</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="taskmanager-footer">
        <div className="footer-item">
          <span className="footer-label">Total Processes:</span>
          <span className="footer-value">{processes.length}</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Running:</span>
          <span className="footer-value">{processes.filter(p => p.status === 'Running').length}</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Idle:</span>
          <span className="footer-value">{processes.filter(p => p.status === 'Idle').length}</span>
        </div>
      </div>
    </div>
  );
};

