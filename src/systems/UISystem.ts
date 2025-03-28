import { SimState } from '../core/config/SimState';
import { System } from '../core/ecs/System';
import { World } from '../core/World';
import { eventEmitter, EVENTS } from '../core/events/EventEmitter';
import { ENABLE_FOOD_SPAWNING, CORPSES_BECOME_FOOD } from '../constants';

export class UISystem extends System {
  private world: World;
  private lastFPSUpdate: number = performance.now();
  private frameCount: number = 0;
  private updatePending: boolean = false;
  private currentPopulation: number = 0;

  constructor(world: World) {
    super();
    this.world = world;

    // Listen for population changes
    eventEmitter.on(EVENTS.POPULATION_CHANGED, async (data: any) => {
      this.currentPopulation = data.population;
      this.updateStats();
    });

    // Listen for sim pause events to show game over
    eventEmitter.on(EVENTS.SIM_PAUSED, async () => {
      if (this.currentPopulation === 0) {
        this.showGameOver();
      }
    });
  }

  shouldProcessEntity(): boolean {
    return false; // This system doesn't process entities
  }

  update(): void {
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastFPSUpdate >= 1000) {
      SimState.fps = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
      // Update average FPS
      SimState.totalFps += SimState.fps;
      SimState.fpsSamples++;
      SimState.avgFps = Math.round(SimState.totalFps / SimState.fpsSamples);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }

    // Update FPS display
    document.getElementById('fpsCounter')!.textContent = SimState.fps.toString();

    // Update canvas dimensions
    document.getElementById('canvasDimensions')!.textContent =
      `${SimState.CANVAS_WIDTH}x${SimState.CANVAS_HEIGHT}`;

    // Update death counters
    document.getElementById('starvationDeaths')!.textContent =
      SimState.deathsByStarvation.toString();
    document.getElementById('oldAgeDeaths')!.textContent = SimState.deathsByOldAge.toString();

    // Only perform initial display update if we don't have population yet
    if (this.currentPopulation === 0) {
      this.currentPopulation = this.world.getPopulation();
      this.updateStats();
    }
  }

  private async updateStats(): Promise<void> {
    if (this.updatePending) return;
    this.updatePending = true;

    await new Promise(resolve => requestAnimationFrame(resolve));

    document.getElementById('populationCount')!.textContent = this.currentPopulation.toString();
    // ... other UI updates ...

    this.updatePending = false;
  }

  showGameOver(): void {
    document.getElementById('maxPopDisplay')!.textContent = SimState.maxPopulation.toString();
    document.getElementById('finalStarvationDeaths')!.textContent =
      SimState.deathsByStarvation.toString();
    document.getElementById('finalOldAgeDeaths')!.textContent = SimState.deathsByOldAge.toString();
    document.getElementById('finalFPS')!.textContent = SimState.avgFps.toString();

    // Set food spawning status
    const finalFoodSpawningStatus = document.getElementById('finalFoodSpawningStatus')!;
    finalFoodSpawningStatus.textContent = ENABLE_FOOD_SPAWNING ? 'ENABLED' : 'DISABLED';
    finalFoodSpawningStatus.style.color = ENABLE_FOOD_SPAWNING ? '#4CAF50' : '#ff4444';

    // Set corpses to food status
    const finalCorpsesFoodStatus = document.getElementById('finalCorpsesFoodStatus')!;
    finalCorpsesFoodStatus.textContent = CORPSES_BECOME_FOOD ? 'ENABLED' : 'DISABLED';
    finalCorpsesFoodStatus.style.color = CORPSES_BECOME_FOOD ? '#4CAF50' : '#ff4444';

    // Display group statistics
    const groupStatsContainer = document.getElementById('groupStatsContainer');
    if (groupStatsContainer) {
      groupStatsContainer.innerHTML = '';
      SimState.groupStats.forEach(
        (stat: {
          color: string;
          name: string;
          maxPopulation: number;
          highestGeneration: number;
        }) => {
          const statElement = document.createElement('div');
          statElement.className = 'group-stat';
          statElement.innerHTML = `
          <div style="color: ${stat.color};">Group: ${stat.name}</div>
          <div>Max Population: ${stat.maxPopulation}</div>
          <div>Generation: ${Math.round(stat.highestGeneration)}</div>
        `;
          groupStatsContainer.appendChild(statElement);
        }
      );
    }

    // Ensure the modal is centered and scrollable on small screens
    const modal = document.getElementById('simulationOver')!;
    modal.style.display = 'flex';
    modal.style.alignItems = window.innerHeight < 600 ? 'flex-start' : 'center';

    // Add resize listener to adjust alignment on window resize
    const handleResize = () => {
      modal.style.alignItems = window.innerHeight < 600 ? 'flex-start' : 'center';
    };
    window.addEventListener('resize', handleResize);
  }
}
