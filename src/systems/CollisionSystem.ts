import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { Vector2D } from '../utils/Vector2D';

export class CollisionSystem extends System {
  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  update(deltaTime: number): void {
    // Check collisions between all pairs of life forms
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const entityA = this.entities[i];
        const entityB = this.entities[j];

        const lifeA = entityA.getComponent(LifeComponent);
        const lifeB = entityB.getComponent(LifeComponent);
        const posA = entityA.getComponent(PositionComponent);
        const posB = entityB.getComponent(PositionComponent);

        if (!lifeA || !lifeB || !posA || !posB) continue;
        if (lifeA.dead || lifeB.dead) continue;

        const distance = posA.position.distanceTo(posB.position);
        const minDistance = lifeA.radius + lifeB.radius;

        if (distance < minDistance) {
          // Calculate collision response
          const overlap = minDistance - distance;
          const direction = new Vector2D(
            posB.position.x - posA.position.x,
            posB.position.y - posA.position.y
          ).normalize();

          // Move entities apart
          const moveAmount = direction.clone().multiply(overlap / 2);
          posA.position = posA.position.clone().subtract(moveAmount);
          posB.position = posB.position.clone().add(moveAmount);

          // Adjust velocities for bouncing effect
          const relativeVelocity = posA.velocity.clone().subtract(posB.velocity);
          const normalVelocity = relativeVelocity.dot(direction);
          
          if (normalVelocity > 0) {
            const restitution = 0.5; // Bounce factor
            const impulse = normalVelocity * restitution;
            
            const impulseVector = direction.clone().multiply(impulse);
            posA.velocity = posA.velocity.clone().subtract(impulseVector);
            posB.velocity = posB.velocity.clone().add(impulseVector);
          }
        }
      }
    }
  }
} 