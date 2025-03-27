import { Entity } from './Entity';

export abstract class System {
  protected entities: Entity[] = [];
  // Pre-filtered entities that should be processed by this system
  protected filteredEntities: Entity[] = [];

  addEntity(entity: Entity): void {
    // Always add to the main entities list
    this.entities.push(entity);
    
    // Only add to filtered list if it should be processed
    if (this.shouldProcessEntity(entity)) {
      this.filteredEntities.push(entity);
    }
  }

  removeEntity(entity: Entity): void {
    // Remove from main entities list
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }

    // Remove from filtered entities list
    const filteredIndex = this.filteredEntities.indexOf(entity);
    if (filteredIndex !== -1) {
      this.filteredEntities.splice(filteredIndex, 1);
    }
  }

  // Method to refresh entity filtering (useful if entity components change)
  refreshEntityFiltering(): void {
    this.filteredEntities = this.entities.filter(entity => this.shouldProcessEntity(entity));
  }

  abstract shouldProcessEntity(entity: Entity): boolean;
  abstract update(deltaTime: number): void;
}
