// store.js - real UI, working items, lower costs
const Store = {
  items: [
    { id: 'coffee', name: 'Union Coffee', cost: 8, desc: 'Reset stress' },
    { id: 'knee_pads', name: 'Knee Pads', cost: 20, desc: 'Reduce stress gain' },
    { id: 'headlamp', name: 'Headlamp', cost: 15, desc: 'See better in dark rooms' },
    { id: 'meter_pro', name: 'KLONE Pro Meter', cost: 40, desc: 'Faster readings + min/max' },
    { id: 'tone_probe', name: 'KLONE Tone & Probe', cost: 60, desc: 'Trace wires through walls' },
    { id: 'insulated', name: 'Insulated Hand Tools', cost: 30, desc: 'Work live panels safely' },
    { id: 'apprentice', name: 'Apprentice Helper', cost: 80, desc: 'Small hints on tough calls' }
  ],
  open() {
    const modal = document.getElementById('store-modal');
    const list = document.getElementById('store-items');
    list.innerHTML = '';
    this.items.forEach(item => {
      const div = document.createElement('div');
      div.style.margin = '8px 0';
      div.innerHTML = `<strong>${item.name}</strong> — ${item.cost} credits<br><small>${item.desc}</small><br>
        <button data-id="${item.id}">Buy</button>`;
      list.appendChild(div);
    });
    list.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => this.buy(btn.dataset.id);
    });
    modal.style.display = 'block';
  },
  buy(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    if (Progress.data.credits >= item.cost) {
      Progress.addCredits(-item.cost);
      if (id === 'coffee') Progress.reduceStress(100);
      if (id === 'knee_pads') Progress.data.tools.kneePads = true;
      if (id === 'headlamp') Progress.data.tools.headlamp = true;
      if (id === 'meter_pro') Progress.data.tools.meter = 'pro';
      if (id === 'tone_probe') Progress.data.tools.tone = true;
      if (id === 'insulated') Progress.data.tools.insulated = true;
      if (id === 'apprentice') Progress.data.tools.apprentice = true;
      Progress.save();
      document.getElementById('credits').textContent = Progress.data.credits;
      document.getElementById('stress').textContent = Progress.data.stress;
      alert(`Bought ${item.name}`);
      document.getElementById('store-modal').style.display = 'none';
    } else {
      alert('Not enough credits');
    }
  }
};
