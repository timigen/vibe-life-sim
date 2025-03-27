import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { LIFE_CONFIG } from '../config/LifeConfig';
import { GameState } from '../config/constants';
import { Vector2D } from '../utils/Vector2D';

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
        const angle = Math.random() * Math.PI * 2;
        const speed = LIFE_CONFIG.SPEED * (1 + Math.random());
        position.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      // Update position
      position.position.x += position.velocity.x;
      position.position.y += position.velocity.y;

      // Keep within bounds using current canvas dimensions
      position.position.x = Math.max(
        life.radius,
        Math.min(GameState.CANVAS_WIDTH - life.radius, position.position.x)
      );
      position.position.y = Math.max(
        life.radius,
        Math.min(GameState.CANVAS_HEIGHT - life.radius, position.position.y)
      );
    }
  }
}
