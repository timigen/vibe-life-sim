import { FOOD_CONFIG } from './core/config/FoodConfig';
import { INITIAL_POPULATION_PER_GROUP, INITIAL_FOOD_COUNT, GROUPS } from './core/constants';
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

// Global variables
const TARGET_FRAME_TIME = 1000 / 60; // Target 60 FPS
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = SimState.CANVAS_WIDTH;
canvas.height = SimState.CANVAS_HEIGHT;

const world = new World(INITIAL_POPULATION_PER_GROUP * GROUPS.length * 2 * 2); // Double initial size for growth
const uiSystem = new UISystem(world);
const foodSystem = new FoodSystem(world);
world.addSystem(new RenderingSystem(ctx));
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem());
world.addSystem(new LifecycleSystem(world, uiSystem));
world.addSystem(new MatingSystem(world));
world.addSystem(foodSystem);
world.addSystem(uiSystem);

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

  ctx.clearRect(0, 0, SimState.CANVAS_WIDTH, SimState.CANVAS_HEIGHT);
  world.update(deltaTime);

  if (world.getPopulation() === 0) {
    SimState.paused = true;
    return;
  }

  if (world.getPopulation() > SimState.maxPopulation) {
    SimState.maxPopulation = world.getPopulation();
  }
}

async function animate(): Promise<void> {
  const now = performance.now();
  const deltaTime = now - SimState.lastTime;

  // Use setTimeout to maintain consistent frame rate
  if (deltaTime < TARGET_FRAME_TIME) {
    await new Promise(resolve => setTimeout(resolve, TARGET_FRAME_TIME - deltaTime));
  }

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
    SimState.paused = !SimState.paused;
    const btn = document.getElementById('toggleBtn')!;
    btn.textContent = SimState.paused ? '▶️' : '⏸';
    if (!SimState.paused) animate();
  }
});

// Initialize and start the simulation
initializeSimulation();
animate();
