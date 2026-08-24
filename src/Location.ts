import type { MoodType } from "./Character";
import type { TraitId } from "./Personality";

export type LocationId = 
  | "park" | "office" | "bar" | "gym" | "home"
  | "apartment" | "beach" | "train" | "movieTheater" | "casino"
  | "restaurant" | "mall" | "library" | "school" | "hospital" | "policeStation";

export type SubAreaId = 
  | "none" | "apartmentLobby" | "apartmentHallway" | "apartmentUnit"
  | "trainPlatform" | "trainInside"
  | "mallEntrance" | "mallShops" | "mallFood"
  | "schoolClassroom" | "schoolHallway";

export type Location = {
  id: LocationId;
  name: string;
  bgColor: string;
  wallColor: string;
  floorY: number;
  width: number;
  height: number;

  moodModifier?: MoodType;
  traitEffects?: Partial<Record<TraitId, number>>;
  energyBurnRate: number;

  subAreas?: SubAreaId[];
  destinations: Array<{ x: number; y: number; subArea?: SubAreaId }>;
  exits: Array<{ x: number; y: number; target: LocationId; label: string }>;

  visualElements?: Array<{ x: number; y: number; type: string; color?: string }>;
  crowdCapacity?: number;
  isIndoor: boolean;
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
    moodModifier: "happy",
    traitEffects: { energetic: 5, cheerful: 5 },
    energyBurnRate: 0.8,
    crowdCapacity: 10,
    isIndoor: false,
    destinations: [
      { x: 100, y: 220 }, { x: 200, y: 300 }, { x: 350, y: 250 },
      { x: 500, y: 320 }, { x: 650, y: 220 }, { x: 750, y: 300 }
    ],
    exits: [
      { x: 30, y: 250, target: "office", label: "Office" },
      { x: 770, y: 250, target: "bar", label: "Bar" },
      { x: 400, y: 420, target: "beach", label: "Beach" },
      { x: 400, y: 30, target: "mall", label: "Mall" }
    ],
    visualElements: [
      { x: 150, y: 80, type: "tree", color: "#4a7c3a" },
      { x: 500, y: 100, type: "tree", color: "#4a7c3a" }
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
    moodModifier: "stressed",
    traitEffects: { ambitious: 5, focused: 5, calm: -3 },
    energyBurnRate: 1.2,
    crowdCapacity: 8,
    isIndoor: true,
    destinations: [
      { x: 100, y: 260 }, { x: 250, y: 280 }, { x: 400, y: 250 },
      { x: 550, y: 280 }, { x: 700, y: 260 }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "gym", label: "Gym" },
      { x: 400, y: 30, target: "restaurant", label: "Restaurant" },
      { x: 400, y: 420, target: "policeStation", label: "Police" }
    ],
    visualElements: [
      { x: 150, y: 140, type: "desk", color: "#8b6f47" },
      { x: 400, y: 140, type: "desk", color: "#8b6f47" },
      { x: 650, y: 140, type: "desk", color: "#8b6f47" }
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
    moodModifier: "happy",
    traitEffects: { sociable: 8, charming: 5 },
    energyBurnRate: 1.0,
    crowdCapacity: 12,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "home", label: "Home" },
      { x: 400, y: 30, target: "casino", label: "Casino" },
      { x: 400, y: 420, target: "restaurant", label: "Restaurant" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "counter", color: "#6b4423" }
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
    moodModifier: "happy",
    traitEffects: { energetic: 8, competitive: 5 },
    energyBurnRate: 1.3,
    crowdCapacity: 6,
    isIndoor: true,
    destinations: [
      { x: 100, y: 240 }, { x: 250, y: 300 }, { x: 400, y: 260 },
      { x: 550, y: 300 }, { x: 700, y: 240 }
    ],
    exits: [
      { x: 30, y: 250, target: "office", label: "Office" },
      { x: 770, y: 250, target: "home", label: "Home" },
      { x: 400, y: 30, target: "beach", label: "Beach" }
    ],
    visualElements: [
      { x: 120, y: 120, type: "equipment", color: "#5a5a5a" },
      { x: 400, y: 120, type: "equipment", color: "#5a5a5a" },
      { x: 680, y: 120, type: "equipment", color: "#5a5a5a" }
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
    moodModifier: "content",
    traitEffects: { calm: 8, energetic: -3 },
    energyBurnRate: 0.5,
    crowdCapacity: 4,
    isIndoor: true,
    destinations: [
      { x: 150, y: 280 }, { x: 350, y: 260 }, { x: 550, y: 280 }, { x: 700, y: 270 }
    ],
    exits: [
      { x: 30, y: 250, target: "bar", label: "Bar" },
      { x: 770, y: 250, target: "gym", label: "Gym" },
      { x: 400, y: 30, target: "apartment", label: "Apartment" },
      { x: 400, y: 420, target: "school", label: "School" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "couch", color: "#7a5a3a" }
    ]
  },

  apartment: {
    id: "apartment",
    name: "Apartment Building",
    bgColor: "#c4c4c4",
    wallColor: "#9a9a9a",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "content",
    traitEffects: { calm: 5, anxious: 3 },
    energyBurnRate: 0.6,
    crowdCapacity: 3,
    isIndoor: true,
    subAreas: ["apartmentLobby", "apartmentHallway", "apartmentUnit"],
    destinations: [
      { x: 150, y: 280, subArea: "apartmentLobby" },
      { x: 350, y: 260, subArea: "apartmentHallway" },
      { x: 550, y: 280, subArea: "apartmentUnit" },
      { x: 700, y: 270, subArea: "apartmentUnit" }
    ],
    exits: [
      { x: 30, y: 250, target: "home", label: "Home" },
      { x: 770, y: 250, target: "mall", label: "Mall" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "mailbox", color: "#8b4513" }
    ]
  },

  beach: {
    id: "beach",
    name: "Beach",
    bgColor: "#d4a574",
    wallColor: "#4a90e2",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "happy",
    traitEffects: { cheerful: 10, energetic: 8, clumsy: 5 },
    energyBurnRate: 0.9,
    crowdCapacity: 15,
    isIndoor: false,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }, { x: 150, y: 200 },
      { x: 350, y: 220 }, { x: 550, y: 210 }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "casino", label: "Casino" },
      { x: 400, y: 420, target: "gym", label: "Gym" }
    ],
    visualElements: [
      { x: 400, y: 150, type: "waves", color: "#4a90e2" }
    ]
  },

  train: {
    id: "train",
    name: "Train",
    bgColor: "#6b6b6b",
    wallColor: "#4a4a4a",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "stressed",
    traitEffects: { anxious: 5, calm: -5 },
    energyBurnRate: 0.7,
    crowdCapacity: 10,
    isIndoor: true,
    subAreas: ["trainPlatform", "trainInside"],
    destinations: [
      { x: 150, y: 280, subArea: "trainPlatform" },
      { x: 350, y: 260, subArea: "trainInside" },
      { x: 550, y: 280, subArea: "trainInside" },
      { x: 700, y: 270, subArea: "trainInside" }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "mall", label: "Mall" },
      { x: 400, y: 30, target: "policeStation", label: "Police" }
    ],
    visualElements: [
      { x: 400, y: 100, type: "train-car", color: "#8b0000" }
    ]
  },

  movieTheater: {
    id: "movieTheater",
    name: "Movie Theater",
    bgColor: "#1a1a2e",
    wallColor: "#16213e",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "content",
    traitEffects: { emotional: 5, calm: 8 },
    energyBurnRate: 0.6,
    crowdCapacity: 20,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "mall", label: "Mall" },
      { x: 770, y: 250, target: "restaurant", label: "Restaurant" }
    ],
    visualElements: [
      { x: 400, y: 100, type: "screen", color: "#ffffff" }
    ]
  },

  casino: {
    id: "casino",
    name: "Casino/Night Club",
    bgColor: "#0d0d1a",
    wallColor: "#000000",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "happy",
    traitEffects: { energetic: 10, competitive: 8, reckless: 5 },
    energyBurnRate: 1.4,
    crowdCapacity: 20,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "bar", label: "Bar" },
      { x: 770, y: 250, target: "beach", label: "Beach" },
      { x: 400, y: 30, target: "restaurant", label: "Restaurant" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "lights", color: "#ff00ff" },
      { x: 600, y: 100, type: "lights", color: "#00ffff" }
    ]
  },

  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    bgColor: "#8b6f47",
    wallColor: "#6b5437",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "happy",
    traitEffects: { sociable: 8, calm: 5 },
    energyBurnRate: 0.5,
    crowdCapacity: 10,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "office", label: "Office" },
      { x: 770, y: 250, target: "bar", label: "Bar" },
      { x: 400, y: 30, target: "mall", label: "Mall" }
    ],
    visualElements: [
      { x: 400, y: 100, type: "table", color: "#8b5a2b" }
    ]
  },

  mall: {
    id: "mall",
    name: "Shopping Mall",
    bgColor: "#ffffff",
    wallColor: "#e0e0e0",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "happy",
    traitEffects: { distracted: 8, energetic: 3 },
    energyBurnRate: 1.3,
    crowdCapacity: 20,
    isIndoor: true,
    subAreas: ["mallEntrance", "mallShops", "mallFood"],
    destinations: [
      { x: 100, y: 280, subArea: "mallEntrance" },
      { x: 250, y: 300, subArea: "mallShops" },
      { x: 400, y: 270, subArea: "mallShops" },
      { x: 550, y: 300, subArea: "mallFood" },
      { x: 700, y: 280, subArea: "mallShops" }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "home", label: "Home" },
      { x: 400, y: 30, target: "movieTheater", label: "Theater" },
      { x: 400, y: 420, target: "school", label: "School" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "store", color: "#ff6b6b" },
      { x: 400, y: 100, type: "store", color: "#4ecdc4" },
      { x: 600, y: 100, type: "store", color: "#ffe66d" }
    ]
  },

  library: {
    id: "library",
    name: "Library",
    bgColor: "#4a3728",
    wallColor: "#3d2817",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "content",
    traitEffects: { focused: 10, calm: 8, sociable: -5 },
    energyBurnRate: 0.4,
    crowdCapacity: 3,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "school", label: "School" },
      { x: 770, y: 250, target: "home", label: "Home" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "bookshelf", color: "#8b4513" },
      { x: 600, y: 100, type: "bookshelf", color: "#8b4513" }
    ]
  },

  school: {
    id: "school",
    name: "School",
    bgColor: "#b5a89c",
    wallColor: "#8b7d6b",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "stressed",
    traitEffects: { anxious: 5, focused: 5, confident: -3 },
    energyBurnRate: 1.1,
    crowdCapacity: 15,
    isIndoor: true,
    subAreas: ["schoolClassroom", "schoolHallway"],
    destinations: [
      { x: 100, y: 280, subArea: "schoolClassroom" },
      { x: 350, y: 260, subArea: "schoolHallway" },
      { x: 550, y: 280, subArea: "schoolClassroom" },
      { x: 700, y: 270, subArea: "schoolHallway" }
    ],
    exits: [
      { x: 30, y: 250, target: "home", label: "Home" },
      { x: 770, y: 250, target: "library", label: "Library" },
      { x: 400, y: 30, target: "mall", label: "Mall" }
    ],
    visualElements: [
      { x: 200, y: 100, type: "desk", color: "#8b6f47" },
      { x: 600, y: 100, type: "desk", color: "#8b6f47" }
    ]
  },

  hospital: {
    id: "hospital",
    name: "Hospital",
    bgColor: "#ffffff",
    wallColor: "#e0f2f1",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "sad",
    traitEffects: { anxious: 8, calm: -5 },
    energyBurnRate: 0.3,
    crowdCapacity: 5,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "park", label: "Park" },
      { x: 770, y: 250, target: "policeStation", label: "Police" }
    ],
    visualElements: [
      { x: 400, y: 100, type: "cross", color: "#ff0000" }
    ]
  },

  policeStation: {
    id: "policeStation",
    name: "Police Station",
    bgColor: "#4a4a6b",
    wallColor: "#3d3d5c",
    floorY: 170,
    width: 800,
    height: 450,
    moodModifier: "stressed",
    traitEffects: { anxious: 8, confident: -5 },
    energyBurnRate: 1.0,
    crowdCapacity: 4,
    isIndoor: true,
    destinations: [
      { x: 100, y: 280 }, { x: 250, y: 300 }, { x: 400, y: 270 },
      { x: 550, y: 300 }, { x: 700, y: 280 }
    ],
    exits: [
      { x: 30, y: 250, target: "office", label: "Office" },
      { x: 770, y: 250, target: "policeStation", label: "Hospital" }
    ],
    visualElements: [
      { x: 400, y: 100, type: "badge", color: "#ffd700" }
    ]
  }
};

export function getLocation(id: LocationId): Location {
  return LOCATIONS[id];
}

export function getAllLocations(): Location[] {
  return Object.values(LOCATIONS);
}

export function getSubAreaDestinations(location: Location, subArea?: SubAreaId): Array<{ x: number; y: number }> {
  if (!subArea || subArea === "none") {
    return location.destinations.filter(d => !d.subArea);
  }
  return location.destinations.filter(d => d.subArea === subArea);
}
