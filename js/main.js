// main.js - fixed progression, power, credits, info, meter sync
let currentLevel = null;
let levels = [];
let mapMode = false;
let currentLevelIndex = 0;

function loadLevels() {
  levels = [
    {
      id: "level1",
      floor: 1,
      title: "Relay Anatomy",
      learning_objective: "Identify the coil (A1/A2) and contacts (COM/NO/NC). Connect A1 to 24V and A2 to GND to energize.",
      story_text: "First job: learn the relay terminals so the next tech knows what's what.",
      devices: [
        {type: "psu", x: 40, y: 40, id: "psu1"},
        {type: "relay", x: 160, y: 80, id: "r1"}
      ],
      correct_connections: [
        {from: "psu1.+", to: "r1.A1"},
        {from: "r1.A2", to: "psu1.-"}
      ],
      reward_credits: 10
    },
    {
      id: "level2",
      floor: 1,
      title: "Basic Relay Control",
      learning_objective: "Pushbutton energizes the coil. Relay NO switches the lamp on.",
      story_text: "Wire a pushbutton to turn on the lamp through the relay's NO contact.",
      devices: [
        {type: "psu", x: 20, y: 30, id: "psu1"},
        {type: "pb_no", x: 40, y: 100, id: "pb1"},
        {type: "relay", x: 140, y: 90, id: "r1"},
        {type: "lamp", x: 250, y: 70, id: "l1"}
      ],
      correct_connections: [
        {from: "psu1.+", to: "pb1.1"},
        {from: "pb1.2", to: "r1.A1"},
        {from: "r1.A2", to: "psu1.-"},
        {from: "psu1.+", to: "r1.COM"},
        {from: "r1.NO", to: "l1.+"},
        {from: "l1.-", to: "psu1.-"}
      ],
      reward_credits: 15
    },
    {
      id: "level3",
      floor: 1,
      title: "Seal-In Circuit",
      learning_objective: "START starts the coil. Relay's own NO holds it. STOP (NC) breaks the circuit.",
      story_text: "Make a seal-in so the lamp stays on after you let go of START.",
      devices: [
        {type: "psu", x: 10, y: 20, id: "psu1"},
        {type: "pb_no", x: 30, y: 60, id: "start"},
        {type: "pb_nc", x: 30, y: 160, id: "stop"},
        {type: "relay", x: 140, y: 100, id: "r1"},
        {type: "lamp", x: 250, y: 90, id: "l1"}
      ],
      correct_connections: [
        {from: "psu1.+", to: "stop.1"},
        {from: "stop.2", to: "start.1"},
        {from: "start.2", to: "r1.A1"},
        {from: "r1.NO", to: "start.2"},
        {from: "r1.A2", to: "psu1.-"},
        {from: "psu1.+", to: "r1.COM"},
        {from: "r1.NO", to: "l1.+"},
        {from: "l1.-", to: "psu1.-"}
      ],
      reward_credits: 20
    },
    {
      id: "level_and",
      floor: 2,
      title: "AND Gate (Relay)",
      learning_objective: "Two NO buttons in series — both must be pressed to energize the coil.",
      story_text: "Both buttons must be closed for the lamp to light.",
      devices: [
        {type: "psu", x: 10, y: 20, id: "psu1"},
        {type: "pb_no", x: 40, y: 50, id: "a"},
        {type: "pb_no", x: 40, y: 150, id: "b"},
        {type: "relay", x: 160, y: 90, id: "r1"},
        {type: "lamp", x: 270, y: 80, id: "l1"}
      ],
      correct_connections: [
        {from: "psu1.+", to: "a.1"},
        {from: "a.2", to: "b.1"},
        {from: "b.2", to: "r1.A1"},
        {from: "r1.A2", to: "psu1.-"},
        {from: "psu1.+", to: "r1.COM"},
        {from: "r1.NO", to: "l1.+"},
        {from: "l1.-", to: "psu1.-"}
      ],
      reward_credits: 20
    },
    {
      id: "fa_level1",
      floor: 3,
      title: "Pull Station + EOL",
      learning_objective: "Pull station on a monitor module with EOL at the end. Open = TROUBLE.",
      story_text: "Wire the pull station with the correct EOL so the panel supervises the circuit.",
      devices: [
        {type: "monitor_module", x: 40, y: 60, id: "mm1"},
        {type: "pull_station", x: 170, y: 40, id: "ps1"},
        {type: "eol", x: 200, y: 150, id: "eol1"}
      ],
      correct_connections: [
        {from: "mm1.IN+", to: "ps1.1"},
        {from: "ps1.2", to: "eol1.1"},
        {from: "eol1.2", to: "mm1.IN-"}
      ],
      reward_credits: 25
    }
  ];
  if (levels.length) startLevel(levels[0]);
}

function startLevel(level) {
  currentLevel = level;
  currentLevelIndex = levels.findIndex(l => l.id === level.id);
  document.getElementById('status').textContent = `Floor ${level.floor}: ${level.title}`;
  document.getElementById('info').innerHTML = `<strong>${level.title}</strong><br>${level.learning_objective || ''}<br><em>${level.story_text || ''}</em>`;
  Wiring.loadLevel(level);
  Progress.load();
  document.getElementById('credits').textContent = Progress.data.credits;
  document.getElementById('stress').textContent = Progress.data.stress || 0;
  Wiring.meterMode = false;
  const btn = document.getElementById('btn-meter');
  btn.style.background = '#38E1F5';
  btn.textContent = 'Meter';
  if (mapMode) {
    mapMode = false;
    document.getElementById('game').style.display = 'block';
    document.getElementById('map').style.display = 'none';
  }
}

function playSuccessBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

function testCircuit() {
  if (!currentLevel) return;
  const result = Simulation.evaluate(currentLevel, Wiring.wires, { start: true });
  if (result.success) {
    playSuccessBeep();
    alert('Correct! Floor is running.\n\n' + (currentLevel.learning_objective || 'Nice work.'));
    const already = Progress.data.completedLevels.includes(currentLevel.id);
    if (!already) {
      Progress.addCredits(currentLevel.reward_credits || 10);
      Progress.completeLevel(currentLevel.id);
      if (currentLevel.floor === Progress.data.unlockedFloors) {
        Progress.unlockFloor(currentLevel.floor + 1);
      }
    }
    Progress.addStress(5);
    Progress.reduceStress(12);
    document.getElementById('stress').textContent = Progress.data.stress;
    document.getElementById('credits').textContent = Progress.data.credits;
    if (currentLevelIndex < levels.length - 1) {
      setTimeout(() => startLevel(levels[currentLevelIndex + 1]), 600);
    }
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

document.getElementById('btn-store').onclick = () => Store.open();

document.getElementById('store-close').onclick = () => {
  document.getElementById('store-modal').style.display = 'none';
};

document.getElementById('btn-floors').onclick = () => {
  mapMode = !mapMode;
  const gameCanvas = document.getElementById('game');
  const mapCanvas = document.getElementById('map');
  if (mapMode) {
    gameCanvas.style.display = 'none';
    mapCanvas.style.display = 'block';
    FloorMap.init(mapCanvas);
    FloorMap.setUnlocked(Progress.data.unlockedFloors || 1);
  } else {
    gameCanvas.style.display = 'block';
    mapCanvas.style.display = 'none';
  }
};

window.onload = () => {
  const canvas = document.getElementById('game');
  Wiring.init(canvas);
  loadLevels();
};
