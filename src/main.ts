import "./style.css";

import { updateSimulation, addCitizen } from "./Simulation";
import { renderWorld } from "./Renderer";
import { mountCharacterCreator } from "./CharacterCreator";
import type { LocationId } from "./Location";
import { getAllLocations, getLocation } from "./Location";
import { clearChatLog, getChatLog } from "./ChatLog";
import {
    getCharacters,
    loadWorld,
    removeCharacter,
    saveWorld
} from "./WorldState";

const app = document.querySelector<HTMLDivElement>("#app")!;
let currentLocation: LocationId = "park";
let creatorMounted = false;

app.innerHTML = `
    <div id="sitcom">
        <div class="world-bar">
            <button id="open-creator" type="button">Create a Citizen</button>
            <button id="save-world" type="button">Save World</button>
            <div id="location-selector"></div>
        </div>

        <div class="world-layout">
            <canvas id="world" width="800" height="450"></canvas>

            <aside id="roster-panel" class="roster-panel">
                <div class="roster-header">
                    <strong>WORLD ROSTER</strong>
                    <span id="roster-count">0 Citizens</span>
                </div>
                <div id="roster-list"></div>
            </aside>
        </div>

        <section class="chat-log-panel">
            <div class="chat-log-header">
                <strong>CHAT LOG</strong>
                <button id="clear-chat" type="button">Clear</button>
            </div>
            <div id="chat-log" class="chat-log" aria-live="polite"></div>
        </section>
    </div>

    <div id="creator-host" hidden></div>
`;

const sitcom = document.querySelector<HTMLDivElement>("#sitcom")!;
const creatorHost = document.querySelector<HTMLDivElement>("#creator-host")!;
const rosterList = document.querySelector<HTMLDivElement>("#roster-list")!;
const rosterCount = document.querySelector<HTMLSpanElement>("#roster-count")!;
const locationSelector = document.querySelector<HTMLDivElement>("#location-selector")!;
const chatLog = document.querySelector<HTMLDivElement>("#chat-log")!;

function setCurrentLocation(locationId: LocationId) {
    currentLocation = locationId;

    locationSelector
        .querySelectorAll<HTMLButtonElement>("button[data-location-id]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.locationId === locationId
            );
        });
}

for (const location of getAllLocations()) {
    const button = document.createElement("button");
    button.textContent = location.name;
    button.dataset.locationId = location.id;

    button.addEventListener("click", () => {
        setCurrentLocation(location.id);
    });

    locationSelector.appendChild(button);
}

setCurrentLocation(currentLocation);

document
    .querySelector<HTMLButtonElement>("#open-creator")!
    .addEventListener("click", () => {
        sitcom.hidden = true;
        creatorHost.hidden = false;

        if (!creatorMounted) {
            creatorMounted = true;

            mountCharacterCreator(creatorHost, {
                onConfirm: (appearance, name, locationId) => {
                    addCitizen(appearance, name, locationId);
                    setCurrentLocation(locationId);
                    refreshRoster();

                    creatorHost.hidden = true;
                    sitcom.hidden = false;
                }
            });
        }
    });

document
    .querySelector<HTMLButtonElement>("#save-world")!
    .addEventListener("click", () => {
        saveWorld();
    });


document
    .querySelector<HTMLButtonElement>("#clear-chat")!
    .addEventListener("click", () => {
        clearChatLog();
        refreshChatLog();
    });

let lastRenderedChatId = 0;

function refreshChatLog() {
    const entries = getChatLog();
    const latestId = entries.at(-1)?.id ?? 0;

    if (latestId === lastRenderedChatId && entries.length > 0) {
        return;
    }

    chatLog.innerHTML = "";

    for (const entry of entries) {
        const row = document.createElement("div");
        row.className = `chat-line ${entry.kind}`;

        const location = entry.locationId
            ? getLocation(entry.locationId).name
            : "World";

        row.innerHTML = `
            <span class="chat-location">[${escapeHtml(location)}]</span>
            <strong class="chat-speaker">${escapeHtml(entry.speaker)}:</strong>
            <span class="chat-text">${escapeHtml(entry.text)}</span>
        `;

        chatLog.appendChild(row);
    }

    lastRenderedChatId = latestId;
    chatLog.scrollTop = chatLog.scrollHeight;
}

function refreshRoster() {
    const characters = getCharacters();
    rosterCount.textContent = `${characters.length} ${characters.length === 1 ? "Citizen" : "Citizens"}`;
    rosterList.innerHTML = "";

    for (const character of characters) {
        const row = document.createElement("div");
        row.className = "roster-row";

        const info = document.createElement("button");
        info.type = "button";
        info.className = "roster-character";
        info.title = "View this citizen's current area";

        const partner = character.conversationPartner
            ? getCharacters().find(c => c.id === character.conversationPartner)?.name
            : undefined;

        info.innerHTML = `
            <strong>${escapeHtml(character.name)}</strong>
            <span>${escapeHtml(getLocation(character.locationId).name)}</span>
            <span>${escapeHtml(character.state)}${partner ? ` → ${escapeHtml(partner)}` : ""}</span>
        `;

        info.addEventListener("click", () => {
            setCurrentLocation(character.locationId);
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "roster-delete";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            removeCharacter(character.id);
            refreshRoster();
        });

        row.append(info, remove);
        rosterList.appendChild(row);
    }
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

let previousTime = performance.now();
let rosterRefreshAccumulator = 0;
let autosaveAccumulator = 0;

function gameLoop(currentTime: number) {
    const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.1);
    previousTime = currentTime;

    updateSimulation(deltaTime, currentTime);

    renderWorld(
        ctx,
        getCharacters(),
        currentLocation,
        currentTime
    );

    // Debug roster does not need to rebuild at 60 FPS.
    rosterRefreshAccumulator += deltaTime;
    if (rosterRefreshAccumulator >= 0.5) {
        rosterRefreshAccumulator = 0;
        refreshRoster();
        refreshChatLog();
    }

    // Persist movement/location changes without writing localStorage every frame.
    autosaveAccumulator += deltaTime;
    if (autosaveAccumulator >= 5) {
        autosaveAccumulator = 0;
        saveWorld();
    }

    requestAnimationFrame(gameLoop);
}

async function start() {
    await loadWorld();
    refreshRoster();
    refreshChatLog();
    previousTime = performance.now();
    requestAnimationFrame(gameLoop);
}

void start();
