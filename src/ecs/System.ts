import { Entity } from './Entity';

export abstract class System {
  protected entities: Entity[] = [];

  addEntity(entity: Entity): void {
    if (this.shouldProcessEntity(entity)) {
      this.entities.push(entity);
    }
  }

  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  abstract shouldProcessEntity(entity: Entity): boolean;
  abstract update(deltaTime: number): void;
} 