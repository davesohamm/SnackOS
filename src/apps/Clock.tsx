// Elegant Clock with World Time
import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import './Clock.css';

interface WorldClock {
  city: string;
  timezone: string;
  offset: number;
}

const WORLD_CLOCKS: WorldClock[] = [
  { city: 'New York', timezone: 'America/New_York', offset: -5 },
  { city: 'London', timezone: 'Europe/London', offset: 0 },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9 },
  { city: 'Sydney', timezone: 'Australia/Sydney', offset: 11 },
  { city: 'Dubai', timezone: 'Asia/Dubai', offset: 4 },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles', offset: -8 },
];

export const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getWorldTime = (timezone: string) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getWorldDate = (timezone: string) => {
    return currentTime.toLocaleDateString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
    });
  };

  const isDifferentDay = (timezone: string) => {
    const localDay = currentTime.getDate();
    const worldDay = new Date(
      currentTime.toLocaleString('en-US', { timeZone: timezone })
    ).getDate();
    return localDay !== worldDay;
  };

  // Draw analog clock
  const getClockHandRotation = () => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    return {
      hour: (hours * 30) + (minutes * 0.5),
      minute: minutes * 6,
      second: seconds * 6,
    };
  };

  const rotation = getClockHandRotation();

  return (
    <div className="clock-app">
      {/* World Clocks Sidebar */}
      <div className="world-clocks-sidebar">
        <div className="sidebar-header">
          <Globe size={20} />
          <h3>World Clocks</h3>
        </div>
        <div className="world-clocks-list">
          {WORLD_CLOCKS.map((clock) => (
            <div key={clock.city} className="world-clock-item">
              <div className="world-clock-header">
                <h4>{clock.city}</h4>
                <span className="timezone-offset">
                  UTC{clock.offset >= 0 ? '+' : ''}{clock.offset}
                </span>
              </div>
              <div className="world-clock-time">{getWorldTime(clock.timezone)}</div>
              <div className="world-clock-date">
                {getWorldDate(clock.timezone)}
                {isDifferentDay(clock.timezone) && (
                  <span className="day-indicator">
                    {currentTime.getDate() < new Date(currentTime.toLocaleString('en-US', { timeZone: clock.timezone })).getDate() ? '+1' : '-1'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Clock */}
      <div className="main-clock-container">
        <div className="main-clock">
          <div className="digital-clock">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)}</div>
          </div>

          <div className="analog-clock">
            <div className="clock-face">
              {/* Hour markers */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="hour-marker"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-75px)`,
                  }}
                >
                  <div className="marker-dot" />
                </div>
              ))}

              {/* Clock hands */}
              <div
                className="clock-hand hour-hand"
                style={{ transform: `rotate(${rotation.hour}deg)` }}
              />
              <div
                className="clock-hand minute-hand"
                style={{ transform: `rotate(${rotation.minute}deg)` }}
              />
              <div
                className="clock-hand second-hand"
                style={{ transform: `rotate(${rotation.second}deg)` }}
              />

              {/* Center dot */}
              <div className="clock-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



