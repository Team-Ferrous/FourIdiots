import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    vi
} from "vitest";

import type { Character } from "../src/Character";

import {
    characters,
    updateSimulation
} from "../src/Simulation";

// These mirror the private constants in Simulation.ts.
// If those change, these must change too.
const WALK_SPEED = 35;
const TALK_DISTANCE = 55;

/**
 * Simulation.ts keeps `characters` as module-level mutable state,
 * so every test has to put it back to a known shape first.
 */
function resetCharacter(
    character: Character,
    x: number,
    y: number
) {
    character.x = x;
    character.y = y;

    character.targetX = x;
    character.targetY = y;

    character.state = "idle";

    character.speech = undefined;
    character.speechUntil = undefined;
    character.conversationPartner = undefined;
}

function resetAll() {
    // Park everyone far apart so nobody accidentally
    // ends up inside TALK_DISTANCE of anyone else.
    characters.forEach((character, index) => {
        resetCharacter(character, index * 500, 0);
    });
}

/** Freeze Math.random so the "chance" branches are predictable. */
function stubRandom(value: number) {
    return vi.spyOn(Math, "random").mockReturnValue(value);
}

beforeEach(() => {
    resetAll();

    // startConversation() calls window.setTimeout(), which does
    // not exist in Vitest's default node environment.
    vi.stubGlobal("window", {
        setTimeout: vi.fn(() => 0)
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("cast", () => {
    it("has four idiots", () => {
        expect(characters).toHaveLength(4);
    });

    it("gives every character a unique id", () => {
        const ids = characters.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe("walking", () => {
    it("moves toward the target at WALK_SPEED", () => {
        stubRandom(0.99);

        const bob = characters[0];
        bob.targetX = 1000;

        updateSimulation(1, 0);

        expect(bob.x).toBeCloseTo(WALK_SPEED, 5);
        expect(bob.state).toBe("walking");
    });

    it("scales movement by deltaTime", () => {
        stubRandom(0.99);

        const bob = characters[0];
        bob.targetX = 1000;

        updateSimulation(0.5, 0);

        expect(bob.x).toBeCloseTo(WALK_SPEED * 0.5, 5);
    });

    it("normalises diagonal movement so it is not faster", () => {
        stubRandom(0.99);

        const bob = characters[0];
        resetCharacter(bob, 0, 0);

        // 3-4-5 triangle: distance 500.
        bob.targetX = 300;
        bob.targetY = 400;

        updateSimulation(1, 0);

        const travelled =
            Math.sqrt(bob.x * bob.x + bob.y * bob.y);

        expect(travelled).toBeCloseTo(WALK_SPEED, 5);
    });

    it("snaps to the target and idles once within 3px", () => {
        stubRandom(0.99);

        const bob = characters[0];
        resetCharacter(bob, 0, 0);

        bob.targetX = 2;
        bob.targetY = 0;

        updateSimulation(1, 0);

        expect(bob.x).toBe(2);
        expect(bob.y).toBe(0);
        expect(bob.state).toBe("idle");
    });

    it("does not overshoot when it arrives", () => {
        stubRandom(0.99);

        const bob = characters[0];
        resetCharacter(bob, 0, 0);

        bob.targetX = 10;

        // Ten seconds is far more than enough to cover 10px.
        for (let i = 0; i < 10; i++) {
            updateSimulation(1, 0);
        }

        expect(bob.x).toBe(10);
    });
});

describe("talking characters", () => {
    it("do not move", () => {
        stubRandom(0.99);

        const bob = characters[0];
        bob.state = "talking";
        bob.targetX = 1000;

        updateSimulation(1, 0);

        expect(bob.x).toBe(0);
        expect(bob.state).toBe("talking");
    });

    it("keep their speech until speechUntil passes", () => {
        stubRandom(0.99);

        const bob = characters[0];
        bob.state = "talking";
        bob.speech = "Hey, Alice.";
        bob.speechUntil = 1000;

        updateSimulation(0.016, 500);

        expect(bob.speech).toBe("Hey, Alice.");
    });

    it("clear their speech once speechUntil passes", () => {
        stubRandom(0.99);

        const bob = characters[0];
        bob.state = "talking";
        bob.speech = "Hey, Alice.";
        bob.speechUntil = 1000;

        updateSimulation(0.016, 2000);

        expect(bob.speech).toBeUndefined();
    });
});

describe("conversations", () => {
    it("start when two idle characters are close enough", () => {
        // 0 passes the `Math.random() < 0.003` gate.
        stubRandom(0);

        const bob = characters[0];
        const alice = characters[1];

        resetCharacter(bob, 100, 100);
        resetCharacter(alice, 110, 100);

        updateSimulation(0.016, 1000);

        expect(bob.state).toBe("talking");
        expect(alice.state).toBe("talking");

        expect(bob.conversationPartner).toBe(alice.id);
        expect(alice.conversationPartner).toBe(bob.id);
    });

    it("set speech that mentions the other character", () => {
        stubRandom(0);

        const bob = characters[0];
        const alice = characters[1];

        resetCharacter(bob, 100, 100);
        resetCharacter(alice, 110, 100);

        updateSimulation(0.016, 1000);

        expect(bob.speech).toContain(alice.name);
        expect(alice.speech).toContain(bob.name);

        expect(bob.speechUntil).toBe(1000 + 4000);
    });

    it("do not start when the characters are too far apart", () => {
        stubRandom(0);

        const bob = characters[0];
        const alice = characters[1];

        resetCharacter(bob, 100, 100);
        resetCharacter(alice, 100 + TALK_DISTANCE + 10, 100);

        updateSimulation(0.016, 1000);

        expect(bob.state).not.toBe("talking");
        expect(alice.state).not.toBe("talking");
    });

    it("do not start when the dice roll fails", () => {
        // 0.99 fails the `Math.random() < 0.003` gate.
        stubRandom(0.99);

        const bob = characters[0];
        const alice = characters[1];

        resetCharacter(bob, 100, 100);
        resetCharacter(alice, 110, 100);

        updateSimulation(0.016, 1000);

        expect(bob.state).not.toBe("talking");
        expect(alice.state).not.toBe("talking");
    });

    it("schedule an end via setTimeout", () => {
        stubRandom(0);

        const bob = characters[0];
        const alice = characters[1];

        resetCharacter(bob, 100, 100);
        resetCharacter(alice, 110, 100);

        updateSimulation(0.016, 1000);

        expect(window.setTimeout).toHaveBeenCalledWith(
            expect.any(Function),
            5000
        );
    });
});
