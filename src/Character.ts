import type { Appearance } from "./Appearance";

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

    x: number;
    y: number;

    targetX: number;
    targetY: number;

    state: CharacterState;

    conversationPartner?: string;

    speech?: string;
    speechUntil?: number;
}