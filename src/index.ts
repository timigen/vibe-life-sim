import { Group } from './types/Group';
import { Vector2D } from './utils/Vector2D';
import { LIFE_CONFIG } from './config/LifeConfig';
import { FOOD_CONFIG } from './config/FoodConfig';
import {
  INITIAL_POPULATION_PER_GROUP,
  INITIAL_FOOD_COUNT,
  GROUPS,
  SimulationState,
} from './config/constants';
import { World } from './ecs/World';
import { Entity } from './ecs/Entity';
import { FoodComponent } from './components/FoodComponent';
import { PositionComponent } from './components/PositionComponent';
import { LifeComponent } from './components/LifeComponent';
import { RenderingSystem } from './systems/RenderingSystem';
import { MovementSystem } from './systems/MovementSystem';
import { LifecycleSystem } from './systems/LifecycleSystem';
import { MatingSystem } from './systems/MatingSystem';
import { GameUtils } from './utils/GameUtils';
import { CollisionSystem } from './systems/CollisionSystem';
import { UISystem } from './systems/UISystem';

// Global variables
const TARGET_FRAME_TIME = 1000 / 60; // Target 60 FPS
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = SimulationState.CANVAS_WIDTH;
canvas.height = SimulationState.CANVAS_HEIGHT;

const world = new World(INITIAL_POPULATION_PER_GROUP * GROUPS.length * 2 * 2); // Double initial size for growth
const uiSystem = new UISystem(world);
world.addSystem(new RenderingSystem(ctx));
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem());
world.addSystem(new LifecycleSystem(world, uiSystem));
world.addSystem(new MatingSystem(world));
world.addSystem(uiSystem);

// Could be updated to load resources asynchronously
async function initializeSimulation(): Promise<void> {
  // Initialize life forms
  for (const group of GROUPS) {
    for (let i = 0; i < INITIAL_POPULATION_PER_GROUP; i++) {
      const position = GameUtils.getRandomPosition(LIFE_CONFIG.INITIAL_RADIUS);
      world.spawnLife(position.x, position.y, group, 'male');
      world.spawnLife(position.x, position.y, group, 'female');
    }
  }

  // Initialize food
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const position = GameUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
    world.spawnFood(position.x, position.y);
  }
}

function spawnFood(): void {
  if (Math.random() < FOOD_CONFIG.SPAWN_BASE_CHANCE) {
    const position = GameUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
    world.spawnFood(position.x, position.y);
  }
}

function processEating(): void {
  const entities = world.getEntities();
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    if (!entity.hasComponent(FoodComponent)) continue;

    const foodPos = entity.getComponent(PositionComponent)!;
    const foodComponent = entity.getComponent(FoodComponent)!;

    for (const lifeEntity of entities) {
      if (!lifeEntity.hasComponent(LifeComponent)) continue;

      const life = lifeEntity.getComponent(LifeComponent)!;
      const lifePos = lifeEntity.getComponent(PositionComponent)!;

      if (lifePos.position.distanceTo(foodPos.position) < life.radius + foodComponent.radius) {
        life.hunger = -LIFE_CONFIG.FULLNESS_DURATION;
        life.radius = Math.min(life.radius + LIFE_CONFIG.SIZE_INCREMENT, LIFE_CONFIG.MAX_RADIUS);

        world.removeEntity(entity);
        break;
      }
    }
  }
}

function update(deltaTime: number) {
  if (SimulationState.paused) return;

  ctx.clearRect(0, 0, SimulationState.CANVAS_WIDTH, SimulationState.CANVAS_HEIGHT);
  spawnFood();

  world.update(deltaTime);

  processEating();

  if (world.getLifeCount() === 0) {
    SimulationState.paused = true;
    return;
  }

  if (world.getLifeCount() > SimulationState.maxPopulation) {
    SimulationState.maxPopulation = world.getLifeCount();
  }
}

async function animate(): Promise<void> {
  while (!SimulationState.paused) {
    const now = performance.now();
    const deltaTime = now - SimulationState.lastTime;

    // Use setTimeout to maintain consistent frame rate
    if (deltaTime < TARGET_FRAME_TIME) {
      await new Promise(resolve => setTimeout(resolve, TARGET_FRAME_TIME - deltaTime));
    }

    await update(deltaTime);
    SimulationState.lastTime = performance.now();
    requestAnimationFrame(animate);
  }
}

window.addEventListener('resize', () => {
  SimulationState.CANVAS_WIDTH = window.innerWidth;
  SimulationState.CANVAS_HEIGHT = window.innerHeight;
  canvas.width = SimulationState.CANVAS_WIDTH;
  canvas.height = SimulationState.CANVAS_HEIGHT;
});

document.getElementById('toggleBtn')!.addEventListener('click', () => {
  SimulationState.paused = !SimulationState.paused;
  const btn = document.getElementById('toggleBtn')!;
  btn.textContent = SimulationState.paused ? '▶️' : '⏸';
  if (!SimulationState.paused) animate();
});

// Initialize and start the simulation
initializeSimulation();
animate();
