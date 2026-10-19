# Fire Panel Builder

Open-source educational electrical / fire-alarm wiring game by Los Boogie (losboogie419-bit).

Licensed under GPL v3. See LICENSE and CREDITS.md.

## How to Play

1. Open `index.html` in any modern browser (works offline).
2. On mobile, tap terminals to run wires. Pinch to zoom (basic support).
3. Test the circuit. Correct wiring lights the floor and awards credits.
4. Progress is saved in localStorage.

## MVP Floors

- Floor 1: Relay basics (levels 1-3)
- Floor 2: Seal-in + logic (planned)
- Floor 3: Troubleshooting + Pull Station + EOL

## Adding Levels

See AUTHORING.md. Drop a new JSON in `/levels/` and it loads.

## Self-Test

Open `test.html` to run every level's correct solution and common mistakes through the simulator.

## Ideas From

- VoltQuest (GPL v3) — wiring + simulation + JSON levels
- Circuit Artist (GPL v3) — logic gates as playable parts
- OpenTowers (GPL v3) — floor-by-floor progression

No code was copied. All implementation is original vanilla JavaScript.
