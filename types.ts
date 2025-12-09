export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Block extends Entity {
  speed: number;
  id: number;
}

export interface Player extends Entity {
  speed: number;
}

export interface GameState {
  score: number;
  highScore: number;
  status: GameStatus;
  difficultyLevel: number;
}