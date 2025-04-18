import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { LIFE_CONFIG } from '../core/config/LifeConfig';
import { Entity } from '../core/ecs/Entity';
import { System } from '../core/ecs/System';
import { World } from '../core/World';
import { SimState } from '../core/config/SimState';

export class MatingSystem extends System {
  constructor(private world: World) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  update(deltaTime: number): void {
    // Skip mating if paused or deltaTime is 0
    if (deltaTime <= 0 || SimState.paused) {
      return;
    }

    for (let i = 0; i < this.filteredEntities.length; i++) {
      for (let j = i + 1; j < this.filteredEntities.length; j++) {
        const aEntity = this.filteredEntities[i];
        const bEntity = this.filteredEntities[j];

        const aLife = aEntity.getComponent(LifeComponent);
        const bLife = bEntity.getComponent(LifeComponent);
        if (!aLife || !bLife) continue;

        if (aLife.dead || bLife.dead || aLife.group !== bLife.group) continue;
        if (
          aLife.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING ||
          bLife.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING ||
          aLife.energy < 200 || // Require sufficient energy to mate
          bLife.energy < 200 // Minimum energy threshold for mating
        )
          continue;

        if (
          (aLife.sex === 'male' && bLife.sex === 'female') ||
          (aLife.sex === 'female' && bLife.sex === 'male')
        ) {
          const female = aLife.sex === 'female' ? aLife : bLife;
          if (!female.isPregnant) {
            const aPos = aEntity.getComponent(PositionComponent)!;
            const bPos = bEntity.getComponent(PositionComponent)!;
            const distance = aPos.pos.distanceTo(bPos.pos);

            if (distance < LIFE_CONFIG.MATING_DISTANCE) {
              female.isPregnant = true;
              female.gestationTimer = LIFE_CONFIG.GESTATION_PERIOD;
            }
          }
        }
      }
    }
  }
}
