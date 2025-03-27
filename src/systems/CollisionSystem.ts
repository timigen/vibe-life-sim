import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FoodComponent } from '../components/FoodComponent';
import { Vector2D } from '../core/Vector2D';
import { SpatialGrid } from '../core/SpatialGrid';
import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';

export class CollisionSystem extends System {
  private spatialGrid: SpatialGrid;
  private allEntities: Entity[] = [];

  constructor() {
    super();
    this.spatialGrid = new SpatialGrid(50); // Cell size of 50 pixels
  }

  shouldProcessEntity(entity: Entity): boolean {
    // We want to process both life entities and food entities for collision detection
    return (
      entity.hasComponent(PositionComponent) &&
      (entity.hasComponent(LifeComponent) || entity.hasComponent(FoodComponent))
    );
  }

  async update(deltaTime: number): Promise<void> {
    const BATCH_SIZE = 100;
    // Use all filtered entities for collision detection
    this.allEntities = [...this.filteredEntities];
    const lifeEntities = this.allEntities.filter(e => e.hasComponent(LifeComponent));

    // Update spatial grid with all entities positions
    this.spatialGrid.update(this.allEntities);

    for (let i = 0; i < lifeEntities.length; i += BATCH_SIZE) {
      const batch = lifeEntities.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch);

      // Allow other tasks to run between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  private async processBatch(batch: Entity[]): Promise<void> {
    // Process collisions using spatial grid
    const processedPairs = new Set<string>();

    for (const entityA of batch) {
      const potentialCollisions = this.spatialGrid.getPotentialCollisions(entityA);

      for (const entityB of potentialCollisions) {
        // Avoid processing the same pair twice
        const pairKey = [entityA.id, entityB.id].sort().join(',');
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        const posA = entityA.getComponent(PositionComponent);
        const posB = entityB.getComponent(PositionComponent);
        if (!posA || !posB) continue;

        // Check if this is a life-food collision
        const lifeA = entityA.getComponent(LifeComponent);
        const foodB = entityB.getComponent(FoodComponent);

        if (lifeA && foodB) {
          // Process food consumption
          this.processLifeFoodCollision(entityA, entityB, posA, posB);
          continue;
        }

        // Check for the reverse case
        const lifeB = entityB.getComponent(LifeComponent);
        const foodA = entityA.getComponent(FoodComponent);

        if (lifeB && foodA) {
          // Process food consumption (reversed)
          this.processLifeFoodCollision(entityB, entityA, posB, posA);
          continue;
        }

        // If both entities are life entities, process regular collision
        if (lifeA && lifeB) {
          this.processLifeLifeCollision(entityA, entityB, lifeA, lifeB, posA, posB);
        }
      }
    }
  }

  private processLifeFoodCollision(
    lifeEntity: Entity,
    foodEntity: Entity,
    lifePos: PositionComponent,
    foodPos: PositionComponent
  ): void {
    const life = lifeEntity.getComponent(LifeComponent);
    const food = foodEntity.getComponent(FoodComponent);

    if (!life || !food || life.dead || food.consumed) return;

    const distance = lifePos.pos.distanceTo(foodPos.pos);
    const minDistance = life.radius + food.radius;

    if (distance < minDistance) {
      // Food is consumed
      life.hunger = Math.max(0, life.hunger - 400); // Reduce hunger by a significant amount

      // Mark the entity for removal immediately
      food.consumed = true;

      // Get the world reference from the entity
      const world = foodEntity.getWorld();
      if (world) {
        world.removeFood(foodEntity);
      }

      // Emit food consumed event
      eventEmitter.emit(EVENTS.FOOD_CONSUMED, {
        lifeEntity,
        foodEntity,
        position: { x: foodPos.pos.x, y: foodPos.pos.y },
      });
    }
  }

  private processLifeLifeCollision(
    entityA: Entity,
    entityB: Entity,
    lifeA: LifeComponent,
    lifeB: LifeComponent,
    posA: PositionComponent,
    posB: PositionComponent
  ): void {
    if (lifeA.dead || lifeB.dead) return;

    const distance = posA.pos.distanceTo(posB.pos);
    const minDistance = lifeA.radius + lifeB.radius;

    if (distance < minDistance) {
      // Calculate collision response
      const overlap = minDistance - distance;
      const direction = new Vector2D(posB.pos.x - posA.pos.x, posB.pos.y - posA.pos.y).normalize();

      // Move entities apart
      const moveAmount = direction.clone().multiply(overlap / 2);
      posA.pos = posA.pos.clone().subtract(moveAmount);
      posB.pos = posB.pos.clone().add(moveAmount);

      // Adjust velocities for bouncing effect
      const relativeVelocity = posA.vel.clone().subtract(posB.vel);
      const normalVelocity = relativeVelocity.dot(direction);

      if (normalVelocity > 0) {
        const restitution = 0.5; // Bounce factor
        const impulse = normalVelocity * restitution;

        const impulseVector = direction.clone().multiply(impulse);
        posA.vel = posA.vel.clone().subtract(impulseVector);
        posB.vel = posB.vel.clone().add(impulseVector);
      }
    }
  }
}
