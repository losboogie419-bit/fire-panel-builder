// floorMap.js - level selection + better building
const FloorMap = {
  canvas: null,
  ctx: null,
  techX: 60,
  techY: 200,
  floors: [
    { id: 1, name: "Relay Basics", y: 300, unlocked: true },
    { id: 2, name: "Logic", y: 180, unlocked: false },
    { id: 3, name: "Fire Alarm", y: 60, unlocked: false }
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
      if (y >= f.y && y <= f.y + 80 && f.unlocked) {
        const level = levels.find(l => l.floor === f.id);
        if (level) {
          this.goToFloor(f.id);
          setTimeout(() => startLevel(level), 400);
        }
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
    const startY = this.techY;
    const endY = f.y + 30;
    const startTime = performance.now();
    const duration = 500;
    const animate = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.techY = startY + (endY - startY) * eased;
      this.draw();
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0d0618';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.floors.forEach(f => {
      ctx.fillStyle = f.unlocked ? '#1e1035' : '#151025';
      ctx.fillRect(30, f.y, this.canvas.width - 60, 80);
      if (f.unlocked) {
        ctx.fillStyle = 'rgba(56, 225, 245, 0.12)';
        ctx.fillRect(30, f.y, this.canvas.width - 60, 80);
      }
      ctx.strokeStyle = f.unlocked ? '#38E1F5' : '#5a4a70';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, f.y, this.canvas.width - 60, 80);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(`Floor ${f.id}: ${f.name}`, 45, f.y + 45);
      ctx.fillStyle = f.unlocked ? '#c8102e' : '#444';
      ctx.fillRect(this.canvas.width - 80, f.y + 25, 28, 40);
    });

    ctx.fillStyle = '#e2b423';
    ctx.beginPath();
    ctx.arc(this.techX, this.techY - 18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.arc(this.techX, this.techY - 22, 9, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#e2b423';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.techX, this.techY - 10);
    ctx.lineTo(this.techX, this.techY + 12);
    ctx.lineTo(this.techX - 9, this.techY + 24);
    ctx.moveTo(this.techX, this.techY + 12);
    ctx.lineTo(this.techX + 9, this.techY + 24);
    ctx.moveTo(this.techX, this.techY);
    ctx.lineTo(this.techX - 12, this.techY + 6);
    ctx.moveTo(this.techX, this.techY);
    ctx.lineTo(this.techX + 12, this.techY + 6);
    ctx.stroke();

    const stress = Progress.data.stress || 0;
    if (stress > 60) {
      ctx.fillStyle = '#c8102e';
      ctx.font = '12px system-ui';
      ctx.fillText('...', this.techX + 14, this.techY - 18);
    }
  }
};
