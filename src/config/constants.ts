// Game initialization constants
export const INITIAL_POPULATION_PER_GROUP = 20;
export const INITIAL_FOOD_COUNT = 70;

// Groups configuration
export const GROUPS = [{ color: '#ff5555' }, { color: '#55aaff' }, { color: '#55ff55' }];

// Game state class for mutable variables
export class GameState {
  static CANVAS_WIDTH = window.innerWidth;
  static CANVAS_HEIGHT = window.innerHeight;
  static lastTime = performance.now();
  static frameCount = 0;
  static fps = 0;
  static paused = false;
  static animationFrameId: number;
  static maxPopulation = 0;
}
