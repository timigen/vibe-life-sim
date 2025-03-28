import { PositionComponent } from '../components/PositionComponent';
import { LifeComponent } from '../components/LifeComponent';
import { FoodComponent } from '../components/FoodComponent';
import { Entity } from './ecs/Entity';
import { DEBUG_MODE } from '../constants';

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
    if (!component) return [];

    // Get radius from either Life or Food component
    let radius = 0;
    if (entity.hasComponent(LifeComponent)) {
      const life = entity.getComponent(LifeComponent);
      radius = life!.radius;
    } else if (entity.hasComponent(FoodComponent)) {
      const food = entity.getComponent(FoodComponent);
      radius = food!.radius;
    } else {
      // Entity has no size component, return empty
      return [];
    }

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

    let foodCount = 0;
    let lifeCount = 0;

    // Add entities to their cells
    for (const entity of entities) {
      if (entity.hasComponent(FoodComponent)) foodCount++;
      if (entity.hasComponent(LifeComponent)) lifeCount++;

      const cells = this.getEntityCells(entity);
      for (const cell of cells) {
        if (!this.grid.has(cell)) {
          this.grid.set(cell, new Set());
        }
        this.grid.get(cell)!.add(entity);
      }
    }

    if (DEBUG_MODE && (foodCount > 0 || lifeCount > 0)) {
      console.log(
        `SpatialGrid updated with ${lifeCount} life entities and ${foodCount} food entities`
      );
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
