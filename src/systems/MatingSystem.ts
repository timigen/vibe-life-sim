import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { LIFE_CONFIG } from '../config/LifeConfig';
import { World } from '../ecs/World';

export class MatingSystem extends System {
  constructor(private world: World) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(LifeComponent) && entity.hasComponent(PositionComponent);
  }

  update(deltaTime: number): void {
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const aEntity = this.entities[i];
        const bEntity = this.entities[j];

        const aLife = aEntity.getComponent(LifeComponent);
        const bLife = bEntity.getComponent(LifeComponent);
        if (!aLife || !bLife) continue;

        if (aLife.dead || bLife.dead || aLife.group !== bLife.group) continue;
        if (
          aLife.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING ||
          bLife.hunger > LIFE_CONFIG.HUNGER_THRESHOLD_FOR_MATING
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
            const distance = aPos.position.distanceTo(bPos.position);

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
