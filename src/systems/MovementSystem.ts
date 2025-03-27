import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { Vector2D } from '../core/Vector2D';
import { SimUtils } from '../utils/SimUtils';
import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { LIFE_CONFIG } from '../core/config/LifeConfig';

export class MovementSystem extends System {
  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  update(deltaTime: number): void {
    // Use filteredEntities instead of entities - no need to check components again
    for (const entity of this.filteredEntities) {
      const life = entity.getComponent(LifeComponent);
      const position = entity.getComponent(PositionComponent);
      if (!life || !position) continue;

      if (life.dead || life.restTimer > 0) continue;

      // Random movement when no target
      if (Math.random() < 0.02) {
        const angle = SimUtils.getRandomAngle();
        const speed = SimUtils.getRandomSpeed(LIFE_CONFIG.SPEED);
        position.vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      // Update position using deltaTime
      position.pos.x += position.vel.x * deltaTime;
      position.pos.y += position.vel.y * deltaTime;

      // Keep within bounds
      const clampedPosition = SimUtils.clampPosition(position.pos, life.radius);
      position.pos = clampedPosition;
    }
  }
}
