// floorMap.js - better tech graphics
const FloorMap = {
  canvas: null,
  ctx: null,
  techX: 80,
  techY: 200,
  targetFloor: 1,
  floors: [
    { id: 1, name: "Relay Basics", y: 280, unlocked: true },
    { id: 2, name: "Logic", y: 180, unlocked: false },
    { id: 3, name: "Fire Alarm", y: 80, unlocked: false }
  ],

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => this.onClick(e));
  },

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    for (const f of this.floors) {
      if (y >= f.y && y <= f.y + 70 && f.unlocked) {
        this.goToFloor(f.id);
        break;
      }
    }
  },

  resize() {
    if (!this.canvas) return;
    const wrap = this.canvas.parentElement;
    this.canvas.width = wrap.clientWidth || 400;
    this.canvas.height = Math.max(wrap.clientHeight || 400, 360);
    this.draw();
  },

  setUnlocked(n) {
    this.floors.forEach(f => { f.unlocked = f.id <= n; });
    this.draw();
  },

  goToFloor(floorId) {
    const f = this.floors.find(fl => fl.id === floorId);
    if (!f || !f.unlocked) return;
    this.targetFloor = floorId;
    const startY = this.techY;
    const endY = f.y + 20;
    const startTime = performance.now();
    const duration = 600;

    const animate = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.techY = startY + (endY - startY) * eased;
      this.draw();
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          const level = levels.find(l => l.floor === floorId);
          if (level) startLevel(level);
        }, 200);
      }
    };
    requestAnimationFrame(animate);
  },

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#1a0e30';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.floors.forEach(f => {
      ctx.fillStyle = f.unlocked ? '#24143F' : '#2a1a45';
      ctx.fillRect(40, f.y, this.canvas.width - 80, 70);
      ctx.strokeStyle = f.unlocked ? '#38E1F5' : '#7A6A99';
      ctx.strokeRect(40, f.y, this.canvas.width - 80, 70);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px system-ui';
      ctx.fillText(`Floor ${f.id}: ${f.name}`, 55, f.y + 40);

      ctx.fillStyle = f.unlocked ? '#c8102e' : '#555';
      ctx.fillRect(this.canvas.width - 90, f.y + 20, 30, 40);
    });

    // Tech with hard hat and tool bag
    ctx.fillStyle = '#e2b423';
    ctx.beginPath();
    ctx.arc(this.techX, this.techY - 22, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.arc(this.techX, this.techY - 26, 10, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#e2b423';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(this.techX, this.techY - 13);
    ctx.lineTo(this.techX, this.techY + 12);
    ctx.lineTo(this.techX - 11, this.techY + 26);
    ctx.moveTo(this.techX, this.techY + 12);
    ctx.lineTo(this.techX + 11, this.techY + 26);
    ctx.moveTo(this.techX, this.techY - 2);
    ctx.lineTo(this.techX - 14, this.techY + 6);
    ctx.moveTo(this.techX, this.techY - 2);
    ctx.lineTo(this.techX + 14, this.techY + 6);
    ctx.stroke();

    ctx.fillStyle = '#24143F';
    ctx.fillRect(this.techX + 12, this.techY + 2, 10, 8);
    ctx.strokeStyle = '#38E1F5';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.techX + 12, this.techY + 2, 10, 8);

    const stress = Progress.data.stress || 0;
    if (stress > 60) {
      ctx.fillStyle = '#c8102e';
      ctx.font = '12px system-ui';
      ctx.fillText('...', this.techX + 15, this.techY - 20);
    }
  }
};
