export type LocationId = "park" | "office" | "bar" | "gym" | "home";

export type Location = {
    id: LocationId;
    name: string;
    bgColor: string;
    wallColor: string;
    floorY: number;
    width: number;
    height: number;
    destinations: Array<{ x: number; y: number }>;
    exits: Array<{ x: number; y: number; target: LocationId; label: string }>;
};

const LOCATIONS: Record<LocationId, Location> = {
    park: {
        id: "park",
        name: "Park",
        bgColor: "#a8d5a8",
        wallColor: "#7cb566",
        floorY: 170,
        width: 800,
        height: 450,
        destinations: [
            { x: 100, y: 220 },
            { x: 200, y: 300 },
            { x: 350, y: 250 },
            { x: 500, y: 320 },
            { x: 650, y: 220 },
            { x: 750, y: 300 }
        ],
        exits: [
            { x: 30, y: 250, target: "office", label: "Office" },
            { x: 770, y: 250, target: "bar", label: "Bar" }
        ]
    },

    office: {
        id: "office",
        name: "Office",
        bgColor: "#d4c5b9",
        wallColor: "#9e8b7e",
        floorY: 170,
        width: 800,
        height: 450,
        destinations: [
            { x: 100, y: 260 },
            { x: 250, y: 280 },
            { x: 400, y: 250 },
            { x: 550, y: 280 },
            { x: 700, y: 260 }
        ],
        exits: [
            { x: 30, y: 250, target: "park", label: "Park" },
            { x: 770, y: 250, target: "gym", label: "Gym" }
        ]
    },

    bar: {
        id: "bar",
        name: "Bar",
        bgColor: "#8b6f47",
        wallColor: "#5c4a2f",
        floorY: 170,
        width: 800,
        height: 450,
        destinations: [
            { x: 100, y: 280 },
            { x: 250, y: 300 },
            { x: 400, y: 270 },
            { x: 550, y: 300 },
            { x: 700, y: 280 }
        ],
        exits: [
            { x: 30, y: 250, target: "park", label: "Park" },
            { x: 770, y: 250, target: "home", label: "Home" }
        ]
    },

    gym: {
        id: "gym",
        name: "Gym",
        bgColor: "#b8cce8",
        wallColor: "#8fa3c8",
        floorY: 170,
        width: 800,
        height: 450,
        destinations: [
            { x: 100, y: 240 },
            { x: 250, y: 300 },
            { x: 400, y: 260 },
            { x: 550, y: 300 },
            { x: 700, y: 240 }
        ],
        exits: [
            { x: 30, y: 250, target: "office", label: "Office" },
            { x: 770, y: 250, target: "home", label: "Home" }
        ]
    },

    home: {
        id: "home",
        name: "Home",
        bgColor: "#d9c8b8",
        wallColor: "#a89a8a",
        floorY: 170,
        width: 800,
        height: 450,
        destinations: [
            { x: 150, y: 280 },
            { x: 350, y: 260 },
            { x: 550, y: 280 },
            { x: 700, y: 270 }
        ],
        exits: [
            { x: 30, y: 250, target: "bar", label: "Bar" },
            { x: 770, y: 250, target: "gym", label: "Gym" }
        ]
    }
};

export function getLocation(id: LocationId): Location {
    return LOCATIONS[id];
}

export function getAllLocations(): Location[] {
    return Object.values(LOCATIONS);
}
