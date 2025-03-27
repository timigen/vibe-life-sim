
# 🧬 lifeSim

**lifeSim** is a browser-based 2D simulation that models the behavior of simple digital organisms in an ecosystem. Organisms move, eat, rest, age, reproduce, and die in a dynamic, visually engaging environment. The simulation is rendered on an HTML5 canvas and features gendered reproduction, food dynamics, and population tracking.

---

## 🚀 Features

- 🐛 Simulates male and female microbes from multiple colored groups.
- 🍊 Organisms seek and consume food to survive and grow.
- 💑 Gendered reproduction: mating requires proximity and hunger conditions.
- 👶 Birth occurs after a gestation period for females.
- 💤 Organisms occasionally rest (stop moving temporarily).
- ⚰️ Organisms die from starvation, shrinking, or old age.
- 📈 Tracks current and max population.
- 🎮 Play/pause button and restart simulation on extinction.
- 📦 Efficient collision and spatial handling using a grid-based partitioning system.
- 🧠 Well-structured with config constants and reusable classes.

---

## 🧪 Organism Behavior

- **Movement**: Toward nearest food if hungry; random otherwise.
- **Eating**: Increases size and resets hunger.
- **Mating**: Happens between nearby male/female pairs of the same group if not too hungry.
- **Birth**: Pregnant females give birth to a child (random sex) after gestation.
- **Resting**: Microbes occasionally rest for a few frames.
- **Death**: Occurs due to age, starvation, or shrinkage.

---

## ⚙️ Configuration

All parameters are defined in constants for easy tuning:

### Microbe Behavior (`MICROBE_CONFIG`)
- Initial radius: 5
- Max radius: 15
- Speed: 1.2
- Mating distance: 15
- Hunger limit: 1000
- Rest chance: 0.002 per frame
- Gestation period: 300 frames
- Age limit: 2000 frames

### Food Behavior (`FOOD_CONFIG`)
- Radius: 3
- Initial spawn: 70
- Spawn rate scales with population (up to 10%)

---

## 🖥️ UI

- Top-left: live population count
- Top-right: play/pause toggle
- Game Over screen when population hits zero, with max population shown and restart button

---

## 📂 Structure

Everything is contained in a single `index.html` file:
- `<canvas>` for rendering
- `<script>` for simulation logic and rendering
- Organized into utility classes (`Vector2D`, `Microbe`, `Food`) and systems (`Mating`, `Eating`, `Collisions`, `UI`, `Game State`)

---

## 🧰 Tech Stack

- HTML5 Canvas
- Vanilla JavaScript (no libraries)
- Typed object structures (`Vector2D`)
- Simple spatial partitioning for collision efficiency

---

## 📦 Getting Started

1. Clone or download the project
2. Open `index.html` in any modern browser
3. Watch life emerge and evolve 🧬

---

## 📜 License

MIT License © 2025
