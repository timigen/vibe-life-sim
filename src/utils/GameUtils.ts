import { GameState } from '../config/constants';
import { Vector2D } from './Vector2D';

export class GameUtils {
  static getRandomPosition(minRadius: number): Vector2D {
    return new Vector2D(
      Math.random() * (GameState.CANVAS_WIDTH - minRadius * 2) + minRadius,
      Math.random() * (GameState.CANVAS_HEIGHT - minRadius * 2) + minRadius
    );
  }

  static clampPosition(position: Vector2D, radius: number): Vector2D {
    return new Vector2D(
      Math.max(radius, Math.min(GameState.CANVAS_WIDTH - radius, position.x)),
      Math.max(radius, Math.min(GameState.CANVAS_HEIGHT - radius, position.y))
    );
  }

  static getRandomAngle(): number {
    return Math.random() * Math.PI * 2;
  }

  static getRandomSpeed(baseSpeed: number): number {
    return baseSpeed * (1 + Math.random());
  }
}
