# AUTHORING.md

## How to Add New Levels (for non-programmers)

1. Copy `/levels/_template.json` to a new file like `/levels/floor3_level7.json`.
2. Fill in the fields in plain language:
   - `id`: unique short name
   - `floor`: number (1, 2, 3...)
   - `title`: what the player sees
   - `learning_objective`: one sentence of what they should learn
   - `story_text`: short flavor text when the tech walks up
   - `devices`: list of device ids from `/devices/` and their screen positions
   - `allowed_parts`: which devices the player can place
   - `correct_connections`: list of "from_terminal" to "to_terminal" that make it work
   - `required_eol`: which circuits need an end-of-line resistor and its value
   - `common_mistakes`: patterns that fail and the plain-English explanation
   - `hints`: array of tip strings
   - `reward_credits`: number earned on clear

3. Save the file. The game loads all JSON in `/levels/` automatically.
4. Test your level by opening `test.html` — it will run the correct solution and the common mistakes through the simulator.

Devices go in `/devices/` as separate JSON files. Terminals must match real labels (A1, A2, COM, NO, NC, etc.).

Faults for troubleshooting missions go in `/faults/`.

Keep it simple. The simulation checks real connections, polarity, and supervision current — not scripted win conditions.
