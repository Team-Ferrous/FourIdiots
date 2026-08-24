import type { Character } from "./Character";
import type { LocationId } from "./Location";
import { SPRITE, drawCitizen } from "./CharacterSprite";
import { getLocation } from "./Location";

export type RenderLayer = "background" | "mainground" | "foreground";

function getCharacterLayer(character: Character): RenderLayer {
  if (character.renderLayer) return character.renderLayer;
  if (character.y > 320) return "background";
  if (character.y < 150) return "foreground";
  return "mainground";
}

export function renderWorld(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    currentLocation: LocationId,
    elapsedTime: number = 0
) {
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoom(ctx, currentLocation);

    // Filter characters in current location
    const locCharacters = characters.filter(c => c.location === currentLocation);
    
    // Separate into layers
    const backgroundChars = locCharacters.filter(c => getCharacterLayer(c) === "background");
    const maingroundChars = locCharacters.filter(c => getCharacterLayer(c) === "mainground");
    const foregroundChars = locCharacters.filter(c => getCharacterLayer(c) === "foreground");

    // Render layers in order
    renderBackgroundLayer(ctx, backgroundChars, elapsedTime);
    renderMainGroundLayer(ctx, maingroundChars, elapsedTime);
    renderForegroundLayer(ctx, foregroundChars, currentLocation, elapsedTime);

    drawLocationUI(ctx, currentLocation);
}

function renderBackgroundLayer(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    elapsedTime: number
) {
    // Sort by Y position
    const sorted = [...characters].sort((a, b) => a.y - b.y);

    ctx.save();
    ctx.globalAlpha = 0.6;

    for (const character of sorted) {
        drawCharacter(ctx, character, elapsedTime, 0.7);
    }

    ctx.restore();
}

function renderMainGroundLayer(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    elapsedTime: number
) {
    // Sort by Y position
    const sorted = [...characters].sort((a, b) => a.y - b.y);

    ctx.save();
    ctx.globalAlpha = 1.0;

    for (const character of sorted) {
        drawCharacter(ctx, character, elapsedTime, 1.0);
    }

    ctx.restore();
}

function renderForegroundLayer(
    ctx: CanvasRenderingContext2D,
    characters: Character[],
    currentLocation: LocationId,
    elapsedTime: number
) {
    // Sort by Y position
    const sorted = [...characters].sort((a, b) => a.y - b.y);

    ctx.save();
    ctx.globalAlpha = 1.0;

    for (const character of sorted) {
        drawCharacter(ctx, character, elapsedTime, 1.1);
    }

    // Only draw train at train station
    if (currentLocation === "train") {
        drawTrain(ctx);
    }

    ctx.restore();
}

function drawTrain(ctx: CanvasRenderingContext2D) {
    const trainY = 100;
    const trainX = 150;

    ctx.fillStyle = "#8b0000";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    // Train engine
    ctx.fillRect(trainX, trainY, 60, 40);
    ctx.strokeRect(trainX, trainY, 60, 40);

    // Train window
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(trainX + 10, trainY + 10, 20, 15);
    ctx.strokeRect(trainX + 10, trainY + 10, 20, 15);

    // Train cars
    for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(trainX + 60 + (i * 45), trainY, 40, 40);
        ctx.strokeRect(trainX + 60 + (i * 45), trainY, 40, 40);

        // Windows
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(trainX + 70 + (i * 45), trainY + 8, 15, 12);
        ctx.fillRect(trainX + 70 + (i * 45), trainY + 22, 15, 12);
    }

    // Track
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, trainY + 40);
    ctx.lineTo(800, trainY + 40);
    ctx.stroke();

    // Platform
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(50, trainY + 40, 700, 30);
    
    // Platform edge
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, trainY + 40, 700, 30);
}

function drawRoom(
    ctx: CanvasRenderingContext2D,
    locationId: LocationId
) {
    const location = getLocation(locationId);

    ctx.fillStyle = location.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Back wall
    ctx.fillStyle = location.wallColor;
    ctx.fillRect(0, 0, ctx.canvas.width, location.floorY);

    // Floor line
    ctx.strokeStyle = "#514b45";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, location.floorY);
    ctx.lineTo(ctx.canvas.width, location.floorY);
    ctx.stroke();

    // Draw location-specific elements
    if (location.visualElements) {
        for (const elem of location.visualElements) {
            ctx.fillStyle = elem.color || "#8b7355";
            switch (elem.type) {
                case "tree":
                    ctx.fillRect(elem.x - 10, elem.y, 20, 60);
                    break;
                case "desk":
                    ctx.fillRect(elem.x, elem.y, 40, 20);
                    break;
                case "counter":
                    ctx.fillRect(elem.x, elem.y, 100, 30);
                    break;
                case "equipment":
                    ctx.fillRect(elem.x, elem.y, 30, 40);
                    break;
                case "couch":
                    ctx.fillRect(elem.x, elem.y, 60, 30);
                    break;
                case "bookshelf":
                    ctx.fillRect(elem.x, elem.y, 25, 50);
                    break;
                case "waves":
                    ctx.fillStyle = elem.color || "#4a90e2";
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.arc(elem.x + i * 80, elem.y + 20, 30, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    break;
            }
        }
    }
}

function drawCharacter(
    ctx: CanvasRenderingContext2D,
    character: Character,
    elapsedTime: number,
    scale: number = 1.0
) {
    // Soft shadow on the floor
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(
        character.x,
        character.y + 3,
        17 * scale,
        5 * scale,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    const walkTime = character.state === "walking" ? elapsedTime : 0;

    ctx.save();
    ctx.scale(scale, scale);
    drawCitizen(
        ctx,
        character.appearance,
        character.x / scale,
        character.y / scale,
        1,
        walkTime
    );
    ctx.restore();

    // Name
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";
    ctx.fillText(character.name, character.x, character.y + 18);

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

    const width = ctx.measureText(text).width + 16;

    ctx.fillStyle = "white";
    ctx.fillRect(x - width / 2, y - 22, width, 25);

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2, y - 22, width, 25);

    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y - 6);
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
    ctx.fillText(location.name, 10, 25);

    // Draw exit points
    ctx.font = "10px monospace";
    ctx.textAlign = "center";

    for (const exit of location.exits) {
        ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
        ctx.fillRect(exit.x - 15, exit.y - 15, 30, 30);
        
        ctx.fillStyle = "#444";
        ctx.fillText(exit.label, exit.x, exit.y + 25);
    }
}
