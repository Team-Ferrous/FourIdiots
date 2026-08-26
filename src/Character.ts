import type { Appearance } from "./Appearance";
import type { LocationId } from "./Location";
import type { TraitId } from "./Personality";

export type CharacterState =
    | "idle"
    | "walking"
    | "talking"
    | "traveling"
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

    // Single source of truth for where a character currently exists.
    locationId: LocationId;

    x: number;
    y: number;
    targetX: number;
    targetY: number;

    state: CharacterState;

    // Simple area-to-area travel intent. The simulation announces the move,
    // waits briefly, then commits locationId to the target room.
    travelTargetId?: LocationId;
    travelCompleteAt?: number;

    conversationPartner?: string;
    speech?: string;
    speechUntil?: number;

    // These are retained for the richer systems that already exist, but the
    // core loop does not mutate them yet. They are data hooks, not drivers.
    traits: Record<TraitId, number>;
    mood: MoodType;
    energy: number;
    lastEventTime: number;

    // Optional presentation / future transport hooks.
    renderLayer?: RenderLayer;
    isOnTrain?: boolean;
}
