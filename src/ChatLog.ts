import type { LocationId } from "./Location";

export interface ChatLogEntry {
    id: number;
    timestamp: number;
    speaker: string;
    text: string;
    locationId?: LocationId;
    kind: "speech" | "system";
}

const MAX_ENTRIES = 100;
const entries: ChatLogEntry[] = [];
let nextId = 1;

export function addChatLine(
    speaker: string,
    text: string,
    timestamp: number = performance.now(),
    locationId?: LocationId
): ChatLogEntry {
    const entry: ChatLogEntry = {
        id: nextId++,
        timestamp,
        speaker,
        text,
        locationId,
        kind: "speech"
    };

    entries.push(entry);
    trimLog();
    return entry;
}

export function addSystemLine(
    text: string,
    timestamp: number = performance.now(),
    locationId?: LocationId
): ChatLogEntry {
    const entry: ChatLogEntry = {
        id: nextId++,
        timestamp,
        speaker: "World",
        text,
        locationId,
        kind: "system"
    };

    entries.push(entry);
    trimLog();
    return entry;
}

export function getChatLog(): readonly ChatLogEntry[] {
    return entries;
}

export function clearChatLog(): void {
    entries.length = 0;
}

function trimLog(): void {
    if (entries.length > MAX_ENTRIES) {
        entries.splice(0, entries.length - MAX_ENTRIES);
    }
}
