/**
 * The citizen creator.
 *
 * Builds a swatch-based editor around a live canvas preview. Sections are
 * generated from the palettes in Appearance.ts, so adding a new colour there
 * automatically adds a swatch here with no changes to this file.
 */

import type { Appearance, PaletteEntry } from "./Appearance";
import type { LocationId } from "./Location";

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
    randomAppearance
} from "./Appearance";

import { SPRITE, drawCitizen } from "./CharacterSprite";
import { getAllLocations } from "./Location";

const STORAGE_KEY = "four-idiots:citizen";

const PREVIEW_SCALE = 4;

export type CreatorOptions = {
    /** Called whenever the appearance changes. */
    onChange?: (appearance: Appearance) => void;

    /** Called when the user confirms their citizen. */
    onConfirm?: (appearance: Appearance, name: string, locationId: LocationId) => void;
};

export function mountCharacterCreator(
    root: HTMLElement,
    options: CreatorOptions = {}
) {
    let appearance: Appearance = loadSaved() ?? {
        ...DEFAULT_APPEARANCE
    };

    let name = "New Citizen";
    let locationId: LocationId = "park";

    root.innerHTML = `
        <div class="creator">
            <header class="creator-header">
                <h1>Create a Citizen</h1>
                <p>Pick a look, then send them out into the world.</p>
            </header>

            <div class="creator-body">
                <aside class="creator-preview">
                    <canvas
                        id="preview"
                        width="${SPRITE.width * PREVIEW_SCALE + 24}"
                        height="${SPRITE.height * PREVIEW_SCALE + 20}"></canvas>

                    <input
                        id="citizen-name"
                        class="name-input"
                        type="text"
                        maxlength="16"
                        aria-label="Citizen name"
                        value="${name}" />

                    <label class="creator-location-label" for="citizen-location">
                        Starting Area
                    </label>
                    <select id="citizen-location" class="creator-location"></select>

                    <div class="preview-actions">
                        <button id="randomise" type="button">
                            Randomise
                        </button>
                        <button id="reset" type="button">
                            Reset
                        </button>
                    </div>

                    <button id="confirm" class="primary" type="button">
                        Save Citizen
                    </button>

                    <p id="status" class="status" role="status"></p>
                </aside>

                <div class="creator-options" id="options"></div>
            </div>
        </div>
    `;

    const canvas =
        root.querySelector<HTMLCanvasElement>("#preview")!;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    const optionsHost =
        root.querySelector<HTMLDivElement>("#options")!;

    const statusEl =
        root.querySelector<HTMLParagraphElement>("#status")!;

    const nameInput =
        root.querySelector<HTMLInputElement>("#citizen-name")!;

    const locationSelect =
        root.querySelector<HTMLSelectElement>("#citizen-location")!;

    for (const location of getAllLocations()) {
        const option = document.createElement("option");
        option.value = location.id;
        option.textContent = location.name;
        option.selected = location.id === locationId;
        locationSelect.appendChild(option);
    }

    locationSelect.addEventListener("change", () => {
        locationId = locationSelect.value as LocationId;
    });

    /** Redraw the preview and refresh which swatches look selected. */
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawCitizen(
            ctx,
            appearance,
            canvas.width / 2,
            canvas.height - 16,
            PREVIEW_SCALE
        );

        syncSelection();

        options.onChange?.(appearance);
    }

    /**
     * Mark the active swatch in every section. Driven by data attributes
     * rather than stored references, so re-rendering stays simple.
     */
    function syncSelection() {
        const buttons =
            optionsHost.querySelectorAll<HTMLButtonElement>(
                "[data-key]"
            );

        buttons.forEach(button => {
            const key = button.dataset.key as keyof Appearance;
            const value = button.dataset.value!;

            const active = String(appearance[key]) === value;

            button.classList.toggle("selected", active);
            button.setAttribute(
                "aria-pressed",
                active ? "true" : "false"
            );
        });

        // A dress supplies its own skirt, so the bottom options have
        // no effect. Dim them rather than hiding them, which avoids
        // the panel jumping around as the user browses styles.
        const bottomsDisabled = coversLegs(appearance.topStyle);

        optionsHost
            .querySelectorAll<HTMLElement>(
                '[data-key="bottomStyle"], [data-key="trouserColor"]'
            )
            .forEach(el => {
                el.closest(".option-group")
                    ?.classList.toggle("muted", bottomsDisabled);
            });
    }

    function setValue<K extends keyof Appearance>(
        key: K,
        value: Appearance[K]
    ) {
        appearance = { ...appearance, [key]: value };
        update();
    }

    /** Build one section of colour swatches. */
    function colorSection(
        title: string,
        key: keyof Appearance,
        palette: PaletteEntry[]
    ): HTMLElement {
        const section = document.createElement("section");
        section.className = "option-group";

        const heading = document.createElement("h2");
        heading.textContent = title;
        section.appendChild(heading);

        const row = document.createElement("div");
        row.className = "swatch-row";

        for (const entry of palette) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "swatch";
            button.style.background = entry.color;
            button.title = entry.name;

            button.setAttribute("aria-label", `${title}: ${entry.name}`);

            button.dataset.key = key;
            button.dataset.value = entry.color;

            button.addEventListener("click", () => {
                setValue(key, entry.color as Appearance[typeof key]);
            });

            row.appendChild(button);
        }

        section.appendChild(row);
        return section;
    }

    /**
     * Build a section of labelled buttons for a style option.
     *
     * Generic over the key so the callback stays type safe: passing
     * TOP_STYLES with key "hairStyle" would not compile.
     */
    function styleSection<K extends keyof Appearance>(
        title: string,
        key: K,
        styles: readonly Appearance[K][],
        names: Record<string, string>
    ): HTMLElement {
        const section = document.createElement("section");
        section.className = "option-group";

        const heading = document.createElement("h2");
        heading.textContent = title;
        section.appendChild(heading);

        const row = document.createElement("div");
        row.className = "chip-row";

        for (const style of styles) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "chip";
            button.textContent = names[String(style)];

            button.dataset.key = key;
            button.dataset.value = String(style);

            button.addEventListener("click", () => {
                setValue(key, style);
            });

            row.appendChild(button);
        }

        section.appendChild(row);
        return section;
    }

    /** Group the sections into tabs so the panel stays manageable. */
    const tabs: Record<string, HTMLElement[]> = {
        Body: [
            colorSection("Skin Tone", "skin", SKIN_TONES),
            colorSection("Eye Colour", "eyeColor", EYE_COLORS)
        ],

        Hair: [
            styleSection(
                "Hair Style", "hairStyle", HAIR_STYLES, HAIR_STYLE_NAMES
            ),
            colorSection("Hair Colour", "hairColor", HAIR_COLORS)
        ],

        Clothes: [
            styleSection("Top", "topStyle", TOP_STYLES, TOP_STYLE_NAMES),
            colorSection("Top Colour", "shirtColor", SHIRT_COLORS),
            colorSection("Accent", "accentColor", ACCENT_COLORS),
            styleSection(
                "Bottom", "bottomStyle", BOTTOM_STYLES, BOTTOM_STYLE_NAMES
            ),
            colorSection("Bottom Colour", "trouserColor", TROUSER_COLORS),
            colorSection("Shoes", "shoeColor", SHOE_COLORS)
        ],

        Extras: [
            styleSection("Hat", "hatStyle", HAT_STYLES, HAT_STYLE_NAMES),
            colorSection("Hat Colour", "hatColor", HAT_COLORS),
            styleSection(
                "Glasses",
                "glassesStyle",
                GLASSES_STYLES,
                GLASSES_STYLE_NAMES
            )
        ]
    };

    const tabBar = document.createElement("div");
    tabBar.className = "tab-bar";

    const panels: Record<string, HTMLDivElement> = {};

    for (const [label, sections] of Object.entries(tabs)) {
        const panel = document.createElement("div");
        panel.className = "tab-panel";
        panel.append(...sections);
        panels[label] = panel;

        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.className = "tab";
        tabButton.textContent = label;

        tabButton.addEventListener("click", () => {
            showTab(label);
        });

        tabBar.appendChild(tabButton);
    }

    function showTab(active: string) {
        for (const [label, panel] of Object.entries(panels)) {
            panel.hidden = label !== active;
        }

        tabBar
            .querySelectorAll<HTMLButtonElement>(".tab")
            .forEach(button => {
                button.classList.toggle(
                    "selected",
                    button.textContent === active
                );
            });
    }

    optionsHost.append(tabBar, ...Object.values(panels));

    showTab("Body");

    nameInput.addEventListener("input", () => {
        name = nameInput.value;
    });

    root.querySelector("#randomise")!
        .addEventListener("click", () => {
            appearance = randomAppearance();
            update();
        });

    root.querySelector("#reset")!
        .addEventListener("click", () => {
            appearance = { ...DEFAULT_APPEARANCE };
            update();
        });

    root.querySelector("#confirm")!
        .addEventListener("click", () => {
            const trimmed = name.trim() || "New Citizen";

            save(appearance, trimmed);

            statusEl.textContent = `Saved ${trimmed}.`;

            options.onConfirm?.(appearance, trimmed, locationId);
        });

    update();

    return {
        getAppearance: () => appearance,
        getName: () => name,
        getLocationId: () => locationId
    };
}

/**
 * Persist the citizen. Wrapped in try/catch because localStorage throws
 * when storage is full or blocked by privacy settings, and failing to
 * save a costume should never break the page.
 */
function save(appearance: Appearance, name: string) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ appearance, name })
        );
    } catch {
        // Non-fatal.
    }
}

/**
 * Read a previously saved citizen.
 *
 * The stored value is untrusted - it can be edited by hand - so each field
 * is validated against the palettes before use, and anything unexpected
 * falls back to the default.
 */
function loadSaved(): Appearance | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as unknown;

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("appearance" in parsed)
        ) {
            return null;
        }

        return sanitiseAppearance(
            (parsed as { appearance: unknown }).appearance
        );
    } catch {
        return null;
    }
}

function allowedColor(
    palette: PaletteEntry[],
    value: unknown,
    fallback: string
): string {
    return typeof value === "string" &&
        palette.some(entry => entry.color === value)
        ? value
        : fallback;
}

/** Only accept a value that appears in the given style list. */
function allowedStyle<T extends string>(
    styles: readonly T[],
    value: unknown,
    fallback: T
): T {
    return typeof value === "string" &&
        (styles as readonly string[]).includes(value)
        ? (value as T)
        : fallback;
}

function sanitiseAppearance(value: unknown): Appearance {
    const raw = (value ?? {}) as Record<string, unknown>;

    return {
        skin: allowedColor(
            SKIN_TONES, raw.skin, DEFAULT_APPEARANCE.skin
        ),

        hairStyle: allowedStyle(
            HAIR_STYLES, raw.hairStyle, DEFAULT_APPEARANCE.hairStyle
        ),

        hairColor: allowedColor(
            HAIR_COLORS, raw.hairColor, DEFAULT_APPEARANCE.hairColor
        ),

        eyeColor: allowedColor(
            EYE_COLORS, raw.eyeColor, DEFAULT_APPEARANCE.eyeColor
        ),

        topStyle: allowedStyle(
            TOP_STYLES, raw.topStyle, DEFAULT_APPEARANCE.topStyle
        ),

        shirtColor: allowedColor(
            SHIRT_COLORS, raw.shirtColor, DEFAULT_APPEARANCE.shirtColor
        ),

        accentColor: allowedColor(
            ACCENT_COLORS, raw.accentColor, DEFAULT_APPEARANCE.accentColor
        ),

        bottomStyle: allowedStyle(
            BOTTOM_STYLES, raw.bottomStyle, DEFAULT_APPEARANCE.bottomStyle
        ),

        trouserColor: allowedColor(
            TROUSER_COLORS, raw.trouserColor, DEFAULT_APPEARANCE.trouserColor
        ),

        shoeColor: allowedColor(
            SHOE_COLORS, raw.shoeColor, DEFAULT_APPEARANCE.shoeColor
        ),

        hatStyle: allowedStyle(
            HAT_STYLES, raw.hatStyle, DEFAULT_APPEARANCE.hatStyle
        ),

        hatColor: allowedColor(
            HAT_COLORS, raw.hatColor, DEFAULT_APPEARANCE.hatColor
        ),

        glassesStyle: allowedStyle(
            GLASSES_STYLES,
            raw.glassesStyle,
            DEFAULT_APPEARANCE.glassesStyle
        )
    };
}
