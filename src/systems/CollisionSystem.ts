import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { Vector2D } from '../core/Vector2D';
import { SpatialGrid } from '../core/SpatialGrid';
import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';

export class CollisionSystem extends System {
  private spatialGrid: SpatialGrid;

  constructor() {
    super();
    this.spatialGrid = new SpatialGrid(50); // Cell size of 50 pixels
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  async update(deltaTime: number): Promise<void> {
    const BATCH_SIZE = 100;
    const entities = [...this.entities];

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const batch = entities.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch);

      // Allow other tasks to run between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  private async processBatch(batch: Entity[]): Promise<void> {
    // Update spatial grid with current entity positions
    this.spatialGrid.update(batch);

    // Process collisions using spatial grid
    const processedPairs = new Set<string>();

    for (const entityA of batch) {
      const potentialCollisions = this.spatialGrid.getPotentialCollisions(entityA);

      for (const entityB of potentialCollisions) {
        // Avoid processing the same pair twice
        const pairKey = [entityA.id, entityB.id].sort().join(',');
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

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
