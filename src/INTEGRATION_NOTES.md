# Four Idiots - Core Flow Integration Pass

This pass intentionally restores the causal loop before adding more features.

## Active flow

1. A `Character` has one canonical `locationId`.
2. The simulation moves the character around inside that location.
3. While idle, a character can decide to travel through one of the location's exits.
4. Travel is explicit:
   - the character says `I'm going to <place>.`
   - the character enters `traveling`
   - after a short delay, `locationId` changes
   - the character spawns at a destination in the new room
5. The renderer filters entirely by `locationId`, so the visual world follows the simulation state.
6. Two idle characters in the same location can start a conversation.
7. Conversation changes state to `talking`, displays speech, then returns both characters to normal movement.
8. The character creator feeds directly into `addCitizen()`, which creates a real simulated character in the park.

## Kept but deliberately not driving the core loop yet

- Personality trait definitions
- Mood / energy data
- Scenario library
- Train-related character states and public train state object
- Rich location metadata

These files are preserved. The goal is to reconnect them later to a stable simulation rather than let them compete with the basic world loop.

## Canonical Character contract

Use these names everywhere:

- `locationId`, never `location`
- `traits: Record<TraitId, number>`
- `mood`
- `energy`
- `state`
- `travelTargetId` / `travelCompleteAt` for area travel

`Scenarios.ts` has been normalized to `locationId` so it can be re-enabled later without creating a second character schema.
