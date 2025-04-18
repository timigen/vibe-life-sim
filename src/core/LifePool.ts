import { Entity } from './ecs/Entity';
import { LifeComponent } from '../components/LifeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { Group } from './types/Group';
import { Vector2D } from './Vector2D';
import { LIFE_CONFIG } from './config/LifeConfig';

export interface IPool<T> {
  despawn(entity: T): void;
  getActiveCount(): number;
  spawn(x: number, y: number, group: Group, sex: 'male' | 'female', parentGeneration?: number): T;
}

export class LifePool implements IPool<Entity> {
  private pool: Entity[] = [];
  private activeEntities: Set<Entity> = new Set();
  private initialSize: number;

  constructor(initialSize: number) {
    this.initialSize = initialSize;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.initialSize; i++) {
      this.pool.push(this.createNewEntity());
    }
  }

  private createNewEntity(): Entity {
    const entity = new Entity();
    entity.addComponent(new PositionComponent(new Vector2D(0, 0)));
    entity.addComponent(
      new LifeComponent(
        LIFE_CONFIG.INITIAL_RADIUS,
        0,
        false,
        0,
        false,
        0,
        0,
        { color: '#000000', name: 'default' },
        'male',
        0
      )
    );
    return entity;
  }

  spawn(
    x: number,
    y: number,
    group: Group,
    sex: 'male' | 'female',
    parentGeneration: number = -1
  ): Entity {
    let entity: Entity;

    if (this.pool.length > 0) {
      entity = this.pool.pop()!;
    } else {
      entity = this.createNewEntity();
    }

    const comp = entity.getComponent(PositionComponent) as PositionComponent;
    const life = entity.getComponent(LifeComponent) as LifeComponent;

    // Reset position
    comp.pos.x = x;
    comp.pos.y = y;
    comp.vel = new Vector2D(0, 0);

    // Reset life properties
    life.radius = LIFE_CONFIG.INITIAL_RADIUS;
    life.hunger = 0;
    life.isPregnant = false;
    life.gestationTimer = 0;
    life.dead = false;
    life.age = 0;
    life.restTimer = 0;
    life.group = group;
    life.sex = sex;
    life.generation = parentGeneration === -1 ? 0 : parentGeneration + 1;

    this.activeEntities.add(entity);
    return entity;
  }

  despawn(entity: Entity): void {
    if (this.activeEntities.has(entity)) {
      this.activeEntities.delete(entity);
      this.pool.push(entity);
    }
  }

  getActiveCount(): number {
    return this.activeEntities.size;
  }
}
