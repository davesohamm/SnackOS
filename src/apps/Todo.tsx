// To-Do App with Deadlines and Notifications
import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar as CalendarIcon, Clock, Filter, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Todo.css';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  createdAt: Date;
  category: string;
}

type FilterType = 'all' | 'active' | 'completed' | 'today' | 'overdue';

export const Todo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('snackos-todos');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'deadline' || key === 'createdAt') {
        return value ? new Date(value) : undefined;
      }
      return value;
    }) : [];
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    category: 'Personal',
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('snackos-todos', JSON.stringify(tasks));
    
    // Check for overdue tasks and show notification
    const overdueCount = tasks.filter(task => 
      !task.completed && task.deadline && new Date(task.deadline) < new Date()
    ).length;

    if (overdueCount > 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('SnackOS To-Do', {
        body: `You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}!`,
        icon: '/favicon.ico',
      });
    }
  }, [tasks]);

  // Listen for storage events (from voice commands)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'snackos-todos' && e.newValue) {
        const newTasks = JSON.parse(e.newValue, (key, value) => {
          if (key === 'deadline' || key === 'createdAt') {
            return value ? new Date(value) : undefined;
          }
          return value;
        });
        setTasks(newTasks);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      deadline: newTask.deadline ? new Date(newTask.deadline) : undefined,
      createdAt: new Date(),
      category: newTask.category,
    };

    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      category: 'Personal',
    });
    setShowAddForm(false);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const isToday = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (task: Task) => {
    if (!task.deadline || task.completed) return false;
    return new Date(task.deadline) < new Date();
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    switch (filter) {
      case 'active':
        filtered = tasks.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = tasks.filter(t => t.completed);
        break;
      case 'today':
        filtered = tasks.filter(t => isToday(t.deadline));
        break;
      case 'overdue':
        filtered = tasks.filter(t => isOverdue(t));
        break;
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (isOverdue(a) && !isOverdue(b)) return -1;
      if (!isOverdue(a) && isOverdue(b)) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const filteredTasks = getFilteredTasks();
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="todo-app">
      {/* Header */}
      <div className="todo-header">
        <div className="header-content">
          <h1>Tasks</h1>
          <div className="stats-row">
            <div className="stat-chip">{stats.active} Active</div>
            <div className="stat-chip">{stats.completed} Done</div>
            {stats.overdue > 0 && (
              <div className="stat-chip overdue">{stats.overdue} Overdue</div>
            )}
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="add-task-form">
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={2}
          />
          <div className="form-row">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category"
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className="btn-add" onClick={handleAddTask}>
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(['all', 'active', 'completed', 'today', 'overdue'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' && <Filter size={16} />}
            {f === 'today' && <CalendarIcon size={16} />}
            {f === 'overdue' && <AlertCircle size={16} />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="todo-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <Check size={48} />
            <p>No tasks {filter !== 'all' ? `in "${filter}"` : ''}</p>
            {filter === 'all' && (
              <button className="btn-add-first" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                Add your first task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}`}
            >
              <button
                className="task-checkbox"
                onClick={() => handleToggleTask(task.id)}
              >
                {task.completed && <Check size={16} />}
              </button>

              <div className="task-content">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <div className="task-badges">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                    {task.category && (
                      <span className="category-badge">{task.category}</span>
                    )}
                  </div>
                </div>
                {task.description && <p className="task-description">{task.description}</p>}
                {task.deadline && (
                  <div className="task-meta">
                    <Clock size={14} />
                    <span className={isOverdue(task) ? 'text-danger' : ''}>
                      {formatDate(task.deadline)}
                      {isOverdue(task) && ' (Overdue)'}
                    </span>
                  </div>
                )}
              </div>

              <button
                className="task-delete"
                onClick={() => handleDeleteTask(task.id)}
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

