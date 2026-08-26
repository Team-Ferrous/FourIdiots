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

export type MoodType =
    | "happy"
    | "sad"
    | "angry"
    | "stressed"
    | "content"
    | "scared";

export interface Character {
    id: string;
    name: string;

    job: string;
    hobby: string;
    likes: string[];
    dislikes: string[];

    appearance: Appearance;

    /** The room/space the character currently occupies. */
    locationId: LocationId;

    x: number;
    y: number;
    targetX: number;
    targetY: number;

    state: CharacterState;

    /** Optional presentation overrides. */
    renderLayer?: RenderLayer;
    isOnTrain?: boolean;

    /** Lightweight personality/state hooks for later simulation work. */
    traits?: TraitId[];
    mood?: MoodType;

    conversationPartner?: string;
    speech?: string;
    speechUntil?: number;
}
