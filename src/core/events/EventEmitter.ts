import { EventSystem } from './EventSystem';

// Event name constants to avoid string duplication and typos
export const EVENTS = {
  ENTITY_CREATED: 'entity:created',
  ENTITY_DESTROYED: 'entity:destroyed',
  COMPONENT_ADDED: 'component:added',
  COMPONENT_REMOVED: 'component:removed',
  LIFE_DIED: 'life:died',
  LIFE_BORN: 'life:born',
  FOOD_CREATED: 'food:created',
  FOOD_CONSUMED: 'food:consumed',
  POPULATION_CHANGED: 'population:changed',
  SIM_PAUSED: 'sim:paused',
  SIM_RESUMED: 'sim:resumed'
};

// Create a singleton event emitter for the entire application
export const eventEmitter = new EventSystem(); 