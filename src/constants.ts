import { Group } from './core/types/Group';

export let CANVAS_WIDTH = window.innerWidth;
export let CANVAS_HEIGHT = window.innerHeight;

// Game initialization constants
export const NUMBER_OF_GROUPS = 2;
export const INITIAL_POPULATION_PER_GROUP = 10;
export const INITIAL_FOOD_COUNT = 20;
export const ENABLE_FOOD_SPAWNING = false; // Controls whether food spawns after initialization
export const CORPSES_BECOME_FOOD = false; // Controls whether dead life forms convert to food

// Array of groups with their respective colors
export const GROUPS: Group[] = [
  { color: '#FFB7B2', name: 'PINK' }, // Pink
  { color: '#B5EAD7', name: 'GREEN' }, // Green
  { color: '#AEC6CF', name: 'BLUE' }, // Blue
].slice(0, NUMBER_OF_GROUPS);
