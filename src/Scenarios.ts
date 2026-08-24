import type { Character } from "./Character";

export type WorldState = {
  weather: "sunny" | "rainy" | "snowy" | "cloudy";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  eventType?: "party" | "alarm" | "conflict" | "none";
  temperature: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  condition: (character: Character, world: WorldState, allCharacters: Character[]) => boolean;
  probability: number;
  effect: (character: Character, allCharacters: Character[], world: WorldState) => void;
  dialogue?: string[];
  animationType?: "fall" | "laugh" | "conflict" | "trip" | "stumble" | "work";
};

export const SCENARIOS: Scenario[] = [
  {
    id: "clumsy_rain",
    name: "Slip and Fall",
    description: "Clumsy person trips in rain",
    condition: (char) => char.traits.clumsy > 70 && Math.random() < 0.1,
    probability: 0.15,
    effect: (char) => {
      char.traits.clumsy = Math.min(100, char.traits.clumsy + 5);
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 10);
    },
    dialogue: ["Whoops!", "Ouch!", "That hurt!"],
    animationType: "fall"
  },

  {
    id: "ambitious_work_late",
    name: "Work Late",
    description: "Ambitious character stays late at office",
    condition: (char, world) => {
      return char.location === "office" && 
        char.traits.ambitious > 65 && 
        world.timeOfDay === "evening" &&
        Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.traits.ambitious = Math.min(100, char.traits.ambitious + 3);
      char.traits.focused = Math.min(100, char.traits.focused + 5);
      char.energy = Math.max(0, char.energy - 15);
    },
    dialogue: ["Just a bit more...", "Almost done!", "Gotta finish this"],
    animationType: "work"
  },

  {
    id: "joker_tell_joke",
    name: "Tell a Joke",
    description: "Joker makes everyone laugh",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && 
        c.location === char.location && 
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.traits.joker > 60 && nearby.length > 0 && Math.random() < 0.3;
    },
    probability: 0.3,
    effect: (char, allChars) => {
      char.traits.joker = Math.min(100, char.traits.joker + 2);
      char.mood = "happy";
      const nearby = allChars.filter(c => 
        c.id !== char.id && 
        c.location === char.location &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      nearby.forEach(c => {
        c.mood = "happy";
        c.traits.cheerful = Math.min(100, c.traits.cheerful + 3);
      });
    },
    dialogue: ["*laughs*", "Haha!", "That's hilarious!"],
    animationType: "laugh"
  },

  {
    id: "irritable_snap",
    name: "Snap at Someone",
    description: "Irritable person snaps when stressed",
    condition: (char, _world, allChars) => {
      const nearby = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location && 
        Math.hypot(c.x - char.x, c.y - char.y) < 80
      );
      return char.traits.irritable > 70 && char.energy < 30 && !!nearby && Math.random() < 0.15;
    },
    probability: 0.15,
    effect: (char, allChars) => {
      char.mood = "angry";
      const nearby = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        Math.hypot(c.x - char.x, c.y - char.y) < 80
      );
      if (nearby) {
        nearby.mood = "sad";
        if (!char.dislikes.includes(nearby.id)) {
          char.dislikes.push(nearby.id);
        }
      }
    },
    dialogue: ["Leave me alone!", "Don't bother me!", "Back off!"],
    animationType: "conflict"
  },

  {
    id: "anxious_crowds",
    name: "Panic in Crowds",
    description: "Anxious character panics around many people",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && 
        c.location === char.location &&
        Math.hypot(c.x - char.x, c.y - char.y) < 120
      ).length;
      return char.traits.anxious > 65 && nearby > 2 && Math.random() < 0.25;
    },
    probability: 0.25,
    effect: (char) => {
      char.traits.anxious = Math.min(100, char.traits.anxious + 5);
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 20);
    },
    dialogue: ["Feeling overwhelmed...", "Too many people...", "Need space..."],
    animationType: "stumble"
  },

  {
    id: "lazy_oversleep",
    name: "Sleep In",
    description: "Lazy person sleeps late",
    condition: (char, world) => {
      return char.traits.lazy > 70 && 
        world.timeOfDay === "morning" && 
        Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.traits.lazy = Math.min(100, char.traits.lazy + 2);
      char.mood = "happy";
      char.energy = Math.min(100, char.energy + 30);
    },
    dialogue: ["More sleep...", "Five more minutes...", "*yawn*"],
    animationType: "work"
  },

  {
    id: "forgetful_lose_item",
    name: "Lose Something",
    description: "Forgetful person loses an item",
    condition: (char) => {
      return char.traits.forgetful > 70 && 
        char.traits.distracted > 50 &&
        Math.random() < 0.15;
    },
    probability: 0.15,
    effect: (char) => {
      char.traits.forgetful = Math.min(100, char.traits.forgetful + 2);
      char.mood = "stressed";
    },
    dialogue: ["Where did I put that?", "I lost it again!", "Ugh, so forgetful"],
    animationType: "stumble"
  },

  {
    id: "competitive_challenge",
    name: "Challenge Someone",
    description: "Competitive character challenges rival",
    condition: (char, _world, allChars) => {
      const rivals = allChars.filter(c => 
        c.id !== char.id && 
        c.location === char.location &&
        char.dislikes.includes(c.id) &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.traits.competitive > 70 && rivals.length > 0 && Math.random() < 0.4;
    },
    probability: 0.4,
    effect: (char, allChars) => {
      char.traits.competitive = Math.min(100, char.traits.competitive + 3);
      char.mood = "angry";
      const rival = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        char.dislikes.includes(c.id)
      );
      if (rival) {
        rival.mood = "angry";
      }
    },
    dialogue: ["You're on!", "I challenge you!", "Let's settle this"],
    animationType: "conflict"
  },

  {
    id: "protective_comfort",
    name: "Comfort Friend",
    description: "Protective character comforts upset friend",
    condition: (char, _world, allChars) => {
      const upset = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        char.likes.includes(c.id) &&
        c.mood === "sad" &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.traits.protective > 60 && !!upset && Math.random() < 0.5;
    },
    probability: 0.5,
    effect: (char, allChars) => {
      const friend = allChars.find(c => 
        c.id !== char.id && 
        char.likes.includes(c.id) &&
        c.mood === "sad"
      );
      if (friend) {
        friend.mood = "content";
        char.traits.protective = Math.min(100, char.traits.protective + 2);
        char.energy = Math.max(0, char.energy - 5);
      }
    },
    dialogue: ["You okay?", "I'm here for you", "It'll be alright"],
    animationType: "laugh"
  },

  {
    id: "charming_icebreaker",
    name: "Natural Icebreaker",
    description: "Charming person breaks ice with stranger",
    condition: (char, _world, allChars) => {
      const stranger = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        !char.likes.includes(c.id) &&
        !char.dislikes.includes(c.id) &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.traits.charming > 65 && !!stranger && Math.random() < 0.6;
    },
    probability: 0.6,
    effect: (char, allChars) => {
      const stranger = allChars.find(c => 
        c.id !== char.id && 
        !char.likes.includes(c.id) &&
        !char.dislikes.includes(c.id)
      );
      if (stranger && !char.likes.includes(stranger.id)) {
        char.likes.push(stranger.id);
        if (!stranger.likes.includes(char.id)) {
          stranger.likes.push(char.id);
        }
      }
    },
    dialogue: ["Hey there!", "Nice to meet you!", "How's it going?"],
    animationType: "laugh"
  },

  {
    id: "perfectionist_frustration",
    name: "Get Frustrated",
    description: "Perfectionist gets frustrated by imperfections",
    condition: (char) => {
      return char.traits.perfectionist > 70 &&
        Math.random() < 0.1;
    },
    probability: 0.1,
    effect: (char) => {
      char.traits.perfectionist = Math.min(100, char.traits.perfectionist + 2);
      char.mood = "angry";
      char.energy = Math.max(0, char.energy - 8);
    },
    dialogue: ["This isn't good enough!", "It's all wrong!", "Ugh, unacceptable!"],
    animationType: "conflict"
  },

  {
    id: "empathetic_sense_feelings",
    name: "Sense Someone's Pain",
    description: "Empathetic character senses friend's distress",
    condition: (char, _world, allChars) => {
      const distressed = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        (c.mood === "sad" || c.mood === "stressed") &&
        char.likes.includes(c.id)
      );
      return char.traits.empathetic > 60 && !!distressed && Math.random() < 0.4;
    },
    probability: 0.4,
    effect: (char) => {
      char.traits.empathetic = Math.min(100, char.traits.empathetic + 2);
      char.mood = "sad";
    },
    dialogue: ["Something's wrong...", "Are you okay?", "I feel your sadness"],
    animationType: "stumble"
  },

  {
    id: "energetic_activity",
    name: "Burst of Energy",
    description: "Energetic person starts activity",
    condition: (char) => {
      return char.traits.energetic > 70 &&
        Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.traits.energetic = Math.min(100, char.traits.energetic + 2);
      char.mood = "happy";
    },
    dialogue: ["Let's do something!", "I'm pumped!", "Let's go!"],
    animationType: "laugh"
  },

  {
    id: "honest_truth",
    name: "Tell Hard Truth",
    description: "Honest person tells difficult truth",
    condition: (char, _world, allChars) => {
      const nearby = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.traits.honest > 75 && !!nearby && Math.random() < 0.15;
    },
    probability: 0.15,
    effect: (char, allChars) => {
      const nearby = allChars.find(c => 
        c.id !== char.id && 
        c.location === char.location &&
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      if (nearby) {
        nearby.mood = "stressed";
        if (!char.dislikes.includes(nearby.id) && Math.random() < 0.5) {
          char.dislikes.push(nearby.id);
        }
      }
    },
    dialogue: ["I need to be honest...", "The truth is...", "You need to hear this"],
    animationType: "conflict"
  }
];

export function checkScenarios(
  character: Character,
  world: WorldState,
  allCharacters: Character[]
): Scenario | null {
  for (const scenario of SCENARIOS) {
    if (scenario.condition(character, world, allCharacters)) {
      if (Math.random() < scenario.probability) {
        return scenario;
      }
    }
  }
  return null;
}

export function executeScenario(
  scenario: Scenario,
  character: Character,
  world: WorldState,
  allCharacters: Character[]
): void {
  scenario.effect(character, allCharacters, world);
  if (scenario.dialogue && scenario.dialogue.length > 0) {
    character.speech = scenario.dialogue[Math.floor(Math.random() * scenario.dialogue.length)];
    character.speechUntil = Date.now() + 3000;
  }
  character.lastEventTime = Date.now();
}
