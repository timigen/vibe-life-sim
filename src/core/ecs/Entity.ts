import { Component } from './Component';
import { eventEmitter, EVENTS } from '../events/EventEmitter';

export class Entity {
  private static nextId = 0;
  public readonly id: number;
  private components: Map<string, Component> = new Map();
  private world?: any; // Reference to the world, using any to avoid circular dependency

  constructor() {
    this.id = Entity.nextId++;
  }

  // Set a reference to the world for component change notifications
  setWorld(world: any): void {
    this.world = world;
  }

  addComponent<T extends Component>(component: T): void {
    const componentName = component.constructor.name;
    const hadComponent = this.components.has(componentName);
    this.components.set(componentName, component);
    
    // Emit event for component being added
    eventEmitter.emit(EVENTS.COMPONENT_ADDED, {
      entity: this,
      componentName,
      component
    });
    
    // If component type changed (added or replaced), notify world to refresh filtering
    if (this.world && !hadComponent) {
      this.world.refreshSystemFiltering();
    }
  }

  getComponent<T extends Component>(componentType: { new (...args: any[]): T }): T | undefined {
    return this.components.get(componentType.name) as T;
  }

  hasComponent<T extends Component>(componentType: { new (...args: any[]): T }): boolean {
    return this.components.has(componentType.name);
  }

  removeComponent<T extends Component>(componentType: { new (...args: any[]): T }): void {
    const componentName = componentType.name;
    const hadComponent = this.components.has(componentName);
    const component = this.components.get(componentName);
    
    if (hadComponent && component) {
      this.components.delete(componentName);
      
      // Emit event for component being removed
      eventEmitter.emit(EVENTS.COMPONENT_REMOVED, {
        entity: this,
        componentName,
        component
      });
      
      // If component was removed, notify world to refresh filtering
      if (this.world) {
        this.world.refreshSystemFiltering();
      }
    }
  }
}
