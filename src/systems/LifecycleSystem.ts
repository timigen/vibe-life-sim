import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { UISystem } from './UISystem';
import { System } from '../core/ecs/System';
import { World } from '../core/World';
import { Entity } from '../core/ecs/Entity';
import { SimState } from '../core/config/SimState';
import { LIFE_CONFIG } from '../core/config/LifeConfig';

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
          const comp = entity.getComponent(PositionComponent)!;
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          const newSex = Math.random() < 0.5 ? 'male' : 'female';

          // Spawn new life form
          this.world.spawnLife(
            comp.pos.x + offsetX,
            comp.pos.y + offsetY,
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
        const comp = entity.getComponent(PositionComponent)!;
        this.world.spawnFood(comp.pos.x, comp.pos.y);
        this.world.removeLife(entity);
      }
    }

    // Update max population
    const currentPopulation = this.world.getPopulation();
    if (currentPopulation > SimState.maxPopulation) {
      SimState.maxPopulation = currentPopulation;
    }

    // Check for simulation over
    if (currentPopulation === 0) {
      this.uiSystem.showGameOver();
    }
  }
}
