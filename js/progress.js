// progress.js - localStorage save/load
const Progress = {
  key: 'panelbuilder_progress',
  data: { credits: 0, unlockedFloors: 1, completedLevels: [] },
  load() {
    const raw = localStorage.getItem(this.key);
    if (raw) this.data = JSON.parse(raw);
    return this.data;
  },
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  },
  addCredits(n) {
    this.data.credits += n;
    this.save();
  },
  completeLevel(id) {
    if (!this.data.completedLevels.includes(id)) {
      this.data.completedLevels.push(id);
      this.save();
    }
  },
  unlockFloor(n) {
    if (n > this.data.unlockedFloors) {
      this.data.unlockedFloors = n;
      this.save();
    }
  }
};
