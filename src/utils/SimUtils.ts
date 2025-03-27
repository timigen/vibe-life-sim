import { SimState } from '../core/config/SimState';
import { Vector2D } from '../core/Vector2D';

export class SimUtils {
  static getRandomPosition(minRadius: number): Vector2D {
    return new Vector2D(
      Math.random() * (SimState.CANVAS_WIDTH - minRadius * 2) + minRadius,
      Math.random() * (SimState.CANVAS_HEIGHT - minRadius * 2) + minRadius
    );
  }

  static clampPosition(position: Vector2D, radius: number): Vector2D {
    return new Vector2D(
      Math.max(radius, Math.min(SimState.CANVAS_WIDTH - radius, position.x)),
      Math.max(radius, Math.min(SimState.CANVAS_HEIGHT - radius, position.y))
    );
  }

  static getRandomAngle(): number {
    return Math.random() * Math.PI * 2;
  }

  static getRandomSpeed(baseSpeed: number): number {
    return baseSpeed * (1 + Math.random());
  }
}
