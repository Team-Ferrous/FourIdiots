import "./style.css";

import {
    characters,
    updateSimulation,
    addCitizen
} from "./Simulation";

import {
    renderWorld
} from "./Renderer";

import {
    mountCharacterCreator
} from "./CharacterCreator";

const app =
    document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
    <div id="sitcom">
        <div class="world-bar">
            <button id="open-creator" type="button">
                Create a Citizen
            </button>
        </div>

        <canvas
            id="world"
            width="800"
            height="450">
        </canvas>
    </div>

    <div id="creator-host" hidden></div>
`;

const sitcom =
    document.querySelector<HTMLDivElement>("#sitcom")!;

const creatorHost =
    document.querySelector<HTMLDivElement>("#creator-host")!;

let creatorMounted = false;

document
    .querySelector<HTMLButtonElement>("#open-creator")!
    .addEventListener("click", () => {
        sitcom.hidden = true;
        creatorHost.hidden = false;

        // Mount lazily so the creator's DOM is only built when needed.
        if (!creatorMounted) {
            creatorMounted = true;

            mountCharacterCreator(creatorHost, {
                onConfirm: (appearance, name) => {
                    addCitizen(appearance, name);

                    creatorHost.hidden = true;
                    sitcom.hidden = false;
                }
            });
        }
    });

const canvas =
    document.querySelector<HTMLCanvasElement>(
        "#world"
    )!;

const ctx =
    canvas.getContext("2d")!;

ctx.imageSmoothingEnabled = false;

let previousTime =
    performance.now();

function gameLoop(
    currentTime: number
) {
    const deltaTime =
        Math.min(
            (currentTime - previousTime) / 1000,
            0.1
        );

    previousTime = currentTime;

    updateSimulation(
        deltaTime,
        currentTime
    );

    renderWorld(
        ctx,
        characters,
        currentTime
    );

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);