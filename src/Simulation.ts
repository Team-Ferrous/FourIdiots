import type { Character } from "./Character";
import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import { DEFAULT_APPEARANCE } from "./Appearance";
import { getLocation } from "./Location";

const WALK_SPEED = 35;
const TALK_DISTANCE = 55;

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
    appearance: Appearance = DEFAULT_APPEARANCE
): Character {

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

        state: "idle"
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
        appearance
    );

    characters.push(character);

    return character;
}

export function updateSimulation(
    deltaTime: number,
    currentTime: number
) {
    for (const character of characters) {
        updateCharacter(
            character,
            deltaTime,
            currentTime
        );
    }

    checkForConversations(currentTime);
}

function updateCharacter(
    character: Character,
    deltaTime: number,
    currentTime: number
) {
    if (character.state === "talking") {

        if (
            character.speechUntil &&
            currentTime > character.speechUntil
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

        // Check if at an exit point
        const location = getLocation(character.location);
        const atExit = location.exits.find(
            exit => Math.abs(exit.x - character.x) < 20 && Math.abs(exit.y - character.y) < 20
        );

        if (atExit && Math.random() < 0.03) {
            // Move to new location
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

        // Small chance every frame to wander somewhere else.
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

            // Only talk if in same location
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
