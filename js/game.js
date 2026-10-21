// game.js - Tiny Death Star style building + close-up wiring
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let mode = 'building';
let credits = 0;
let stress = 0;
let techX = 80;
let facing = 1;
let walkFrame = 0;
let floors = [
  { id: 1, name: 'Relay Basics', y: 0, done: false, panelX: 180 },
  { id: 2, name: 'Logic', y: 0, done: false, panelX: 180 },
  { id: 3, name: 'Fire Alarm', y: 0, done: false, panelX: 180 }
];
let currentFloor = 0;
let closeupDevices = [];
let wires = [];
let selectedTerm = null;
let lastReading = null;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  floors.forEach((f, i) => f.y = canvas.height - 120 - i * 90);
  draw();
}
window.addEventListener('resize', resize);
resize();

function drawTech(x, y) {
  ctx.fillStyle = '#e2b423';
  ctx.fillRect(x, y - 28, 14, 14);
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(x - 1, y - 32, 16, 6);
  ctx.fillStyle = '#24143F';
  ctx.fillRect(x + 2, y - 14, 10, 16);
  ctx.fillStyle = '#1c1e1a';
  const legOffset = Math.sin(walkFrame) * 3;
  ctx.fillRect(x + 2, y + 2, 4, 10 + legOffset);
  ctx.fillRect(x + 8, y + 2, 4, 10 - legOffset);
  ctx.fillStyle = '#3B1F66';
  ctx.fillRect(x + 12, y - 8, 8, 10);
}

function drawBuilding() {
  ctx.fillStyle = '#0d0618';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  floors.forEach((f, i) => {
    const unlocked = i <= currentFloor || f.done;
    ctx.fillStyle = unlocked ? '#1e1035' : '#12101a';
    ctx.fillRect(20, f.y, canvas.width - 40, 80);
    if (f.done) {
      ctx.fillStyle = 'rgba(56,225,245,0.15)';
      ctx.fillRect(20, f.y, canvas.width - 40, 80);
    }
    ctx.strokeStyle = unlocked ? '#38E1F5' : '#5a4a70';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, f.y, canvas.width - 40, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '14px system-ui';
    ctx.fillText(`Floor ${f.id}: ${f.name}`, 30, f.y + 45);
    ctx.fillStyle = f.done ? '#22c55e' : '#c8102e';
    ctx.fillRect(f.panelX, f.y + 20, 40, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '10px system-ui';
    ctx.fillText('PANEL', f.panelX + 4, f.y + 42);
  });
  const techY = floors[currentFloor].y + 20;
  drawTech(techX, techY);
}

function drawCloseup() {
  ctx.fillStyle = '#140A26';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#38E1F5';
  ctx.font = '16px system-ui';
  ctx.fillText('Close-up: Wire the circuit', 20, 30);
  closeupDevices.forEach(dev => {
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(dev.x, dev.y, 120, 70);
    ctx.strokeStyle = '#4a2a7a';
    ctx.strokeRect(dev.x, dev.y, 120, 70);
    ctx.fillStyle = '#38E1F5';
    ctx.font = '10px system-ui';
    ctx.fillText(dev.type, dev.x + 6, dev.y + 14);
    dev.terminals.forEach(t => {
      const tx = dev.x + t.x;
      const ty = dev.y + t.y;
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty);
      ctx.lineTo(tx + 3, ty);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(t.label, tx, ty + 16);
      ctx.textAlign = 'left';
    });
  });
  ctx.lineWidth = 3;
  wires.forEach(w => {
    ctx.strokeStyle = w.color;
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  });
  if (lastReading) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(10, 50, 200, 40);
    ctx.fillStyle = '#38E1F5';
    ctx.fillText(lastReading, 20, 75);
  }
}

function draw() {
  if (mode === 'building') drawBuilding();
  else drawCloseup();
}

function updateHUD() {
  document.getElementById('credits').textContent = credits;
  document.getElementById('stress').textContent = stress;
}

function openCloseup() {
  mode = 'closeup';
  document.getElementById('info').innerHTML = '<strong>Relay Basics</strong><br>Connect A1 to +24V and A2 to GND. Tap terminals to wire.';
  closeupDevices = [
    { type: 'PSU', x: 40, y: 80, terminals: [{id:'+', label:'+24V', x:40, y:30}, {id:'-', label:'GND', x:80, y:30}] },
    { type: 'RELAY', x: 200, y: 90, terminals: [{id:'A1', label:'A1', x:25, y:25}, {id:'A2', label:'A2', x:25, y:50}, {id:'COM', label:'COM', x:70, y:30}] }
  ];
  wires = [];
  selectedTerm = null;
  lastReading = null;
  draw();
}

function checkComplete() {
  if (wires.length > 0) {
    floors[currentFloor].done = true;
    credits += 15;
    stress = Math.max(0, stress - 10);
    updateHUD();
    alert('Floor complete! +15 credits');
    mode = 'building';
    document.getElementById('info').textContent = 'Floor lit up. Walk to the next one.';
    if (currentFloor < floors.length - 1) currentFloor++;
    draw();
  } else {
    alert('Wire something first.');
  }
}

document.getElementById('btn-left').onclick = () => {
  if (mode === 'building') {
    techX = Math.max(30, techX - 20);
    facing = -1;
    walkFrame += 0.5;
    draw();
  }
};
document.getElementById('btn-right').onclick = () => {
  if (mode === 'building') {
    techX = Math.min(canvas.width - 40, techX + 20);
    facing = 1;
    walkFrame += 0.5;
    draw();
  }
};
document.getElementById('btn-interact').onclick = () => {
  if (mode === 'building') {
    const f = floors[currentFloor];
    if (Math.abs(techX - f.panelX) < 60) openCloseup();
    else document.getElementById('info').textContent = 'Get closer to the panel.';
  } else {
    checkComplete();
  }
};

document.getElementById('btn-store').onclick = () => {
  const modal = document.getElementById('store-modal');
  const list = document.getElementById('store-items');
  list.innerHTML = `
    <div>Coffee — 8 credits <button data-id="coffee">Buy</button></div>
    <div>Knee Pads — 20 credits <button data-id="knee">Buy</button></div>
    <div>Headlamp — 15 credits <button data-id="lamp">Buy</button></div>
  `;
  list.querySelectorAll('button').forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    const cost = id === 'coffee' ? 8 : id === 'knee' ? 20 : 15;
    if (credits >= cost) {
      credits -= cost;
      if (id === 'coffee') stress = 0;
      updateHUD();
      alert('Bought!');
      modal.style.display = 'none';
    } else alert('Not enough credits');
  });
  modal.style.display = 'block';
};
document.getElementById('store-close').onclick = () => document.getElementById('store-modal').style.display = 'none';

canvas.addEventListener('pointerdown', e => {
  if (mode !== 'closeup') return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let found = null;
  closeupDevices.forEach(dev => {
    dev.terminals.forEach(t => {
      const tx = dev.x + t.x;
      const ty = dev.y + t.y;
      if (Math.hypot(x - tx, y - ty) < 18) found = { x: tx, y: ty, label: t.label };
    });
  });
  if (found) {
    if (!selectedTerm) selectedTerm = found;
    else {
      wires.push({ x1: selectedTerm.x, y1: selectedTerm.y, x2: found.x, y2: found.y, color: '#c8102e' });
      selectedTerm = null;
    }
    draw();
  }
});

updateHUD();
draw();
