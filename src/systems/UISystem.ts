import { System } from '../ecs/System';
import { SimulationState } from '../config/constants';
import { World } from '../ecs/World';

export class UISystem extends System {
  private world: World;
  private lastFPSUpdate: number = performance.now();
  private frameCount: number = 0;
  private updatePending: boolean = false;

  constructor(world: World) {
    super();
    this.world = world;
  }

  shouldProcessEntity(): boolean {
    return false; // This system doesn't process entities
  }

  update(): void {
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();

    // Calculate FPS immediately for the first frame
    const currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
    document.getElementById('fpsCounter')!.textContent = currentFps.toString();

    if (now - this.lastFPSUpdate >= 1000) {
      SimulationState.fps = currentFps;
      // Update average FPS
      SimulationState.totalFps += SimulationState.fps;
      SimulationState.fpsSamples++;
      SimulationState.avgFps = Math.round(SimulationState.totalFps / SimulationState.fpsSamples);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }

    // Update FPS display
    document.getElementById('fpsCounter')!.textContent = SimulationState.fps.toString();

    // Update canvas dimensions
    document.getElementById('canvasDimensions')!.textContent =
      `${SimulationState.CANVAS_WIDTH}x${SimulationState.CANVAS_HEIGHT}`;

    // Update death counters
    document.getElementById('starvationDeaths')!.textContent =
      SimulationState.deathsByStarvation.toString();
    document.getElementById('oldAgeDeaths')!.textContent = SimulationState.deathsByOldAge.toString();

    // Update population count
    this.updateStats();
  }

  private async updateStats(): Promise<void> {
    if (this.updatePending) return;
    this.updatePending = true;

    await new Promise(resolve => requestAnimationFrame(resolve));

    document.getElementById('populationCount')!.textContent = this.world.getLifeCount().toString();
    // ... other UI updates ...

    this.updatePending = false;
  }

  showGameOver(): void {
    document.getElementById('maxPopDisplay')!.textContent = SimulationState.maxPopulation.toString();
    document.getElementById('finalStarvationDeaths')!.textContent =
      SimulationState.deathsByStarvation.toString();
    document.getElementById('finalOldAgeDeaths')!.textContent = SimulationState.deathsByOldAge.toString();
    document.getElementById('finalFPS')!.textContent = SimulationState.avgFps.toString();

    // Display group statistics
    const groupStatsContainer = document.getElementById('groupStatsContainer');
    if (groupStatsContainer) {
      groupStatsContainer.innerHTML = '';
      SimulationState.groupStats.forEach((stat: { color: string; name: string; maxPopulation: number; highestGeneration: number; }) => {
        const statElement = document.createElement('div');
        statElement.className = 'group-stat';
        statElement.innerHTML = `
          <div style="color: ${stat.color};">Group Name: ${stat.name}</div>
          <div>Max Population: ${stat.maxPopulation}</div>
          <div>Max Generation: ${stat.highestGeneration}</div>
        `;
        groupStatsContainer.appendChild(statElement);
      });
    }

    document.getElementById('simulationOver')!.style.display = 'flex';
  }
}
