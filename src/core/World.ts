import { Entity } from './ecs/Entity';
import { System } from './ecs/System';
import { Group } from './types/Group';
import { LifeComponent } from '../components/LifeComponent';
import { FoodComponent } from '../components/FoodComponent';
import { PositionComponent } from '../components/PositionComponent';
import { FOOD_CONFIG } from './config/FoodConfig';
import { Vector2D } from './Vector2D';
import { eventEmitter, EVENTS } from './events/EventEmitter';
import { LifePool } from './LifePool';

export class World {
  private entities: Entity[] = [];
  private systems: System[] = [];
  private lifePool: LifePool;

  constructor(initialLifePoolSize: number) {
    this.lifePool = new LifePool(initialLifePoolSize);
  }

  spawnFood(x: number, y: number): void {
    const foodEntity = new Entity();
    foodEntity.setWorld(this);
    foodEntity.addComponent(new PositionComponent(new Vector2D(x, y)));
    foodEntity.addComponent(new FoodComponent(FOOD_CONFIG.RADIUS));
    this.addEntity(foodEntity);

    // Emit food created event
    eventEmitter.emit(EVENTS.FOOD_CREATED, { entity: foodEntity, position: { x, y } });
  }

  spawnLife(x: number, y: number, group: Group, sex: 'male' | 'female'): Entity {
    const entity = this.lifePool.spawn(x, y, group, sex);
    entity.setWorld(this);
    this.addEntity(entity);

    // Emit life born event
    eventEmitter.emit(EVENTS.LIFE_BORN, { entity, position: { x, y }, group, sex });

    return entity;
  }

  removeLife(entity: Entity): void {
    const comp = entity.getComponent(PositionComponent) as PositionComponent;
    if (comp) {
      // Emit life died event
      eventEmitter.emit(EVENTS.LIFE_DIED, {
        entity,
        position: { x: comp.pos.x, y: comp.pos.y },
        group: entity.getComponent(LifeComponent)?.group,
      });

      // Spawn food at the death location
      this.spawnFood(comp.pos.x, comp.pos.y);
    }
    this.removeEntity(entity);
    this.lifePool.despawn(entity);

    // Emit population changed event
    eventEmitter.emit(EVENTS.POPULATION_CHANGED, {
      population: this.getPopulation(),
    });
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
    entity.setWorld(this);
    this.systems.forEach(system => system.addEntity(entity));

    // Emit entity created event
    eventEmitter.emit(EVENTS.ENTITY_CREATED, { entity });
  }

  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      this.systems.forEach(system => system.removeEntity(entity));

      // Emit entity destroyed event
      eventEmitter.emit(EVENTS.ENTITY_DESTROYED, { entity });
    }
  }

  addSystem(system: System): void {
    this.systems.push(system);
    // Refresh entity filtering for this system with existing entities
    this.entities.forEach(entity => system.addEntity(entity));
  }

  update(deltaTime: number): void {
    // Update all systems
    this.systems.forEach(system => system.update(deltaTime));

    // Remove dead entities
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      const life = entity.getComponent(LifeComponent);
      if (life?.dead) {
        this.removeLife(entity);
      }
    }
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  getFoods(): Entity[] {
    return this.entities.filter(entity => entity.hasComponent(FoodComponent));
  }

  getPopulation(): number {
    return this.lifePool.getActiveCount();
  }

  // Refresh filtering for all systems - useful when entities change components
  refreshSystemFiltering(): void {
    this.systems.forEach(system => system.refreshEntityFiltering());
  }
}
