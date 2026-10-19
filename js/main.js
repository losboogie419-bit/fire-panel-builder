// main.js - improved level flow and feedback
let currentLevel = null;
let levels = [];

async function loadLevels() {
  const levelFiles = ['level1.json', 'level2.json', 'level3.json', 'fa_level1.json'];
  for (const f of levelFiles) {
    try {
      const res = await fetch(`levels/${f}`);
      if (res.ok) levels.push(await res.json());
    } catch (e) {
      console.warn('Could not load', f);
    }
  }
  if (levels.length) startLevel(levels[0]);
}

function startLevel(level) {
  currentLevel = level;
  document.getElementById('status').textContent = `Floor ${level.floor}: ${level.title}`;
  Wiring.loadLevel(level);
  Progress.load();
  document.getElementById('credits').textContent = Progress.data.credits;
}

function testCircuit() {
  if (!currentLevel) return;
  const result = Simulation.evaluate(currentLevel, Wiring.wires, { start: true });
  if (result.success) {
    alert('Correct! Floor is running.\n\n' + (currentLevel.learning_objective || 'Nice work.'));
    Progress.addCredits(currentLevel.reward_credits || 10);
    Progress.completeLevel(currentLevel.id);
    if (currentLevel.floor === Progress.data.unlockedFloors) {
      Progress.unlockFloor(currentLevel.floor + 1);
    }
    document.getElementById('credits').textContent = Progress.data.credits;
  } else {
    alert('Not quite:\n\n' + (result.errors.length ? result.errors.join('\n') : 'Check your connections.'));
  }
}

document.getElementById('btn-test').onclick = testCircuit;

document.getElementById('btn-meter').onclick = () => {
  Wiring.meterMode = !Wiring.meterMode;
  Wiring.meterPoints = [];
  Wiring.lastReading = null;
  const btn = document.getElementById('btn-meter');
  btn.style.background = Wiring.meterMode ? '#e2b423' : '#38E1F5';
  btn.textContent = Wiring.meterMode ? 'Meter ON' : 'Meter';
  Wiring.draw();
};

document.getElementById('btn-wire').onclick = () => {
  Wiring.meterMode = false;
  Wiring.meterPoints = [];
  const btn = document.getElementById('btn-meter');
  btn.style.background = '#38E1F5';
  btn.textContent = 'Meter';
  Wiring.draw();
};
document.getElementById('btn-next').onclick = () => {
  const idx = levels.findIndex(l => l.id === currentLevel.id);
  if (idx >= 0 && idx < levels.length - 1) {
    startLevel(levels[idx + 1]);
  } else {
    alert('More floors coming soon.');
  }
};

window.onload = () => {
  const canvas = document.getElementById('game');
  Wiring.init(canvas);
  loadLevels();
};
