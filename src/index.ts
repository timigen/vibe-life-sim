import { Group } from './types/Group';
import { Vector2D } from './utils/Vector2D';
import { LIFE_CONFIG } from './config/LifeConfig';
import { FOOD_CONFIG } from './config/FoodConfig';
import {
  INITIAL_POPULATION_PER_GROUP,
  INITIAL_FOOD_COUNT,
  GROUPS,
  GameState,
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

// Global variables
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = GameState.CANVAS_WIDTH;
canvas.height = GameState.CANVAS_HEIGHT;

const world = new World(INITIAL_POPULATION_PER_GROUP * GROUPS.length * 2 * 2); // Double initial size for growth
world.addSystem(new RenderingSystem(ctx));
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem());
world.addSystem(new LifecycleSystem(world));
world.addSystem(new MatingSystem(world));

function initializeSimulation(): void {
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

function updateFPS() {
  const currentTime = performance.now();
  GameState.frameCount++;

  if (currentTime - GameState.lastTime >= 1000) {
    GameState.fps = GameState.frameCount;
    GameState.frameCount = 0;
    GameState.lastTime = currentTime;
  }
}

function update() {
  if (GameState.paused) return;

  updateFPS();

  ctx.clearRect(0, 0, GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
  spawnFood();

  world.update(1); // deltaTime of 1 for now

  processEating();

  document.getElementById('populationCount')!.textContent = world.getLifeCount().toString();
  document.getElementById('fpsCounter')!.textContent = GameState.fps.toString();

  if (world.getLifeCount() === 0) {
    document.getElementById('maxPopDisplay')!.textContent = GameState.maxPopulation.toString();
    document.getElementById('finalStarvationDeaths')!.textContent = GameState.deathsByStarvation.toString();
    document.getElementById('finalOldAgeDeaths')!.textContent = GameState.deathsByOldAge.toString();
    document.getElementById('finalFPS')!.textContent = GameState.fps.toString();
    document.getElementById('gameOver')!.style.display = 'flex';
    GameState.paused = true;
    return;
  }

  if (world.getLifeCount() > GameState.maxPopulation) {
    GameState.maxPopulation = world.getLifeCount();
  }
}

function animate() {
  GameState.animationFrameId = requestAnimationFrame(animate);
  update();
}

window.addEventListener('resize', () => {
  GameState.CANVAS_WIDTH = window.innerWidth;
  GameState.CANVAS_HEIGHT = window.innerHeight;
  canvas.width = GameState.CANVAS_WIDTH;
  canvas.height = GameState.CANVAS_HEIGHT;
});

document.getElementById('toggleBtn')!.addEventListener('click', () => {
  GameState.paused = !GameState.paused;
  const btn = document.getElementById('toggleBtn')!;
  btn.textContent = GameState.paused ? '▶️' : '⏸';
  if (!GameState.paused) update();
});

// Initialize and start the simulation
initializeSimulation();
GameState.animationFrameId = requestAnimationFrame(animate);
