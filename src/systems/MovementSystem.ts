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
    for (const entity of this.entities) {
      const life = entity.getComponent(LifeComponent);
      const position = entity.getComponent(PositionComponent);
      if (!life || !position) continue;

      if (life.dead || life.restTimer > 0) continue;

      // Random movement when no target
      if (Math.random() < 0.02) {
        const angle = SimUtils.getRandomAngle();
        const speed = SimUtils.getRandomSpeed(LIFE_CONFIG.SPEED);
        position.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      // Update position using deltaTime
      position.position.x += position.velocity.x * deltaTime;
      position.position.y += position.velocity.y * deltaTime;

      // Keep within bounds
      const clampedPosition = SimUtils.clampPosition(position.position, life.radius);
      position.position = clampedPosition;
    }
  }
}
