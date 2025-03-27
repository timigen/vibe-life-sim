import { Group } from './types/Group';

// Game initialization constants
export const INITIAL_POPULATION_PER_GROUP = 6;
export const INITIAL_FOOD_COUNT = 30;
export const NUMBER_OF_GROUPS = 2;
export let CANVAS_WIDTH = window.innerWidth;
export let CANVAS_HEIGHT = window.innerHeight;


// Array of groups with their respective colors
export const GROUPS: Group[] = [
  { color: '#ff0000', name: '0' }, // Red
  { color: '#00ff00', name: '1' }, // Green
  { color: '#0000ff', name: '2' }, // Blue
].slice(0, NUMBER_OF_GROUPS);

export function updateCanvasSize(width: number, height: number): void {
  CANVAS_WIDTH = width;
  CANVAS_HEIGHT = height;
}
