import { Component } from '../core/ecs/Component';
import { Vector2D } from '../core/Vector2D';

export class PositionComponent extends Component {
  constructor(
    public pos: Vector2D,
    public vel: Vector2D = new Vector2D(0, 0)
  ) {
    super();
  }
}
