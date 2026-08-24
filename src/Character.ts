import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";

export type CharacterState =
    | "idle"
    | "walking"
    | "talking";

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
}
