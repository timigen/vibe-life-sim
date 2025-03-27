import { Component } from '../core/ecs/Component';
import { Group } from '../types/Group';

export class LifeComponent extends Component {
  constructor(
    public radius: number,
    public hunger: number = 0,
    public isPregnant: boolean = false,
    public gestationTimer: number = 0,
    public dead: boolean = false,
    public age: number = 0,
    public restTimer: number = 0,
    public group: Group,
    public sex: 'male' | 'female'
  ) {
    super();
  }
}
