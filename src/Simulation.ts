import type { Character } from "./Character";
import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { WorldState as ScenarioWorldState } from "./Scenarios";

import { getLocation } from "./Location";
import { initializeTraits } from "./Personality";
import {
    addCharacter,
    getCharacters
} from "./WorldState";

const WALK_SPEED = 35;
const TALK_DISTANCE = 40;
const WANDER_CHANCE_PER_SECOND = 0.45;
const TRAVEL_CHANCE_PER_SECOND = 0.035;
const TRAVEL_ANNOUNCE_MS = 1800;
const CONVERSATION_MS = 5000;
const CONVERSATION_COOLDOWN_MS = 12000;

export let worldState: ScenarioWorldState = {
    weather: "sunny",
    timeOfDay: "afternoon",
    eventType: "none",
    temperature: 70
};

// Kept as a compatibility hook for the existing renderer/train experiments.
export const trainState = {
    isAtStation: true,
    passengersBoarded: [] as string[],
    departureCountdown: 0,
    isDeparting: false,
    departureProgress: 0
};

export function addCitizen(
    appearance: Appearance,
    name: string,
    locationId: LocationId
): Character {
    const spawn = randomDestination(locationId);

    const character: Character = {
        id: crypto.randomUUID(),
        name,
        job: "Unemployed",
        hobby: "Existing",
        likes: [],
        dislikes: [],
        appearance,
        locationId,
        x: spawn.x,
        y: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        state: "idle",
        traits: initializeTraits(),
        mood: "content",
        energy: 80,
        lastEventTime: 0,
        conversationCooldownUntil: 0
    };

    return addCharacter(character);
}

export function updateSimulation(
    deltaTime: number,
    timestamp: number
) {
    worldState.timeOfDay = getTimeOfDay(timestamp);

    const characters = getCharacters();

    for (const character of characters) {
        updateCharacter(character, deltaTime, timestamp);
    }

    checkForConversations(timestamp);
}

function updateCharacter(
    character: Character,
    deltaTime: number,
    timestamp: number
) {
    clearExpiredSpeech(character, timestamp);

    if (character.state === "traveling") {
        if (
            character.travelTargetId &&
            character.travelCompleteAt !== undefined &&
            timestamp >= character.travelCompleteAt
        ) {
            completeTravel(character, character.travelTargetId, timestamp);
        }
        return;
    }

    if (character.state === "talking") return;

    const dx = character.targetX - character.x;
    const dy = character.targetY - character.y;
    const distance = Math.hypot(dx, dy);

    if (distance >= 3) {
        character.state = "walking";

        const step = Math.min(WALK_SPEED * deltaTime, distance);
        character.x += (dx / distance) * step;
        character.y += (dy / distance) * step;
        return;
    }

    character.x = character.targetX;
    character.y = character.targetY;
    character.state = "idle";

    if (Math.random() < TRAVEL_CHANCE_PER_SECOND * deltaTime) {
        const target = chooseConnectedLocation(character.locationId);
        if (target) {
            beginTravel(character, target, timestamp);
            return;
        }
    }

    if (Math.random() < WANDER_CHANCE_PER_SECOND * deltaTime) {
        chooseNewDestination(character);
    }
}

function beginTravel(
    character: Character,
    targetId: LocationId,
    timestamp: number
) {
    const target = getLocation(targetId);

    character.state = "traveling";
    character.travelTargetId = targetId;
    character.travelCompleteAt = timestamp + TRAVEL_ANNOUNCE_MS;
    character.speech = `I'm going to ${target.name}.`;
    character.speechUntil = timestamp + TRAVEL_ANNOUNCE_MS;
    character.lastEventTime = timestamp;
}

function completeTravel(
    character: Character,
    targetId: LocationId,
    timestamp: number
) {
    const spawn = randomDestination(targetId);

    character.locationId = targetId;
    character.x = spawn.x;
    character.y = spawn.y;
    character.targetX = spawn.x;
    character.targetY = spawn.y;
    character.state = "idle";
    character.travelTargetId = undefined;
    character.travelCompleteAt = undefined;
    character.speech = undefined;
    character.speechUntil = undefined;
    character.lastEventTime = timestamp;
}

function chooseConnectedLocation(locationId: LocationId): LocationId | null {
    const exits = getLocation(locationId).exits;
    if (exits.length === 0) return null;
    return exits[Math.floor(Math.random() * exits.length)].target;
}

function chooseNewDestination(character: Character) {
    const destination = randomDestination(character.locationId);
    character.targetX = destination.x;
    character.targetY = destination.y;
}

function randomDestination(locationId: LocationId): { x: number; y: number } {
    const destinations = getLocation(locationId).destinations;
    return destinations[Math.floor(Math.random() * destinations.length)] ?? { x: 400, y: 280 };
}

/**
 * Encounters are deterministic now: if two available citizens physically meet,
 * they stop and talk. A cooldown keeps them from immediately re-triggering.
 */
function checkForConversations(timestamp: number) {
    const characters = getCharacters();

    for (let a = 0; a < characters.length; a++) {
        for (let b = a + 1; b < characters.length; b++) {
            const charA = characters[a];
            const charB = characters[b];

            if (charA.locationId !== charB.locationId) continue;
            if (!canTalk(charA, timestamp) || !canTalk(charB, timestamp)) continue;

            const distance = Math.hypot(
                charA.x - charB.x,
                charA.y - charB.y
            );

            if (distance <= TALK_DISTANCE) {
                startConversation(charA, charB, timestamp);
                return;
            }
        }
    }
}

function canTalk(character: Character, timestamp: number): boolean {
    if (
        character.state === "talking" ||
        character.state === "traveling" ||
        character.state === "boarding" ||
        character.state === "on_train" ||
        character.state === "disembarking"
    ) {
        return false;
    }

    return (character.conversationCooldownUntil ?? 0) <= timestamp;
}

function startConversation(
    a: Character,
    b: Character,
    timestamp: number
) {
    // Stop both where the encounter happened.
    a.targetX = a.x;
    a.targetY = a.y;
    b.targetX = b.x;
    b.targetY = b.y;

    a.state = "talking";
    b.state = "talking";
    a.conversationPartner = b.id;
    b.conversationPartner = a.id;

    a.speech = `Hey, ${b.name}.`;
    b.speech = `Hey, ${a.name}.`;
    a.speechUntil = timestamp + 4000;
    b.speechUntil = timestamp + 4000;
    a.lastEventTime = timestamp;
    b.lastEventTime = timestamp;

    window.setTimeout(() => endConversation(a, b), CONVERSATION_MS);
}

function endConversation(a: Character, b: Character) {
    const now = performance.now();

    if (a.conversationPartner === b.id) {
        a.conversationPartner = undefined;
        a.speech = undefined;
        a.speechUntil = undefined;
        a.conversationCooldownUntil = now + CONVERSATION_COOLDOWN_MS;
        if (a.state === "talking") a.state = "idle";
        chooseNewDestination(a);
    }

    if (b.conversationPartner === a.id) {
        b.conversationPartner = undefined;
        b.speech = undefined;
        b.speechUntil = undefined;
        b.conversationCooldownUntil = now + CONVERSATION_COOLDOWN_MS;
        if (b.state === "talking") b.state = "idle";
        chooseNewDestination(b);
    }
}

function clearExpiredSpeech(character: Character, timestamp: number) {
    if (character.speechUntil !== undefined && timestamp >= character.speechUntil) {
        character.speech = undefined;
        character.speechUntil = undefined;
    }
}

function getTimeOfDay(
    timestamp: number
): "morning" | "afternoon" | "evening" | "night" {
    const seconds = timestamp / 1000;
    const hour = Math.floor((seconds / 3600) % 24);

    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}
