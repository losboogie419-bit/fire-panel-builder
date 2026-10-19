// floorMap.js - simple floor progression view stub
const FloorMap = {
  floors: [
    { id: 1, name: "Relay Basics", unlocked: true },
    { id: 2, name: "Logic Gates", unlocked: false },
    { id: 3, name: "Fire Alarm Basics", unlocked: false }
  ],
  render(container) {
    container.innerHTML = '<h3>Building</h3>';
    this.floors.forEach(f => {
      const div = document.createElement('div');
      div.className = 'panel';
      div.textContent = `Floor ${f.id}: ${f.name} ${f.unlocked ? '' : '(locked)'}`;
      div.onclick = () => {
        if (f.unlocked) {
          const level = levels.find(l => l.floor === f.id);
          if (level) startLevel(level);
        }
      };
      container.appendChild(div);
    });
  }
};
