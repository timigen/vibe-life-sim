import { FoodComponent } from '../components/FoodComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FOOD_CONFIG } from '../core/config/FoodConfig';
import { System } from '../core/ecs/System';
import { SimUtils } from '../utils/SimUtils';
import { World } from '../core/World';
import { Entity } from '../core/ecs/Entity';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';
import { ENABLE_FOOD_SPAWNING } from '../constants';
import { SimState } from '../core/config/SimState';

export class FoodSystem extends System {
  constructor(private world: World) {
    super();

    // Listen for food consumption events to remove the consumed food
    eventEmitter.on(EVENTS.FOOD_CONSUMED, async (data: any) => {
      if (data.foodEntity) {
        const food = data.foodEntity.getComponent(FoodComponent);
        if (food) {
          food.consumed = true;
          this.world.removeFood(data.foodEntity);
        }
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
    // Check for food marked as consumed and remove it immediately
    // Use a reverse loop to safely remove entities during iteration
    for (let i = this.filteredEntities.length - 1; i >= 0; i--) {
      const entity = this.filteredEntities[i];
      const food = entity.getComponent(FoodComponent);
      if (food?.consumed) {
        this.world.removeFood(entity);
      }
    }
  }
}
