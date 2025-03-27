import { PositionComponent } from '../components/PositionComponent';
import { LifeComponent } from '../components/LifeComponent';
import { FoodComponent } from '../components/FoodComponent';
import { Entity } from '../core/ecs/Entity';
import { System } from '../core/ecs/System';

export class RenderingSystem extends System {
  constructor(private ctx: CanvasRenderingContext2D) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return (
      entity.hasComponent(PositionComponent) &&
      (entity.hasComponent(LifeComponent) || entity.hasComponent(FoodComponent))
    );
  }

  update(): void {
    // Render all entities - use filteredEntities for better performance
    for (const entity of this.filteredEntities) {
      const position = entity.getComponent(PositionComponent);
      if (!position) continue;

      if (entity.hasComponent(LifeComponent)) {
        const life = entity.getComponent(LifeComponent)!;
        this.drawLife(position, life);
      } else if (entity.hasComponent(FoodComponent)) {
        const food = entity.getComponent(FoodComponent)!;
        this.drawFood(position, food);
      }
    }
  }

  private drawLife(comp: PositionComponent, life: LifeComponent): void {
    this.ctx.beginPath();
    this.ctx.arc(comp.pos.x, comp.pos.y, life.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = life.group.color;
    this.ctx.fill();

    this.ctx.lineWidth = 1;
    if (life.sex === 'male') {
      this.ctx.strokeStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.moveTo(comp.pos.x - life.radius / 2, comp.pos.y);
      this.ctx.lineTo(comp.pos.x + life.radius / 2, comp.pos.y);
      this.ctx.moveTo(comp.pos.x, comp.pos.y - life.radius / 2);
      this.ctx.lineTo(comp.pos.x, comp.pos.y + life.radius / 2);
      this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(comp.pos.x, comp.pos.y, life.radius / 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
    }

    if (life.sex === 'female' && life.isPregnant) {
      this.ctx.beginPath();
      this.ctx.arc(comp.pos.x, comp.pos.y, life.radius + 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'yellow';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    if (life.restTimer > 0) {
      this.ctx.beginPath();
      this.ctx.arc(comp.pos.x, comp.pos.y, life.radius + 4, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'cyan';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  private drawFood(comp: PositionComponent, food: FoodComponent): void {
    this.ctx.beginPath();
    this.ctx.arc(comp.pos.x, comp.pos.y, food.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.fill();
  }
}
