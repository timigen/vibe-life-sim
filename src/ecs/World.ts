import { Entity } from './Entity';
import { System } from './System';
import { LifePool } from './LifePool';
import { Group } from '../types/Group';
import { LifeComponent } from '../components/LifeComponent';

export class World {
  private entities: Entity[] = [];
  private systems: System[] = [];
  private lifePool: LifePool;

  constructor(initialLifePoolSize: number) {
    this.lifePool = new LifePool(initialLifePoolSize);
  }

  spawnLife(x: number, y: number, group: Group, sex: 'male' | 'female'): Entity {
    const entity = this.lifePool.spawn(x, y, group, sex);
    this.addEntity(entity);
    return entity;
  }

  removeLife(entity: Entity): void {
    this.removeEntity(entity);
    this.lifePool.despawn(entity);
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.systems.forEach(system => system.addEntity(entity));
  }

  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      this.systems.forEach(system => system.removeEntity(entity));
    }
  }

  addSystem(system: System): void {
    this.systems.push(system);
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

  getLifeCount(): number {
    return this.lifePool.getActiveCount();
  }
}
