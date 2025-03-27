// Game initialization constants
// Initial population per group
export const INITIAL_POPULATION_PER_GROUP = 20;

// Initial food count in the simulation
export const INITIAL_FOOD_COUNT = 150;

// Number of groups in the simulation
export const NUMBER_OF_GROUPS = 2;

// Interface for defining a group
export interface Group {
  color: string;
}

// Array of groups with their respective colors
export const GROUPS: Group[] = [
  { color: '#ff0000' }, // Red
  { color: '#00ff00' }, // Green
  { color: '#0000ff' }, // Blue
].slice(0, NUMBER_OF_GROUPS);

// Game state class for mutable variables
// This class holds the state of the game that can change over time
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
  static groupStats = GROUPS.map(group => ({
    color: group.color,
    maxPopulation: 0,
    highestGeneration: 0,
  }));
}
