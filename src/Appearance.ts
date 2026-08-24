/**
 * Appearance data for a citizen.
 *
 * This module holds *only* data and pure helpers - no drawing and no DOM.
 * That keeps it easy to unit test, and lets both the game renderer and the
 * character creator share exactly the same definitions.
 */

export type PaletteEntry = {
    id: string;
    name: string;
    color: string;
};

/**
 * Hair styles are a closed set because each one needs matching draw code
 * in CharacterSprite.ts. Declared as a const array so we get both a runtime
 * list (for building the UI) and a compile-time union type from one source.
 */
export const HAIR_STYLES = [
    "bald",
    "buzz",
    "short",
    "messy",
    "bowl",
    "long",
    "ponytail",
    "bun",
    "mohawk",
    "afro"
] as const;

export type HairStyle = typeof HAIR_STYLES[number];

export const HAIR_STYLE_NAMES: Record<HairStyle, string> = {
    bald: "Bald",
    buzz: "Buzzcut",
    short: "Short",
    messy: "Messy",
    bowl: "Bowl",
    long: "Long",
    ponytail: "Ponytail",
    bun: "Bun",
    mohawk: "Mohawk",
    afro: "Afro"
};

/**
 * Upper body garments. "dress" is special: it replaces the legwear with
 * a skirt, so the chosen bottom is ignored. See coversLegs().
 */
export const TOP_STYLES = [
    "tshirt",
    "longsleeve",
    "tank",
    "sweater",
    "hoodie",
    "jacket",
    "blazer",
    "overalls",
    "dress"
] as const;

export type TopStyle = typeof TOP_STYLES[number];

export const TOP_STYLE_NAMES: Record<TopStyle, string> = {
    tshirt: "T-Shirt",
    longsleeve: "Long Sleeve",
    tank: "Tank Top",
    sweater: "Sweater",
    hoodie: "Hoodie",
    jacket: "Jacket",
    blazer: "Blazer & Tie",
    overalls: "Overalls",
    dress: "Dress"
};

export const BOTTOM_STYLES = [
    "trousers",
    "shorts",
    "skirt"
] as const;

export type BottomStyle = typeof BOTTOM_STYLES[number];

export const BOTTOM_STYLE_NAMES: Record<BottomStyle, string> = {
    trousers: "Trousers",
    shorts: "Shorts",
    skirt: "Skirt"
};

export const HAT_STYLES = [
    "none",
    "cap",
    "beanie",
    "cowboy",
    "bandana"
] as const;

export type HatStyle = typeof HAT_STYLES[number];

export const HAT_STYLE_NAMES: Record<HatStyle, string> = {
    none: "None",
    cap: "Cap",
    beanie: "Beanie",
    cowboy: "Cowboy",
    bandana: "Bandana"
};

export const GLASSES_STYLES = [
    "none",
    "specs",
    "shades"
] as const;

export type GlassesStyle = typeof GLASSES_STYLES[number];

export const GLASSES_STYLE_NAMES: Record<GlassesStyle, string> = {
    none: "None",
    specs: "Specs",
    shades: "Shades"
};

/**
 * True when the top garment supplies its own legwear, meaning the
 * bottom style should not be drawn.
 */
export function coversLegs(top: TopStyle): boolean {
    return top === "dress";
}

export type Appearance = {
    skin: string;

    hairStyle: HairStyle;
    hairColor: string;

    eyeColor: string;

    topStyle: TopStyle;
    shirtColor: string;

    /** Ties, logos, stripes and overall buttons. */
    accentColor: string;

    bottomStyle: BottomStyle;
    trouserColor: string;

    shoeColor: string;

    hatStyle: HatStyle;
    hatColor: string;

    glassesStyle: GlassesStyle;
};

/** A broad, evenly spaced range of skin tones. */
export const SKIN_TONES: PaletteEntry[] = [
    { id: "porcelain", name: "Porcelain", color: "#f8ddc8" },
    { id: "fair",      name: "Fair",      color: "#f1c9a5" },
    { id: "light",     name: "Light",     color: "#e4b78e" },
    { id: "warm",      name: "Warm",      color: "#d19c6a" },
    { id: "olive",     name: "Olive",     color: "#b57f4f" },
    { id: "tan",       name: "Tan",       color: "#a06a3f" },
    { id: "bronze",    name: "Bronze",    color: "#8a5a34" },
    { id: "brown",     name: "Brown",     color: "#6f4426" },
    { id: "deep",      name: "Deep",      color: "#573520" },
    { id: "ebony",     name: "Ebony",     color: "#3d2417" }
];

/** Natural shades first, then the loud ones. */
export const HAIR_COLORS: PaletteEntry[] = [
    { id: "black",     name: "Black",      color: "#1b1b1f" },
    { id: "darkbrown", name: "Dark Brown", color: "#3a2418" },
    { id: "brown",     name: "Brown",      color: "#5c3a21" },
    { id: "chestnut",  name: "Chestnut",   color: "#7a4a2b" },
    { id: "auburn",    name: "Auburn",     color: "#91402a" },
    { id: "ginger",    name: "Ginger",     color: "#c2571f" },
    { id: "blonde",    name: "Blonde",     color: "#d9a94b" },
    { id: "platinum",  name: "Platinum",   color: "#e8dcb5" },
    { id: "grey",      name: "Grey",       color: "#9a9a9a" },
    { id: "white",     name: "White",      color: "#e8e8e8" },
    { id: "pink",      name: "Punk Pink",  color: "#e0409a" },
    { id: "blue",      name: "Electric",   color: "#2f7fe0" },
    { id: "green",     name: "Toxic",      color: "#43b545" },
    { id: "purple",    name: "Violet",     color: "#8a4fd0" }
];

export const EYE_COLORS: PaletteEntry[] = [
    { id: "brown",  name: "Brown",  color: "#4a2c15" },
    { id: "hazel",  name: "Hazel",  color: "#8a6a2f" },
    { id: "amber",  name: "Amber",  color: "#b5761f" },
    { id: "green",  name: "Green",  color: "#3f7a3f" },
    { id: "blue",   name: "Blue",   color: "#3a6ea8" },
    { id: "steel",  name: "Steel",  color: "#5f7d8c" },
    { id: "grey",   name: "Grey",   color: "#7a7a7a" },
    { id: "violet", name: "Violet", color: "#7a4fa0" }
];

export const SHIRT_COLORS: PaletteEntry[] = [
    { id: "blue",    name: "Blue",    color: "#527da8" },
    { id: "red",     name: "Red",     color: "#b04a42" },
    { id: "green",   name: "Green",   color: "#4a8a5c" },
    { id: "mustard", name: "Mustard", color: "#dbb43c" },
    { id: "purple",  name: "Purple",  color: "#7a5aa8" },
    { id: "teal",    name: "Teal",    color: "#3f8a8a" },
    { id: "orange",  name: "Orange",  color: "#d1793c" },
    { id: "pink",    name: "Pink",    color: "#d4749b" },
    { id: "cream",   name: "Cream",   color: "#e8ddc0" },
    { id: "charcoal",name: "Charcoal",color: "#3a3a42" }
];

export const TROUSER_COLORS: PaletteEntry[] = [
    { id: "denim",   name: "Denim",   color: "#3f5a7a" },
    { id: "black",   name: "Black",   color: "#2a2a30" },
    { id: "khaki",   name: "Khaki",   color: "#b09a6a" },
    { id: "grey",    name: "Grey",    color: "#6a6a72" },
    { id: "brown",   name: "Brown",   color: "#6b4a2f" },
    { id: "olive",   name: "Olive",   color: "#5c6a3a" },
    { id: "maroon",  name: "Maroon",  color: "#6b3a42" },
    { id: "white",   name: "White",   color: "#d8d8d0" }
];

export const SHOE_COLORS: PaletteEntry[] = [
    { id: "black", name: "Black", color: "#1f1f24" },
    { id: "brown", name: "Brown", color: "#4a3020" },
    { id: "white", name: "White", color: "#ddddd5" },
    { id: "red",   name: "Red",   color: "#8a3a34" },
    { id: "blue",  name: "Blue",  color: "#344a7a" }
];

/** Used for ties, logos, stripes and overall buttons. */
export const ACCENT_COLORS: PaletteEntry[] = [
    { id: "white",   name: "White",   color: "#f0f0e8" },
    { id: "black",   name: "Black",   color: "#1b1b1f" },
    { id: "red",     name: "Red",     color: "#c4382f" },
    { id: "yellow",  name: "Yellow",  color: "#e8d24a" },
    { id: "blue",    name: "Blue",    color: "#3a6ed0" },
    { id: "green",   name: "Green",   color: "#3f9e57" },
    { id: "orange",  name: "Orange",  color: "#e08a2f" },
    { id: "pink",    name: "Pink",    color: "#e067a8" },
    { id: "purple",  name: "Purple",  color: "#8a4fd0" },
    { id: "cyan",    name: "Cyan",    color: "#3fc0c8" }
];

export const HAT_COLORS: PaletteEntry[] = [
    { id: "red",    name: "Red",    color: "#b03a32" },
    { id: "blue",   name: "Blue",   color: "#3a5aa8" },
    { id: "green",  name: "Green",  color: "#3f7a4a" },
    { id: "black",  name: "Black",  color: "#22222a" },
    { id: "tan",    name: "Tan",    color: "#c2a06a" },
    { id: "grey",   name: "Grey",   color: "#8a8a92" },
    { id: "yellow", name: "Yellow", color: "#d9b83c" },
    { id: "purple", name: "Purple", color: "#7a4fa8" }
];

export const DEFAULT_APPEARANCE: Appearance = {
    skin: SKIN_TONES[2].color,

    hairStyle: "short",
    hairColor: HAIR_COLORS[2].color,

    eyeColor: EYE_COLORS[0].color,

    topStyle: "tshirt",
    shirtColor: SHIRT_COLORS[0].color,
    accentColor: ACCENT_COLORS[0].color,

    bottomStyle: "trousers",
    trouserColor: TROUSER_COLORS[0].color,

    shoeColor: SHOE_COLORS[0].color,

    hatStyle: "none",
    hatColor: HAT_COLORS[0].color,

    glassesStyle: "none"
};

/**
 * Blend a hex colour toward black (negative amount) or white (positive).
 *
 * Used for automatic shading, so every palette entry only needs one colour
 * and the sprite can derive its own highlights and shadows from it.
 *
 * @param hex    A colour such as "#e4b78e" or "#abc".
 * @param amount -1 (black) through 0 (unchanged) to 1 (white).
 */
export function shadeColor(
    hex: string,
    amount: number
): string {
    const clean = hex.replace("#", "");

    const full =
        clean.length === 3
            ? clean.split("").map(c => c + c).join("")
            : clean;

    const num = parseInt(full, 16);

    const channels = [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
    ];

    const target = amount < 0 ? 0 : 255;
    const strength = Math.min(Math.abs(amount), 1);

    return (
        "#" +
        channels
            .map(channel => {
                const mixed =
                    Math.round(
                        channel +
                        (target - channel) * strength
                    );

                return mixed
                    .toString(16)
                    .padStart(2, "0");
            })
            .join("")
    );
}

function pick<T>(items: readonly T[]): T {
    return items[
        Math.floor(Math.random() * items.length)
    ];
}

/** Build a completely random appearance. */
export function randomAppearance(): Appearance {
    return {
        skin: pick(SKIN_TONES).color,

        hairStyle: pick(HAIR_STYLES),
        hairColor: pick(HAIR_COLORS).color,

        eyeColor: pick(EYE_COLORS).color,

        topStyle: pick(TOP_STYLES),
        shirtColor: pick(SHIRT_COLORS).color,
        accentColor: pick(ACCENT_COLORS).color,

        bottomStyle: pick(BOTTOM_STYLES),
        trouserColor: pick(TROUSER_COLORS).color,

        shoeColor: pick(SHOE_COLORS).color,

        hatStyle: pick(HAT_STYLES),
        hatColor: pick(HAT_COLORS).color,

        glassesStyle: pick(GLASSES_STYLES)
    };
}
