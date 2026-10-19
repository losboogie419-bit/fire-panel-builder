// main.js - levels embedded + mobile positions
let currentLevel = null;
let levels = [];

function loadLevels() {
  levels = [
    {
      "id": "level1",
      "floor": 1,
      "title": "Relay Anatomy",
      "learning_objective": "Identify coil A1/A2, COM, NO, and NC terminals. NO is open until coil is energized.",
      "devices": [
        {"type": "relay", "x": 80, "y": 100, "id": "r1"}
      ],
      "correct_connections": [],
      "common_mistakes": [
        {"connection_pattern": "lamp_on_nc", "explanation": "The lamp is on NC, so it is lit when the relay is OFF."}
      ],
      "reward_credits": 10
    },
    {
      "id": "level2",
      "floor": 1,
      "title": "Basic Relay Control",
      "learning_objective": "Pushbutton energizes the coil (24VDC). Relay NO contact switches the lamp on.",
      "devices": [
        {"type": "pb_no", "x": 30, "y": 50, "id": "pb1"},
        {"type": "relay", "x": 110, "y": 90, "id": "r1"},
        {"type": "lamp", "x": 200, "y": 50, "id": "l1"}
      ],
      "correct_connections": [
        {"from": "pb1.1", "to": "r1.A1"},
        {"from": "r1.A2", "to": "gnd"},
        {"from": "24v", "to": "pb1.2"},
        {"from": "r1.COM", "to": "24v"},
        {"from": "r1.NO", "to": "l1.+"},
        {"from": "l1.-", "to": "gnd"}
      ],
      "common_mistakes": [
        {"connection_pattern": "lamp_on_nc", "explanation": "The lamp is on NC, so it is lit when the relay is OFF."}
      ],
      "reward_credits": 15
    },
    {
      "id": "level3",
      "floor": 1,
      "title": "Seal-In Circuit",
      "learning_objective": "START (NO) starts the coil. The relay's own NO contact holds it after START is released. STOP (NC) breaks the circuit.",
      "devices": [
        {"type": "pb_no", "x": 20, "y": 40, "id": "start"},
        {"type": "pb_nc", "x": 20, "y": 140, "id": "stop"},
        {"type": "relay", "x": 120, "y": 80, "id": "r1"},
        {"type": "lamp", "x": 210, "y": 80, "id": "l1"}
      ],
      "correct_connections": [
        {"from": "24v", "to": "stop.1"},
        {"from": "stop.2", "to": "start.1"},
        {"from": "start.2", "to": "r1.A1"},
        {"from": "r1.NO", "to": "start.2"},
        {"from": "r1.A2", "to": "gnd"},
        {"from": "r1.COM", "to": "24v"},
        {"from": "r1.NO", "to": "l1.+"},
        {"from": "l1.-", "to": "gnd"}
      ],
      "reward_credits": 20
    },
    {
      "id": "fa_level1",
      "floor": 3,
      "title": "Pull Station + EOL",
      "learning_objective": "A pull station on a monitor module circuit shows NORMAL with EOL, TROUBLE if open, ALARM when pulled.",
      "devices": [
        {"type": "monitor_module", "x": 60, "y": 80, "id": "mm1"},
        {"type": "pull_station", "x": 180, "y": 40, "id": "ps1"},
        {"type": "eol", "x": 200, "y": 140, "id": "eol1"}
      ],
      "correct_connections": [
        {"from": "mm1.IN+", "to": "ps1.1"},
        {"from": "ps1.2", "to": "eol1.1"},
        {"from": "eol1.2", "to": "mm1.IN-"}
      ],
      "common_mistakes": [
        {"connection_pattern": "no_eol", "explanation": "Missing EOL — panel sees OPEN and reports TROUBLE."}
      ],
      "reward_credits": 25
    }
  ];
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
