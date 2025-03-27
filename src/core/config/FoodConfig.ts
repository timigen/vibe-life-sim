export const FOOD_CONFIG: IFoodConfig = {
  RADIUS: 3,
  SPAWN_BASE_CHANCE: 0.0125,
  MAX_SPAWN_CHANCE: 0.125,
  POPULATION_SPAWN_FACTOR: 0.000125,
};

export interface IFoodConfig {
  RADIUS: number;
  SPAWN_BASE_CHANCE: number;
  MAX_SPAWN_CHANCE: number;
  POPULATION_SPAWN_FACTOR: number;
}
