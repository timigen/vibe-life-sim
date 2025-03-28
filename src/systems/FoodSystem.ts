import { FoodComponent } from '../components/FoodComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FOOD_CONFIG } from '../core/config/FoodConfig';
import { System } from '../core/ecs/System';
import { SimUtils } from '../utils/SimUtils';
import { World } from '../core/World';
import { Entity } from '../core/ecs/Entity';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';
import { ENABLE_FOOD_SPAWNING, DEBUG_MODE } from '../constants';
import { SimState } from '../core/config/SimState';

export class FoodSystem extends System {
  private lastLogTime: number = 0;

  constructor(private world: World) {
    super();

    // Listen for food consumption events - we'll use this just for logging
    eventEmitter.on(EVENTS.FOOD_CONSUMED, async (data: any) => {
      if (data.foodEntity && DEBUG_MODE) {
        console.log('FoodSystem received FOOD_CONSUMED event');
      }
    });
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(FoodComponent) && entity.hasComponent(PositionComponent);
  }

  update(): void {
    // Make sure to remove consumed food first before spawning new food
    this.removeConsumedFood();

    // Only spawn new food if enabled and simulation is not paused
    if (ENABLE_FOOD_SPAWNING && !SimState.paused) {
      this.spawnFood();
    }

    // Log food stats periodically
    if (DEBUG_MODE) {
      const now = performance.now();
      if (now - this.lastLogTime > 5000) {
        // Log every 5 seconds
        this.logFoodStats();
        this.lastLogTime = now;
      }
    }
  }

  private spawnFood(): void {
    // Calculate population-based spawn chance
    const currentPopulation = this.world.getPopulation();
    const populationFactor = currentPopulation * FOOD_CONFIG.POPULATION_SPAWN_FACTOR;
    const spawnChance = Math.min(
      FOOD_CONFIG.MAX_SPAWN_CHANCE,
      FOOD_CONFIG.SPAWN_BASE_CHANCE + populationFactor
    );

    if (Math.random() < spawnChance) {
      const position = SimUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
      this.world.spawnFood(position.x, position.y);
    }
  }

  private removeConsumedFood(): void {
    // Get all food entities already marked as consumed to avoid redundant filtering
    const foodEntities = this.world.getFoods().filter(entity => {
      const food = entity.getComponent(FoodComponent);
      return food?.consumed === true;
    });

    if (foodEntities.length === 0) return;

    // Remove consumed food entities
    for (const entity of foodEntities) {
      this.world.removeFood(entity);
    }

    if (DEBUG_MODE && foodEntities.length > 0) {
      console.log(`FoodSystem removed ${foodEntities.length} consumed food items`);
    }
  }

  private logFoodStats(): void {
    const allFoods = this.world.getFoods();
    const consumedFoods = allFoods.filter(entity => {
      const food = entity.getComponent(FoodComponent);
      return food?.consumed === true;
    });

    console.log('=== FOOD STATS ===');
    console.log(`Total food entities: ${allFoods.length}`);
    console.log(`Consumed food entities: ${consumedFoods.length}`);
    console.log(`Active food entities: ${allFoods.length - consumedFoods.length}`);
    console.log('=================');
  }
}
