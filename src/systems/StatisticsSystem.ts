import { System } from '../core/ecs/System';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';
import { Entity } from '../core/ecs/Entity';

/**
 * A system that collects statistics about the simulation by listening to events.
 * This demonstrates how systems can communicate indirectly through events
 * rather than direct dependencies.
 */
export class StatisticsSystem extends System {
  private birthCount: number = 0;
  private deathCount: number = 0;
  private deathsByGroup: Map<string, number> = new Map();
  private birthsByGroup: Map<string, number> = new Map();
  private foodConsumed: number = 0;
  private foodCreated: number = 0;

  constructor() {
    super();
    
    // Listen for life born events
    eventEmitter.on(EVENTS.LIFE_BORN, async (data: any) => {
      this.birthCount++;
      
      const groupColor = data.group.color;
      const currentBirths = this.birthsByGroup.get(groupColor) || 0;
      this.birthsByGroup.set(groupColor, currentBirths + 1);
    });
    
    // Listen for life death events
    eventEmitter.on(EVENTS.LIFE_DIED, async (data: any) => {
      this.deathCount++;
      
      if (data.group) {
        const groupColor = data.group.color;
        const currentDeaths = this.deathsByGroup.get(groupColor) || 0;
        this.deathsByGroup.set(groupColor, currentDeaths + 1);
      }
    });
    
    // Listen for food created events
    eventEmitter.on(EVENTS.FOOD_CREATED, async () => {
      this.foodCreated++;
    });
    
    // Listen for food consumed events
    eventEmitter.on(EVENTS.FOOD_CONSUMED, async () => {
      this.foodConsumed++;
    });
    
    // Listen for simulation paused events to log stats
    eventEmitter.on(EVENTS.SIM_PAUSED, async () => {
      this.logStatistics();
    });
  }

  shouldProcessEntity(entity: Entity): boolean {
    return false; // This system doesn't process entities
  }

  update(): void {
    // This system doesn't need to update on every frame
  }
  
  private logStatistics(): void {
    console.log('=== Simulation Statistics ===');
    console.log(`Total births: ${this.birthCount}`);
    console.log(`Total deaths: ${this.deathCount}`);
    console.log(`Food created: ${this.foodCreated}`);
    console.log(`Food consumed: ${this.foodConsumed}`);
    
    console.log('=== Births by Group ===');
    this.birthsByGroup.forEach((count, groupColor) => {
      console.log(`Group ${groupColor}: ${count} births`);
    });
    
    console.log('=== Deaths by Group ===');
    this.deathsByGroup.forEach((count, groupColor) => {
      console.log(`Group ${groupColor}: ${count} deaths`);
    });
  }
  
  // Public methods to access statistics
  getBirthCount(): number {
    return this.birthCount;
  }
  
  getDeathCount(): number {
    return this.deathCount;
  }
  
  getFoodCreated(): number {
    return this.foodCreated;
  }
  
  getFoodConsumed(): number {
    return this.foodConsumed;
  }
} 