import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { Vector2D } from '../core/Vector2D';
import { SimUtils } from '../utils/SimUtils';
import { System } from '../core/ecs/System';
import { Entity } from '../core/ecs/Entity';
import { LIFE_CONFIG } from '../core/config/LifeConfig';
import { FoodComponent } from '../components/FoodComponent';
import { SimState } from '../core/config/SimState';
import { DEBUG_MODE } from '../constants';

export class MovementSystem extends System {
  private foodEntities: Entity[] = [];

  shouldProcessEntity(entity: Entity): boolean {
    // We don't need to store food entities here since we rebuild the list in update()
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  update(deltaTime: number): void {
    // Skip movement updates if paused or deltaTime is 0
    if (deltaTime <= 0 || SimState.paused) {
      return;
    }

    // Clear food entities cache and rebuild it
    this.foodEntities = [];
    for (const entity of this.entities) {
      if (entity.hasComponent(FoodComponent)) {
        const food = entity.getComponent(FoodComponent);
        if (food && !food.consumed) {
          this.foodEntities.push(entity);
        }
      }
    }

    if (DEBUG_MODE && this.filteredEntities.length > 0) {
      console.log(
        `MovementSystem: ${this.filteredEntities.length} life entities, ${this.foodEntities.length} food entities available`
      );
    }

    // Use filteredEntities instead of entities - no need to check components again
    for (const entity of this.filteredEntities) {
      const life = entity.getComponent(LifeComponent);
      const position = entity.getComponent(PositionComponent);
      if (!life || !position) continue;

      if (life.dead || life.restTimer > 0) continue;

      // Determine if the entity is hungry enough to seek food
      const isHungry = life.hunger > LIFE_CONFIG.HUNGER_LIMIT * 0.5;

      if (isHungry && this.foodEntities.length > 0) {
        // Find the closest food
        const closestFood = this.findClosestFood(position.pos);

        if (closestFood) {
          // Move toward the closest food
          const foodPos = closestFood.getComponent(PositionComponent)!.pos;
          const direction = new Vector2D(
            foodPos.x - position.pos.x,
            foodPos.y - position.pos.y
          ).normalize();

          const speed = LIFE_CONFIG.SPEED * 1.5; // Move faster when hungry
          position.vel = direction.multiply(speed);

          if (DEBUG_MODE && Math.random() < 0.05) {
            // Log occasionally to avoid spam
            const distance = position.pos.distanceTo(foodPos);
            console.log(
              `Life #${entity.id} moving toward Food #${closestFood.id} at distance ${distance.toFixed(2)}`
            );
          }
        }
      } else if (Math.random() < 0.02) {
        // Random movement when not hungry or no food available
        const angle = SimUtils.getRandomAngle();
        const speed = SimUtils.getRandomSpeed(LIFE_CONFIG.SPEED);
        position.vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      // Update position using deltaTime
      position.pos.x += position.vel.x * deltaTime;
      position.pos.y += position.vel.y * deltaTime;

      // Moving consumes energy - more when moving faster
      const speed = Math.sqrt(position.vel.x * position.vel.x + position.vel.y * position.vel.y);
      const energyCost = speed * 0.02 * deltaTime;
      life.energy = Math.max(0, life.energy - energyCost);

      // Keep within bounds
      const clampedPosition = SimUtils.clampPosition(position.pos, life.radius);
      position.pos = clampedPosition;
    }
  }

  private findClosestFood(position: Vector2D): Entity | null {
    if (this.foodEntities.length === 0) return null;

    let closestFood: Entity | null = null;
    let closestDistance = Number.MAX_VALUE;

    for (const food of this.foodEntities) {
      // No need to check for consumed food here as we already filter those out in update()
      const foodPos = food.getComponent(PositionComponent)!.pos;
      const distance = position.distanceTo(foodPos);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestFood = food;
      }
    }

    if (DEBUG_MODE && closestFood && Math.random() < 0.01) {
      // Log occasionally
      console.log(
        `Found closest food #${closestFood.id} at distance ${closestDistance.toFixed(2)}`
      );
    }

    return closestFood;
  }
}
