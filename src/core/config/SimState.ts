import { GROUPS } from '../constants';

// This class holds the state of the game that can change over time
export class SimState {
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
    name: group.name,
    maxPopulation: 0,
    highestGeneration: 0,
  }));
}
