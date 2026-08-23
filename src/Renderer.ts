import type { Character } from "./Character";
import { SPRITE, drawCitizen } from "./CharacterSprite";

export function renderWorld(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    elapsedTime: number = 0
) {
    const canvas = ctx.canvas;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawRoom(ctx);

    // Draw characters by Y position.
    // This will matter once they're sprites.
    const sortedCharacters =
        [...characters].sort(
            (a, b) => a.y - b.y
        );

    for (const character of sortedCharacters) {
        drawCharacter(ctx, character, elapsedTime);
    }
}

function drawRoom(
    ctx: CanvasRenderingContext2D
) {
    ctx.fillStyle = "#c8b89c";

    ctx.fillRect(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );

    // Back wall

    ctx.fillStyle = "#897d70";

    ctx.fillRect(
        0,
        0,
        ctx.canvas.width,
        170
    );

    // Floor line

    ctx.strokeStyle = "#514b45";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(ctx.canvas.width, 170);
    ctx.stroke();
}

function drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    elapsedTime: number = 0
) {
    // Soft shadow on the floor, which grounds the sprite.
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";

    ctx.beginPath();
    ctx.ellipse(
        character.x,
        character.y + 3,
        17,
        5,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Only animate the stride while actually walking, so idle
    // characters stand still instead of shuffling in place.
    const walkTime =
        character.state === "walking" ? elapsedTime : 0;

    drawCitizen(
        ctx,
        character.appearance,
        character.x,
        character.y,
        1,
        walkTime
    );

    // Name

    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";

    ctx.fillText(
        character.name,
        character.x,
        character.y + 18
    );

    if (character.speech) {
        drawSpeechBubble(
            ctx,
            character.x,
            // Clear the top of the sprite, plus room for tall hats.
            character.y - SPRITE.height - 14,
            character.speech
        );
    }
}

function drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string
) {
    ctx.font = "12px monospace";

    const width =
        ctx.measureText(text).width + 16;

    ctx.fillStyle = "white";

    ctx.fillRect(
        x - width / 2,
        y - 22,
        width,
        25
    );

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        x - width / 2,
        y - 22,
        width,
        25
    );

    ctx.fillStyle = "#111";
    ctx.textAlign = "center";

    ctx.fillText(
        text,
        x,
        y - 6
    );
}