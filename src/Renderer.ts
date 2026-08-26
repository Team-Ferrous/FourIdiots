import type { Character, RenderLayer } from "./Character";
import type { LocationId } from "./Location";
import { SPRITE, drawCitizen } from "./CharacterSprite";
import { getLocation } from "./Location";

function getCharacterLayer(character: Character): RenderLayer {
  if (character.renderLayer) return character.renderLayer;
  if (character.y < 220) return "background";
  if (character.y > 320) return "foreground";
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
    const locCharacters = characters.filter(c => c.locationId === currentLocation);
    
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
    const sorted = [...characters].sort((a, b) => a.y - b.y);

    ctx.save();
    ctx.globalAlpha = 1.0;

    for (const character of sorted) {
        drawCharacter(ctx, character, elapsedTime, 1.1);
    }


    ctx.restore();
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
                    ctx.strokeStyle = elem.color || "#4a90e2";
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.arc(elem.x + i * 80, elem.y + 20, 30, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    break;

                case "table":
                    ctx.fillRect(elem.x, elem.y, 50, 40);
                    break;
                case "screen":
                    ctx.fillRect(elem.x, elem.y, 80, 60);
                    break;
                case "store":
                    ctx.fillRect(elem.x, elem.y, 40, 60);
                    break;
                case "lights":
                    ctx.beginPath();
                    ctx.arc(elem.x, elem.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case "cross":
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(elem.x - 8, elem.y);
                    ctx.lineTo(elem.x + 8, elem.y);
                    ctx.moveTo(elem.x, elem.y - 8);
                    ctx.lineTo(elem.x, elem.y + 8);
                    ctx.stroke();
                    break;
                case "badge":
                    ctx.fillRect(elem.x - 8, elem.y - 8, 16, 16);
                    break;
                case "mailbox":
                    ctx.fillRect(elem.x, elem.y, 20, 30);
                    break;
                case "bench":
                    ctx.fillRect(elem.x, elem.y, 60, 20);
                    break;
                case "cooler":
                    ctx.fillRect(elem.x, elem.y, 25, 35);
                    break;
                case "cabinet":
                    ctx.fillRect(elem.x, elem.y, 35, 50);
                    break;
                case "stool":
                    ctx.fillRect(elem.x, elem.y, 20, 25);
                    break;
                case "shelf":
                    ctx.fillRect(elem.x, elem.y, 50, 30);
                    break;
                case "treadmill":
                    ctx.fillRect(elem.x, elem.y, 50, 35);
                    break;
                case "weights":
                    ctx.beginPath();
                    ctx.arc(elem.x - 10, elem.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(elem.x + 10, elem.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case "door":
                    ctx.fillRect(elem.x, elem.y, 25, 40);
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(elem.x, elem.y, 25, 40);
                    break;
                case "plant":
                    ctx.fillRect(elem.x - 8, elem.y + 20, 16, 20);
                    ctx.beginPath();
                    ctx.arc(elem.x, elem.y + 10, 12, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case "umbrella":
                    ctx.beginPath();
                    ctx.arc(elem.x, elem.y, 15, 0, Math.PI);
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(elem.x, elem.y);
                    ctx.lineTo(elem.x, elem.y + 20);
                    ctx.stroke();
                    break;
                case "sailboat":
                    ctx.beginPath();
                    ctx.moveTo(elem.x, elem.y + 20);
                    ctx.lineTo(elem.x - 15, elem.y + 20);
                    ctx.lineTo(elem.x, elem.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case "seat":
                    ctx.fillRect(elem.x, elem.y, 25, 15);
                    break;
                case "curtain":
                    ctx.fillRect(elem.x, elem.y, 20, 50);
                    break;
                case "slot-machine":
                    ctx.fillRect(elem.x, elem.y, 30, 50);
                    break;
                case "chair":
                    ctx.fillRect(elem.x, elem.y, 20, 20);
                    break;
                case "podium":
                    ctx.fillRect(elem.x, elem.y, 40, 35);
                    break;
                case "bed":
                    ctx.fillRect(elem.x, elem.y, 60, 40);
                    break;
                case "cell":
                    ctx.fillRect(elem.x, elem.y, 50, 50);
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(elem.x, elem.y, 50, 50);
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(elem.x + 15 + i * 15, elem.y);
                        ctx.lineTo(elem.x + 15 + i * 15, elem.y + 50);
                        ctx.stroke();
                    }
                    break;
                case "lamp":
                    ctx.fillRect(elem.x - 3, elem.y + 15, 6, 20);
                    ctx.beginPath();
                    ctx.arc(elem.x, elem.y + 8, 10, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case "chalkboard":
                    ctx.fillRect(elem.x, elem.y, 60, 40);
                    break;
                case "train-car":
                    ctx.fillRect(elem.x, elem.y, 40, 30);
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

    const walkTime = character.state === "walking" || character.state === "boarding" ? elapsedTime : 0;

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
