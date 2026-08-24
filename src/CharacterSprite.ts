/**
 * Draws a citizen from their Appearance data.
 *
 * Shared by the game renderer and the character creator preview so the
 * two can never drift apart. Everything is drawn with fillRect on a
 * pixel grid, which suits the retro look and keeps it dependency free.
 */

import type { Appearance } from "./Appearance";
import { coversLegs, shadeColor, boostSaturation } from "./Appearance";

/** Every part is outlined in this, which defines the retro look. */
const INK = "#12101a";

/**
 * Sprite metrics, in unscaled pixels, measured from the character's
 * feet at (0, 0). Deliberately big-headed and chunky: the head is
 * roughly a third of the total height, which is what gives the
 * classic 16-bit character sprite its readability at small sizes.
 */
export const SPRITE = {
    width: 38,
    height: 74,

    headWidth: 26,
    headHeight: 24,
    headTop: -70,

    neckTop: -46,
    neckHeight: 2,

    bodyWidth: 22,
    bodyTop: -44,
    bodyHeight: 26,

    armWidth: 6,
    armTop: -42,
    armHeight: 21,

    legTop: -18,
    legHeight: 18,
    legWidth: 9,
    legGap: 2,

    shoeHeight: 4
} as const;

/**
 * Draw a citizen with their feet at (x, y).
 *
 * Parts are drawn back to front: legs, torso, arms, head, then
 * everything that sits on top of the face and skull.
 *
 * @param scale Pixel multiplier. The world uses 1; the creator preview
 *              uses a larger value to show detail.
 * @param elapsedTime Milliseconds since start, used for leg swing animation.
 */
export function drawCitizen(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance,
    x: number,
    y: number,
    scale: number = 1,
    elapsedTime: number = 0
) {
    ctx.save();

    ctx.translate(x, y);
    // Boost saturation for SNES-style vibrant colors
    const boostedApp = {
        ...appearance,
        skin: boostSaturation(appearance.skin, 0.15),
        hairColor: boostSaturation(appearance.hairColor, 0.2),
        shirtColor: boostSaturation(appearance.shirtColor, 0.2),
        accentColor: boostSaturation(appearance.accentColor, 0.2),
        trouserColor: boostSaturation(appearance.trouserColor, 0.15),
        shoeColor: boostSaturation(appearance.shoeColor, 0.1),
        hatColor: boostSaturation(appearance.hatColor, 0.2),
        eyeColor: boostSaturation(appearance.eyeColor, 0.15)
    };
    ctx.scale(scale, scale);

    // Crisp edges: the sprite is authored on whole pixels.
    ctx.imageSmoothingEnabled = false;

    drawLegs(ctx, boostedApp, elapsedTime);
    drawTorso(ctx, appearance);
    drawArms(ctx, boostedApp, elapsedTime);
    drawHead(ctx, appearance);
    drawHair(ctx, appearance);
    drawFace(ctx, appearance);
    drawGlasses(ctx, appearance);
    drawHat(ctx, appearance);

    ctx.restore();
}

/** Plain filled rectangle. */
function box(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number
) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

/**
 * Filled rectangle with a 1px ink border drawn around the outside.
 *
 * Drawing the outline as a slightly larger black rect behind the fill
 * keeps every shape on the pixel grid, which a stroke() would not.
 */
function oBox(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number
) {
    ctx.fillStyle = INK;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawLegs(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance,
    elapsedTime: number = 0
) {
    const {
        legTop, legHeight, legWidth, legGap, shoeHeight
    } = SPRITE;

    const shoeTop = legTop + legHeight - shoeHeight;

    const left = -legWidth - legGap / 2;
    const right = legGap / 2;

    // A dress or skirt is a single flared shape rather than two legs,
    // so the bare legs show beneath it.
    const wearingSkirt =
        coversLegs(appearance.topStyle) ||
        appearance.bottomStyle === "skirt";

    // How far down the leg the garment reaches.
    const coverage =
        wearingSkirt
            ? 0
            : appearance.bottomStyle === "shorts"
                ? 7
                : legHeight - shoeHeight;

    // Legs shuffle apart and back together out of phase, like a
    // stepping gait. Zero when idle, since elapsedTime is 0 then.
    const stride =
        Math.round(Math.sin(elapsedTime / 140) * 5); // Enhanced stride for SNES-style

    const legs = [left - stride, right + stride];

    for (const x of legs) {
        // Bare leg underneath, so shorts and skirts reveal skin.
        oBox(
            ctx,
            appearance.skin,
            x,
            legTop,
            legWidth,
            legHeight - shoeHeight
        );
        
        // Add shading on the right side of leg for depth (SNES-style)
        box(ctx, shadeColor(appearance.skin, -0.15), x + legWidth - 2, legTop + 4, 2, legHeight - shoeHeight - 6);

        if (coverage > 0) {
            oBox(
                ctx,
                appearance.trouserColor,
                x,
                legTop,
                legWidth,
                coverage
            );
        }

        // Shoes.
        oBox(
            ctx,
            appearance.shoeColor,
            x,
            shoeTop,
            legWidth,
            shoeHeight
        );
    }

    if (wearingSkirt) {
        drawSkirt(ctx, appearance);
    }
}

/**
 * A flared skirt, built from stacked rows that widen toward the hem.
 * Used by both the "skirt" bottom and the "dress" top.
 */
function drawSkirt(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    const { legTop } = SPRITE;

    const color =
        coversLegs(appearance.topStyle)
            ? appearance.shirtColor
            : appearance.trouserColor;

    const top = legTop - 4;

    const rows = [
        { w: 20, h: 3 },
        { w: 24, h: 3 },
        { w: 28, h: 3 }
    ];

    let y = top;

    for (const row of rows) {
        oBox(ctx, color, -row.w / 2, y, row.w, row.h);
        y += row.h;
    }
}

function drawTorso(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    const { bodyWidth, bodyTop, bodyHeight } = SPRITE;

    const left = -bodyWidth / 2;
    const shirt = appearance.shirtColor;
    const accent = appearance.accentColor;

    // Bare chest first, so tank tops and overalls show skin.
    oBox(ctx, appearance.skin, left, bodyTop, bodyWidth, bodyHeight);
    
    // Add chest shading for depth (right side darker for SNES look)
    box(ctx, shadeColor(appearance.skin, -0.12), left + bodyWidth - 4, bodyTop + 2, 4, bodyHeight - 4);

    switch (appearance.topStyle) {
        case "tank":
            // Two straps over the shoulders, body from the chest down.
            oBox(ctx, shirt, left + 2, bodyTop, 4, 8);
            oBox(ctx, shirt, left + bodyWidth - 6, bodyTop, 4, 8);
            oBox(ctx, shirt, left, bodyTop + 7, bodyWidth, bodyHeight - 7);
            break;

        case "overalls":
            // Bib and straps over a bare chest.
            oBox(ctx, shirt, left + 2, bodyTop, 3, 10);
            oBox(ctx, shirt, left + bodyWidth - 5, bodyTop, 3, 10);
            oBox(ctx, shirt, left + 3, bodyTop + 9, bodyWidth - 6, 6);
            oBox(
                ctx, shirt,
                left, bodyTop + 14, bodyWidth, bodyHeight - 14
            );

            // Buttons where the straps meet the bib.
            box(ctx, accent, left + 3, bodyTop + 9, 2, 2);
            box(ctx, accent, left + bodyWidth - 5, bodyTop + 9, 2, 2);
            break;

        case "dress":
            oBox(ctx, shirt, left, bodyTop, bodyWidth, bodyHeight);
            // A belt at the waist separates bodice from skirt.
            box(
                ctx, accent,
                left, bodyTop + bodyHeight - 4, bodyWidth, 3
            );
            break;

        case "blazer": {
            // Shirt underneath.
            oBox(ctx, "#efeee6", left, bodyTop, bodyWidth, bodyHeight);

            // Jacket panels either side, leaving a V of shirt showing.
            oBox(ctx, shirt, left, bodyTop, 8, bodyHeight);
            oBox(
                ctx, shirt,
                left + bodyWidth - 8, bodyTop, 8, bodyHeight
            );

            // Lapels.
            box(
                ctx, shadeColor(shirt, -0.25),
                left + 7, bodyTop, 2, 9
            );
            box(
                ctx, shadeColor(shirt, -0.25),
                left + bodyWidth - 9, bodyTop, 2, 9
            );

            // Tie.
            box(ctx, accent, -2, bodyTop + 2, 4, 3);
            box(ctx, accent, -2, bodyTop + 5, 4, 11);
            break;
        }

        case "hoodie":
            oBox(ctx, shirt, left, bodyTop, bodyWidth, bodyHeight);

            // Hood bunched behind the neck.
            oBox(
                ctx, shadeColor(shirt, -0.22),
                left + 3, bodyTop - 3, bodyWidth - 6, 4
            );

            // Pocket.
            box(
                ctx, shadeColor(shirt, -0.18),
                left + 4, bodyTop + 15, bodyWidth - 8, 6
            );

            // Drawstrings.
            box(ctx, accent, -4, bodyTop + 1, 1, 5);
            box(ctx, accent, 3, bodyTop + 1, 1, 5);
            break;

        case "jacket":
            oBox(ctx, shirt, left, bodyTop, bodyWidth, bodyHeight);

            // Open zip line down the centre.
            box(ctx, shadeColor(shirt, -0.4), -1, bodyTop, 2, bodyHeight);

            // Collar flaps.
            box(ctx, shadeColor(shirt, -0.25), left, bodyTop, 6, 3);
            box(
                ctx, shadeColor(shirt, -0.25),
                left + bodyWidth - 6, bodyTop, 6, 3
            );
            break;

        case "sweater":
            oBox(ctx, shirt, left, bodyTop, bodyWidth, bodyHeight);

            // A single contrast band, the classic knitted stripe.
            box(ctx, accent, left, bodyTop + 10, bodyWidth, 4);

            // Ribbed hem.
            box(
                ctx, shadeColor(shirt, -0.25),
                left, bodyTop + bodyHeight - 3, bodyWidth, 3
            );
            break;

        case "longsleeve":
        case "tshirt":
        default:
            oBox(ctx, shirt, left, bodyTop, bodyWidth, bodyHeight);

            // Small chest logo, echoing the reference art.
            box(ctx, accent, -3, bodyTop + 7, 6, 6);
            break;
    }

    // Collar notch, drawn last so it sits over the garment.
    box(ctx, shadeColor(appearance.skin, -0.25), -3, bodyTop, 6, 2);
}

/**
 * Arms are drawn separately from the torso because sleeve length
 * depends on the garment: some cover the whole arm, some stop at
 * the shoulder, and the rest end mid-upper-arm.
 */
function drawArms(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance,
    elapsedTime: number = 0
) {
    const { bodyWidth, armWidth, armTop, armHeight } = SPRITE;

    const left = -bodyWidth / 2 - armWidth;
    const right = bodyWidth / 2;

    const top = appearance.topStyle;

    // Full-length sleeves.
    const longSleeved =
        top === "longsleeve" ||
        top === "sweater" ||
        top === "hoodie" ||
        top === "jacket" ||
        top === "blazer";

    // Sleeveless garments.
    const sleeveless =
        top === "tank" || top === "overalls";

    const sleeveLength =
        longSleeved
            ? armHeight - 4
            : sleeveless
                ? 0
                : 7;

    const handHeight = 4;

    // Arms bob up and down out of phase with each other while
    // walking, echoing the legs' stride. Zero when idle.
    const swing =
        Math.round(Math.sin(elapsedTime / 140) * -4); // Enhanced arm swing

    const arms = [left, right];

    for (let i = 0; i < arms.length; i++) {
        const x = arms[i];
        const armSwing = i === 0 ? swing : -swing;

        // Bare arm.
        oBox(ctx, appearance.skin, x, armTop + armSwing, armWidth, armHeight);

        if (sleeveLength > 0) {
            oBox(
                ctx,
                appearance.shirtColor,
                x,
                armTop + armSwing,
                armWidth,
                sleeveLength
            );
        }

        // Hand at the bottom of the arm.
        oBox(
            ctx,
            appearance.skin,
            x,
            armTop + armSwing + armHeight,
            armWidth,
            handHeight
        );
    }
}

function drawHead(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    const { headWidth, headHeight, headTop, neckTop, neckHeight } = SPRITE;

    const left = -headWidth / 2;

    // Neck first, so the jaw overlaps it.
    oBox(
        ctx,
        shadeColor(appearance.skin, -0.2),
        -4,
        neckTop - neckHeight,
        8,
        neckHeight + 2
    );

    oBox(ctx, appearance.skin, left, headTop, headWidth, headHeight);

    // Soft shading down the right cheek.
    box(
        ctx,
        shadeColor(appearance.skin, -0.1),
        left + headWidth - 4,
        headTop + 2,
        4,
        headHeight - 2
    );

    // Ears.
    oBox(ctx, appearance.skin, left - 2, headTop + 10, 2, 5);
    oBox(
        ctx,
        shadeColor(appearance.skin, -0.1),
        left + headWidth,
        headTop + 10,
        2,
        5
    );
}

/**
 * Eyes, brows, nose and mouth.
 *
 * Drawn after the hair so a fringe never covers the eyes, matching the
 * reference art where the face always reads clearly.
 */
function drawFace(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    const { headTop } = SPRITE;

    const eyeY = headTop + 10;

    // Large blocky eyes with a dark rim, as in the reference.
    for (const eyeX of [-8, 3]) {
        oBox(ctx, "#ffffff", eyeX, eyeY, 5, 5);
        box(ctx, appearance.eyeColor, eyeX + 1, eyeY + 1, 3, 3);
        box(
            ctx,
            shadeColor(appearance.eyeColor, -0.65),
            eyeX + 2,
            eyeY + 2,
            2,
            2
        );

        // Specular highlight, which brings the eye to life.
        box(ctx, "#ffffff", eyeX + 1, eyeY + 1, 1, 1);
    }

    // Brows, tinted from the hair so they always match.
    const brow = shadeColor(appearance.hairColor, -0.2);

    box(ctx, brow, -9, eyeY - 4, 6, 2);
    box(ctx, brow, 3, eyeY - 4, 6, 2);
    // Add darker shading under brows for expression
    box(ctx, shadeColor(appearance.hairColor, -0.4), -9, eyeY - 3, 6, 1);
    box(ctx, shadeColor(appearance.hairColor, -0.4), 3, eyeY - 3, 6, 1);

    // Nose: a short shaded edge with better contrast for SNES look
    box(ctx, shadeColor(appearance.skin, -0.35), -1, headTop + 15, 2, 3);
    box(ctx, shadeColor(appearance.skin, -0.18), 0, headTop + 15, 1, 3);

    // Mouth with a hint of a smile at the left corner.
    box(ctx, INK, -4, headTop + 20, 8, 1);
    box(ctx, INK, -5, headTop + 19, 1, 1);
}

function drawGlasses(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    if (appearance.glassesStyle === "none") return;

    const { headTop } = SPRITE;
    const eyeY = headTop + 10;

    const shades = appearance.glassesStyle === "shades";
    const lens = shades ? "#1a1a22" : "rgba(180, 220, 255, 0.35)";

    for (const x of [-9, 2]) {
        // Lens.
        box(ctx, lens, x, eyeY - 1, 7, 7);

        // Frame drawn as four thin bars, keeping it on the pixel grid.
        box(ctx, INK, x, eyeY - 2, 7, 1);
        box(ctx, INK, x, eyeY + 6, 7, 1);
        box(ctx, INK, x - 1, eyeY - 1, 1, 7);
        box(ctx, INK, x + 7, eyeY - 1, 1, 7);
    }

    // Bridge between the lenses.
    box(ctx, INK, -2, eyeY + 1, 4, 1);
}

function drawHair(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    const { headWidth, headTop } = SPRITE;

    const left = -headWidth / 2;
    const hair = appearance.hairColor;
    const dark = shadeColor(hair, -0.28);

    switch (appearance.hairStyle) {
        case "bald":
            // A faint shine keeps the scalp from looking unfinished.
            box(
                ctx,
                shadeColor(appearance.skin, 0.18),
                left + 5,
                headTop + 2,
                7,
                2
            );
            break;

        case "buzz":
            oBox(ctx, hair, left, headTop, headWidth, 4);
            box(ctx, dark, left, headTop + 4, 3, 4);
            box(ctx, dark, left + headWidth - 3, headTop + 4, 3, 4);
            break;

        case "short":
            oBox(ctx, hair, left, headTop - 2, headWidth, 8);
            box(ctx, hair, left, headTop + 6, 4, 5);
            box(ctx, dark, left + headWidth - 4, headTop + 6, 4, 5);
            break;

        case "messy":
            oBox(ctx, hair, left, headTop - 2, headWidth, 8);
            // Spikes at irregular heights, as in the reference.
            oBox(ctx, hair, left + 2, headTop - 7, 5, 5);
            oBox(ctx, hair, left + 9, headTop - 9, 4, 7);
            oBox(ctx, hair, left + 15, headTop - 6, 5, 4);
            box(ctx, dark, left + headWidth - 4, headTop + 6, 4, 5);
            break;

        case "bowl":
            oBox(ctx, hair, left - 1, headTop - 3, headWidth + 2, 12);
            box(ctx, dark, left - 1, headTop + 9, 4, 4);
            box(ctx, dark, left + headWidth - 3, headTop + 9, 4, 4);
            break;

        case "long":
            oBox(ctx, hair, left - 1, headTop - 3, headWidth + 2, 9);
            // Curtains falling past the jaw.
            oBox(ctx, hair, left - 3, headTop, 4, 28);
            oBox(ctx, dark, left + headWidth - 1, headTop, 4, 28);
            break;

        case "ponytail":
            oBox(ctx, hair, left, headTop - 2, headWidth, 8);
            box(ctx, hair, left, headTop + 6, 4, 4);
            box(ctx, dark, left + headWidth - 4, headTop + 6, 4, 4);
            // Tail behind the shoulder.
            oBox(ctx, dark, left + headWidth + 1, headTop + 3, 5, 20);
            break;

        case "bun":
            oBox(ctx, hair, left, headTop - 2, headWidth, 8);
            box(ctx, hair, left, headTop + 6, 4, 4);
            box(ctx, dark, left + headWidth - 4, headTop + 6, 4, 4);
            // The bun on top.
            oBox(ctx, hair, -5, headTop - 10, 10, 8);
            box(ctx, dark, 1, headTop - 10, 4, 8);
            break;

        case "mohawk":
            oBox(ctx, hair, -4, headTop - 11, 8, 14);
            box(ctx, dark, 1, headTop - 11, 3, 14);
            // Shaved sides showing stubble.
            box(
                ctx, shadeColor(appearance.skin, -0.18),
                left, headTop, 9, 4
            );
            box(
                ctx, shadeColor(appearance.skin, -0.22),
                left + headWidth - 9, headTop, 9, 4
            );
            break;

        case "afro":
            oBox(ctx, hair, left - 4, headTop - 8, headWidth + 8, 13);
            oBox(ctx, hair, left - 5, headTop - 4, 5, 12);
            oBox(ctx, dark, left + headWidth, headTop - 4, 5, 12);
            break;
    }
}

function drawHat(
    ctx: CanvasRenderingContext2D,
    appearance: Appearance
) {
    if (appearance.hatStyle === "none") return;

    const { headWidth, headTop } = SPRITE;

    const left = -headWidth / 2;
    const hat = appearance.hatColor;
    const dark = shadeColor(hat, -0.3);

    switch (appearance.hatStyle) {
        case "cap":
            // Crown plus a peak jutting out to the left.
            oBox(ctx, hat, left, headTop - 6, headWidth, 8);
            oBox(ctx, dark, left - 7, headTop + 1, 9, 3);
            box(ctx, shadeColor(hat, 0.15), left + 3, headTop - 5, 5, 3);
            break;

        case "beanie":
            oBox(ctx, hat, left - 1, headTop - 7, headWidth + 2, 10);
            // Folded brim.
            oBox(ctx, dark, left - 1, headTop + 1, headWidth + 2, 4);
            // Bobble.
            oBox(ctx, shadeColor(hat, 0.2), -3, headTop - 11, 6, 5);
            break;

        case "cowboy":
            // Wide brim, then the crown on top.
            oBox(ctx, dark, left - 8, headTop - 1, headWidth + 16, 4);
            oBox(ctx, hat, left + 2, headTop - 9, headWidth - 4, 9);
            box(ctx, dark, left + 2, headTop - 4, headWidth - 4, 2);
            break;

        case "bandana":
            oBox(ctx, hat, left, headTop - 2, headWidth, 6);
            // Knot and trailing tail on the right.
            oBox(ctx, dark, left + headWidth, headTop, 4, 4);
            oBox(ctx, hat, left + headWidth + 2, headTop + 3, 3, 8);
            break;
    }
}
