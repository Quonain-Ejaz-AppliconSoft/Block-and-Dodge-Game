import React from 'react';
import { GameState, GameStatus } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  onStart: () => void;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onStart, onRestart }) => {
  const { status, score, highScore, difficultyLevel } = gameState;

  // HUD (Heads-up Display)
  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between text-white font-bold pointer-events-none select-none">
        <div className="flex flex-col">
          <span className="text-xl text-sky-400">SCORE: {score}</span>
          <span className="text-xs text-slate-400">HI: {highScore}</span>
        </div>
        <div className="text-right">
             <span className="text-xl text-rose-400">LEVEL {difficultyLevel}</span>
        </div>
      </div>
    );
  }

  // Menu Screen
  if (status === GameStatus.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 mb-8 tracking-tighter">
          BLOCK DODGER
        </h1>
        <div className="mb-8 text-center space-y-2 text-slate-300">
          <p>Use <span className="bg-slate-700 px-2 py-1 rounded">←</span> <span className="bg-slate-700 px-2 py-1 rounded">→</span> or <span className="bg-slate-700 px-2 py-1 rounded">A</span> <span className="bg-slate-700 px-2 py-1 rounded">D</span> to move.</p>
          <p>Avoid the falling blocks.</p>
        </div>
        <button
          onClick={onStart}
          className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full shadow-lg hover:shadow-sky-500/50 transition-all transform hover:scale-105 active:scale-95"
        >
          START GAME
        </button>
      </div>
    );
  }

  // Game Over Screen
  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white">
        <h2 className="text-5xl font-bold text-rose-500 mb-4">GAME OVER</h2>
        
        <div className="flex flex-col items-center mb-8 space-y-2">
            <div className="text-2xl">Final Score: <span className="text-white font-mono">{score}</span></div>
            {score >= highScore && score > 0 && (
                <div className="text-yellow-400 font-bold animate-pulse">NEW HIGH SCORE!</div>
            )}
            <div className="text-sm text-slate-500">Best: {highScore}</div>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-white/20"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return null;
};

export default UIOverlay;