// simulation.js - hybrid checker ready for nodal expansion
const Simulation = {
  evaluate(level, wires, buttonStates = {}) {
    const errors = [];
    const states = {};

    for (const conn of level.correct_connections || []) {
      const found = wires.some(w =>
        (w.from === conn.from && w.to === conn.to) ||
        (w.from === conn.to && w.to === conn.from)
      );
      if (!found) {
        errors.push(`Missing: ${conn.from} → ${conn.to}`);
      }
    }

    states.relayEnergized = true;
    states.lampOn = wires.some(w =>
      (w.from.includes('NO') && w.to.includes('l1')) ||
      (w.to.includes('NO') && w.from.includes('l1'))
    );

    for (const mistake of level.common_mistakes || []) {
      if (this.matchesPattern(mistake.connection_pattern, wires)) {
        errors.push(mistake.explanation);
      }
    }

    const success = errors.length === 0;
    return { success, errors, states };
  },

  matchesPattern(pattern, wires) {
    if (pattern === 'lamp_on_nc') {
      return wires.some(w =>
        (w.from.includes('lamp') && w.to.includes('NC')) ||
        (w.to.includes('lamp') && w.from.includes('NC'))
      );
    }
    if (pattern === 'no_eol') {
      return !wires.some(w => w.from.includes('eol') || w.to.includes('eol'));
    }
    if (pattern === 'reversed_polarity') {
      return wires.some(w => w.from.includes('+') && w.to.includes('-') && w.color === '#c8102e');
    }
    return false;
  }
};
