import type { Character } from "./Character";
import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { WorldState } from "./Scenarios";

import { DEFAULT_APPEARANCE } from "./Appearance";
import { getLocation } from "./Location";
import { initializeTraits } from "./Personality";

const WALK_SPEED = 35;
const TALK_DISTANCE = 55;

// These are deliberately modest. The point is to make the world visibly
// breathe, not to have everybody constantly firing actions every frame.
const WANDER_CHANCE_PER_SECOND = 0.45;
const TRAVEL_CHANCE_PER_SECOND = 0.035;
const CONVERSATION_CHANCE_PER_SECOND = 0.08;
const TRAVEL_ANNOUNCE_MS = 1800;
const CONVERSATION_MS = 5000;

export let worldState: WorldState = {
    weather: "sunny",
    timeOfDay: "afternoon",
    eventType: "none",
    temperature: 70
};

/**
 * The richer train system can be reattached later. Keeping the public object
 * here means work that already imports trainState does not have to be thrown
 * away while the core world flow is stabilised.
 */
export const trainState = {
    isAtStation: true,
    passengersBoarded: [] as string[],
    departureCountdown: 0,
    isDeparting: false,
    departureProgress: 0
};

export const characters: Character[] = [
    makeCharacter(
        "bob",
        "Bob",
        "Accountant",
        "Fishing",
        150,
        250,
        "office",
        {
            ambitious: 75, perfectionist: 70, focused: 65, serious: 60,
            professional: 80, emotional: 25, sociable: 40, energetic: 55,
            clumsy: 15, loyal: 70
        },
        {
            skin: "#e4b78e",
            hairStyle: "short",
            hairColor: "#5c3a21",
            eyeColor: "#4a2c15",
            topStyle: "blazer",
            shirtColor: "#3a3a42",
            accentColor: "#c4382f",
            bottomStyle: "trousers",
            trouserColor: "#3f5a7a",
            shoeColor: "#4a3020",
            hatStyle: "none",
            hatColor: "#b03a32",
            glassesStyle: "specs"
        }
    ),
    makeCharacter(
        "alice",
        "Alice",
        "Teacher",
        "Painting",
        300,
        300,
        "park",
        {
            empathetic: 80, charming: 70, optimistic: 75, focused: 65,
            sociable: 75, outgoing: 60, cheerful: 70, cultured: 70,
            adventurous: 60, protective: 65
        },
        {
            skin: "#f1c9a5",
            hairStyle: "long",
            hairColor: "#c2571f",
            eyeColor: "#3f7a3f",
            topStyle: "dress",
            shirtColor: "#b04a42",
            accentColor: "#f0f0e8",
            bottomStyle: "skirt",
            trouserColor: "#b04a42",
            shoeColor: "#ddddd5",
            hatStyle: "none",
            hatColor: "#b03a32",
            glassesStyle: "none"
        }
    ),
    makeCharacter(
        "jim",
        "Jim",
        "Mechanic",
        "Video Games",
        500,
        250,
        "gym",
        {
            competitive: 75, energetic: 80, reckless: 60, lazy: 35,
            cooperative: 50, joker: 70, confident: 70, ambitious: 55,
            clumsy: 45, charming: 60
        },
        {
            skin: "#8a5a34",
            hairStyle: "messy",
            hairColor: "#1b1b1f",
            eyeColor: "#4a2c15",
            topStyle: "hoodie",
            shirtColor: "#3f8a8a",
            accentColor: "#e8d24a",
            bottomStyle: "shorts",
            trouserColor: "#5c6a3a",
            shoeColor: "#8a3a34",
            hatStyle: "cap",
            hatColor: "#3a5aa8",
            glassesStyle: "none"
        }
    ),
    makeCharacter(
        "sarah",
        "Sarah",
        "Bartender",
        "Gardening",
        650,
        300,
        "bar",
        {
            sociable: 85, charming: 75, empathetic: 70, outgoing: 80,
            cheerful: 75, loyal: 80, protective: 70, honest: 70,
            ambitious: 50, energetic: 70
        },
        {
            skin: "#573520",
            hairStyle: "afro",
            hairColor: "#3a2418",
            eyeColor: "#8a6a2f",
            topStyle: "overalls",
            shirtColor: "#3f5a7a",
            accentColor: "#e8d24a",
            bottomStyle: "trousers",
            trouserColor: "#3f5a7a",
            shoeColor: "#1f1f24",
            hatStyle: "bandana",
            hatColor: "#7a4fa8",
            glassesStyle: "none"
        }
    )
];

function makeCharacter(
    id: string,
    name: string,
    job: string,
    hobby: string,
    x: number,
    y: number,
    locationId: LocationId,
    traitOverrides: Partial<Record<string, number>> = {},
    appearance: Appearance = DEFAULT_APPEARANCE
): Character {
    const traits = initializeTraits();

    for (const [key, value] of Object.entries(traitOverrides)) {
        if (key in traits && typeof value === "number") {
            (traits as Record<string, number>)[key] = value;
        }
    }

    return {
        id,
        name,
        job,
        hobby,
        likes: [],
        dislikes: [],
        appearance,
        locationId,
        x,
        y,
        targetX: x,
        targetY: y,
        state: "idle",
        traits,
        mood: "content",
        energy: 80,
        lastEventTime: 0
    };
}

export function addCitizen(
    appearance: Appearance,
    name: string
): Character {
    const locationId: LocationId = "park";
    const spawn = randomDestination(locationId);

    const character = makeCharacter(
        `citizen-${Date.now()}`,
        name,
        "Newcomer",
        "Existing",
        spawn.x,
        spawn.y,
        locationId,
        {},
        appearance
    );

    characters.push(character);
    return character;
}

export function updateSimulation(
    deltaTime: number,
    timestamp: number
) {
    worldState.timeOfDay = getTimeOfDay(timestamp);

    for (const character of characters) {
        updateCharacter(character, deltaTime, timestamp);
    }

    checkForConversations(deltaTime, timestamp);
}

function updateCharacter(
    character: Character,
    deltaTime: number,
    timestamp: number
) {
    clearExpiredSpeech(character, timestamp);

    // Travel is an explicit two-step action: announce intent, then move rooms.
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

    if (character.state === "talking") {
        return;
    }

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

    // The important flow: a character decides to leave, says where they are
    // going, then the simulation changes their room after the announcement.
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

function chooseConnectedLocation(
    locationId: LocationId
): LocationId | null {
    const exits = getLocation(locationId).exits;
    if (exits.length === 0) return null;

    return exits[Math.floor(Math.random() * exits.length)].target;
}

function chooseNewDestination(character: Character) {
    const destination = randomDestination(character.locationId);
    character.targetX = destination.x;
    character.targetY = destination.y;
}

function randomDestination(locationId: LocationId) {
    const destinations = getLocation(locationId).destinations;
    return destinations[Math.floor(Math.random() * destinations.length)];
}

function checkForConversations(
    deltaTime: number,
    timestamp: number
) {
    for (let a = 0; a < characters.length; a++) {
        for (let b = a + 1; b < characters.length; b++) {
            const charA = characters[a];
            const charB = characters[b];

            if (charA.locationId !== charB.locationId) continue;
            if (charA.state !== "idle" || charB.state !== "idle") continue;

            const distance = Math.hypot(charA.x - charB.x, charA.y - charB.y);
            if (distance >= TALK_DISTANCE) continue;

            if (Math.random() < CONVERSATION_CHANCE_PER_SECOND * deltaTime) {
                startConversation(charA, charB, timestamp);
            }
        }
    }
}

function startConversation(
    a: Character,
    b: Character,
    timestamp: number
) {
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
    // A later system may have changed either character's state while the timer
    // was running. Do not stomp that newer decision.
    if (a.conversationPartner === b.id) {
        a.conversationPartner = undefined;
        a.speech = undefined;
        a.speechUntil = undefined;
        if (a.state === "talking") a.state = "idle";
        chooseNewDestination(a);
    }

    if (b.conversationPartner === a.id) {
        b.conversationPartner = undefined;
        b.speech = undefined;
        b.speechUntil = undefined;
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
