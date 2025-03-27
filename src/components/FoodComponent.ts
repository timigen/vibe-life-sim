import { Component } from '../core/ecs/Component';

export class FoodComponent extends Component {
  constructor(public radius: number) {
    super();
  }
}
