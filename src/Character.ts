import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { TraitId } from "./Personality";

export type CharacterState =
    | "idle"
    | "walking"
    | "talking"
    | "boarding"
    | "on_train"
    | "disembarking";

export type RenderLayer = "background" | "mainground" | "foreground";

export type MoodType = "happy" | "sad" | "angry" | "stressed" | "content" | "scared";

export type Character = {
    id: string;
    name: string;

    job: string;
    hobby: string;

    appearance: Appearance;

    likes: string[];
    dislikes: string[];

    location: LocationId;

    x: number;
    y: number;

    targetX: number;
    targetY: number;

    state: CharacterState;

    conversationPartner?: string;

    speech?: string;
    speechUntil?: number;

    traits: Record<TraitId, number>;
    mood: MoodType;
    energy: number;
    lastEventTime: number;

    renderLayer?: RenderLayer;
    isOnTrain?: boolean;
    boardingProgress?: number;
}
