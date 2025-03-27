import { Group } from './types/Group';
import { LifeConfig } from './types/LifeConfig';
import { FoodConfig } from './types/FoodConfig';
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

// Global variables
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = GameState.CANVAS_WIDTH;
canvas.height = GameState.CANVAS_HEIGHT;

const world = new World(INITIAL_POPULATION_PER_GROUP * GROUPS.length * 2 * 2); // Double initial size for growth
world.addSystem(new RenderingSystem(ctx));
world.addSystem(new MovementSystem());
world.addSystem(new LifecycleSystem(world));
world.addSystem(new MatingSystem(world));

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function initializeSimulation(): void {
  // Initialize life forms
  for (const group of GROUPS) {
    for (let i = 0; i < INITIAL_POPULATION_PER_GROUP; i++) {
      const x = getRandom(
        LIFE_CONFIG.INITIAL_RADIUS,
        GameState.CANVAS_WIDTH - LIFE_CONFIG.INITIAL_RADIUS
      );
      const y = getRandom(
        LIFE_CONFIG.INITIAL_RADIUS,
        GameState.CANVAS_HEIGHT - LIFE_CONFIG.INITIAL_RADIUS
      );
      world.spawnLife(x, y, group, 'male');
      world.spawnLife(x, y, group, 'female');
    }
  }

  // Initialize food
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const x = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    world.spawnFood(x, y);
  }
}

function spawnFood(): void {
  if (Math.random() < FOOD_CONFIG.SPAWN_BASE_CHANCE) {
    const x = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    world.spawnFood(x, y);
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
    document.getElementById('gameOver')!.style.display = 'flex';
    GameState.paused = true;
    return;
  }

  if (world.getLifeCount() > GameState.maxPopulation) {
    GameState.maxPopulation = world.getLifeCount();
  }
}

function render() {
  // Draw lives
  const entities = world.getEntities();
  for (const entity of entities) {
    if (!entity.hasComponent(LifeComponent)) continue;

    const life = entity.getComponent(LifeComponent)!;
    const position = entity.getComponent(PositionComponent)!;

    ctx.beginPath();
    ctx.arc(position.position.x, position.position.y, life.radius, 0, Math.PI * 2);
    ctx.fillStyle = life.group.color;
    ctx.fill();
    ctx.closePath();

    // Draw sex indicators
    if (life.sex === 'male') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(position.position.x - life.radius / 2, position.position.y);
      ctx.lineTo(position.position.x + life.radius / 2, position.position.y);
      ctx.moveTo(position.position.x, position.position.y - life.radius / 2);
      ctx.lineTo(position.position.x, position.position.y + life.radius / 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(position.position.x, position.position.y, life.radius / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Draw pregnancy indicator
    if (life.sex === 'female' && life.isPregnant) {
      ctx.beginPath();
      ctx.arc(position.position.x, position.position.y, life.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw rest indicator
    if (life.restTimer > 0) {
      ctx.beginPath();
      ctx.arc(position.position.x, position.position.y, life.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw foods
  for (const food of world.getFoods()) {
    const position = food.getComponent(PositionComponent)!;
    const foodComponent = food.getComponent(FoodComponent)!;
    ctx.beginPath();
    ctx.arc(position.position.x, position.position.y, foodComponent.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff00ff';
    ctx.fill();
    ctx.closePath();
  }
}

function animate() {
  GameState.animationFrameId = requestAnimationFrame(animate);
  update();
  render();
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
