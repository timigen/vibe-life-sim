import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { LIFE_CONFIG } from '../config/LifeConfig';
import { World } from '../ecs/World';
import { GameState } from '../config/constants';
import { UISystem } from './UISystem';

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

      life.age++;
      life.hunger += life.restTimer > 0 ? 0.2 : 1;

      // Handle pregnancy and birth
      if (life.sex === 'female' && life.isPregnant) {
        life.gestationTimer--;
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
        GameState.deathsByOldAge++;
      }

      if (life.hunger > LIFE_CONFIG.HUNGER_LIMIT) {
        life.dead = true;
        GameState.deathsByStarvation++;
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
    if (currentPopulation > GameState.maxPopulation) {
      GameState.maxPopulation = currentPopulation;
    }

    // Check for simulation over
    if (currentPopulation === 0) {
      this.uiSystem.showGameOver();
    }
  }
}
