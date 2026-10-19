// store.js - KLONE Tools stub
const Store = {
  items: [
    { id: 'meter_pro', name: 'KLONE Pro Meter', cost: 50, desc: 'Faster readings + min/max' },
    { id: 'coffee', name: 'Union Coffee', cost: 15, desc: 'Reset stress' },
    { id: 'knee_pads', name: 'Knee Pads', cost: 30, desc: 'Less stress gain' }
  ],
  buy(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    if (Progress.data.credits >= item.cost) {
      Progress.addCredits(-item.cost);
      if (id === 'coffee') Progress.reduceStress(100);
      if (id === 'meter_pro') Progress.data.tools.meter = 'pro';
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
      msg += `${i.name} — ${i.cost} credits\n${i.desc}\n\n`;
    });
    const choice = prompt(msg + 'Type item id to buy (meter_pro, coffee, knee_pads):');
    if (choice) this.buy(choice.trim());
  }
};
