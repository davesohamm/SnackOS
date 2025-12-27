// Advanced Music Player with Audio Visualizer
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, 
  Trash2, List, Shuffle, Repeat, Maximize2, Minimize2, BarChart3
} from 'lucide-react';
import './Music.css';

interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
}

type VisualizerType = 'bars' | 'circular' | 'waveform';

export const Music: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('bars');
  const [isCompactView, setIsCompactView] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (audioRef.current && !audioContextRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Visualizer animation
  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (visualizerType === 'bars') {
        drawBars(ctx, dataArray, rect.width, rect.height);
      } else if (visualizerType === 'circular') {
        drawCircular(ctx, dataArray, rect.width, rect.height);
      } else if (visualizerType === 'waveform') {
        drawWaveform(ctx, dataArray, rect.width, rect.height);
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualizerType]);

  // Visualizer drawing functions
  const drawBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barCount = isCompactView ? 32 : 64;
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;

      // Create gradient - silver/white theme
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      const intensity = value / 255;
      gradient.addColorStop(0, `rgba(180, 180, 200, ${0.4 + intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(220, 220, 240, ${0.6 + intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${0.8 + intensity * 0.2})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);

      // Add glow effect
      ctx.shadowBlur = 15 + intensity * 10;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.3 + intensity * 0.4})`;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
      ctx.shadowBlur = 0;
    }
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const barCount = isCompactView ? 64 : 128;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * radius * 0.8;
      const angle = (i / barCount) * Math.PI * 2;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      const intensity = value / 255;
      ctx.strokeStyle = `rgba(${200 + intensity * 55}, ${200 + intensity * 55}, ${220 + intensity * 35}, ${0.6 + intensity * 0.4})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12 + intensity * 8;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.3 + intensity * 0.4})`;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const sliceWidth = width / dataArray.length;
    let x = 0;

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(240, 240, 250, 0.9)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

    ctx.beginPath();

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255;
      const y = height / 2 + (v - 0.5) * height * 0.6;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Mirror effect
    ctx.globalAlpha = 0.25;
    ctx.scale(1, -1);
    ctx.translate(0, -height);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  // Audio control functions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && playlist[currentTrackIndex]) {
      audioRef.current.src = playlist[currentTrackIndex].url;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      }
    }
  }, [currentTrackIndex, playlist]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: Track[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const track: Track = {
          id: Date.now().toString() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          duration: 0,
        };
        newTracks.push(track);
      }
    });

    setPlaylist([...playlist, ...newTracks]);
    
    // Auto-play first track if playlist was empty
    if (playlist.length === 0 && newTracks.length > 0) {
      setCurrentTrackIndex(0);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || playlist.length === 0) return;

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error('Play error:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentTrackIndex && playlist.length > 1);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeat === 'all') {
      handleNext();
    } else {
      if (currentTrackIndex < playlist.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const deleteTrack = (id: string) => {
    const trackIndex = playlist.findIndex(t => t.id === id);
    if (trackIndex === currentTrackIndex) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
    setPlaylist(playlist.filter(t => t.id !== id));
    if (trackIndex < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cycleVisualizer = () => {
    setVisualizerType(prev => {
      if (prev === 'bars') return 'circular';
      if (prev === 'circular') return 'waveform';
      return 'bars';
    });
  };

  const currentTrack = playlist[currentTrackIndex];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`music-app ${isCompactView ? 'compact' : ''}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Toolbar */}
      <div className="music-toolbar">
        <div className="toolbar-left">
          <h2 className="toolbar-title">Music Player</h2>
          <span className="toolbar-count">{playlist.length} {playlist.length === 1 ? 'song' : 'songs'}</span>
        </div>
        <label className="toolbar-upload-btn">
          <Upload size={18} />
          <span>Upload Music</span>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Visualizer */}
      <div className="music-visualizer">
        <canvas ref={canvasRef} className="visualizer-canvas" />
        <div className="visualizer-overlay">
          <button 
            className="visualizer-control"
            onClick={cycleVisualizer}
            title="Change Visualizer"
          >
            <BarChart3 size={16} />
          </button>
          <button
            className="compact-control"
            onClick={() => setIsCompactView(!isCompactView)}
            title={isCompactView ? "Expand View" : "Compact View"}
          >
            {isCompactView ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Player */}
      <div className="music-player">
        {!isCompactView && (
          <div className="player-info">
            <div className="track-artwork">
              <div className="artwork-placeholder">🎵</div>
              {isPlaying && <div className="artwork-pulse" />}
            </div>
            <div className="track-details">
              <div className="track-name">{currentTrack?.name || 'No track selected'}</div>
              <div className="track-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )}

        <div className="player-progress-container">
          <div 
            className="player-progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
        </div>

        {isCompactView && (
          <div className="compact-info">
            <div className="compact-track-name">{currentTrack?.name || 'No track'}</div>
            <div className="compact-time">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
        )}

        <div className="player-controls">
          <button
            className={`control-btn small ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            <Shuffle size={isCompactView ? 14 : 16} />
          </button>
          <button 
            className="control-btn" 
            onClick={handlePrevious} 
            disabled={playlist.length === 0}
          >
            <SkipBack size={isCompactView ? 18 : 20} />
          </button>
          <button 
            className="control-btn play" 
            onClick={togglePlay} 
            disabled={playlist.length === 0}
          >
            {isPlaying ? <Pause size={isCompactView ? 20 : 26} /> : <Play size={isCompactView ? 20 : 26} />}
          </button>
          <button 
            className="control-btn" 
            onClick={handleNext} 
            disabled={playlist.length === 0}
          >
            <SkipForward size={isCompactView ? 18 : 20} />
          </button>
          <button
            className={`control-btn small ${repeat !== 'none' ? 'active' : ''}`}
            onClick={() => setRepeat(repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none')}
            title={repeat === 'none' ? 'Repeat Off' : repeat === 'all' ? 'Repeat All' : 'Repeat One'}
          >
            <Repeat size={isCompactView ? 14 : 16} />
            {repeat === 'one' && <span className="repeat-indicator">1</span>}
          </button>
        </div>

        <div className="player-extras">
          <button
            className="control-btn small"
            onClick={() => setShowPlaylist(!showPlaylist)}
            title="Toggle Playlist"
          >
            <List size={isCompactView ? 16 : 18} />
          </button>
          <div className="volume-control">
            <button className="control-btn small" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX size={isCompactView ? 16 : 18} /> : <Volume2 size={isCompactView ? 16 : 18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="playlist-container">
          <div className="playlist-header">
            <h3>Playlist ({playlist.length})</h3>
          </div>

          <div className="playlist">
            {playlist.length === 0 ? (
              <div className="playlist-empty">
                <div className="empty-icon">🎵</div>
                <p>No songs in playlist</p>
                <p className="empty-hint">Click "Upload Music" button above to get started</p>
              </div>
            ) : (
              <>
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`playlist-item ${index === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => selectTrack(index)}
                  >
                    <div className="playlist-item-index">
                      {index === currentTrackIndex && isPlaying ? (
                        <div className="playing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="playlist-item-name">{track.name}</div>
                    <button
                      className="playlist-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
