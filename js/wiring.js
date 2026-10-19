// wiring.js - improved terminal positions and real wire drawing
const Wiring = {
  canvas: null,
  ctx: null,
  devices: [],
  wires: [],
  selectedTerminal: null,
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
      if (!this.selectedTerminal) {
        this.selectedTerminal = closest;
      } else if (this.selectedTerminal.device !== closest.device || this.selectedTerminal.terminal !== closest.terminal) {
        this.wires.push({
          from: `${this.selectedTerminal.device}.${this.selectedTerminal.terminal}`,
          to: `${closest.device}.${closest.terminal}`,
          color: '#c8102e'
        });
        this.selectedTerminal = null;
      } else {
        this.selectedTerminal = null;
      }
      this.draw();
    }
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

    // Draw wires first
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

    // Devices
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

    ctx.restore();
  }
};
