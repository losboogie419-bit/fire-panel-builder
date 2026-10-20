// store.js - expanded KLONE Tools
const Store = {
  items: [
    { id: 'meter_pro', name: 'KLONE Pro Meter', cost: 50, desc: 'Faster readings + min/max' },
    { id: 'tone_probe', name: 'KLONE Tone & Probe', cost: 80, desc: 'Trace wires through walls' },
    { id: 'insulated', name: 'Insulated Hand Tools', cost: 40, desc: 'Work live panels safely' },
    { id: 'coffee', name: 'Union Coffee', cost: 15, desc: 'Reset stress' },
    { id: 'knee_pads', name: 'Knee Pads', cost: 30, desc: 'Less stress gain' },
    { id: 'headlamp', name: 'Headlamp', cost: 25, desc: 'See in dark rooms' },
    { id: 'apprentice', name: 'Apprentice Helper', cost: 100, desc: 'Small hints on tough calls' }
  ],
  buy(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    if (Progress.data.credits >= item.cost) {
      Progress.addCredits(-item.cost);
      if (id === 'coffee') Progress.reduceStress(100);
      if (id === 'meter_pro') Progress.data.tools.meter = 'pro';
      if (id === 'tone_probe') Progress.data.tools.tone = true;
      if (id === 'insulated') Progress.data.tools.insulated = true;
      if (id === 'apprentice') Progress.data.tools.apprentice = true;
      Progress.save();
      alert(`Bought ${item.name}`);
      return true;
    }
    alert('Not enough credits');
    return false;
  },
  open() {
    let msg = 'KLONE Tools\n\n';
    this.items.forEach(i => {
      msg += `${i.id}: ${i.name} — ${i.cost} credits\n${i.desc}\n\n`;
    });
    const choice = prompt(msg + 'Type item id to buy:');
    if (choice) this.buy(choice.trim());
  }
};
