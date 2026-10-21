// wiring.js - wires on top, better hit, drag, realistic terminals, PSU
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
  dragging: false,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
  },

  resize() {
    const wrap = this.canvas.parentElement;
    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || (window.innerHeight - 140);
    this.canvas.width = w;
    this.canvas.height = Math.max(h, 320);
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
      psu: [
        { id: '+', label: '+24V', x: 40, y: 35 },
        { id: '-', label: 'GND', x: 90, y: 35 }
      ],
      relay: [
        { id: 'A1', label: 'A1', x: 25, y: 35 },
        { id: 'A2', label: 'A2', x: 25, y: 60 },
        { id: 'COM', label: 'COM', x: 70, y: 35 },
        { id: 'NO', label: 'NO', x: 105, y: 35 },
        { id: 'NC', label: 'NC', x: 105, y: 60 }
      ],
      pb_no: [
        { id: '1', label: '1', x: 40, y: 45 },
        { id: '2', label: '2', x: 90, y: 45 }
      ],
      pb_nc: [
        { id: '1', label: '1', x: 40, y: 45 },
        { id: '2', label: '2', x: 90, y: 45 }
      ],
      lamp: [
        { id: '+', label: '+', x: 45, y: 40 },
        { id: '-', label: '-', x: 85, y: 40 }
      ],
      monitor_module: [
        { id: 'IN+', label: 'IN+', x: 35, y: 35 },
        { id: 'IN-', label: 'IN-', x: 35, y: 60 },
        { id: 'SLC+', label: 'SLC+', x: 95, y: 35 },
        { id: 'SLC-', label: 'SLC-', x: 95, y: 60 }
      ],
      pull_station: [
        { id: '1', label: '1', x: 40, y: 45 },
        { id: '2', label: '2', x: 90, y: 45 }
      ],
      eol: [
        { id: '1', label: '1', x: 40, y: 45 },
        { id: '2', label: '2', x: 90, y: 45 }
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

  findTerminal(x, y) {
    let closest = null;
    let minDist = 16;
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
    return closest;
  },

  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.scale;
    const y = (e.clientY - rect.top - this.offsetY) / this.scale;
    const closest = this.findTerminal(x, y);
    if (closest) {
      if (this.meterMode) {
        this.meterPoints.push(closest);
        if (this.meterPoints.length === 2) {
          this.lastReading = this.measure(this.meterPoints[0], this.meterPoints[1]);
          this.meterPoints = [];
        }
      } else {
        this.selectedTerminal = closest;
        this.dragging = true;
      }
      this.draw();
    }
  },

  onPointerMove(e) {
    if (this.dragging && this.selectedTerminal) this.draw();
  },

  onPointerUp(e) {
    if (!this.dragging || !this.selectedTerminal) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.scale;
    const y = (e.clientY - rect.top - this.offsetY) / this.scale;
    const closest = this.findTerminal(x, y);
    if (closest && (closest.device !== this.selectedTerminal.device || closest.terminal !== this.selectedTerminal.terminal)) {
      this.wires.push({
        from: `${this.selectedTerminal.device}.${this.selectedTerminal.terminal}`,
        to: `${closest.device}.${closest.terminal}`,
        color: this.currentColor || '#c8102e'
      });
    }
    this.selectedTerminal = null;
    this.dragging = false;
    this.draw();
  },

  measure(a, b) {
    const keyA = `${a.device}.${a.terminal}`;
    const keyB = `${b.device}.${b.terminal}`;
    const connected = this.wires.some(w =>
      (w.from === keyA && w.to === keyB) || (w.from === keyB && w.to === keyA)
    );
    if (connected) return { type: 'ohms', value: '0.1 Ω', note: 'Solid connection' };
    if ((keyA.includes('A1') || keyB.includes('A1')) && (keyA.includes('A2') || keyB.includes('A2'))) {
      return { type: 'volts', value: '24 V DC', note: 'Coil voltage' };
    }
    if (keyA.includes('eol') || keyB.includes('eol') || keyA.includes('IN') || keyB.includes('IN')) {
      return { type: 'volts', value: '0.5 mA', note: 'EOL supervision current' };
    }
    return { type: 'ohms', value: 'OL', note: 'Open circuit' };
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    for (const dev of this.devices) {
      ctx.fillStyle = '#1a1028';
      ctx.fillRect(dev.x, dev.y, dev.width, dev.height);
      ctx.strokeStyle = '#4a2a7a';
      ctx.lineWidth = 2;
      ctx.strokeRect(dev.x, dev.y, dev.width, dev.height);
      ctx.fillStyle = '#38E1F5';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(dev.type.replace('_', ' ').toUpperCase(), dev.x + 6, dev.y + 14);

      for (const t of dev.terminals) {
        const tx = dev.x + t.x;
        const ty = dev.y + t.y;
        const isSelected = this.selectedTerminal &&
          this.selectedTerminal.device === dev.id &&
          this.selectedTerminal.terminal === t.id;

        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx - 4, ty);
        ctx.lineTo(tx + 4, ty);
        ctx.stroke();
        if (isSelected) {
          ctx.strokeStyle = '#38E1F5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tx, ty, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(t.label, tx, ty + 18);
        ctx.textAlign = 'left';
      }
    }

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

    if (this.lastReading) {
      ctx.fillStyle = 'rgba(20,10,38,0.9)';
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
