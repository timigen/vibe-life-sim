import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { LIFE_CONFIG } from '../config/LifeConfig';

export class LifecycleSystem extends System {
  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent);
  }

  update(deltaTime: number): void {
    for (const entity of this.entities) {
      const life = entity.getComponent(LifeComponent);
      if (!life) continue;

      life.age++;
      life.hunger += life.restTimer > 0 ? 0.2 : 1;

      if (
        life.age > LIFE_CONFIG.AGE_LIMIT ||
        life.hunger > LIFE_CONFIG.HUNGER_LIMIT ||
        life.radius < LIFE_CONFIG.MIN_RADIUS
      ) {
        life.dead = true;
      }

      if (life.hunger > LIFE_CONFIG.HUNGER_LIMIT / 2) {
        life.radius -= LIFE_CONFIG.SIZE_DECREMENT;
      }
    }
  }
}
