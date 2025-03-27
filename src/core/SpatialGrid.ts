import { PositionComponent } from '../components/PositionComponent';
import { LifeComponent } from '../components/LifeComponent';
import { Entity } from './ecs/Entity';

export class SpatialGrid {
  private grid: Map<string, Set<Entity>> = new Map();
  private cellSize: number;
  private entityCellCache: Map<number, string[]> = new Map();

  constructor(cellSize: number = 50) {
    this.cellSize = cellSize;
  }

  private getEntityCells(entity: Entity): string[] {
    // Check if we have cached cells for this entity
    if (this.entityCellCache.has(entity.id)) {
      return this.entityCellCache.get(entity.id)!;
    }

    const component = entity.getComponent(PositionComponent);
    const life = entity.getComponent(LifeComponent);
    if (!component || !life) return [];

    const radius = life.radius;
    const minX = Math.floor((component.pos.x - radius) / this.cellSize);
    const maxX = Math.floor((component.pos.x + radius) / this.cellSize);
    const minY = Math.floor((component.pos.y - radius) / this.cellSize);
    const maxY = Math.floor((component.pos.y + radius) / this.cellSize);

    const cells: string[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    // Cache the cells for this entity
    this.entityCellCache.set(entity.id, cells);
    return cells;
  }

  update(entities: Entity[]): void {
    // Clear the grid and entity cell cache
    this.grid.clear();
    this.entityCellCache.clear();

    // Add entities to their cells
    for (const entity of entities) {
      const cells = this.getEntityCells(entity);
      for (const cell of cells) {
        if (!this.grid.has(cell)) {
          this.grid.set(cell, new Set());
        }
        this.grid.get(cell)!.add(entity);
      }
    }
  }

  getPotentialCollisions(entity: Entity): Set<Entity> {
    const cells = this.getEntityCells(entity);
    const potentialCollisions = new Set<Entity>();

    for (const cell of cells) {
      const entitiesInCell = this.grid.get(cell);
      if (entitiesInCell) {
        for (const other of entitiesInCell) {
          if (other !== entity) {
            potentialCollisions.add(other);
          }
        }
      }
    }

    return potentialCollisions;
  }
}
