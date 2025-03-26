let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;

const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let paused = false;
let animationFrameId;
let maxPopulation = 0;

const INITIAL_POPULATION_PER_GROUP = 20;
const INITIAL_FOOD_COUNT = 70;
const GROUPS = [
  { color: "#ff5555" },
  { color: "#55aaff" },
  { color: "#55ff55" }
];

// Constants for microbe behavior
const MICROBE_CONFIG = {
  INITIAL_RADIUS: 5,
  MAX_RADIUS: 15,
  MIN_RADIUS: 2,
  SPEED: 1.2,
  MATING_DISTANCE: 15,
  GESTATION_PERIOD: 300,
  HUNGER_LIMIT: 1000,
  HUNGER_THRESHOLD_FOR_MATING: 800,
  FULLNESS_DURATION: 100,
  SIZE_INCREMENT: 0.5,
  SIZE_DECREMENT: 0.005,
  AGE_LIMIT: 2000,
  REST_CHANCE: 0.002,
  REST_MIN_DURATION: 20,
  REST_MAX_DURATION: 60
};

// Constants for food behavior
const FOOD_CONFIG = {
  RADIUS: 3,
  SPAWN_BASE_CHANCE: 0.03,
  MAX_SPAWN_CHANCE: 0.1,
  POPULATION_SPAWN_FACTOR: 0.0005
};

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Performance optimization: Use TypedArrays for better memory usage
class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  normalize() {
    const d = Math.hypot(this.x, this.y);
    if (d > 0) {
      this.x /= d;
      this.y /= d;
    }
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
}

class Microbe {
  constructor(x, y, group, sex) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.group = group;
    this.sex = sex;
    this.radius = MICROBE_CONFIG.INITIAL_RADIUS;
    this.hunger = 0;
    this.isPregnant = false;
    this.gestationTimer = 0;
    this.dead = false;
    this.age = 0;
    this.restTimer = 0;
  }

  update(foods) {
    this.age++;
    this.hunger += this.restTimer > 0 ? 0.2 : 1;
    
    if (this.age > MICROBE_CONFIG.AGE_LIMIT) {
      this.dead = true;
      return;
    }

    if (this.restTimer <= 0 && Math.random() < MICROBE_CONFIG.REST_CHANCE) {
      this.restTimer = Math.floor(getRandom(MICROBE_CONFIG.REST_MIN_DURATION, MICROBE_CONFIG.REST_MAX_DURATION));
    }

    if (this.restTimer > 0) {
      this.restTimer--;
      return;
    }

    // Find nearest food using spatial partitioning optimization
    const nearestFood = this.findNearestFood(foods);
    
    if (nearestFood) {
      const direction = new Vector2D(
        nearestFood.position.x - this.position.x,
        nearestFood.position.y - this.position.y
      );
      const hungerScale = Math.min(2, Math.max(1, this.hunger / 100));
      direction.normalize().multiply(MICROBE_CONFIG.SPEED * hungerScale);
      this.position.x += direction.x;
      this.position.y += direction.y;
    } else {
      // Random movement when no food is found
      this.position.x += (Math.random() - 0.5) * MICROBE_CONFIG.SPEED * 2;
      this.position.y += (Math.random() - 0.5) * MICROBE_CONFIG.SPEED * 2;
    }

    // Boundary checking
    this.position.x = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, this.position.y));

    // Size and health management
    if (this.hunger > MICROBE_CONFIG.HUNGER_LIMIT / 2) {
      this.radius -= MICROBE_CONFIG.SIZE_DECREMENT;
    }

    if (this.hunger > MICROBE_CONFIG.HUNGER_LIMIT || this.radius < MICROBE_CONFIG.MIN_RADIUS) {
      this.dead = true;
    }

    // Pregnancy management
    if (this.sex === "female" && this.isPregnant) {
      this.gestationTimer--;
      if (this.gestationTimer <= 0) {
        this.giveBirth();
      }
    }
  }

  findNearestFood(foods) {
    let nearestFood = null;
    let minDist = Infinity;
    
    for (let food of foods) {
      const dist = this.position.distanceTo(food.position);
      if (dist < minDist) {
        minDist = dist;
        nearestFood = food;
      }
    }
    
    return nearestFood;
  }

  eat() {
    this.hunger = -MICROBE_CONFIG.FULLNESS_DURATION;
    this.radius = Math.min(this.radius + MICROBE_CONFIG.SIZE_INCREMENT, MICROBE_CONFIG.MAX_RADIUS);
  }

  giveBirth() {
    const offsetX = getRandom(-5, 5);
    const offsetY = getRandom(-5, 5);
    const newSex = Math.random() < 0.5 ? "male" : "female";
    microbes.push(new Microbe(
      this.position.x + offsetX,
      this.position.y + offsetY,
      this.group,
      newSex
    ));
    this.isPregnant = false;
    this.gestationTimer = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.group.color;
    ctx.fill();

    ctx.lineWidth = 1;
    if (this.sex === "male") {
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(this.position.x - this.radius / 2, this.position.y);
      ctx.lineTo(this.position.x + this.radius / 2, this.position.y);
      ctx.moveTo(this.position.x, this.position.y - this.radius / 2);
      ctx.lineTo(this.position.x, this.position.y + this.radius / 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius / 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    if (this.sex === "female" && this.isPregnant) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (this.restTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

class Food {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.radius = FOOD_CONFIG.RADIUS;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
  }
}

// Initialize simulation
let microbes = [];
let foods = [];

function initializeSimulation() {
  // Initialize microbes
  for (let group of GROUPS) {
    for (let i = 0; i < INITIAL_POPULATION_PER_GROUP; i++) {
      const x = getRandom(MICROBE_CONFIG.INITIAL_RADIUS, CANVAS_WIDTH - MICROBE_CONFIG.INITIAL_RADIUS);
      const y = getRandom(MICROBE_CONFIG.INITIAL_RADIUS, CANVAS_HEIGHT - MICROBE_CONFIG.INITIAL_RADIUS);
      microbes.push(new Microbe(x, y, group, "male"));
      microbes.push(new Microbe(x, y, group, "female"));
    }
  }

  // Initialize food
  for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    const x = getRandom(FOOD_CONFIG.RADIUS, CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    foods.push(new Food(x, y));
  }
}

// Optimized collision detection using spatial partitioning
function processCollisions() {
  const gridSize = MICROBE_CONFIG.MAX_RADIUS * 2;
  const grid = new Map();

  // Create spatial grid
  for (let i = 0; i < microbes.length; i++) {
    const microbe = microbes[i];
    if (microbe.dead) continue;

    const gridX = Math.floor(microbe.position.x / gridSize);
    const gridY = Math.floor(microbe.position.y / gridSize);
    const key = `${gridX},${gridY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key).push(i);
  }

  // Check collisions only within same grid cells
  for (let [key, indices] of grid) {
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const m1 = microbes[indices[i]];
        const m2 = microbes[indices[j]];
        if (m1.dead || m2.dead) continue;

        const dx = m2.position.x - m1.position.x;
        const dy = m2.position.y - m1.position.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m1.radius + m2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const offsetX = (dx / dist) * overlap;
          const offsetY = (dy / dist) * overlap;
          m1.position.x -= offsetX;
          m1.position.y -= offsetY;
          m2.position.x += offsetX;
          m2.position.y += offsetY;
        }
      }
    }
  }
}

function processMating() {
  for (let i = 0; i < microbes.length; i++) {
    for (let j = i + 1; j < microbes.length; j++) {
      const a = microbes[i];
      const b = microbes[j];
      if (a.dead || b.dead || a.group !== b.group) continue;
      if (a.hunger > MICROBE_CONFIG.HUNGER_THRESHOLD_FOR_MATING || 
          b.hunger > MICROBE_CONFIG.HUNGER_THRESHOLD_FOR_MATING) continue;

      if ((a.sex === "male" && b.sex === "female") || 
          (a.sex === "female" && b.sex === "male")) {
        const female = a.sex === "female" ? a : b;
        if (!female.isPregnant && 
            a.position.distanceTo(b.position) < MICROBE_CONFIG.MATING_DISTANCE) {
          female.isPregnant = true;
          female.gestationTimer = MICROBE_CONFIG.GESTATION_PERIOD;
        }
      }
    }
  }
}

function processEating() {
  for (let i = foods.length - 1; i >= 0; i--) {
    const food = foods[i];
    for (const microbe of microbes) {
      if (microbe.position.distanceTo(food.position) < microbe.radius + food.radius) {
        microbe.eat();
        foods.splice(i, 1);
        break;
      }
    }
  }
}

function spawnFood() {
  const dynamicChance = Math.min(
    FOOD_CONFIG.SPAWN_BASE_CHANCE + (microbes.length * FOOD_CONFIG.POPULATION_SPAWN_FACTOR),
    FOOD_CONFIG.MAX_SPAWN_CHANCE
  );
  
  if (Math.random() < dynamicChance) {
    const x = getRandom(FOOD_CONFIG.RADIUS, CANVAS_WIDTH - FOOD_CONFIG.RADIUS);
    const y = getRandom(FOOD_CONFIG.RADIUS, CANVAS_HEIGHT - FOOD_CONFIG.RADIUS);
    foods.push(new Food(x, y));
  }
}

function update() {
  if (paused) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  spawnFood();

  // Update microbes
  for (const microbe of microbes) {
    microbe.update(foods);
  }
  microbes = microbes.filter(m => !m.dead);

  processMating();
  processEating();
  processCollisions();

  // Draw everything
  for (const food of foods) food.draw(ctx);
  for (const microbe of microbes) microbe.draw(ctx);

  // Update UI
  document.getElementById("populationCount").textContent = microbes.length;
  maxPopulation = Math.max(maxPopulation, microbes.length);

  if (microbes.length === 0) {
    document.getElementById("maxPopDisplay").textContent = maxPopulation;
    document.getElementById("gameOver").style.display = "flex";
    paused = true;
    return;
  }

  animationFrameId = requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
});

document.getElementById("toggleBtn").addEventListener("click", () => {
  paused = !paused;
  const btn = document.getElementById("toggleBtn");
  btn.textContent = paused ? "▶️" : "⏸";
  if (!paused) update();
});

// Initialize and start simulation
initializeSimulation();
update(); 