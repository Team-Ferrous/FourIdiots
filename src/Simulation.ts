import type { Character } from "./Character";
import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { TraitId } from "./Personality";
import { DEFAULT_APPEARANCE } from "./Appearance";
import { getLocation } from "./Location";
import { initializeTraits, getTrait as getTraitDef } from "./Personality";
import { checkScenarios, executeScenario } from "./Scenarios";
import type { WorldState } from "./Scenarios";

const WALK_SPEED = 35;
const TALK_DISTANCE = 55;

export let worldState: WorldState = {
  weather: "sunny",
  timeOfDay: "afternoon",
  eventType: "none",
  temperature: 70
};

// Train system state
export let trainState = {
  isAtStation: true,
  passengersBoarded: [] as string[],
  departureCountdown: 0,
  isDeparting: false,
  departureProgress: 0
};

const TRAIN_BOARD_TARGET_X = 200;
const TRAIN_BOARD_TARGET_Y = 100;
const TRAIN_DEPARTURE_DELAY = 5000;
const TRAIN_DEPARTURE_DURATION = 3000;

function getTimeOfDay(timestamp: number): "morning" | "afternoon" | "evening" | "night" {
  const seconds = timestamp / 1000;
  const hour = Math.floor((seconds / 3600) % 24);
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

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
            ambitious: 75, perfectionist: 70, focused: 65, serious: 60, professional: 80,
            emotional: 25, sociable: 40, energetic: 55, clumsy: 15, loyal: 70
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
            empathetic: 80, charming: 70, optimistic: 75, focused: 65, sociable: 75,
            outgoing: 60, cheerful: 70, cultured: 70, adventurous: 60, protective: 65
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
            competitive: 75, energetic: 80, reckless: 60, lazy: 35, cooperative: 50,
            joker: 70, confident: 70, ambitious: 55, clumsy: 45, charming: 60
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
            sociable: 85, charming: 75, empathetic: 70, outgoing: 80, cheerful: 75,
            loyal: 80, protective: 70, honest: 70, ambitious: 50, energetic: 70
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
    location: LocationId,
    traitOverrides: Partial<Record<string, number>>,
    appearance: Appearance = DEFAULT_APPEARANCE
): Character {
    const traits = initializeTraits();
    
    for (const [key, value] of Object.entries(traitOverrides)) {
        (traits as any)[key] = value;
    }

    return {
        id,
        name,
        job,
        hobby,

        appearance,

        likes: [],
        dislikes: [],

        location,

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
    const location = getLocation(locationId);
    
    const spawn =
        location.destinations[
            Math.floor(Math.random() * location.destinations.length)
        ];

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
    
    // Update train departing state
    if (trainState.departureCountdown > 0) {
        trainState.departureCountdown -= deltaTime * 1000;
        if (trainState.departureCountdown <= 0) {
            trainState.isDeparting = true;
            trainState.departureProgress = 0;
        }
    }

    if (trainState.isDeparting) {
        trainState.departureProgress += (deltaTime * 1000) / TRAIN_DEPARTURE_DURATION;
        if (trainState.departureProgress >= 1) {
            trainState.isDeparting = false;
            trainState.passengersBoarded = [];
            trainState.departureProgress = 0;
            for (const char of characters.filter(c => c.isOnTrain)) {
                char.isOnTrain = false;
                char.state = "idle";
                char.x = 400;
                char.y = 300;
            }
        }
    }
    
    for (const character of characters) {
        // Boarding logic for train station
        if (character.location === "train" && !character.isOnTrain && character.state === "idle" && character.y < 150 && Math.random() < 0.005) {
            character.state = "boarding";
            character.targetX = TRAIN_BOARD_TARGET_X;
            character.targetY = TRAIN_BOARD_TARGET_Y;
        }

        // Check if character reached boarding point
        if (character.state === "boarding") {
            const dx = TRAIN_BOARD_TARGET_X - character.x;
            const dy = TRAIN_BOARD_TARGET_Y - character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 5) {
                character.isOnTrain = true;
                character.state = "on_train";
                trainState.passengersBoarded.push(character.id);
                if (trainState.passengersBoarded.length > 0 && trainState.departureCountdown === 0) {
                    trainState.departureCountdown = TRAIN_DEPARTURE_DELAY;
                }
            }
        }

        updateCharacter(character, deltaTime, timestamp);
        updateTraits(character, deltaTime);
        checkAndExecuteScenarios(character);
    }

    checkForConversations(timestamp);
}

function updateTraits(character: Character, deltaTime: number) {
    const traitEntries = Object.entries(character.traits) as Array<[TraitId, number]>;
    
    for (const [traitId, value] of traitEntries) {
        const trait = getTraitDef(traitId);
        if (!trait) continue;

        const volatility = trait.volatility;
        const driftAmount = (Math.random() - 0.5) * volatility * 2;
        
        let newValue = value + driftAmount * deltaTime * 10;
        newValue = Math.max(0, Math.min(100, newValue));
        
        if (trait.conflictsWith) {
            for (const conflictId of trait.conflictsWith) {
                const conflictValue = character.traits[conflictId];
                if (conflictValue && newValue > 70 && conflictValue > 70) {
                    newValue = Math.min(newValue, 70);
                }
            }
        }

        character.traits[traitId] = newValue;
    }

    character.energy = Math.max(0, Math.min(100, character.energy - deltaTime * 2));
    
    if (character.mood === "happy") {
        character.energy = Math.min(100, character.energy + deltaTime * 1.5);
    } else if (character.mood === "stressed" || character.mood === "angry") {
        character.energy = Math.max(0, character.energy - deltaTime * 3);
    }
}

function checkAndExecuteScenarios(character: Character) {
    const scenario = checkScenarios(character, worldState, characters);
    if (scenario) {
        executeScenario(scenario, character, worldState, characters);
    }
}

function updateCharacter(
    character: Character,
    deltaTime: number,
    timestamp: number
) {
    if (character.state === "talking") {

        if (
            character.speechUntil &&
            timestamp > character.speechUntil
        ) {
            character.speech = undefined;
        }

        return;
    }

    const dx =
        character.targetX - character.x;

    const dy =
        character.targetY - character.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance < 3) {
        character.x = character.targetX;
        character.y = character.targetY;

        character.state = "idle";

        const location = getLocation(character.location);
        const atExit = location.exits.find(
            exit => Math.abs(exit.x - character.x) < 20 && Math.abs(exit.y - character.y) < 20
        );

        if (atExit && Math.random() < 0.03) {
            character.location = atExit.target;
            const newLocation = getLocation(character.location);
            const spawn = newLocation.destinations[
                Math.floor(Math.random() * newLocation.destinations.length)
            ];
            character.x = spawn.x;
            character.y = spawn.y;
            character.targetX = spawn.x;
            character.targetY = spawn.y;
            return;
        }

        if (Math.random() < 0.01) {
            chooseNewDestination(character);
        }

        return;
    }

    character.state = "walking";

    const step =
        Math.min(
            WALK_SPEED * deltaTime,
            distance
        );

    character.x +=
        (dx / distance) * step;

    character.y +=
        (dy / distance) * step;
}

function chooseNewDestination(
    character: Character
) {
    const location = getLocation(character.location);
    
    const destination =
        location.destinations[
            Math.floor(
                Math.random() *
                location.destinations.length
            )
        ];

    character.targetX = destination.x;
    character.targetY = destination.y;
}

function checkForConversations(
    currentTime: number
) {
    for (
        let a = 0;
        a < characters.length;
        a++
    ) {
        for (
            let b = a + 1;
            b < characters.length;
            b++
        ) {
            const charA = characters[a];
            const charB = characters[b];

            if (charA.location !== charB.location) {
                continue;
            }

            if (
                charA.state === "talking" ||
                charB.state === "talking"
            ) {
                continue;
            }

            const dx =
                charA.x - charB.x;

            const dy =
                charA.y - charB.y;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            if (
                distance < TALK_DISTANCE &&
                Math.random() < 0.003
            ) {
                startConversation(
                    charA,
                    charB,
                    currentTime
                );
            }
        }
    }
}

function startConversation(
    a: Character,
    b: Character,
    currentTime: number
) {
    a.state = "talking";
    b.state = "talking";

    a.conversationPartner = b.id;
    b.conversationPartner = a.id;

    a.speech = `Hey, ${b.name}.`;
    b.speech = `Hey, ${a.name}.`;

    a.speechUntil =
        currentTime + 4000;

    b.speechUntil =
        currentTime + 4000;

    console.log(
        `${a.name} started talking to ${b.name}`
    );

    window.setTimeout(() => {
        endConversation(a, b);
    }, 5000);
}

function endConversation(
    a: Character,
    b: Character
) {
    a.state = "idle";
    b.state = "idle";

    a.conversationPartner = undefined;
    b.conversationPartner = undefined;

    a.speech = undefined;
    b.speech = undefined;

    chooseNewDestination(a);
    chooseNewDestination(b);
}
