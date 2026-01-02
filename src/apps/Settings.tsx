// System Settings & Preferences
import React, { useState } from 'react';
import { Palette, Moon, Sun, Image as ImageIcon, Clock as ClockIcon, Monitor } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';
import './Settings.css';

interface SettingsProps {}

type Theme = 'light' | 'dark';
type AccentColor = 'blue' | 'purple' | 'green' | 'red' | 'orange';
type ClockFormat = '12h' | '24h';

const WALLPAPERS = [
  { id: 'forest', name: 'Calm Forest', path: getAssetPath('/assets/wallpapers/calm-forest-landscape-under-clouds-hu.jpg') },
  { id: 'apple', name: 'Apple CNY', path: getAssetPath('/assets/wallpapers/apple-chinese-new-year-mac-mt.jpg') },
  { id: 'ghost', name: 'Ghost', path: getAssetPath('/assets/wallpapers/ghost-ol.jpg') },
  { id: 'chamonix', name: 'Chamonix Mountains', path: getAssetPath('/assets/wallpapers/chamonix-mountains-5k-ih.jpg') },
  { id: 'pilot-pikachu', name: 'Pilot Pikachu', path: getAssetPath('/assets/wallpapers/pilot-pikachu-journey-ar.jpg') },
  { id: 'pikachu-fireworks', name: 'Pikachu Fireworks', path: getAssetPath('/assets/wallpapers/pikachu-seeing-fireworks-9r.jpg') },
  { id: 'pikachu-horizon', name: 'Pikachu Horizon', path: getAssetPath('/assets/wallpapers/pikachu-beyond-the-horizon-42.jpg') },
];

const ACCENT_COLORS = [
  { id: 'blue', name: 'Blue', color: '#007aff' },
  { id: 'purple', name: 'Purple', color: '#af52de' },
  { id: 'green', name: 'Green', color: '#34c759' },
  { id: 'red', name: 'Red', color: '#ff3b30' },
  { id: 'orange', name: 'Orange', color: '#ff9500' },
];

export const Settings: React.FC<SettingsProps> = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('snackos-theme');
    return (saved as Theme) || 'dark';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('snackos-accent');
    return (saved as AccentColor) || 'blue';
  });

  const [wallpaper, setWallpaper] = useState(() => {
    const saved = localStorage.getItem('snackos-wallpaper');
    const defaultWallpaper = getAssetPath('/assets/wallpapers/calm-forest-landscape-under-clouds-hu.jpg');
    
    if (!saved) {
      return defaultWallpaper;
    }
    
    // Normalize path: if it's an old absolute path, convert it using getAssetPath
    if (saved.startsWith('/assets')) {
      const normalized = getAssetPath(saved);
      // Update localStorage with normalized path
      localStorage.setItem('snackos-wallpaper', normalized);
      return normalized;
    }
    
    // Already normalized or has base URL
    return saved;
  });

  const [clockFormat, setClockFormat] = useState<ClockFormat>(() => {
    const saved = localStorage.getItem('snackos-clock-format');
    return (saved as ClockFormat) || '24h';
  });

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('snackos-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAccentChange = (color: AccentColor) => {
    setAccentColor(color);
    localStorage.setItem('snackos-accent', color);
    const colorValue = ACCENT_COLORS.find(c => c.id === color)?.color || '#007aff';
    document.documentElement.style.setProperty('--accent-blue', colorValue);
    document.documentElement.style.setProperty('--accent-blue-hover', colorValue + 'dd');
  };

  const handleWallpaperChange = (path: string) => {
    setWallpaper(path);
    localStorage.setItem('snackos-wallpaper', path);
    const wallpaperElement = document.querySelector('.desktop-wallpaper') as HTMLElement;
    if (wallpaperElement) {
      wallpaperElement.style.backgroundImage = `url(${path})`;
    }
  };

  const handleClockFormatChange = (format: ClockFormat) => {
    setClockFormat(format);
    localStorage.setItem('snackos-clock-format', format);
    window.dispatchEvent(new CustomEvent('clock-format-change', { detail: format }));
  };

  return (
    <div className="settings-app">
      <div className="settings-container">
        {/* Appearance Section */}
        <section className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h2>Appearance</h2>
          </div>

          {/* Theme */}
          <div className="setting-group">
            <label className="setting-label">Theme</label>
            <div className="theme-selector">
              <button
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={20} />
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={20} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div className="setting-group">
            <label className="setting-label">Accent Color</label>
            <div className="color-selector">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.id}
                  className={`color-option ${accentColor === color.id ? 'active' : ''}`}
                  style={{ backgroundColor: color.color }}
                  onClick={() => handleAccentChange(color.id as AccentColor)}
                  title={color.name}
                >
                  {accentColor === color.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Wallpaper */}
          <div className="setting-group">
            <label className="setting-label">Wallpaper</label>
            <div className="wallpaper-grid">
              {WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  className={`wallpaper-option ${wallpaper === wp.path ? 'active' : ''}`}
                  onClick={() => handleWallpaperChange(wp.path)}
                >
                  <img src={wp.path} alt={wp.name} />
                  <span className="wallpaper-name">{wp.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Clock & Time Section */}
        <section className="settings-section">
          <div className="section-header">
            <ClockIcon size={20} />
            <h2>Clock & Time</h2>
          </div>

          <div className="setting-group">
            <label className="setting-label">Clock Format</label>
            <div className="format-selector">
              <button
                className={`format-option ${clockFormat === '12h' ? 'active' : ''}`}
                onClick={() => handleClockFormatChange('12h')}
              >
                12-hour (AM/PM)
              </button>
              <button
                className={`format-option ${clockFormat === '24h' ? 'active' : ''}`}
                onClick={() => handleClockFormatChange('24h')}
              >
                24-hour
              </button>
            </div>
          </div>
        </section>

        {/* System Info */}
        <section className="settings-section">
          <div className="section-header">
            <Monitor size={20} />
            <h2>System Information</h2>
          </div>

          <div className="system-info">
            <div className="info-row">
              <span className="info-label">OS Name</span>
              <span className="info-value">SnackOS</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Build</span>
              <span className="info-value">2025.12</span>
            </div>
            <div className="info-row">
              <span className="info-label">Browser</span>
              <span className="info-value">{navigator.userAgent.split(' ').pop()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Platform</span>
              <span className="info-value">{navigator.platform}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

