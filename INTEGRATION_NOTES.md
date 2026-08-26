# Four Idiots — World State Integration

This pass restores one shared world roster and makes the existing systems read/write the same citizens.

## Active flow

`public/characters.json` -> `WorldState.loadWorld()` -> shared character roster -> Simulation -> Renderer -> autosave/localStorage.

The JSON is the seed roster. On first run it is loaded into the world and then localStorage becomes the live save. Delete the `four-idiots:world` localStorage entry if you want to re-seed from `characters.json` while developing.

## Character creation

The creator now asks for a Starting Area. Saving a citizen creates a real Character, adds it to WorldState, saves the world, switches the camera to that area, and renders them there immediately.

## Encounters

Two available citizens in the same room who come within 40 pixels stop and talk automatically. There is no random conversation roll anymore. After the conversation they get a 12-second cooldown before another encounter can start.

## Roster/debug panel

The panel beside the canvas shows every living citizen, their current area, and their state. Clicking a citizen switches the camera to their room. Delete removes them from the live world and save. Save World is also available manually; the app autosaves every five seconds.

## Ownership

- `WorldState.ts` owns the roster, loading, saving, adding, finding, and deleting.
- `Simulation.ts` operates on `getCharacters()`; it no longer owns a private character array.
- `Renderer.ts` renders the same roster filtered by `locationId`.
- `CharacterCreator.ts` creates citizens through the shared world flow.
- `public/characters.json` is deliberately one big editable seed file for now.

The personality/scenario/train experiments remain available but are not being allowed to replace this core flow.
