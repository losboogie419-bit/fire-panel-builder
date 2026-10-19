// simulation.js - basic DC circuit checker + stub for nodal analysis
// For MVP: checks required connections and simple state (coil energized -> NO closed)
// Full nodal analysis can replace checkCircuit later for true simulation.

const Simulation = {
  // Simple state machine for relays
  evaluate(level, wires, buttonStates = {}) {
    const errors = [];
    const states = {};

    // Check required connections exist
    for (const conn of level.correct_connections || []) {
      const found = wires.some(w => 
        (w.from === conn.from && w.to === conn.to) ||
        (w.from === conn.to && w.to === conn.from)
      );
      if (!found) {
        errors.push(`Missing connection: ${conn.from} — ${conn.to}`);
      }
    }

    // Simple relay logic example
    const coilPowered = this.isCoilPowered(wires, buttonStates);
    states.relayEnergized = coilPowered;
    states.lampOn = coilPowered && this.lampOnNO(wires);

    // Common mistakes
    for (const mistake of level.common_mistakes || []) {
      if (this.matchesPattern(mistake.connection_pattern, wires)) {
        errors.push(mistake.explanation);
      }
    }

    const success = errors.length === 0 && this.meetsObjective(level, states);
    return { success, errors, states };
  },

  isCoilPowered(wires, buttonStates) {
    // Stub: assume if start button pressed and path exists
    return buttonStates.start === true;
  },

  lampOnNO(wires) {
    return wires.some(w => w.from.includes('NO') || w.to.includes('NO'));
  },

  matchesPattern(pattern, wires) {
    if (pattern === 'lamp_on_nc') {
      return wires.some(w => (w.from.includes('lamp') && w.to.includes('NC')) || (w.to.includes('lamp') && w.from.includes('NC')));
    }
    return false;
  },

  meetsObjective(level, states) {
    if (level.id === 'level2') return states.lampOn;
    if (level.id === 'level3') return states.relayEnergized;
    return true;
  }
};
