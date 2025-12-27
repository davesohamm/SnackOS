// Advanced Tic Tac Toe with Minimax AI
import React, { useState, useEffect, useCallback } from 'react';
import { X, Circle, RotateCcw, Trophy, Brain, User } from 'lucide-react';
import './TicTacToe.css';

type Player = 'X' | 'O' | null;
type Board = Player[];
type Difficulty = 'easy' | 'medium' | 'impossible';

interface Score {
  player: number;
  computer: number;
  draws: number;
}

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState<Score>({ player: 0, computer: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState<Difficulty>('impossible');
  const [isThinking, setIsThinking] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [gameStarted, setGameStarted] = useState(false);

  const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Check for winner
  const checkWinner = useCallback((currentBoard: Board): { winner: Player | 'draw' | null; line: number[] | null } => {
    // Check all winning combinations
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }

    // Check for draw
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  }, [winningCombinations]);

  // Minimax algorithm for impossible AI
  const minimax = useCallback((currentBoard: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const result = checkWinner(currentBoard);
    
    if (result.winner === computerSymbol) return 10 - depth;
    if (result.winner === playerSymbol) return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = computerSymbol;
          const score = minimax(currentBoard, depth + 1, false, alpha, beta);
          currentBoard[i] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = playerSymbol;
          const score = minimax(currentBoard, depth + 1, true, alpha, beta);
          currentBoard[i] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return minScore;
    }
  }, [checkWinner, computerSymbol, playerSymbol]);

  // Get best move for computer
  const getBestMove = useCallback((currentBoard: Board, diff: Difficulty): number => {
    const emptyIndices = currentBoard
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null) as number[];

    if (emptyIndices.length === 0) return -1;

    // Easy: Random move
    if (diff === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Medium: 50% best move, 50% random
    if (diff === 'medium') {
      if (Math.random() < 0.5) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    // Impossible: Minimax with alpha-beta pruning
    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const index of emptyIndices) {
      currentBoard[index] = computerSymbol;
      const score = minimax([...currentBoard], 0, false, -Infinity, Infinity);
      currentBoard[index] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }

    return bestMove;
  }, [minimax, computerSymbol]);

  // Computer makes a move
  const makeComputerMove = useCallback(() => {
    if (winner || !gameStarted) return;

    setIsThinking(true);

    // Add delay for thinking animation
    setTimeout(() => {
      const newBoard = [...board];
      const moveIndex = getBestMove(newBoard, difficulty);

      if (moveIndex !== -1) {
        newBoard[moveIndex] = computerSymbol;
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.line);
          
          if (result.winner === computerSymbol) {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
          } else if (result.winner === 'draw') {
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
          }
        } else {
          setIsPlayerTurn(true);
        }
      }

      setIsThinking(false);
    }, 500);
  }, [board, winner, difficulty, computerSymbol, getBestMove, checkWinner, gameStarted]);

  // Handle player move
  const handleCellClick = (index: number) => {
    if (!gameStarted || board[index] !== null || winner || !isPlayerTurn || isThinking) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      if (result.winner === playerSymbol) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else if (result.winner === 'draw') {
        setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    } else {
      setIsPlayerTurn(false);
    }
  };

  // Computer's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner && gameStarted) {
      makeComputerMove();
    }
  }, [isPlayerTurn, winner, makeComputerMove, gameStarted]);

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(playerSymbol === 'X');
    setWinner(null);
    setWinningLine(null);
    setIsThinking(false);
    setGameStarted(true);
  };

  // Start new game with symbol selection
  const startGame = (symbol: 'X' | 'O') => {
    setPlayerSymbol(symbol);
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(symbol === 'X'); // X always goes first
    setWinner(null);
    setWinningLine(null);
    setIsThinking(false);
    setGameStarted(true);

    // If player chose O, computer (X) goes first
    if (symbol === 'O') {
      setTimeout(() => {
        setIsPlayerTurn(false);
      }, 100);
    }
  };

  // Reset all scores
  const resetScore = () => {
    setScore({ player: 0, computer: 0, draws: 0 });
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setIsPlayerTurn(true);
    setGameStarted(false);
  };

  // Render cell content
  const renderCellContent = (value: Player) => {
    if (value === 'X') {
      return <X size={48} strokeWidth={3} className="cell-x" />;
    }
    if (value === 'O') {
      return <Circle size={48} strokeWidth={3} className="cell-o" />;
    }
    return null;
  };

  return (
    <div className="tictactoe-app">
      {/* Header */}
      <div className="tictactoe-header">
        <div className="header-title">
          <Trophy size={24} className="title-icon" />
          <h2>Tic Tac Toe</h2>
        </div>
        <div className="difficulty-selector">
          <button
            className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </button>
          <button
            className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </button>
          <button
            className={`diff-btn ${difficulty === 'impossible' ? 'active' : ''}`}
            onClick={() => setDifficulty('impossible')}
          >
            Impossible
          </button>
        </div>
      </div>

      {/* Score Board */}
      <div className="score-board">
        <div className="score-item player">
          <User size={20} />
          <div className="score-info">
            <span className="score-label">You</span>
            <span className="score-value">{score.player}</span>
          </div>
        </div>
        <div className="score-item draws">
          <div className="score-info">
            <span className="score-label">Draws</span>
            <span className="score-value">{score.draws}</span>
          </div>
        </div>
        <div className="score-item computer">
          <Brain size={20} />
          <div className="score-info">
            <span className="score-label">AI</span>
            <span className="score-value">{score.computer}</span>
          </div>
        </div>
      </div>

      {/* Start Screen */}
      {!gameStarted && (
        <div className="start-screen">
          <h3>Choose Your Symbol</h3>
          <div className="symbol-selection">
            <button className="symbol-btn" onClick={() => startGame('X')}>
              <X size={64} strokeWidth={3} />
              <span>Play as X</span>
              <small>You go first</small>
            </button>
            <button className="symbol-btn" onClick={() => startGame('O')}>
              <Circle size={64} strokeWidth={3} />
              <span>Play as O</span>
              <small>AI goes first</small>
            </button>
          </div>
        </div>
      )}

      {/* Game Board */}
      {gameStarted && (
        <>
          {/* Status */}
          <div className="game-status">
            {winner ? (
              winner === 'draw' ? (
                <span className="status-draw">It's a Draw! 🤝</span>
              ) : winner === playerSymbol ? (
                <span className="status-win">You Win! 🎉</span>
              ) : (
                <span className="status-lose">AI Wins! 🤖</span>
              )
            ) : isThinking ? (
              <span className="status-thinking">
                <Brain size={18} className="thinking-icon" />
                AI is thinking...
              </span>
            ) : isPlayerTurn ? (
              <span className="status-turn">Your Turn ({playerSymbol})</span>
            ) : (
              <span className="status-turn">AI's Turn ({computerSymbol})</span>
            )}
          </div>

          {/* Board with Side Controls */}
          <div className="game-container">
            <button className="side-control-btn reset" onClick={resetGame} title="New Game">
              <RotateCcw size={20} />
            </button>

            <div className="game-board">
              {board.map((cell, index) => (
                <button
                  key={index}
                  className={`game-cell ${cell ? 'filled' : ''} ${
                    winningLine?.includes(index) ? 'winning' : ''
                  } ${!isPlayerTurn || isThinking ? 'disabled' : ''}`}
                  onClick={() => handleCellClick(index)}
                  disabled={!isPlayerTurn || isThinking || !!winner}
                >
                  {renderCellContent(cell)}
                </button>
              ))}
            </div>

            <button className="side-control-btn clear" onClick={resetScore} title="Reset Score">
              <RotateCcw size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

