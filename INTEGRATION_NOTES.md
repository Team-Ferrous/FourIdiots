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

## Chat log

`ChatLog.ts` owns a small session history of the last 100 spoken lines. The simulation writes travel announcements and conversation speech into it. `main.ts` renders the log directly beneath the world view and automatically scrolls to the newest entry. The log is intentionally session-only for now; world persistence remains focused on citizen state.

## Episode DSL / functional episode loop

`public/episodes/episodes.json` is now the deliberately tiny episode DSL. It is a JSON array of episodes. Each episode can use only four commands:

- `goto`: move a named character to a location, optionally overriding their travel announcement.
- `say`: show a speech bubble and write the line to the chat log.
- `wait`: pause the script for a number of milliseconds.
- `end`: finish the episode and save the world.

`EpisodeRunner.ts` validates the JSON before executing it. Character references use the IDs from `public/characters.json`; location references must be valid `LocationId`s. While an episode is running, autonomous simulation is paused so random wandering/conversations cannot fight the script. The runner loops the episode array forever until Stop Episodes is pressed. The camera follows scripted `goto`/`say` actions.

This intentionally keeps the API boundary tiny: a future story generator only needs to produce valid episode JSON. It does not need access to renderer or simulation internals.
