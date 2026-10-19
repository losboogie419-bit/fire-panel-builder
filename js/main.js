// main.js - game loop, level loading, UI
let currentLevel = null;
let levels = [];

async function loadLevels() {
  const levelFiles = ['level1.json', 'level2.json', 'level3.json', 'fa_level1.json'];
  for (const f of levelFiles) {
    const res = await fetch(`levels/${f}`);
    levels.push(await res.json());
  }
  startLevel(levels[0]);
}

function startLevel(level) {
  currentLevel = level;
  document.getElementById('status').textContent = `Floor ${level.floor}: ${level.title}`;
  Wiring.loadLevel(level);
  Progress.load();
  document.getElementById('credits').textContent = Progress.data.credits;
}

function testCircuit() {
  const result = Simulation.evaluate(currentLevel, Wiring.wires, { start: true });
  if (result.success) {
    alert('Circuit correct! Floor running.\n' + (currentLevel.learning_objective || ''));
    Progress.addCredits(currentLevel.reward_credits || 10);
    Progress.completeLevel(currentLevel.id);
    if (currentLevel.floor === Progress.data.unlockedFloors) {
      Progress.unlockFloor(currentLevel.floor + 1);
    }
    document.getElementById('credits').textContent = Progress.data.credits;
  } else {
    alert('Not yet:\n' + result.errors.join('\n'));
  }
}

document.getElementById('btn-test').onclick = testCircuit;
document.getElementById('btn-next').onclick = () => {
  const idx = levels.findIndex(l => l.id === currentLevel.id);
  if (idx < levels.length - 1) startLevel(levels[idx + 1]);
};

window.onload = () => {
  const canvas = document.getElementById('game');
  Wiring.init(canvas);
  loadLevels();
};
