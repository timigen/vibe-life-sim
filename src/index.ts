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

class Life {
  public position: Vector2D;
  public velocity: Vector2D;
  public radius: number;
  public hunger: number;
  public isPregnant: boolean;
  public gestationTimer: number;
  public dead: boolean;
  public age: number;
  public restTimer: number;

  constructor(
    x: number,
    y: number,
    public group: Group,
    public sex: 'male' | 'female'
  ) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.radius = LIFE_CONFIG.INITIAL_RADIUS;
    this.hunger = 0;
    this.isPregnant = false;
    this.gestationTimer = 0;
    this.dead = false;
    this.age = 0;
    this.restTimer = 0;
  }

  update(foods: Food[]): void {
    this.age++;
    this.hunger += this.restTimer > 0 ? 0.2 : 1;

    if (this.age > LIFE_CONFIG.AGE_LIMIT) {
      this.dead = true;
      return;
    }

    if (this.restTimer <= 0 && Math.random() < LIFE_CONFIG.REST_CHANCE) {
      this.restTimer = Math.floor(
        getRandom(LIFE_CONFIG.REST_MIN_DURATION, LIFE_CONFIG.REST_MAX_DURATION)
      );
    }

    if (this.restTimer > 0) {
      this.restTimer--;
      return;
    }

    const nearestFood = this.findNearestFood(foods);

    if (nearestFood) {
      const direction = new Vector2D(
        nearestFood.position.x - this.position.x,
        nearestFood.position.y - this.position.y
      );
      const hungerScale = Math.min(2, Math.max(1, this.hunger / 100));
      direction.normalize().multiply(LIFE_CONFIG.SPEED * hungerScale);
      this.position.x += direction.x;
      this.position.y += direction.y;
    } else {
      this.position.x += (Math.random() - 0.5) * LIFE_CONFIG.SPEED * 2;
      this.position.y += (Math.random() - 0.5) * LIFE_CONFIG.SPEED * 2;
    }

    this.position.x = Math.max(
      this.radius,
      Math.min(GameState.CANVAS_WIDTH - this.radius, this.position.x)
    );
    this.position.y = Math.max(
      this.radius,
      Math.min(GameState.CANVAS_HEIGHT - this.radius, this.position.y)
    );

    if (this.hunger > LIFE_CONFIG.HUNGER_LIMIT / 2) {
      this.radius -= LIFE_CONFIG.SIZE_DECREMENT;
    }

    if (this.hunger > LIFE_CONFIG.HUNGER_LIMIT || this.radius < LIFE_CONFIG.MIN_RADIUS) {
      this.dead = true;
    }

    if (this.sex === 'female' && this.isPregnant) {
      this.gestationTimer--;
      if (this.gestationTimer <= 0) {
        this.giveBirth();
      }
    }
  }

  findNearestFood(foods: Food[]): Food | null {
    let nearestFood: Food | null = null;
    let minDist = Infinity;

    for (const food of foods) {
      const dist = this.position.distanceTo(food.position);
      if (dist < minDist) {
        minDist = dist;
        nearestFood = food;
      }
    }

    return nearestFood;
  }

  eat(): void {
    this.hunger = -LIFE_CONFIG.FULLNESS_DURATION;
    this.radius = Math.min(this.radius + LIFE_CONFIG.SIZE_INCREMENT, LIFE_CONFIG.MAX_RADIUS);
  }

  giveBirth(): void {
    const offsetX = getRandom(-5, 5);
    const offsetY = getRandom(-5, 5);
    const newSex = Math.random() < 0.5 ? ('male' as const) : ('female' as const);
    lives.push(new Life(this.position.x + offsetX, this.position.y + offsetY, this.group, newSex));
    this.isPregnant = false;
    this.gestationTimer = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.group.color;
    ctx.fill();

    ctx.lineWidth = 1;
    if (this.sex === 'male') {
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(this.position.x - this.radius / 2, this.position.y);
      ctx.lineTo(this.position.x + this.radius / 2, this.position.y);
      ctx.moveTo(this.position.x, this.position.y - this.radius / 2);
      ctx.lineTo(this.position.x, this.position.y + this.radius / 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    if (this.sex === 'female' && this.isPregnant) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (this.restTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

class Food {
  constructor(
    public position: Vector2D,
    public radius: number = FOOD_CONFIG.RADIUS
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff00ff'; // Bright magenta
    ctx.fill();
  }
}

// Global variables
const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = GameState.CANVAS_WIDTH;
canvas.height = GameState.CANVAS_HEIGHT;

let lives: Life[] = [];
let foods: Food[] = [];

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function initializeSimulation(): void {
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
      lives.push(new Life(x, y, group, 'male'));
      lives.push(new Life(x, y, group, 'female'));
    }
  }

  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const x = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    foods.push(new Food(new Vector2D(x, y)));
  }
}

function processCollisions(): void {
  const gridSize = LIFE_CONFIG.MAX_RADIUS * 2;
  const grid = new Map<string, number[]>();

  for (let i = 0; i < lives.length; i++) {
    const life = lives[i];
    if (life.dead) continue;

    const gridX = Math.floor(life.position.x / gridSize);
    const gridY = Math.floor(life.position.y / gridSize);
    const key = `${gridX},${gridY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(i);
  }

  for (const [key, indices] of grid) {
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const l1 = lives[indices[i]];
        const l2 = lives[indices[j]];
        if (l1.dead || l2.dead) continue;

        const dx = l2.position.x - l1.position.x;
        const dy = l2.position.y - l1.position.y;
        const dist = Math.hypot(dx, dy);
        const minDist = l1.radius + l2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const offsetX = (dx / dist) * overlap;
          const offsetY = (dy / dist) * overlap;
          l1.position.x -= offsetX;
          l1.position.y -= offsetY;
          l2.position.x += offsetX;
          l2.position.y += offsetY;
        }
      }
    }
  }
}

function processMating(): void {
  for (let i = 0; i < lives.length; i++) {
    for (let j = i + 1; j < lives.length; j++) {
      const a = lives[i];
      const b = lives[j];
      if (a.dead || b.dead || a.group !== b.group) continue;
      if (
        a.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING ||
        b.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING
      )
        continue;

      if ((a.sex === 'male' && b.sex === 'female') || (a.sex === 'female' && b.sex === 'male')) {
        const female = a.sex === 'female' ? a : b;
        if (!female.isPregnant && a.position.distanceTo(b.position) < LIFE_CONFIG.MATING_DISTANCE) {
          female.isPregnant = true;
          female.gestationTimer = LIFE_CONFIG.GESTATION_PERIOD;
        }
      }
    }
  }
}

function processEating(): void {
  for (let i = foods.length - 1; i >= 0; i--) {
    const food = foods[i];
    for (const life of lives) {
      if (life.position.distanceTo(food.position) < life.radius + food.radius) {
        life.eat();
        foods.splice(i, 1);
        break;
      }
    }
  }
}

function spawnFood(): void {
  const dynamicChance = Math.min(
    FOOD_CONFIG.SPAWN_BASE_CHANCE + lives.length * FOOD_CONFIG.POPULATION_SPAWN_FACTOR,
    FOOD_CONFIG.MAX_SPAWN_CHANCE
  );

  if (Math.random() < dynamicChance) {
    const x = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, GameState.CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    foods.push(new Food(new Vector2D(x, y)));
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

  for (const life of lives) {
    life.update(foods);
  }
  lives = lives.filter(l => !l.dead);

  processMating();
  processEating();
  processCollisions();

  for (const food of foods) food.draw(ctx);
  for (const life of lives) life.draw(ctx);

  document.getElementById('populationCount')!.textContent = lives.length.toString();
  document.getElementById('fpsCounter')!.textContent = GameState.fps.toString();

  if (lives.length === 0) {
    document.getElementById('maxPopDisplay')!.textContent = GameState.maxPopulation.toString();
    document.getElementById('gameOver')!.style.display = 'flex';
    GameState.paused = true;
    return;
  }

  if (lives.length > GameState.maxPopulation) {
    GameState.maxPopulation = lives.length;
  }

  GameState.animationFrameId = requestAnimationFrame(update);
}

function render() {
  // Draw lives
  for (const life of lives) {
    ctx.beginPath();
    ctx.arc(life.position.x, life.position.y, life.radius, 0, Math.PI * 2);
    ctx.fillStyle = life.group.color;
    ctx.fill();
    ctx.closePath();
  }

  // Draw foods
  for (const food of foods) {
    ctx.beginPath();
    ctx.arc(food.position.x, food.position.y, FOOD_CONFIG.RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
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

// Initialize and start simulation
initializeSimulation();
update();
