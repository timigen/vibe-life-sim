import { Component } from '../core/ecs/Component';

export class FoodComponent extends Component {
  public consumed: boolean = false;

  constructor(public radius: number) {
    super();
  }
}
