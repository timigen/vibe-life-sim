import { Component } from '../core/ecs/Component';
import { Group } from '../core/types/Group';

export class LifeComponent extends Component {
  // Energy-related properties
  public energy: number = 500;
  public maxEnergy: number = 1000;

  // Pre-existing properties from constructor
  constructor(
    public radius: number,
    public hunger: number = 0,
    public isPregnant: boolean = false,
    public gestationTimer: number = 0,
    public dead: boolean = false,
    public age: number = 0,
    public restTimer: number = 0,
    public group: Group,
    public sex: 'male' | 'female',
    public generation: number = 0
  ) {
    super();
  }
}
