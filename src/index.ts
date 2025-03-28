import { FOOD_CONFIG } from './core/config/FoodConfig';
import { FoodComponent } from './components/FoodComponent';
import { PositionComponent } from './components/PositionComponent';
import { LifeComponent } from './components/LifeComponent';
import { RenderingSystem } from './systems/RenderingSystem';
import { MovementSystem } from './systems/MovementSystem';
import { LifecycleSystem } from './systems/LifecycleSystem';
import { MatingSystem } from './systems/MatingSystem';
import { SimUtils } from './utils/SimUtils';
import { CollisionSystem } from './systems/CollisionSystem';
import { UISystem } from './systems/UISystem';
import { World } from './core/World';
import { SimState } from './core/config/SimState';
import { LIFE_CONFIG } from './core/config/LifeConfig';
import { FoodSystem } from './systems/FoodSystem';
import { eventEmitter, EVENTS } from './core/events/EventEmitter';
import { StatisticsSystem } from './systems/StatisticsSystem';
import {
  INITIAL_POPULATION_PER_GROUP,
  GROUPS,
  INITIAL_FOOD_COUNT,
  ENABLE_FOOD_SPAWNING,
  CORPSES_BECOME_FOOD,
} from './constants';

// Global variables
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = SimState.CANVAS_WIDTH;
canvas.height = SimState.CANVAS_HEIGHT;

const world = new World(INITIAL_POPULATION_PER_GROUP * GROUPS.length * 2 * 2); // Double initial size for growth
const uiSystem = new UISystem(world);
const foodSystem = new FoodSystem(world);
const collisionSystem = new CollisionSystem();

// Add systems in priority order
world.addSystem(collisionSystem); // Collision detection first
world.addSystem(foodSystem); // Food system second to handle consumed food
world.addSystem(new LifecycleSystem(world));
world.addSystem(new MatingSystem(world));
world.addSystem(new MovementSystem());
world.addSystem(new RenderingSystem(ctx));
world.addSystem(uiSystem);
world.addSystem(new StatisticsSystem());

// Could be updated to load resources asynchronously
async function initializeSimulation(): Promise<void> {
  // Initialize life forms
  for (const group of GROUPS) {
    for (let i = 0; i < INITIAL_POPULATION_PER_GROUP; i++) {
      const position = SimUtils.getRandomPosition(LIFE_CONFIG.INITIAL_RADIUS);
      world.spawnLife(position.x, position.y, group, 'male');
      world.spawnLife(position.x, position.y, group, 'female');
    }
  }

  // Initialize food
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const position = SimUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
    world.spawnFood(position.x, position.y);
  }
}

function update(deltaTime: number) {
  if (SimState.paused) return;

  // Limit deltaTime to prevent huge jumps after being paused
  const limitedDeltaTime = Math.min(deltaTime, 33); // Cap at about 30 FPS worth of time

  ctx.clearRect(0, 0, SimState.CANVAS_WIDTH, SimState.CANVAS_HEIGHT);
  world.update(limitedDeltaTime);

  if (world.getPopulation() === 0) {
    setPaused(true);
    return;
  }

  if (world.getPopulation() > SimState.maxPopulation) {
    SimState.maxPopulation = world.getPopulation();
  }
}

function setPaused(paused: boolean): void {
  SimState.paused = paused;
  const btn = document.getElementById('toggleBtn')!;
  const statusElement = document.getElementById('pauseStatus')!;

  btn.textContent = SimState.paused ? '▶️' : '⏸';
  statusElement.textContent = SimState.paused ? 'PAUSED' : 'RUNNING';
  statusElement.style.color = SimState.paused ? '#ff4444' : '#4CAF50';

  if (paused) {
    eventEmitter.emit(EVENTS.SIM_PAUSED, {});
  } else {
    // Reset the last time when resuming to prevent huge deltaTime
    SimState.lastTime = performance.now();
    eventEmitter.emit(EVENTS.SIM_RESUMED, {});
    animate();
  }
}

async function animate(): Promise<void> {
  const now = performance.now();
  const deltaTime = now - SimState.lastTime;

  await update(deltaTime);
  SimState.lastTime = performance.now();

  if (!SimState.paused) {
    requestAnimationFrame(animate);
  }
}

window.addEventListener('resize', () => {
  SimState.CANVAS_WIDTH = window.innerWidth;
  SimState.CANVAS_HEIGHT = window.innerHeight;
  canvas.width = SimState.CANVAS_WIDTH;
  canvas.height = SimState.CANVAS_HEIGHT;
});

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    setPaused(!SimState.paused);
  }
});

// Add click handler for the toggle button
document.getElementById('toggleBtn')!.addEventListener('click', () => {
  setPaused(!SimState.paused);
});

// Listen for population changes to end simulation when population is 0
eventEmitter.on(EVENTS.POPULATION_CHANGED, async (data: any) => {
  if (data.population === 0) {
    setPaused(true);
  }
});

// Initialize and start the simulation
initializeSimulation();

// Initial render to show the starting state - use deltaTime=0 to avoid affecting hunger/age
ctx.clearRect(0, 0, SimState.CANVAS_WIDTH, SimState.CANVAS_HEIGHT);

// Temporarily set paused to false just for rendering, then restore it
const wasPaused = SimState.paused;
SimState.paused = false;
world.update(0); // Use 0 for deltaTime to avoid affecting hunger/age
SimState.paused = wasPaused;

// Notify population change for UI
eventEmitter.emit(EVENTS.POPULATION_CHANGED, {
  population: world.getPopulation(),
});

// Update food spawning status indicator
const foodSpawningStatus = document.getElementById('foodSpawningStatus')!;
foodSpawningStatus.textContent = ENABLE_FOOD_SPAWNING ? 'ENABLED' : 'DISABLED';
foodSpawningStatus.style.color = ENABLE_FOOD_SPAWNING ? '#4CAF50' : '#ff4444';

// Update corpses to food status indicator
const corpsesFoodStatus = document.getElementById('corpsesFoodStatus')!;
corpsesFoodStatus.textContent = CORPSES_BECOME_FOOD ? 'ENABLED' : 'DISABLED';
corpsesFoodStatus.style.color = CORPSES_BECOME_FOOD ? '#4CAF50' : '#ff4444';

// Only start animation if not paused
if (!SimState.paused) {
  animate();
}

// Initialize the toggle button state
document.getElementById('toggleBtn')!.textContent = SimState.paused ? '▶️' : '⏸';
