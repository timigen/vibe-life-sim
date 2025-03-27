import { Component } from '../ecs/Component';
import { Vector2D } from '../utils/Vector2D';

export class PositionComponent extends Component {
  constructor(
    public position: Vector2D,
    public velocity: Vector2D = new Vector2D(0, 0)
  ) {
    super();
  }
} 