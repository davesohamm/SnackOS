// macOS-style menu bar
import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryCharging, Volume2 } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';
import './MenuBar.css';

export const MenuBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [batterySupported, setBatterySupported] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch battery status using Battery Status API
  useEffect(() => {
    const updateBatteryStatus = async () => {
      // Check if Battery Status API is supported
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          
          // Update battery level (convert to percentage)
          const updateLevel = () => {
            setBatteryLevel(Math.round(battery.level * 100));
            setIsCharging(battery.charging);
          };

          // Initial update
          updateLevel();

          // Listen for battery level changes
          battery.addEventListener('levelchange', updateLevel);
          battery.addEventListener('chargingchange', updateLevel);

          // Cleanup
          return () => {
            battery.removeEventListener('levelchange', updateLevel);
            battery.removeEventListener('chargingchange', updateLevel);
          };
        } catch (error) {
          console.warn('Battery Status API not available:', error);
          setBatterySupported(false);
          setBatteryLevel(null);
        }
      } else {
        console.warn('Battery Status API not supported in this browser');
        setBatterySupported(false);
        setBatteryLevel(null);
      }
    };

    updateBatteryStatus();
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/davesohamm', '_blank', 'noopener,noreferrer');
  };

  const handleWifiToggle = () => {
    setWifiEnabled(!wifiEnabled);
  };

  const handleVolumeClick = () => {
    setVolumeLevel(volumeLevel === 0 ? 100 : 0);
  };

  const getBatteryIcon = () => {
    if (isCharging) {
      return <BatteryCharging size={16} />;
    }
    return <Battery size={16} />;
  };

  const getBatteryTitle = () => {
    if (!batterySupported || batteryLevel === null) {
      return 'Battery: Not Available';
    }
    if (isCharging) {
      return `Battery: ${batteryLevel}% (Charging)`;
    }
    return `Battery: ${batteryLevel}%`;
  };

  const getBatteryDisplay = () => {
    if (!batterySupported || batteryLevel === null) {
      return 'N/A';
    }
    return `${batteryLevel}%`;
  };

  return (
    <div className="menu-bar">
      <div className="menu-left">
        <div className="menu-logo">SnackOS</div>
      </div>
      <div className="menu-right">
        <button className="menu-item github-btn" onClick={handleGitHubClick} title="GitHub">
          <img src={getAssetPath('/assets/png-icons/icons8-github-50.png')} alt="GitHub" className="github-icon" />
        </button>
        <button 
          className={`menu-item ${wifiEnabled ? 'active' : 'disabled'}`}
          onClick={handleWifiToggle}
          title={wifiEnabled ? 'WiFi: Connected' : 'WiFi: Disconnected'}
        >
          <Wifi size={16} />
        </button>
        <button 
          className={`menu-item ${isCharging ? 'charging' : ''} ${batteryLevel !== null && batteryLevel < 20 ? 'low-battery' : ''}`}
          title={getBatteryTitle()}
        >
          {getBatteryIcon()}
          <span className="battery-level">{getBatteryDisplay()}</span>
        </button>
        <button 
          className="menu-item"
          onClick={handleVolumeClick}
          title={volumeLevel === 0 ? 'Volume: Muted' : `Volume: ${volumeLevel}%`}
        >
          <Volume2 size={16} />
        </button>
        <div className="menu-time">{formatTime()}</div>
      </div>
    </div>
  );
};

