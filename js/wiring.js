// wiring.js - color support + multimeter
const Wiring = {
  canvas: null,
  ctx: null,
  devices: [],
  wires: [],
  selectedTerminal: null,
  meterMode: false,
  meterPoints: [],
  lastReading: null,
  currentColor: '#c8102e',
  scale: 1,
  offsetX: 0,
  offsetY: 0,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
  },

  resize() {
    const wrap = this.canvas.parentElement;
    this.canvas.width = wrap.clientWidth;
    this.canvas.height = wrap.clientHeight;
    this.draw();
  },

  loadLevel(level) {
    this.devices = level.devices.map(d => {
      const terminals = this.getTerminals(d.type);
      return { ...d, terminals, width: 140, height: 90 };
    });
    this.wires = [];
    this.selectedTerminal = null;
    this.meterMode = false;
    this.meterPoints = [];
    this.lastReading = null;
    this.draw();
  },

  getTerminals(type) {
    const defs = {
      relay: [
        { id: 'A1', label: 'A1', x: 20, y: 30 },
        { id: 'A2', label: 'A2', x: 20, y: 55 },
        { id: 'COM', label: 'COM', x: 70, y: 30 },
        { id: 'NO', label: 'NO', x: 100, y: 30 },
        { id: 'NC', label: 'NC', x: 100, y: 55 }
      ],
      pb_no: [
        { id: '1', label: '1', x: 30, y: 40 },
        { id: '2', label: '2', x: 70, y: 40 }
      ],
      pb_nc: [
        { id: '1', label: '1', x: 30, y: 40 },
        { id: '2', label: '2', x: 70, y: 40 }
      ],
      lamp: [
        { id: '+', label: '+', x: 40, y: 35 },
        { id: '-', label: '-', x: 80, y: 35 }
      ],
      monitor_module: [
        { id: 'SLC-', label: 'SLC-', x: 15, y: 30 },
        { id: 'SLC+', label: 'SLC+', x: 15, y: 55 },
        { id: 'IN+', label: 'IN+', x: 80, y: 30 },
        { id: 'IN-', label: 'IN-', x: 80, y: 55 }
      ],
      pull_station: [
        { id: '1', label: '1', x: 35, y: 40 },
        { id: '2', label: '2', x: 75, y: 40 }
      ],
      eol: [
        { id: '1', label: '1', x: 35, y: 40 },
        { id: '2', label: '2', x: 75, y: 40 }
      ]
    };
    return defs[type] || [];
  },

  getTerminalWorldPos(deviceId, terminalId) {
    const dev = this.devices.find(d => d.id === deviceId);
    if (!dev) return null;
    const term = dev.terminals.find(t => t.id === terminalId);
    if (!term) return null;
    return { x: dev.x + term.x, y: dev.y + term.y };
  },

  onPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.scale;
    const y = (e.clientY - rect.top - this.offsetY) / this.scale;

    let closest = null;
    let minDist = 22;
    for (const dev of this.devices) {
      for (const term of dev.terminals) {
        const tx = dev.x + term.x;
        const ty = dev.y + term.y;
        const d = Math.hypot(x - tx, y - ty);
        if (d < minDist) {
          minDist = d;
          closest = { device: dev.id, terminal: term.id, x: tx, y: ty };
        }
      }
    }

    if (closest) {
      if (this.meterMode) {
        this.meterPoints.push(closest);
        if (this.meterPoints.length === 2) {
          this.lastReading = this.measure(this.meterPoints[0], this.meterPoints[1]);
          this.meterPoints = [];
        }
      } else {
        if (!this.selectedTerminal) {
          this.selectedTerminal = closest;
        } else if (this.selectedTerminal.device !== closest.device || this.selectedTerminal.terminal !== closest.terminal) {
          this.wires.push({
            from: `${this.selectedTerminal.device}.${this.selectedTerminal.terminal}`,
            to: `${closest.device}.${closest.terminal}`,
            color: this.currentColor || '#c8102e'
          });
          this.selectedTerminal = null;
        } else {
          this.selectedTerminal = null;
        }
      }
      this.draw();
    }
  },

  measure(a, b) {
    const keyA = `${a.device}.${a.terminal}`;
    const keyB = `${b.device}.${b.terminal}`;
    const connected = this.wires.some(w =>
      (w.from === keyA && w.to === keyB) || (w.from === keyB && w.to === keyA)
    );

    if (connected) {
      return { type: 'ohms', value: '0.1 Ω', note: 'Direct short / solid connection' };
    }

    if ((keyA.includes('A1') || keyB.includes('A1')) && (keyA.includes('A2') || keyB.includes('A2'))) {
      return { type: 'volts', value: '24 V DC', note: 'Coil path' };
    }

    return { type: 'ohms', value: 'OL (open)', note: 'No direct path between these points' };
  },

  onPointerMove(e) {
    if (this.selectedTerminal) this.draw();
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    ctx.lineWidth = 3;
    for (const w of this.wires) {
      const [fromDev, fromTerm] = w.from.split('.');
      const [toDev, toTerm] = w.to.split('.');
      const a = this.getTerminalWorldPos(fromDev, fromTerm);
      const b = this.getTerminalWorldPos(toDev, toTerm);
      if (a && b) {
        ctx.strokeStyle = w.color || '#c8102e';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const dev of this.devices) {
      ctx.fillStyle = '#24143F';
      ctx.fillRect(dev.x, dev.y, dev.width, dev.height);
      ctx.strokeStyle = '#3B1F66';
      ctx.lineWidth = 2;
      ctx.strokeRect(dev.x, dev.y, dev.width, dev.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(dev.type.replace('_', ' '), dev.x + 8, dev.y + 16);

      for (const t of dev.terminals) {
        const tx = dev.x + t.x;
        const ty = dev.y + t.y;
        const isSelected = this.selectedTerminal &&
          this.selectedTerminal.device === dev.id &&
          this.selectedTerminal.terminal === t.id;

        ctx.fillStyle = isSelected ? '#38E1F5' : '#D8B4FE';
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#140A26';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(t.label, tx, ty + 3);
        ctx.textAlign = 'left';
      }
    }

    if (this.lastReading) {
      ctx.fillStyle = 'rgba(20,10,38,0.85)';
      ctx.fillRect(10, 10, 220, 50);
      ctx.fillStyle = '#38E1F5';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(this.lastReading.value, 20, 30);
      ctx.fillStyle = '#D8B4FE';
      ctx.font = '11px system-ui';
      ctx.fillText(this.lastReading.note, 20, 48);
    }

    ctx.restore();
  }
};
