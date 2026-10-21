// game.js - Floor 1 only, 3 distinct levels, exact checks, no alerts
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let mode = 'building';
let credits = 0;
let stress = 0;
let techX = 100;
let walkFrame = 0;
let currentLevel = 0;
let wires = [];
let selectedTerm = null;
let meterMode = false;
let lastReading = null;
let completed = new Set();
let holdingLeft = false;
let holdingRight = false;

const levels = [
  {
    id: 'coil',
    title: 'Relay Coil Power',
    instruction: 'Connect A1 to +24V and A2 to GND.',
    devices: [
      { type: 'PSU', x: 40, y: 100, terminals: [{id:'+', label:'+24V', x:45, y:35}, {id:'-', label:'GND', x:95, y:35}] },
      { type: 'RELAY', x: 200, y: 110, terminals: [{id:'A1', label:'A1', x:30, y:30}, {id:'A2', label:'A2', x:30, y:55}] }
    ],
    correct: [
      { from: 'PSU.+', to: 'RELAY.A1' },
      { from: 'PSU.-', to: 'RELAY.A2' }
    ]
  },
  {
    id: 'contact',
    title: 'Relay Contact Control',
    instruction: 'Button switches the coil. Relay NO contact switches the lamp.',
    devices: [
      { type: 'PSU', x: 20, y: 80, terminals: [{id:'+', label:'+24V', x:40, y:30}, {id:'-', label:'GND', x:90, y:30}] },
      { type: 'PB', x: 40, y: 180, terminals: [{id:'1', label:'1', x:30, y:30}, {id:'2', label:'2', x:80, y:30}] },
      { type: 'RELAY', x: 180, y: 140, terminals: [{id:'A1', label:'A1', x:25, y:25}, {id:'A2', label:'A2', x:25, y:50}, {id:'COM', label:'COM', x:70, y:30}, {id:'NO', label:'NO', x:100, y:30}] },
      { type: 'LAMP', x: 280, y: 120, terminals: [{id:'+', label:'+', x:40, y:30}, {id:'-', label:'-', x:80, y:30}] }
    ],
    correct: [
      { from: 'PSU.+', to: 'PB.1' },
      { from: 'PB.2', to: 'RELAY.A1' },
      { from: 'RELAY.A2', to: 'PSU.-' },
      { from: 'PSU.+', to: 'RELAY.COM' },
      { from: 'RELAY.NO', to: 'LAMP.+' },
      { from: 'LAMP.-', to: 'PSU.-' }
    ]
  },
  {
    id: 'trouble',
    title: 'Troubleshooting: Open on A2',
    instruction: 'Pre-wired but A2 is open. Meter to find OL, then add the missing wire.',
    devices: [
      { type: 'PSU', x: 40, y: 100, terminals: [{id:'+', label:'+24V', x:45, y:35}, {id:'-', label:'GND', x:95, y:35}] },
      { type: 'RELAY', x: 200, y: 110, terminals: [{id:'A1', label:'A1', x:30, y:30}, {id:'A2', label:'A2', x:30, y:55}] }
    ],
    correct: [
      { from: 'PSU.+', to: 'RELAY.A1' },
      { from: 'PSU.-', to: 'RELAY.A2' }
    ],
    prewired: true
  }
];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener('resize', resize);
resize();

function getTechY() { return canvas.height - 100; }

function drawTech(x, y) {
  ctx.fillStyle = '#e2b423';
  ctx.fillRect(x, y - 28, 14, 14);
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(x - 1, y - 32, 16, 6);
  ctx.fillStyle = '#24143F';
  ctx.fillRect(x + 2, y - 14, 10, 16);
  const leg = Math.sin(walkFrame) * 4;
  ctx.fillStyle = '#1c1e1a';
  ctx.fillRect(x + 2, y + 2, 4, 10 + leg);
  ctx.fillRect(x + 8, y + 2, 4, 10 - leg);
}

function drawBuilding() {
  ctx.fillStyle = '#0d0618';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const floorY = canvas.height - 140;
  ctx.fillStyle = '#1e1035';
  ctx.fillRect(20, floorY, canvas.width - 40, 100);
  ctx.strokeStyle = '#38E1F5';
  ctx.strokeRect(20, floorY, canvas.width - 40, 100);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText('Floor 1: Relay Basics', 30, floorY + 30);
  for (let i = 0; i < 3; i++) {
    const dx = 60 + i * 90;
    ctx.fillStyle = completed.has(levels[i].id) ? '#22c55e' : '#c8102e';
    ctx.fillRect(dx, floorY + 50, 50, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '10px system-ui';
    ctx.fillText(`L${i+1}`, dx + 18, floorY + 74);
  }
  drawTech(techX, getTechY());
}

function drawCloseup() {
  const lvl = levels[currentLevel];
  ctx.fillStyle = '#140A26';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#38E1F5';
  ctx.font = '16px system-ui';
  ctx.fillText(lvl.title, 20, 30);
  ctx.fillStyle = '#D8B4FE';
  ctx.font = '13px system-ui';
  ctx.fillText(lvl.instruction, 20, 50);
  lvl.devices.forEach(dev => {
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(dev.x, dev.y, 130, 80);
    ctx.strokeStyle = '#4a2a7a';
    ctx.strokeRect(dev.x, dev.y, 130, 80);
    ctx.fillStyle = '#38E1F5';
    ctx.font = '10px system-ui';
    ctx.fillText(dev.type, dev.x + 6, dev.y + 14);
    dev.terminals.forEach(t => {
      const tx = dev.x + t.x;
      const ty = dev.y + t.y;
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(tx - 4, ty);
      ctx.lineTo(tx + 4, ty);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(t.label, tx, ty + 18);
      ctx.textAlign = 'left';
    });
  });
  ctx.lineWidth = 3;
  wires.forEach(w => {
    ctx.strokeStyle = w.color || '#c8102e';
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  });
  if (lastReading) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(10, 70, 220, 40);
    ctx.fillStyle = '#38E1F5';
    ctx.font = '14px system-ui';
    ctx.fillText(lastReading, 20, 95);
  }
  ctx.fillStyle = '#7A6A99';
  ctx.fillRect(10, canvas.height - 50, 80, 36);
  ctx.fillStyle = '#fff';
  ctx.font = '14px system-ui';
  ctx.fillText('Back', 32, canvas.height - 28);
}

function draw() {
  if (mode === 'building') drawBuilding();
  else drawCloseup();
}

function updateHUD() {
  document.getElementById('credits').textContent = credits;
  document.getElementById('stress').textContent = stress;
  document.getElementById('info').textContent = mode === 'building'
    ? 'Walk to L1/L2/L3 and Interact. Stress slows you at 100.'
    : levels[currentLevel].instruction;
}

function openLevel(i) {
  currentLevel = i;
  mode = 'closeup';
  wires = [];
  selectedTerm = null;
  lastReading = null;
  meterMode = false;
  const lvl = levels[i];
  if (lvl.prewired) {
    wires.push({ x1: 85, y1: 135, x2: 230, y2: 140, color: '#c8102e', from: 'PSU.+', to: 'RELAY.A1' });
  }
  if (lvl.id === 'trouble') stress = Math.min(100, stress + 20);
  updateHUD();
  draw();
}

function checkWires() {
  const lvl = levels[currentLevel];
  if (wires.length === 0) return { ok: false, msg: 'No wires placed.' };
  const player = wires.map(w => [w.from, w.to].sort().join('|')).filter(p => p !== '|');
  const needed = lvl.correct.map(c => [c.from, c.to].sort().join('|'));
  const missing = needed.filter(n => !player.includes(n));
  const extra = player.filter(p => !needed.includes(p));
  if (missing.length || extra.length) return { ok: false, msg: 'Wrong connections.' };
  return { ok: true, msg: 'Correct!' };
}

function completeLevel() {
  const result = checkWires();
  if (!result.ok) {
    stress = Math.min(100, stress + 10);
    updateHUD();
    document.getElementById('info').textContent = result.msg;
    return;
  }
  const id = levels[currentLevel].id;
  if (!completed.has(id)) {
    completed.add(id);
    credits += 15;
  }
  stress = Math.max(0, stress - 8);
  updateHUD();
  document.getElementById('info').textContent = 'Level complete. Credits awarded once.';
  mode = 'building';
  draw();
}

function measure(a, b) {
  if ((a.label === 'A1' && b.label === '+24V') || (a.label === '+24V' && b.label === 'A1')) return '24 V DC';
  if ((a.label === 'A2' && b.label === 'GND') || (a.label === 'GND' && b.label === 'A2')) return '0.1 Ω';
  return 'OL';
}

function loop() {
  if (mode === 'building') {
    const speed = stress >= 100 ? 1.2 : 2.5;
    if (holdingLeft) techX = Math.max(30, techX - speed);
    if (holdingRight) techX = Math.min(canvas.width - 40, techX + speed);
    if (holdingLeft || holdingRight) walkFrame += 0.25;
    draw();
  }
  requestAnimationFrame(loop);
}
loop();

document.getElementById('btn-left').onpointerdown = () => holdingLeft = true;
document.getElementById('btn-left').onpointerup = () => holdingLeft = false;
document.getElementById('btn-left').onpointerleave = () => holdingLeft = false;
document.getElementById('btn-right').onpointerdown = () => holdingRight = true;
document.getElementById('btn-right').onpointerup = () => holdingRight = false;
document.getElementById('btn-right').onpointerleave = () => holdingRight = false;

document.getElementById('btn-interact').onclick = () => {
  if (mode === 'building') {
    const floorY = canvas.height - 140;
    for (let i = 0; i < 3; i++) {
      const dx = 60 + i * 90;
      if (Math.abs(techX - (dx + 25)) < 40) {
        openLevel(i);
        return;
      }
    }
    document.getElementById('info').textContent = 'Get closer to a level door.';
  } else {
    completeLevel();
  }
};

document.getElementById('btn-store').onclick = () => {
  const modal = document.getElementById('store-modal');
  document.getElementById('store-items').innerHTML = `<div>Coffee — 8 credits <button id="buy-coffee">Buy</button></div>`;
  document.getElementById('buy-coffee').onclick = () => {
    if (credits >= 8) {
      credits -= 8;
      stress = 0;
      updateHUD();
      document.getElementById('info').textContent = 'Coffee bought. Stress reset.';
      modal.style.display = 'none';
    } else {
      document.getElementById('info').textContent = 'Not enough credits.';
    }
  };
  modal.style.display = 'block';
};
document.getElementById('store-close').onclick = () => document.getElementById('store-modal').style.display = 'none';

canvas.addEventListener('pointerdown', e => {
  if (mode !== 'closeup') return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (x > 10 && x < 90 && y > canvas.height - 50) {
    mode = 'building';
    wires = [];
    updateHUD();
    draw();
    return;
  }
  let found = null;
  const lvl = levels[currentLevel];
  lvl.devices.forEach(dev => {
    dev.terminals.forEach(t => {
      const tx = dev.x + t.x;
      const ty = dev.y + t.y;
      if (Math.hypot(x - tx, y - ty) < 16) found = { dev: dev.type, term: t.id, x: tx, y: ty, label: t.label };
    });
  });
  if (found) {
    if (meterMode) {
      if (!selectedTerm) selectedTerm = found;
      else {
        lastReading = measure(selectedTerm, found);
        selectedTerm = null;
        document.getElementById('info').textContent = lastReading;
      }
    } else {
      if (!selectedTerm) selectedTerm = found;
      else if (selectedTerm.x !== found.x || selectedTerm.y !== found.y) {
        wires.push({
          x1: selectedTerm.x, y1: selectedTerm.y,
          x2: found.x, y2: found.y,
          color: '#c8102e',
          from: `${selectedTerm.dev}.${selectedTerm.term}`,
          to: `${found.dev}.${found.term}`
        });
        selectedTerm = null;
      } else selectedTerm = null;
    }
    draw();
  }
});

document.getElementById('btn-interact').addEventListener('contextmenu', e => {
  e.preventDefault();
  meterMode = !meterMode;
  document.getElementById('info').textContent = meterMode ? 'Meter ON' : 'Wire mode';
});

updateHUD();
draw();
