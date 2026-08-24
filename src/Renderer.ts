import type { Character } from "./Character";
import type { LocationId } from "./Location";
import { SPRITE, drawCitizen } from "./CharacterSprite";
import { getLocation } from "./Location";

export function renderWorld(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    currentLocation: LocationId,
    elapsedTime: number = 0
) {
    const canvas = ctx.canvas;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawRoom(ctx, currentLocation);

    // Filter characters in current location
    const locCharacters = characters.filter(c => c.location === currentLocation);
    
    // Draw characters by Y position.
    const sortedCharacters =
        [...locCharacters].sort(
            (a, b) => a.y - b.y
        );

    for (const character of sortedCharacters) {
        drawCharacter(ctx, character, elapsedTime);
    }

    drawLocationUI(ctx, currentLocation);
}

function drawRoom(
    ctx: CanvasRenderingContext2D,
    locationId: LocationId
) {
    const location = getLocation(locationId);

    ctx.fillStyle = location.bgColor;

    ctx.fillRect(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );

    // Back wall
    ctx.fillStyle = location.wallColor;

    ctx.fillRect(
        0,
        0,
        ctx.canvas.width,
        location.floorY
    );

    // Floor line
    ctx.strokeStyle = "#514b45";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, location.floorY);
    ctx.lineTo(ctx.canvas.width, location.floorY);
    ctx.stroke();

    // Draw location-specific elements
    switch (locationId) {
        case "park":
            drawParkElements(ctx);
            break;
        case "office":
            drawOfficeElements(ctx);
            break;
        case "bar":
            drawBarElements(ctx);
            break;
        case "gym":
            drawGymElements(ctx);
            break;
        case "home":
            drawHomeElements(ctx);
            break;
    }
}

function drawParkElements(ctx: CanvasRenderingContext2D) {
    // Simple tree representation
    ctx.fillStyle = "#4a7c3a";
    ctx.fillRect(150, 80, 40, 60);
    ctx.fillRect(500, 100, 50, 50);
}

function drawOfficeElements(ctx: CanvasRenderingContext2D) {
    // Desks
    ctx.fillStyle = "#5c4a3a";
    ctx.fillRect(80, 140, 60, 20);
    ctx.fillRect(300, 140, 60, 20);
    ctx.fillRect(520, 140, 60, 20);
}

function drawBarElements(ctx: CanvasRenderingContext2D) {
    // Bar counter
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(200, 100, 400, 40);
    
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(200, 95, 400, 5);
}

function drawGymElements(ctx: CanvasRenderingContext2D) {
    // Equipment
    ctx.fillStyle = "#5a5a5a";
    ctx.fillRect(120, 120, 30, 50);
    ctx.fillRect(400, 120, 30, 50);
    ctx.fillRect(680, 120, 30, 50);
}

function drawHomeElements(ctx: CanvasRenderingContext2D) {
    // Couch
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(200, 100, 150, 50);
}

function drawLocationUI(
    ctx: CanvasRenderingContext2D,
    locationId: LocationId
) {
    const location = getLocation(locationId);

    // Location name
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#111";

    ctx.fillText(
        location.name,
        10,
        25
    );

    // Draw exit points
    ctx.font = "10px monospace";
    ctx.textAlign = "center";

    for (const exit of location.exits) {
        ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
        ctx.fillRect(exit.x - 15, exit.y - 15, 30, 30);
        
        ctx.fillStyle = "#444";
        ctx.fillText(
            exit.label,
            exit.x,
            exit.y + 25
        );
    }
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
