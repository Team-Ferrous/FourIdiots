import type { LocationId } from "./Location";
import type { Character } from "./Character";
import { getAllLocations, getLocation } from "./Location";
import { addChatLine, addSystemLine } from "./ChatLog";
import { findCharacter, saveWorld } from "./WorldState";

export type EpisodeStep =
    | { action: "goto"; character: string; location: LocationId; announce?: string; delayMs?: number }
    | { action: "say"; character: string; text: string; durationMs?: number }
    | { action: "wait"; ms: number }
    | { action: "end" };

export interface EpisodeDefinition {
    id: string;
    title: string;
    cast?: string[];
    nextEpisodeDelayMs?: number;
    steps: EpisodeStep[];
}

export interface EpisodeRunnerOptions {
    onLocationChange?: (locationId: LocationId) => void;
    onEpisodeChange?: (episode: EpisodeDefinition | null) => void;
}

const DEFAULT_SPEECH_MS = 2400;
const DEFAULT_TRAVEL_MS = 1400;
let running = false;

export function isEpisodeRunning(): boolean {
    return running;
}

export async function loadEpisodes(url = "/episodes/episodes.json"): Promise<EpisodeDefinition[]> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load episodes: HTTP ${response.status}`);

    const value = await response.json() as unknown;
    if (!Array.isArray(value)) throw new Error("Episode file must contain a JSON array.");

    return value.map(parseEpisode);
}

export async function runEpisodeLoop(
    episodes: EpisodeDefinition[],
    options: EpisodeRunnerOptions = {}
): Promise<void> {
    if (running || episodes.length === 0) return;
    running = true;

    try {
        let index = 0;
        while (running) {
            const episode = episodes[index];
            await runEpisode(episode, options);
            if (!running) break;

            await sleep(episode.nextEpisodeDelayMs ?? 4000);
            index = (index + 1) % episodes.length;
        }
    } finally {
        running = false;
        options.onEpisodeChange?.(null);
    }
}

export function stopEpisodeLoop(): void {
    running = false;
}

async function runEpisode(
    episode: EpisodeDefinition,
    options: EpisodeRunnerOptions
): Promise<void> {
    options.onEpisodeChange?.(episode);
    addSystemLine(`Episode: ${episode.title}`);

    for (const step of episode.steps) {
        if (!running) return;

        switch (step.action) {
            case "goto":
                await runGoto(step, options);
                break;
            case "say":
                await runSay(step, options);
                break;
            case "wait":
                await sleep(step.ms);
                break;
            case "end":
                addSystemLine(`End: ${episode.title}`);
                saveWorld();
                return;
        }
    }

    addSystemLine(`End: ${episode.title}`);
    saveWorld();
}

async function runGoto(
    step: Extract<EpisodeStep, { action: "goto" }>,
    options: EpisodeRunnerOptions
): Promise<void> {
    const character = requireCharacter(step.character);
    const destination = getLocation(step.location);
    const announcement = step.announce ?? `I'm going to ${destination.name}.`;

    freeze(character);
    character.state = "traveling";
    character.speech = announcement;
    addChatLine(character.name, announcement, performance.now(), character.locationId);

    await sleep(step.delayMs ?? DEFAULT_TRAVEL_MS);
    if (!running) return;

    const spawn = randomDestination(step.location);
    character.locationId = step.location;
    character.x = spawn.x;
    character.y = spawn.y;
    character.targetX = spawn.x;
    character.targetY = spawn.y;
    character.state = "idle";
    character.speech = undefined;
    character.speechUntil = undefined;
    character.travelTargetId = undefined;
    character.travelCompleteAt = undefined;

    options.onLocationChange?.(step.location);
}

async function runSay(
    step: Extract<EpisodeStep, { action: "say" }>,
    options: EpisodeRunnerOptions
): Promise<void> {
    const character = requireCharacter(step.character);
    freeze(character);
    character.state = "talking";
    character.speech = step.text;
    character.speechUntil = undefined;

    options.onLocationChange?.(character.locationId);
    addChatLine(character.name, step.text, performance.now(), character.locationId);

    await sleep(step.durationMs ?? DEFAULT_SPEECH_MS);
    if (!running) return;

    character.speech = undefined;
    character.state = "idle";
}

function freeze(character: Character): void {
    character.targetX = character.x;
    character.targetY = character.y;
    character.conversationPartner = undefined;
}

function requireCharacter(id: string): Character {
    const character = findCharacter(id);
    if (!character) throw new Error(`Episode references missing character '${id}'.`);
    return character;
}

function randomDestination(locationId: LocationId): { x: number; y: number } {
    const destinations = getLocation(locationId).destinations;
    return destinations[Math.floor(Math.random() * destinations.length)] ?? { x: 400, y: 280 };
}

function parseEpisode(value: unknown, index: number): EpisodeDefinition {
    if (!isRecord(value)) throw new Error(`Episode ${index} is not an object.`);
    if (typeof value.id !== "string" || typeof value.title !== "string" || !Array.isArray(value.steps)) {
        throw new Error(`Episode ${index} needs id, title, and steps.`);
    }

    return {
        id: value.id,
        title: value.title,
        cast: Array.isArray(value.cast) ? value.cast.filter((v): v is string => typeof v === "string") : undefined,
        nextEpisodeDelayMs: typeof value.nextEpisodeDelayMs === "number" ? value.nextEpisodeDelayMs : undefined,
        steps: value.steps.map(parseStep)
    };
}

function parseStep(value: unknown, index: number): EpisodeStep {
    if (!isRecord(value) || typeof value.action !== "string") {
        throw new Error(`Invalid episode step ${index}.`);
    }

    switch (value.action) {
        case "goto": {
            if (typeof value.character !== "string" || !validLocation(value.location)) {
                throw new Error(`Invalid goto step ${index}.`);
            }
            return {
                action: "goto",
                character: value.character,
                location: value.location,
                announce: typeof value.announce === "string" ? value.announce : undefined,
                delayMs: typeof value.delayMs === "number" ? value.delayMs : undefined
            };
        }
        case "say":
            if (typeof value.character !== "string" || typeof value.text !== "string") {
                throw new Error(`Invalid say step ${index}.`);
            }
            return {
                action: "say",
                character: value.character,
                text: value.text,
                durationMs: typeof value.durationMs === "number" ? value.durationMs : undefined
            };
        case "wait":
            if (typeof value.ms !== "number") throw new Error(`Invalid wait step ${index}.`);
            return { action: "wait", ms: value.ms };
        case "end":
            return { action: "end" };
        default:
            throw new Error(`Unknown episode action '${value.action}'.`);
    }
}

function validLocation(value: unknown): value is LocationId {
    return typeof value === "string" && getAllLocations().some(location => location.id === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, Math.max(0, ms)));
}
