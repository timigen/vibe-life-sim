import { System } from '../ecs/System';
import { GameState } from '../config/constants';
import { World } from '../ecs/World';

export class UISystem extends System {
  private world: World;
  private lastFPSUpdate: number = 0;
  private frameCount: number = 0;
  private updatePending: boolean = false;

  constructor(world: World) {
    super();
    this.world = world;
  }

  shouldProcessEntity(): boolean {
    return false; // This system doesn't process entities
  }

  update(deltaTime: number): void {
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFPSUpdate >= 1000) {
      GameState.fps = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }

    // Update FPS display
    document.getElementById('fpsCounter')!.textContent = GameState.fps.toString();

    // Update death counters
    document.getElementById('starvationDeaths')!.textContent = GameState.deathsByStarvation.toString();
    document.getElementById('oldAgeDeaths')!.textContent = GameState.deathsByOldAge.toString();

    // Update population count
    this.updateStats();
  }

  private async updateStats(): Promise<void> {
    if (this.updatePending) return;
    this.updatePending = true;

    await new Promise(resolve => requestAnimationFrame(resolve));
    
    document.getElementById('populationCount')!.textContent = 
        this.world.getLifeCount().toString();
    // ... other UI updates ...

    this.updatePending = false;
  }

  showGameOver(): void {
    document.getElementById('maxPopDisplay')!.textContent = GameState.maxPopulation.toString();
    document.getElementById('finalStarvationDeaths')!.textContent = GameState.deathsByStarvation.toString();
    document.getElementById('finalOldAgeDeaths')!.textContent = GameState.deathsByOldAge.toString();
    document.getElementById('finalFPS')!.textContent = GameState.fps.toString();
    document.getElementById('gameOver')!.style.display = 'flex';
  }
} 