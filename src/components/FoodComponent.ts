import { Component } from '../ecs/Component';

export class FoodComponent extends Component {
  constructor(
    public radius: number
  ) {
    super();
  }
} 