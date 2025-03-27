import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { LifeComponent } from '../components/LifeComponent';
import { FoodComponent } from '../components/FoodComponent';

export class RenderingSystem extends System {
  constructor(private ctx: CanvasRenderingContext2D) {
    super();
  }

  shouldProcessEntity(entity: Entity): boolean {
    return entity.hasComponent(PositionComponent) && 
           (entity.hasComponent(LifeComponent) || entity.hasComponent(FoodComponent));
  }

  update(deltaTime: number): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Render all entities
    for (const entity of this.entities) {
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

  private drawLife(position: PositionComponent, life: LifeComponent): void {
    this.ctx.beginPath();
    this.ctx.arc(position.position.x, position.position.y, life.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = life.group.color;
    this.ctx.fill();

    this.ctx.lineWidth = 1;
    if (life.sex === "male") {
      this.ctx.strokeStyle = "#fff";
      this.ctx.beginPath();
      this.ctx.moveTo(position.position.x - life.radius / 2, position.position.y);
      this.ctx.lineTo(position.position.x + life.radius / 2, position.position.y);
      this.ctx.moveTo(position.position.x, position.position.y - life.radius / 2);
      this.ctx.lineTo(position.position.x, position.position.y + life.radius / 2);
      this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(position.position.x, position.position.y, life.radius / 3, 0, Math.PI * 2);
      this.ctx.fillStyle = "#fff";
      this.ctx.fill();
    }

    if (life.sex === "female" && life.isPregnant) {
      this.ctx.beginPath();
      this.ctx.arc(position.position.x, position.position.y, life.radius + 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = "yellow";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    if (life.restTimer > 0) {
      this.ctx.beginPath();
      this.ctx.arc(position.position.x, position.position.y, life.radius + 4, 0, Math.PI * 2);
      this.ctx.strokeStyle = "cyan";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  private drawFood(position: PositionComponent, food: FoodComponent): void {
    this.ctx.beginPath();
    this.ctx.arc(position.position.x, position.position.y, food.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ff00ff";
    this.ctx.fill();
  }
} 