import { Component } from './Component';

export class Entity {
  private static nextId = 0;
  public readonly id: number;
  private components: Map<string, Component> = new Map();

  constructor() {
    this.id = Entity.nextId++;
  }

  addComponent<T extends Component>(component: T): void {
    const componentName = component.constructor.name;
    this.components.set(componentName, component);
  }

  getComponent<T extends Component>(componentType: { new(...args: any[]): T }): T | undefined {
    return this.components.get(componentType.name) as T;
  }

  hasComponent<T extends Component>(componentType: { new(...args: any[]): T }): boolean {
    return this.components.has(componentType.name);
  }

  removeComponent<T extends Component>(componentType: { new(...args: any[]): T }): void {
    this.components.delete(componentType.name);
  }
} 