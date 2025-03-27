import { LifeConfig as ILifeConfig } from '../types/LifeConfig';

export const LIFE_CONFIG: ILifeConfig = {
  INITIAL_RADIUS: 5,
  MAX_RADIUS: 15,
  MIN_RADIUS: 2,
  SPEED: 1.2,
  MATING_DISTANCE: 15,
  GESTATION_PERIOD: 300,
  HUNGER_LIMIT: 1000,
  HUNGER_THRESHOLD_FOR_MATING: 800,
  FULLNESS_DURATION: 100,
  SIZE_INCREMENT: 0.5,
  SIZE_DECREMENT: 0.005,
  AGE_LIMIT: 2000,
  REST_CHANCE: 0.002,
  REST_MIN_DURATION: 20,
  REST_MAX_DURATION: 60
}; 