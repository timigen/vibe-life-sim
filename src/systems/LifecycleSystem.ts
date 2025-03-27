import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { LIFE_CONFIG } from '../config/LifeConfig';
import { UISystem } from './UISystem';
import { SimState } from '../config/SimState';
import { System } from '../core/ecs/System';
import { World } from '../core/ecs/World';
import { Entity } from '../core/ecs/Entity';

export class LifecycleSystem extends System {
  constructor(
    private world: World,
    private uiSystem: UISystem
  ) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent);
  }

  update(deltaTime: number): void {
    for (const entity of this.entities) {
      const life = entity.getComponent(LifeComponent);
      if (!life) continue;

      // Use deltaTime for consistent aging and hunger accumulation
      life.age += deltaTime;
      life.hunger += (life.restTimer > 0 ? 0.2 : 1) * deltaTime;

      // Update group stats
      const groupStat = SimState.groupStats.find(
        (stat: { color: string; name: string; maxPopulation: number; highestGeneration: number }) =>
          stat.color === life.group.color
      );
      if (groupStat) {
        const currentGroupPopulation = this.entities.filter(
          e => e.getComponent(LifeComponent)?.group.color === life.group.color
        ).length;
        if (currentGroupPopulation > groupStat.maxPopulation) {
          groupStat.maxPopulation = currentGroupPopulation;
        }
        if (life.age > groupStat.highestGeneration) {
          groupStat.highestGeneration = life.age;
        }
      }

      // Handle pregnancy and birth
      if (life.sex === 'female' && life.isPregnant) {
        life.gestationTimer -= deltaTime;
        if (life.gestationTimer <= 0) {
          const position = entity.getComponent(PositionComponent)!;
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          const newSex = Math.random() < 0.5 ? 'male' : 'female';

          // Spawn new life form
          this.world.spawnLife(
            position.position.x + offsetX,
            position.position.y + offsetY,
            life.group,
            newSex
          );

          // Reset pregnancy
          life.isPregnant = false;
          life.gestationTimer = 0;
        }
      }

      if (life.age > LIFE_CONFIG.AGE_LIMIT) {
        life.dead = true;
        SimState.deathsByOldAge++;
      }

      if (life.hunger > LIFE_CONFIG.HUNGER_LIMIT) {
        life.dead = true;
        SimState.deathsByStarvation++;
      }

      if (life.dead) {
        // Convert to food
        const position = entity.getComponent(PositionComponent)!;
        this.world.spawnFood(position.position.x, position.position.y);
        this.world.removeLife(entity);
      }
    }

    // Update max population
    const currentPopulation = this.world.getLifeCount();
    if (currentPopulation > SimState.maxPopulation) {
      SimState.maxPopulation = currentPopulation;
    }

    // Check for simulation over
    if (currentPopulation === 0) {
      this.uiSystem.showGameOver();
    }
  }
}
