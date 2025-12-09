import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameStatus, Block, Player, GameState } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  PLAYER_INITIAL_SPEED,
  PLAYER_COLOR,
  INITIAL_SPAWN_RATE,
  MIN_BLOCK_WIDTH,
  MAX_BLOCK_WIDTH,
  MIN_BLOCK_SPEED,
  MAX_BLOCK_SPEED,
  DIFFICULTY_INCREMENT_INTERVAL
} from '../constants';
import UIOverlay from './UIOverlay';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game state refs (mutable for performance in loop)
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - PLAYER_SIZE - 20,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: PLAYER_COLOR,
    speed: PLAYER_INITIAL_SPEED
  });
  
  const blocksRef = useRef<Block[]>([]);
  const frameCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const keysPressed = useRef<Set<string>>(new Set());
  
  // React state for UI rendering
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: 0,
    status: GameStatus.MENU,
    difficultyLevel: 1
  });

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Load High Score
    const savedHighScore = localStorage.getItem('blockDodgerHighScore');
    if (savedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const spawnBlock = () => {
    // Determine spawn rate based on difficulty
    // Higher difficulty -> Lower spawn rate (more frequent)
    const currentSpawnRate = Math.max(20, INITIAL_SPAWN_RATE - (difficultyRef.current * 2));
    
    if (frameCountRef.current % currentSpawnRate === 0) {
      const width = Math.random() * (MAX_BLOCK_WIDTH - MIN_BLOCK_WIDTH) + MIN_BLOCK_WIDTH;
      const x = Math.random() * (CANVAS_WIDTH - width);
      const speedMultiplier = 1 + (difficultyRef.current * 0.1);
      
      blocksRef.current.push({
        x,
        y: -50,
        width,
        height: 30, // Fixed height for blocks
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        speed: (Math.random() * (MAX_BLOCK_SPEED - MIN_BLOCK_SPEED) + MIN_BLOCK_SPEED) * speedMultiplier,
        id: Date.now() + Math.random()
      });
    }
  };

  const update = () => {
    if (gameState.status !== GameStatus.PLAYING) return;

    // Player Movement
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) {
      playerRef.current.x = Math.max(0, playerRef.current.x - playerRef.current.speed);
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
      playerRef.current.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerRef.current.x + playerRef.current.speed);
    }

    // Block Logic
    spawnBlock();

    // Filter out blocks that have passed the bottom
    // We do this carefully to update score for dodged blocks
    const activeBlocks: Block[] = [];
    
    blocksRef.current.forEach(block => {
      block.y += block.speed;

      // Collision Detection
      if (
        playerRef.current.x < block.x + block.width &&
        playerRef.current.x + playerRef.current.width > block.x &&
        playerRef.current.y < block.y + block.height &&
        playerRef.current.y + playerRef.current.height > block.y
      ) {
        handleGameOver();
      }

      if (block.y < CANVAS_HEIGHT) {
        activeBlocks.push(block);
      } else {
        // Block successfully dodged
        scoreRef.current += 10;
        
        // Increase difficulty
        const newLevel = Math.floor(scoreRef.current / DIFFICULTY_INCREMENT_INTERVAL) + 1;
        if (newLevel > difficultyRef.current) {
            difficultyRef.current = newLevel;
        }
      }
    });

    blocksRef.current = activeBlocks;
    frameCountRef.current++;
    
    // Sync score to React state occasionally for UI (every 10 frames to avoid React render spam)
    if (frameCountRef.current % 10 === 0) {
        setGameState(prev => ({
            ...prev,
            score: scoreRef.current,
            difficultyLevel: difficultyRef.current
        }));
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear Canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Grid (Retro effect)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for(let i = 0; i < CANVAS_WIDTH; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for(let i = 0; i < CANVAS_HEIGHT; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // Draw Player
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerRef.current.color;
    ctx.fillStyle = playerRef.current.color;
    ctx.fillRect(playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height);
    ctx.shadowBlur = 0;

    // Draw Blocks
    blocksRef.current.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);
    });
    ctx.shadowBlur = 0;
  };

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState.status === GameStatus.PLAYING) {
        update();
    }
    draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState.status]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  const handleGameOver = () => {
    setGameState(prev => {
        const newHighScore = Math.max(prev.highScore, scoreRef.current);
        localStorage.setItem('blockDodgerHighScore', newHighScore.toString());
        return {
            ...prev,
            status: GameStatus.GAME_OVER,
            highScore: newHighScore
        };
    });
  };

  const startGame = () => {
    // Reset Refs
    playerRef.current.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
    blocksRef.current = [];
    scoreRef.current = 0;
    difficultyRef.current = 1;
    frameCountRef.current = 0;

    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      difficultyLevel: 1
    }));
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block rounded bg-black cursor-crosshair"
      />
      <UIOverlay 
        gameState={gameState} 
        onStart={startGame} 
        onRestart={startGame} 
      />
    </div>
  );
};

export default GameCanvas;