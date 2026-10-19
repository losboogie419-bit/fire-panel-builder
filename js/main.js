// main.js - stress + title support
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
  document.getElementById('stress').textContent = Progress.data.stress || 0;
}

function testCircuit() {
  if (!currentLevel) return;
  const result = Simulation.evaluate(currentLevel, Wiring.wires, { start: true });
  if (result.success) {
    alert('Correct! Floor is running.\n\n' + (currentLevel.learning_objective || 'Nice work.'));
    Progress.addCredits(currentLevel.reward_credits || 10);
    Progress.addStress(5);
    Progress.reduceStress(12);
    document.getElementById('stress').textContent = Progress.data.stress;
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

let wireColor = '#c8102e';

document.getElementById('btn-color').onclick = () => {
  const colors = ['#c8102e', '#000000', '#38E1F5', '#e2b423', '#FFFFFF'];
  const names = ['Red', 'Black', 'Cyan', 'Gold', 'White'];
  const idx = colors.indexOf(wireColor);
  const next = (idx + 1) % colors.length;
  wireColor = colors[next];
  const btn = document.getElementById('btn-color');
  btn.style.background = wireColor;
  btn.style.color = (wireColor === '#000000' || wireColor === '#FFFFFF') ? '#140A26' : '#FFFFFF';
  btn.textContent = names[next];
  Wiring.currentColor = wireColor;
};

document.getElementById('btn-clear').onclick = () => {
  Wiring.wires = [];
  Wiring.lastReading = null;
  Wiring.draw();
};

document.getElementById('btn-floors').onclick = () => {
  const unlocked = Progress.data.unlockedFloors || 1;
  const choice = prompt(`Go to floor (1-${unlocked}):`, '1');
  const floor = parseInt(choice);
  if (floor >= 1 && floor <= unlocked) {
    const level = levels.find(l => l.floor === floor);
    if (level) startLevel(level);
  }
};

window.onload = () => {
  const canvas = document.getElementById('game');
  Wiring.init(canvas);
  loadLevels();
};
