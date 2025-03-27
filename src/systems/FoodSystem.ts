import { FoodComponent } from '../components/FoodComponent';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FOOD_CONFIG } from '../core/config/FoodConfig';
import { LIFE_CONFIG } from '../core/config/LifeConfig';
import { System } from '../core/ecs/System';
import { SimUtils } from '../utils/SimUtils';
import { World } from '../core/World';
import { Entity } from '../core/ecs/Entity';

export class FoodSystem extends System {
  constructor(private world: World) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(FoodComponent) && entity.hasComponent(PositionComponent);
  }

  update(): void {
    this.spawnFood();
    this.processEating();
  }

  private spawnFood(): void {
    if (Math.random() < FOOD_CONFIG.SPAWN_BASE_CHANCE) {
      const position = SimUtils.getRandomPosition(FOOD_CONFIG.RADIUS);
      this.world.spawnFood(position.x, position.y);
    }
  }

  private processEating(): void {
    const entities = this.world.getEntities();
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (!entity.hasComponent(FoodComponent)) continue;

      const foodPos = entity.getComponent(PositionComponent)!;
      const foodComponent = entity.getComponent(FoodComponent)!;

      for (const lifeEntity of entities) {
        if (!lifeEntity.hasComponent(LifeComponent)) continue;

        const life = lifeEntity.getComponent(LifeComponent)!;
        const lifePos = lifeEntity.getComponent(PositionComponent)!;

        if (lifePos.pos.distanceTo(foodPos.pos) < life.radius + foodComponent.radius) {
          life.hunger = -LIFE_CONFIG.FULLNESS_DURATION;
          life.radius = Math.min(life.radius + LIFE_CONFIG.SIZE_INCREMENT, LIFE_CONFIG.MAX_RADIUS);

          this.world.removeEntity(entity);
          break;
        }
      }
    }
  }
} 