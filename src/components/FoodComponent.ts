import { Component } from '../core/ecs/Component';

export class FoodComponent extends Component {
  public consumed: boolean = false;
  public nutritionalValue: number = 400; // Default nutritional value

  constructor(public radius: number) {
    super();
  }
}
