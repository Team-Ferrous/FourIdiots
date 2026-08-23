import { describe, it, expect, vi, afterEach } from "vitest";

import {
    ACCENT_COLORS,
    BOTTOM_STYLES,
    BOTTOM_STYLE_NAMES,
    DEFAULT_APPEARANCE,
    EYE_COLORS,
    GLASSES_STYLES,
    GLASSES_STYLE_NAMES,
    HAIR_COLORS,
    HAIR_STYLES,
    HAIR_STYLE_NAMES,
    HAT_COLORS,
    HAT_STYLES,
    HAT_STYLE_NAMES,
    SHIRT_COLORS,
    SHOE_COLORS,
    SKIN_TONES,
    TOP_STYLES,
    TOP_STYLE_NAMES,
    TROUSER_COLORS,
    coversLegs,
    randomAppearance,
    shadeColor
} from "../src/Appearance";

afterEach(() => {
    vi.restoreAllMocks();
});

const ALL_PALETTES = [
    ["skin tones", SKIN_TONES],
    ["hair colours", HAIR_COLORS],
    ["eye colours", EYE_COLORS],
    ["shirt colours", SHIRT_COLORS],
    ["trouser colours", TROUSER_COLORS],
    ["shoe colours", SHOE_COLORS],
    ["accent colours", ACCENT_COLORS],
    ["hat colours", HAT_COLORS]
] as const;

const ALL_STYLE_SETS = [
    ["hair", HAIR_STYLES, HAIR_STYLE_NAMES],
    ["top", TOP_STYLES, TOP_STYLE_NAMES],
    ["bottom", BOTTOM_STYLES, BOTTOM_STYLE_NAMES],
    ["hat", HAT_STYLES, HAT_STYLE_NAMES],
    ["glasses", GLASSES_STYLES, GLASSES_STYLE_NAMES]
] as const;

describe("palettes", () => {
    it.each(ALL_PALETTES)(
        "%s use valid 6-digit hex colours",
        (_label, palette) => {
            for (const entry of palette) {
                expect(entry.color).toMatch(/^#[0-9a-f]{6}$/i);
            }
        }
    );

    it.each(ALL_PALETTES)(
        "%s have unique ids",
        (_label, palette) => {
            const ids = palette.map(e => e.id);
            expect(new Set(ids).size).toBe(ids.length);
        }
    );

    it.each(ALL_PALETTES)(
        "%s have no duplicate colours",
        (_label, palette) => {
            const colors = palette.map(e => e.color);
            expect(new Set(colors).size).toBe(colors.length);
        }
    );

    it.each(ALL_STYLE_SETS)(
        "%s styles all have display names",
        (_label, styles, names) => {
            for (const style of styles) {
                expect(
                    (names as Record<string, string>)[style]
                ).toBeTruthy();
            }
        }
    );

    it.each(ALL_STYLE_SETS)(
        "%s styles are unique",
        (_label, styles) => {
            expect(new Set(styles).size).toBe(styles.length);
        }
    );

    it.each(ALL_STYLE_SETS)(
        "%s style names map only known styles",
        (_label, styles, names) => {
            // Guards against a name left behind after a style is renamed.
            expect(Object.keys(names).sort())
                .toEqual([...styles].sort());
        }
    );
});

describe("coversLegs", () => {
    it("is true for a dress, which brings its own skirt", () => {
        expect(coversLegs("dress")).toBe(true);
    });

    it("is false for every other top", () => {
        for (const top of TOP_STYLES) {
            if (top === "dress") continue;
            expect(coversLegs(top)).toBe(false);
        }
    });
});

describe("default appearance", () => {
    it("only uses colours that exist in the palettes", () => {
        expect(
            SKIN_TONES.some(e => e.color === DEFAULT_APPEARANCE.skin)
        ).toBe(true);

        expect(
            HAIR_COLORS.some(e => e.color === DEFAULT_APPEARANCE.hairColor)
        ).toBe(true);

        expect(
            EYE_COLORS.some(e => e.color === DEFAULT_APPEARANCE.eyeColor)
        ).toBe(true);

        expect(
            SHIRT_COLORS.some(e => e.color === DEFAULT_APPEARANCE.shirtColor)
        ).toBe(true);
    });

    it("uses known styles throughout", () => {
        expect(HAIR_STYLES).toContain(DEFAULT_APPEARANCE.hairStyle);
        expect(TOP_STYLES).toContain(DEFAULT_APPEARANCE.topStyle);
        expect(BOTTOM_STYLES).toContain(DEFAULT_APPEARANCE.bottomStyle);
        expect(HAT_STYLES).toContain(DEFAULT_APPEARANCE.hatStyle);
        expect(GLASSES_STYLES).toContain(DEFAULT_APPEARANCE.glassesStyle);
    });

    it("uses palette colours for the new clothing fields", () => {
        expect(
            ACCENT_COLORS.some(e => e.color === DEFAULT_APPEARANCE.accentColor)
        ).toBe(true);

        expect(
            HAT_COLORS.some(e => e.color === DEFAULT_APPEARANCE.hatColor)
        ).toBe(true);
    });
});

describe("shadeColor", () => {
    it("returns the same colour when the amount is zero", () => {
        expect(shadeColor("#80a0c0", 0)).toBe("#80a0c0");
    });

    it("goes fully black at -1", () => {
        expect(shadeColor("#80a0c0", -1)).toBe("#000000");
    });

    it("goes fully white at 1", () => {
        expect(shadeColor("#80a0c0", 1)).toBe("#ffffff");
    });

    it("darkens toward black for negative amounts", () => {
        expect(shadeColor("#808080", -0.5)).toBe("#404040");
    });

    it("lightens toward white for positive amounts", () => {
        // 128 + (255 - 128) * 0.5 = 191.5, rounds to 192 (0xc0).
        expect(shadeColor("#808080", 0.5)).toBe("#c0c0c0");
    });

    it("expands three digit shorthand", () => {
        expect(shadeColor("#abc", 0)).toBe("#aabbcc");
    });

    it("accepts colours without a leading hash", () => {
        expect(shadeColor("808080", 0)).toBe("#808080");
    });

    it("clamps amounts beyond the -1..1 range", () => {
        expect(shadeColor("#808080", -5)).toBe("#000000");
        expect(shadeColor("#808080", 5)).toBe("#ffffff");
    });

    it("always returns a valid 6-digit hex colour", () => {
        for (const amount of [-0.9, -0.33, 0, 0.07, 0.61]) {
            expect(shadeColor("#1b1b1f", amount))
                .toMatch(/^#[0-9a-f]{6}$/);
        }
    });
});

describe("randomAppearance", () => {
    it("only picks values from the palettes", () => {
        for (let i = 0; i < 40; i++) {
            const a = randomAppearance();

            expect(SKIN_TONES.some(e => e.color === a.skin)).toBe(true);
            expect(HAIR_COLORS.some(e => e.color === a.hairColor)).toBe(true);
            expect(EYE_COLORS.some(e => e.color === a.eyeColor)).toBe(true);
            expect(SHIRT_COLORS.some(e => e.color === a.shirtColor)).toBe(true);
            expect(
                ACCENT_COLORS.some(e => e.color === a.accentColor)
            ).toBe(true);
            expect(HAT_COLORS.some(e => e.color === a.hatColor)).toBe(true);

            expect(HAIR_STYLES).toContain(a.hairStyle);
            expect(TOP_STYLES).toContain(a.topStyle);
            expect(BOTTOM_STYLES).toContain(a.bottomStyle);
            expect(HAT_STYLES).toContain(a.hatStyle);
            expect(GLASSES_STYLES).toContain(a.glassesStyle);
        }
    });

    it("picks the first entry of each palette when random returns 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        const a = randomAppearance();

        expect(a.skin).toBe(SKIN_TONES[0].color);
        expect(a.hairStyle).toBe(HAIR_STYLES[0]);
    });

    it("never runs off the end of a palette when random is near 1", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.999999);

        const a = randomAppearance();

        expect(a.skin).toBe(SKIN_TONES[SKIN_TONES.length - 1].color);
        expect(a.shoeColor).toBe(SHOE_COLORS[SHOE_COLORS.length - 1].color);
    });
});
