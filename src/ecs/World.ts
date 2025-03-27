import { Entity } from './Entity';
import { System } from './System';

export class World {
  private entities: Entity[] = [];
  private systems: System[] = [];

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
    this.systems.forEach(system => system.update(deltaTime));
  }

  getEntities(): Entity[] {
    return this.entities;
  }
}
