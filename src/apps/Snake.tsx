// Classic Snake Game - Elegant & Properly Implemented
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './Snake.css';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

interface SnakeProps {
  onScoreChange?: (score: number) => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEEDS = {
  easy: 150,
  medium: 100,
  hard: 70,
};

export const Snake: React.FC<SnakeProps> = ({ onScoreChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snackos-snake-highscore');
    return saved ? parseInt(saved) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEEDS.medium);

  // Generate food at random position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    const availablePositions: Position[] = [];
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const isSnake = currentSnake.some(segment => segment.x === x && segment.y === y);
        if (!isSnake) {
          availablePositions.push({ x, y });
        }
      }
    }

    if (availablePositions.length === 0) {
      // Game won! (entire grid filled)
      return currentSnake[0];
    }

    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    return availablePositions[randomIndex];
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const newSnake = INITIAL_SNAKE;
    setSnake(newSnake);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(generateFood(newSnake));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    onScoreChange?.(0);
  }, [generateFood, onScoreChange]);

  // Start game
  const startGame = useCallback(() => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
    setIsPaused(false);
  }, [gameOver, resetGame]);

  // Pause game
  const togglePause = useCallback(() => {
    if (isPlaying && !gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [isPlaying, gameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.code === 'Space') {
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          togglePause();
        }
        return;
      }

      if (!isPlaying || isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying, isPaused, gameOver, startGame, togglePause]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;

    const gameLoop = (timestamp: number) => {
      if (lastUpdateTimeRef.current === 0) {
        lastUpdateTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateTimeRef.current;

      if (elapsed >= gameSpeed) {
        lastUpdateTimeRef.current = timestamp;

        setDirection(nextDirection);

        setSnake(currentSnake => {
          const head = currentSnake[0];
          let newHead: Position;

          // Calculate new head position
          switch (nextDirection) {
            case 'UP':
              newHead = { x: head.x, y: head.y - 1 };
              break;
            case 'DOWN':
              newHead = { x: head.x, y: head.y + 1 };
              break;
            case 'LEFT':
              newHead = { x: head.x - 1, y: head.y };
              break;
            case 'RIGHT':
              newHead = { x: head.x + 1, y: head.y };
              break;
          }

          // Check wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            setGameOver(true);
            setIsPlaying(false);
            return currentSnake;
          }

          // Check self collision
          if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            setGameOver(true);
            setIsPlaying(false);
            return currentSnake;
          }

          const newSnake = [newHead, ...currentSnake];

          // Check food collision
          if (newHead.x === food.x && newHead.y === food.y) {
            const newScore = score + 10;
            setScore(newScore);
            onScoreChange?.(newScore);

            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snackos-snake-highscore', newScore.toString());
            }

            setFood(generateFood(newSnake));
            return newSnake;
          } else {
            newSnake.pop();
            return newSnake;
          }
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        lastUpdateTimeRef.current = 0;
      }
    };
  }, [isPlaying, isPaused, gameOver, nextDirection, food, score, highScore, gameSpeed, generateFood, onScoreChange]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#1d1d1f';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e8e8ed';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#007aff';
      } else {
        // Body
        const opacity = 1 - (index / snake.length) * 0.3;
        ctx.fillStyle = `rgba(0, 122, 255, ${opacity})`;
      }

      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );

      // Draw eyes on head
      if (index === 0) {
        ctx.fillStyle = 'white';
        const eyeSize = 3;
        const eyeOffset = 5;

        if (direction === 'UP') {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
        } else if (direction === 'DOWN') {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (direction === 'LEFT') {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else {
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      }
    });
  }, [snake, food, direction]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    setGameSpeed(GAME_SPEEDS[newDifficulty]);
    if (isPlaying) {
      resetGame();
      setIsPlaying(false);
    }
  };

  return (
    <div className="snake-game">
      <div className="snake-header">
        <div className="snake-stats">
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High Score</span>
            <span className="stat-value">{highScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Length</span>
            <span className="stat-value">{snake.length}</span>
          </div>
        </div>

        <div className="snake-controls">
          <div className="difficulty-selector">
            <button
              className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('easy')}
              disabled={isPlaying}
            >
              Easy
            </button>
            <button
              className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('medium')}
              disabled={isPlaying}
            >
              Medium
            </button>
            <button
              className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('hard')}
              disabled={isPlaying}
            >
              Hard
            </button>
          </div>

          <div className="game-buttons">
            {!isPlaying && !gameOver && (
              <button className="game-btn primary" onClick={startGame}>
                <Play size={18} />
                Start
              </button>
            )}
            {isPlaying && !gameOver && (
              <button className="game-btn" onClick={togglePause}>
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            {(isPlaying || gameOver) && (
              <button className="game-btn" onClick={resetGame}>
                <RotateCcw size={18} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="snake-canvas-container">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="snake-canvas"
        />

        {!isPlaying && !gameOver && (
          <div className="snake-overlay">
            <h3>Classic Snake</h3>
            <p>Use arrow keys or WASD to move</p>
            <p>Press Space to start</p>
          </div>
        )}

        {isPaused && (
          <div className="snake-overlay">
            <h3>Paused</h3>
            <p>Press Space to resume</p>
          </div>
        )}

        {gameOver && (
          <div className="snake-overlay">
            <h3>Game Over!</h3>
            <p className="final-score">Final Score: {score}</p>
            {score === highScore && score > 0 && <p className="new-highscore">New High Score!</p>}
            <button className="play-again-btn" onClick={() => { resetGame(); startGame(); }}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="snake-help">
        <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>WASD</kbd> to move · <kbd>Space</kbd> to pause
      </div>
    </div>
  );
};



