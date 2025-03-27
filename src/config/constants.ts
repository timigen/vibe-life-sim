// Game initialization constants
export const INITIAL_POPULATION_PER_GROUP = 50;
export const INITIAL_FOOD_COUNT = 140;

export interface Group {
  color: string;
}

export const GROUPS: Group[] = [
  { color: '#ff0000' }, // Red
  { color: '#00ff00' }, // Green
  { color: '#0000ff' }, // Blue
  { color: '#ffff00' }, // Yellow
];

// Game state class for mutable variables
export class GameState {
  static CANVAS_WIDTH = window.innerWidth;
  static CANVAS_HEIGHT = window.innerHeight;
  static lastTime = performance.now();
  static frameCount = 0;
  static fps = 0;
  static avgFps = 0;
  static fpsSamples = 0;
  static totalFps = 0;
  static paused = false;
  static animationFrameId: number;
  static maxPopulation = 0;
  static deathsByStarvation = 0;
  static deathsByOldAge = 0;
}
