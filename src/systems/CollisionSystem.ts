import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FoodComponent } from '../components/FoodComponent';
import { Vector2D } from '../core/Vector2D';
import { SpatialGrid } from '../core/SpatialGrid';
import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';
import { World } from '../core/World';
import { SimState } from '../core/config/SimState';
import { DEBUG_MODE } from '../constants';

export class CollisionSystem extends System {
  private spatialGrid: SpatialGrid;
  private allEntities: Entity[] = [];
  private world: World;
  private lastDebugTime: number = 0;

  constructor(world: World) {
    super();
    this.spatialGrid = new SpatialGrid(50); // Cell size of 50 pixels
    this.world = world;
  }

  shouldProcessEntity(entity: Entity): boolean {
    // We want to process both life entities and food entities for collision detection
    return (
      entity.hasComponent(PositionComponent) &&
      (entity.hasComponent(LifeComponent) || entity.hasComponent(FoodComponent))
    );
  }

  async update(deltaTime: number): Promise<void> {
    if (SimState.paused) return;

    const BATCH_SIZE = 100;
    // Use all filtered entities for collision detection
    this.allEntities = [...this.filteredEntities];
    const lifeEntities = this.allEntities.filter(e => e.hasComponent(LifeComponent));
    const foodEntities = this.allEntities.filter(e => e.hasComponent(FoodComponent));

    if (DEBUG_MODE) {
      console.log(
        `CollisionSystem processing ${lifeEntities.length} life entities and ${foodEntities.length} food entities`
      );
    }

    // Update spatial grid with all entities positions
    this.spatialGrid.update(this.allEntities);

    // Process collisions - use direct approach for small entity counts for better reliability
    if (lifeEntities.length * foodEntities.length < 1000) {
      // Direct food collision detection for small entity counts
      for (const lifeEntity of lifeEntities) {
        const life = lifeEntity.getComponent(LifeComponent);
        if (!life || life.dead) continue;

        const lifePos = lifeEntity.getComponent(PositionComponent);
        if (!lifePos) continue;

        for (const foodEntity of foodEntities) {
          const food = foodEntity.getComponent(FoodComponent);
          if (!food || food.consumed) continue;

          const foodPos = foodEntity.getComponent(PositionComponent);
          if (!foodPos) continue;

          this.processLifeFoodCollision(lifeEntity, foodEntity, lifePos, foodPos);
        }
      }
    } else {
      // Use spatial partitioning for larger entity counts
      for (let i = 0; i < lifeEntities.length; i += BATCH_SIZE) {
        const batch = lifeEntities.slice(i, i + BATCH_SIZE);
        await this.processBatch(batch);

        // Allow other tasks to run between batches
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Periodically run debug checks
    if (DEBUG_MODE) {
      const now = performance.now();
      if (now - this.lastDebugTime > 10000) {
        // Every 10 seconds
        this.world.debugEntities();
        this.lastDebugTime = now;
      }
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
      if (DEBUG_MODE) {
        console.log(`Collision detected between Life ${lifeEntity.id} and Food ${foodEntity.id}`);
      }

      // Mark the food as consumed before removing it
      food.consumed = true;

      // Food is consumed - reduce hunger and add energy
      life.hunger = Math.max(0, life.hunger - food.nutritionalValue);
      life.energy = Math.min(life.maxEnergy, life.energy + food.nutritionalValue);

      // Emit food consumed event
      eventEmitter.emit(EVENTS.FOOD_CONSUMED, {
        lifeEntity,
        foodEntity,
        position: { x: foodPos.pos.x, y: foodPos.pos.y },
      });

      // Remove the food entity directly
      this.world.removeFood(foodEntity);

      if (DEBUG_MODE) {
        console.log(
          `Food ${foodEntity.id} consumed by Life ${lifeEntity.id} and removed. Life hunger: ${life.hunger}, energy: ${life.energy}`
        );
      }
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
