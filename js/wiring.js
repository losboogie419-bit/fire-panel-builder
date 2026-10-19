// wiring.js - canvas rendering and touch/mouse wire drawing
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
  },

  resize() {
    const wrap = this.canvas.parentElement;
    this.canvas.width = wrap.clientWidth;
    this.canvas.height = wrap.clientHeight;
    this.draw();
  },

  loadLevel(level) {
    this.devices = level.devices.map(d => ({ ...d, terminals: this.getTerminals(d.type) }));
    this.wires = [];
    this.draw();
  },

  getTerminals(type) {
    // Load from device JSON in real version; hardcoded stubs for MVP
    const defs = {
      relay: ['A1','A2','COM','NO','NC'],
      pb_no: ['1','2'],
      pb_nc: ['1','2'],
      lamp: ['+','-'],
      monitor_module: ['SLC-','SLC+','IN+','IN-'],
      pull_station: ['1','2'],
      eol: ['1','2']
    };
    return (defs[type] || []).map(id => ({ id, label: id }));
  },

  onPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.scale;
    const y = (e.clientY - rect.top - this.offsetY) / this.scale;

    // Find closest terminal
    let closest = null;
    let minDist = 30;
    for (const dev of this.devices) {
      for (const term of dev.terminals) {
        const tx = dev.x + (term.id.length * 8); // rough position
        const ty = dev.y + 40;
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
          color: 'red'
        });
        this.selectedTerminal = null;
      }
      this.draw();
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // Draw devices as cards
    for (const dev of this.devices) {
      ctx.fillStyle = '#24143F';
      ctx.fillRect(dev.x, dev.y, 120, 80);
      ctx.strokeStyle = '#3B1F66';
      ctx.strokeRect(dev.x, dev.y, 120, 80);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px system-ui';
      ctx.fillText(dev.type, dev.x + 8, dev.y + 20);

      // Terminals
      dev.terminals.forEach((t, i) => {
        const tx = dev.x + 10 + (i % 3) * 35;
        const ty = dev.y + 40 + Math.floor(i / 3) * 18;
        ctx.fillStyle = this.selectedTerminal && this.selectedTerminal.device === dev.id && this.selectedTerminal.terminal === t.id ? '#38E1F5' : '#D8B4FE';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '9px system-ui';
        ctx.fillText(t.label, tx + 8, ty + 3);
      });
    }

    // Draw wires
    ctx.strokeStyle = '#c8102e';
    ctx.lineWidth = 3;
    for (const w of this.wires) {
      // Stub positions - in full version resolve terminal coords
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(200, 150);
      ctx.stroke();
    }

    ctx.restore();
  }
};
