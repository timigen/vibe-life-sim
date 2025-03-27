import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { LifeComponent } from '../components/LifeComponent';

export class SpatialGrid {
  private grid: Map<string, Set<Entity>> = new Map();
  private cellSize: number;

  constructor(cellSize: number = 50) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  private getEntityCells(entity: Entity): string[] {
    const position = entity.getComponent(PositionComponent);
    const life = entity.getComponent(LifeComponent);
    if (!position || !life) return [];

    const radius = life.radius;
    const minX = Math.floor((position.position.x - radius) / this.cellSize);
    const maxX = Math.floor((position.position.x + radius) / this.cellSize);
    const minY = Math.floor((position.position.y - radius) / this.cellSize);
    const maxY = Math.floor((position.position.y + radius) / this.cellSize);

    const cells: string[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }

  update(entities: Entity[]): void {
    // Clear the grid
    this.grid.clear();

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