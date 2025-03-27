import { FoodComponent } from '../components/FoodComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FOOD_CONFIG } from '../core/config/FoodConfig';
import { System } from '../core/ecs/System';
import { SimUtils } from '../utils/SimUtils';
import { World } from '../core/World';
import { Entity } from '../core/ecs/Entity';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';

export class FoodSystem extends System {
  constructor(private world: World) {
    super();
    
    // Listen for food consumption events to remove the consumed food
    eventEmitter.on(EVENTS.FOOD_CONSUMED, async (data: any) => {
      if (data.foodEntity) {
        this.world.removeEntity(data.foodEntity);
      }
    });
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(FoodComponent) && entity.hasComponent(PositionComponent);
  }

  update(): void {
    this.spawnFood();
    this.removeConsumedFood();
  }

  private spawnFood(): void {
    if (Math.random() < FOOD_CONFIG.SPAWN_BASE_CHANCE) {
      const position = SimUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
      this.world.spawnFood(position.x, position.y);
    }
  }

  private removeConsumedFood(): void {
    // Check for food marked as consumed and remove it
    for (const entity of this.filteredEntities) {
      const food = entity.getComponent(FoodComponent);
      if (food?.consumed) {
        this.world.removeEntity(entity);
      }
    }
  }
} 