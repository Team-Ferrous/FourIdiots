import type { Character } from "./Character";
import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { TraitId } from "./Personality";

import { DEFAULT_APPEARANCE } from "./Appearance";
import { getAllLocations, getLocation } from "./Location";
import { initializeTraits } from "./Personality";

const STORAGE_KEY = "four-idiots:world";
const SEED_URL = "/characters.json";

export interface SavedWorld {
    characters: Character[];
}

let characters: Character[] = [];

export function getCharacters(): Character[] {
    return characters;
}

export function findCharacter(id: string): Character | undefined {
    return characters.find(character => character.id === id);
}

export function addCharacter(character: Character): Character {
    characters.push(character);
    saveWorld();
    return character;
}

export function removeCharacter(id: string): boolean {
    const before = characters.length;
    characters = characters.filter(character => character.id !== id);
    const removed = characters.length !== before;
    if (removed) saveWorld();
    return removed;
}

export function saveWorld(): void {
    try {
        const save: SavedWorld = { characters };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (error) {
        console.warn("Could not save world.", error);
    }
}

export function clearWorldSave(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export async function loadWorld(): Promise<Character[]> {
    const saved = loadSavedWorld();
    if (saved) {
        characters = saved.map(hydrateCharacter);
        return characters;
    }

    try {
        const response = await fetch(SEED_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const seed = await response.json() as unknown;
        const rawCharacters = Array.isArray(seed)
            ? seed
            : isRecord(seed) && Array.isArray(seed.characters)
                ? seed.characters
                : [];

        characters = rawCharacters.map(hydrateCharacter);
        saveWorld();
    } catch (error) {
        console.warn("Could not load characters.json; starting with an empty world.", error);
        characters = [];
    }

    return characters;
}

function loadSavedWorld(): unknown[] | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as unknown;
        if (!isRecord(parsed) || !Array.isArray(parsed.characters)) return null;
        return parsed.characters;
    } catch {
        return null;
    }
}

function hydrateCharacter(value: unknown): Character {
    const raw = isRecord(value) ? value : {};
    const locationId = validLocation(raw.locationId) ?? "park";
    const spawn = getRandomDestination(locationId);
    const traits = initializeTraits();

    if (isRecord(raw.traits)) {
        for (const [key, val] of Object.entries(raw.traits)) {
            if (key in traits && typeof val === "number") {
                traits[key as TraitId] = val;
            }
        }
    }

    const x = numberOr(raw.x, spawn.x);
    const y = numberOr(raw.y, spawn.y);

    return {
        id: stringOr(raw.id, crypto.randomUUID()),
        name: stringOr(raw.name, "New Citizen"),
        job: stringOr(raw.job, "Unemployed"),
        hobby: stringOr(raw.hobby, "Existing"),
        likes: stringArray(raw.likes),
        dislikes: stringArray(raw.dislikes),
        appearance: appearanceOr(raw.appearance, DEFAULT_APPEARANCE),
        locationId,
        x,
        y,
        targetX: numberOr(raw.targetX, x),
        targetY: numberOr(raw.targetY, y),
        state: "idle",
        traits,
        mood: moodOr(raw.mood),
        energy: numberOr(raw.energy, 80),
        lastEventTime: 0,
        renderLayer: raw.renderLayer === "background" || raw.renderLayer === "mainground" || raw.renderLayer === "foreground"
            ? raw.renderLayer
            : undefined,
        isOnTrain: false,
        conversationPartner: undefined,
        conversationCooldownUntil: 0,
        speech: undefined,
        speechUntil: undefined,
        travelTargetId: undefined,
        travelCompleteAt: undefined
    };
}

function getRandomDestination(locationId: LocationId): { x: number; y: number } {
    const destinations = getLocation(locationId).destinations;
    return destinations[Math.floor(Math.random() * destinations.length)] ?? { x: 400, y: 280 };
}

function validLocation(value: unknown): LocationId | null {
    if (typeof value !== "string") return null;
    return getAllLocations().some(location => location.id === value)
        ? value as LocationId
        : null;
}

function appearanceOr(value: unknown, fallback: Appearance): Appearance {
    if (!isRecord(value)) return { ...fallback };
    return { ...fallback, ...value } as Appearance;
}

function moodOr(value: unknown): Character["mood"] {
    return value === "happy" || value === "sad" || value === "angry" ||
        value === "stressed" || value === "content" || value === "scared"
        ? value
        : "content";
}

function stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringOr(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function numberOr(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null;
}
