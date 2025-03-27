# 🧬 Vibe Life Simulator

**Vibe Life Simulator** is a browser-based 2D ecosystem simulation that models the behavior of simple digital organisms. Organisms move, eat, rest, age, reproduce, and evolve through generations in a dynamic environment. The simulation is built using TypeScript and rendered on an HTML5 canvas.

---

## 🚀 Features

- 🌈 Simulates multiple groups of organisms with distinct colors
- 🧬 Generational evolution: each offspring has a generation number (parent's generation + 1)
- ♀️♂️ Gendered reproduction with male and female organisms
- 🍽️ Organisms seek and consume food to survive and grow
- 🤰 Pregnancy and gestation period for female organisms
- 💤 Organisms occasionally rest to conserve energy
- ⏳ Natural lifecycle including aging and death
- 📊 Statistics tracking for population and highest generation reached
- ⏯️ UI controls to pause and resume simulation

---

## 🧪 Organism Behavior

- **Movement**: Organisms move toward food when hungry
- **Feeding**: Eating food reduces hunger and allows growth
- **Mating**: Occurs between males and females of the same group when hunger is below threshold
- **Reproduction**: Females become pregnant and give birth after a gestation period
- **Generations**: Each new organism has a generation number (parent's generation + 1)
- **Resting**: Organisms occasionally enter a rest state
- **Death**: Occurs due to old age or starvation

---

## ⚙️ Configuration

The simulation is highly configurable through TypeScript configuration files:

### Life Configuration (`LifeConfig.ts`)
- Initial radius: 5
- Max/min radius: 15/2
- Speed: 1.2
- Mating distance: 15
- Gestation period: 300 frames
- Hunger limit: 1000
- Age limit: 1500 frames
- Rest chance: 0.002 per frame

### Food Configuration (`FoodConfig.ts`)
- Radius: 3
- Spawn chance based on population density

---

## 🏗️ Architecture

The simulation is built using an Entity-Component-System (ECS) architecture:

### Components
- `LifeComponent`: Stores organism properties (sex, hunger, generation, etc.)
- `PositionComponent`: Handles position and velocity
- `FoodComponent`: Represents food entities

### Systems
- `LifecycleSystem`: Manages aging, reproduction, and death
- `MovementSystem`: Controls organism movement
- `MatingSystem`: Handles reproduction logic
- `RenderingSystem`: Visualizes entities on canvas
- `CollisionSystem`: Detects and resolves collisions
- `FoodSystem`: Manages food spawning and consumption

### Core
- `World`: Central simulation container
- `Entity`: Base class for all simulation objects
- `Vector2D`: 2D vector operations
- `EventEmitter`: Handles simulation events

---

## 🖥️ Tech Stack

- TypeScript
- HTML5 Canvas
- Entity-Component-System architecture
- Event-driven communication
- Object pooling for performance

---

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the local server address

---

## 📜 License

MIT License
