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
  // Original 15 scenarios
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
  },

  // Location-specific scenarios (25 new)
  {
    id: "beach_sunburn",
    name: "Sunburned",
    description: "Character gets sunburned",
    condition: (char) => char.location === "beach" && char.traits.energetic > 60 && Math.random() < 0.1,
    probability: 0.1,
    effect: (char) => {
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 15);
      char.traits.cheerful = Math.max(0, char.traits.cheerful - 5);
    },
    dialogue: ["Ouch, I'm burnt!", "Too much sun...", "This hurts!"]
  },
  {
    id: "beach_romance",
    name: "Meet Someone Special",
    description: "Romance blooms on the beach",
    condition: (char, _world, allChars) => {
      const strangers = allChars.filter(c => 
        c.id !== char.id && c.location === "beach" && !char.likes.includes(c.id)
      );
      return char.traits.charming > 70 && strangers.length > 0 && Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char, allChars) => {
      const stranger = allChars.find(c => 
        c.id !== char.id && c.location === "beach" && !char.likes.includes(c.id)
      );
      if (stranger) {
        char.likes.push(stranger.id);
        stranger.likes.push(char.id);
        char.mood = "happy";
        stranger.mood = "happy";
      }
    },
    dialogue: ["Want to get ice cream?", "You're cute...", "This is nice..."]
  },
  {
    id: "mall_overwhelmed",
    name: "Overwhelmed by Crowds",
    description: "Too many people in the mall",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && c.location === "mall"
      ).length;
      return char.location === "mall" && nearby > 4 && char.traits.anxious > 50 && Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 20);
    },
    dialogue: ["Too many people!", "Can't breathe...", "Need to leave!"]
  },
  {
    id: "mall_shopping_spree",
    name: "Shopping Spree",
    description: "Character gets excited about shopping",
    condition: (char) => 
      char.location === "mall" && char.traits.fashionable > 70 && char.energy > 70 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.traits.fashionable = Math.min(100, char.traits.fashionable + 5);
      char.mood = "happy";
      char.energy = Math.max(0, char.energy - 10);
    },
    dialogue: ["This looks great!", "Love these sales!", "Perfect fit!"],
    animationType: "laugh"
  },
  {
    id: "restaurant_bad_service",
    name: "Bad Service",
    description: "Frustrated with slow service",
    condition: (char) => 
      char.location === "restaurant" && char.traits.irritable > 60 && Math.random() < 0.1,
    probability: 0.1,
    effect: (char) => {
      char.mood = "angry";
      char.traits.irritable = Math.min(100, char.traits.irritable + 5);
    },
    dialogue: ["Where's my food?", "This is slow!", "Come on!"],
    animationType: "conflict"
  },
  {
    id: "restaurant_delicious",
    name: "Delicious Food",
    description: "Character enjoys great meal",
    condition: (char) => 
      char.location === "restaurant" && char.traits.cultured > 60 && Math.random() < 0.2,
    probability: 0.2,
    effect: (char) => {
      char.mood = "happy";
      char.energy = Math.min(100, char.energy + 15);
      char.traits.cheerful = Math.min(100, char.traits.cheerful + 5);
    },
    dialogue: ["Mmm, delicious!", "Best food ever!", "Wow, amazing!"],
    animationType: "laugh"
  },
  {
    id: "library_focus",
    name: "Deep Focus",
    description: "Get completely immersed in study",
    condition: (char) => 
      char.location === "library" && char.traits.focused > 70 && char.energy > 50 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.traits.focused = Math.min(100, char.traits.focused + 8);
      char.traits.perfectionist = Math.min(100, char.traits.perfectionist + 3);
      char.energy = Math.max(0, char.energy - 8);
    },
    dialogue: ["So focused...", "Lost in books...", "Time flies..."],
    animationType: "work"
  },
  {
    id: "library_quiet_rebel",
    name: "Quiet Rebellion",
    description: "Joker tries to be quiet (and fails)",
    condition: (char) => 
      char.location === "library" && char.traits.joker > 70 && Math.random() < 0.2,
    probability: 0.2,
    effect: (char) => {
      char.traits.joker = Math.min(100, char.traits.joker + 3);
      char.mood = "happy";
    },
    dialogue: ["Trying not to laugh...", "*silent giggle*", "This is funny..."]
  },
  {
    id: "school_teacher_caught",
    name: "Caught by Teacher",
    description: "Get in trouble at school",
    condition: (char) => 
      char.location === "school" && char.traits.reckless > 60 && Math.random() < 0.1,
    probability: 0.1,
    effect: (char) => {
      char.mood = "stressed";
      char.traits.anxious = Math.min(100, char.traits.anxious + 8);
      char.traits.confident = Math.max(0, char.traits.confident - 5);
    },
    dialogue: ["Oh no!", "I'm in trouble...", "That was close..."],
    animationType: "conflict"
  },
  {
    id: "school_crush",
    name: "Crush Moment",
    description: "See your crush at school",
    condition: (char, _world, allChars) => {
      const crush = allChars.find(c => 
        c.id !== char.id && c.location === "school" && char.likes.includes(c.id)
      );
      return char.location === "school" && !!crush && char.traits.flirty > 60 && Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.mood = "happy";
      char.traits.shy = Math.min(100, char.traits.shy + 3);
    },
    dialogue: ["There they are...", "*nervous smile*", "Look cool..."]
  },
  {
    id: "casino_winning",
    name: "Lucky Win",
    description: "Win big at the casino",
    condition: (char) => 
      char.location === "casino" && char.traits.competitive > 70 && Math.random() < 0.1,
    probability: 0.1,
    effect: (char) => {
      char.mood = "happy";
      char.traits.confident = Math.min(100, char.traits.confident + 8);
      char.energy = Math.min(100, char.energy + 20);
    },
    dialogue: ["Yes! I won!", "Lucky me!", "Jackpot!"],
    animationType: "laugh"
  },
  {
    id: "casino_risky_bet",
    name: "Big Risk",
    description: "Reckless character makes risky bets",
    condition: (char) => 
      char.location === "casino" && char.traits.reckless > 70 && Math.random() < 0.2,
    probability: 0.2,
    effect: (char) => {
      char.traits.reckless = Math.min(100, char.traits.reckless + 5);
      char.mood = "stressed";
    },
    dialogue: ["Go big or go home!", "All in!", "This is crazy!"],
    animationType: "conflict"
  },
  {
    id: "hospital_healing",
    name: "Recovery Time",
    description: "Character gets healing energy",
    condition: (char) => 
      char.location === "hospital" && char.energy < 50 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.energy = Math.min(100, char.energy + 25);
      char.mood = "content";
    },
    dialogue: ["Feeling better...", "Recovery time", "Thanks for helping..."]
  },
  {
    id: "hospital_worry",
    name: "Worried About Health",
    description: "Character worries in hospital",
    condition: (char) => 
      char.location === "hospital" && char.traits.anxious > 60 && Math.random() < 0.2,
    probability: 0.2,
    effect: (char) => {
      char.traits.anxious = Math.min(100, char.traits.anxious + 8);
      char.mood = "sad";
    },
    dialogue: ["Am I okay?", "This scares me...", "What if...?"]
  },
  {
    id: "theater_emotional",
    name: "Emotional Scene",
    description: "Moved by movie scene",
    condition: (char) => 
      char.location === "movieTheater" && char.traits.emotional > 70 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.mood = "happy";
      char.traits.emotional = Math.min(100, char.traits.emotional + 3);
    },
    dialogue: ["That's beautiful...", "*tears*", "So moving..."]
  },
  {
    id: "theater_scary",
    name: "Scary Scene",
    description: "Get scared by horror movie",
    condition: (char) => 
      char.location === "movieTheater" && char.traits.anxious > 50 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.mood = "scared";
      char.traits.anxious = Math.min(100, char.traits.anxious + 5);
    },
    dialogue: ["Ahhh!", "That's terrifying!", "Cover your eyes!"],
    animationType: "stumble"
  },
  {
    id: "train_delayed",
    name: "Train Delay",
    description: "Train is delayed, frustrating",
    condition: (char) => 
      char.location === "train" && char.traits.irritable > 60 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.mood = "angry";
      char.traits.irritable = Math.min(100, char.traits.irritable + 5);
    },
    dialogue: ["Why is this so slow?", "Come on!", "Ugh, typical..."],
    animationType: "conflict"
  },
  {
    id: "train_crowded",
    name: "Crowded Train",
    description: "Too many people on train",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && c.location === "train"
      ).length;
      return char.location === "train" && nearby > 3 && char.traits.anxious > 50 && Math.random() < 0.2;
    },
    probability: 0.2,
    effect: (char) => {
      char.mood = "stressed";
      char.traits.anxious = Math.min(100, char.traits.anxious + 8);
    },
    dialogue: ["So packed...", "Can't move...", "Personal space..."]
  },
  {
    id: "apartment_lonely",
    name: "Feel Lonely",
    description: "Apartment feels empty",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && c.location === "apartment"
      ).length;
      return char.location === "apartment" && nearby === 0 && char.traits.introverted < 40 && Math.random() < 0.15;
    },
    probability: 0.15,
    effect: (char) => {
      char.mood = "sad";
      char.traits.anxious = Math.min(100, char.traits.anxious + 5);
    },
    dialogue: ["So quiet...", "Nobody here...", "Feel alone..."]
  },
  {
    id: "office_stressed",
    name: "Work Stress",
    description: "Workload piles up",
    condition: (char) => 
      char.location === "office" && char.energy < 40 && char.traits.focused > 50 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.mood = "stressed";
      char.traits.anxious = Math.min(100, char.traits.anxious + 5);
      char.energy = Math.max(0, char.energy - 15);
    },
    dialogue: ["Too much work...", "Never ends...", "I'm overwhelmed..."],
    animationType: "conflict"
  },
  {
    id: "gym_achievement",
    name: "Personal Best",
    description: "Reach fitness goal",
    condition: (char) => 
      char.location === "gym" && char.traits.ambitious > 70 && char.energy > 60 && Math.random() < 0.15,
    probability: 0.15,
    effect: (char) => {
      char.traits.confident = Math.min(100, char.traits.confident + 8);
      char.mood = "happy";
      char.traits.energetic = Math.min(100, char.traits.energetic + 5);
    },
    dialogue: ["I did it!", "New record!", "I'm so strong!"],
    animationType: "laugh"
  },
  {
    id: "bar_drunk",
    name: "One Too Many",
    description: "Character gets a bit tipsy",
    condition: (char) => 
      char.location === "bar" && char.energy < 30 && char.traits.carefree > 60 && Math.random() < 0.1,
    probability: 0.1,
    effect: (char) => {
      char.traits.sociable = Math.min(100, char.traits.sociable + 10);
      char.traits.shy = Math.max(0, char.traits.shy - 10);
      char.mood = "happy";
      char.energy = Math.max(0, char.energy - 20);
    },
    dialogue: ["Hahahaha!", "This is great!", "I love everyone!"],
    animationType: "laugh"
  },
  {
    id: "police_intimidated",
    name: "Intimidated",
    description: "Character feels nervous at police station",
    condition: (char) => 
      char.location === "policeStation" && char.traits.confident < 50 && Math.random() < 0.2,
    probability: 0.2,
    effect: (char) => {
      char.mood = "stressed";
      char.traits.anxious = Math.min(100, char.traits.anxious + 10);
      char.traits.confident = Math.max(0, char.traits.confident - 8);
    },
    dialogue: ["I didn't do anything!", "Please don't arrest me...", "This is scary!"],
    animationType: "stumble"
  },

  // Park scenarios
  {
    id: "park_romance",
    name: "Park Romance",
    description: "Characters fall in love on the grass",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && 
        c.location === "park" && 
        Math.hypot(c.x - char.x, c.y - char.y) < 80 &&
        c.traits.charming > 50
      );
      return char.location === "park" && nearby.length > 0 && char.traits.charming > 50 && Math.random() < 0.05;
    },
    probability: 0.08,
    effect: (char) => {
      char.mood = "happy";
      char.traits.charming = Math.min(100, char.traits.charming + 2);
    },
    dialogue: ["Beautiful day...", "You're nice to be around", "This is lovely"]
  },

  // Office scenarios
  {
    id: "office_deadline",
    name: "Deadline Panic",
    description: "Ambitious character rushes to finish work",
    condition: (char, world) => 
      char.location === "office" && 
      char.traits.ambitious > 65 && 
      world.timeOfDay === "evening" &&
      Math.random() < 0.1,
    probability: 0.12,
    effect: (char) => {
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 20);
      char.traits.focused = Math.min(100, char.traits.focused + 5);
    },
    dialogue: ["Must finish!", "Almost there!", "No time left!"],
    animationType: "work"
  },

  {
    id: "office_coffee_break",
    name: "Coffee Break",
    description: "Character gets energized at the water cooler",
    condition: (char) =>
      char.location === "office" &&
      char.energy < 40 &&
      Math.random() < 0.08,
    probability: 0.1,
    effect: (char) => {
      char.energy = Math.min(100, char.energy + 15);
      char.mood = "happy";
    },
    dialogue: ["Ahh, caffeine!", "Much better", "Needed that"]
  },

  // Bar scenarios
  {
    id: "bar_friendly_drunk",
    name: "Friendly Drunk",
    description: "Joker gets tipsy and sociable",
    condition: (char) =>
      char.location === "bar" &&
      char.traits.joker > 60 &&
      char.traits.sociable > 60 &&
      Math.random() < 0.07,
    probability: 0.1,
    effect: (char) => {
      char.mood = "happy";
      char.energy = Math.max(0, char.energy - 5);
      char.traits.charming = Math.min(100, char.traits.charming + 3);
    },
    dialogue: ["Hahahaha!", "You're great!", "Drinks on me!"]
  },

  // Beach scenarios
  {
    id: "beach_sunburn",
    name: "Sunburned",
    description: "Clumsy person gets sunburned",
    condition: (char) =>
      char.location === "beach" &&
      char.traits.clumsy > 65 &&
      Math.random() < 0.08,
    probability: 0.1,
    effect: (char) => {
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 15);
    },
    dialogue: ["Ouch!", "So red...", "That hurts!"]
  },

  {
    id: "beach_swimming",
    name: "Swimming Fun",
    description: "Energetic people enjoy the water",
    condition: (char) =>
      char.location === "beach" &&
      char.traits.energetic > 70 &&
      Math.random() < 0.09,
    probability: 0.12,
    effect: (char) => {
      char.mood = "happy";
      char.energy = Math.min(100, char.energy + 10);
    },
    dialogue: ["Wheee!", "The water is great!", "So refreshing!"]
  },

  // Casino scenarios
  {
    id: "casino_big_win",
    name: "Big Win",
    description: "Lucky ambitious player celebrates",
    condition: (char) =>
      char.location === "casino" &&
      char.traits.ambitious > 60 &&
      Math.random() < 0.06,
    probability: 0.08,
    effect: (char) => {
      char.mood = "happy";
      char.energy = Math.min(100, char.energy + 20);
      char.traits.confident = Math.min(100, char.traits.confident + 4);
    },
    dialogue: ["YES!", "I won!", "Lucky day!"]
  },

  {
    id: "casino_lose_money",
    name: "Lose Big",
    description: "Devastated loss at casino",
    condition: (char) =>
      char.location === "casino" &&
      char.traits.ambitious > 50 &&
      Math.random() < 0.05,
    probability: 0.08,
    effect: (char) => {
      char.mood = "sad";
      char.energy = Math.max(0, char.energy - 25);
      char.traits.confident = Math.max(0, char.traits.confident - 5);
    },
    dialogue: ["No...", "I lost it all", "This is bad"]
  },

  // Library scenarios
  {
    id: "library_study",
    name: "Deep Study",
    description: "Focused person concentrates intensely",
    condition: (char) =>
      char.location === "library" &&
      char.traits.focused > 70 &&
      Math.random() < 0.07,
    probability: 0.1,
    effect: (char) => {
      char.mood = "content";
      char.traits.focused = Math.min(100, char.traits.focused + 3);
    },
    dialogue: ["So absorbing", "Got it!", "Interesting"]
  },

  {
    id: "library_talk_loud",
    name: "Talk Too Loud",
    description: "Clumsy social person disrupts library",
    condition: (char) =>
      char.location === "library" &&
      char.traits.clumsy > 50 &&
      char.traits.sociable > 60 &&
      Math.random() < 0.06,
    probability: 0.1,
    effect: (char) => {
      char.mood = "stressed";
      char.traits.charming = Math.max(0, char.traits.charming - 3);
    },
    dialogue: ["Oops!", "Sorry", "Didn't mean to..."],
    animationType: "stumble"
  },

  // School scenarios
  {
    id: "school_pass_test",
    name: "Pass Test",
    description: "Ambitious student passes exam",
    condition: (char, world) =>
      char.location === "school" &&
      char.traits.ambitious > 65 &&
      world.timeOfDay === "afternoon" &&
      Math.random() < 0.08,
    probability: 0.1,
    effect: (char) => {
      char.mood = "happy";
      char.traits.confident = Math.min(100, char.traits.confident + 4);
    },
    dialogue: ["Yes!", "I passed!", "So proud!"]
  },

  // Hospital scenarios
  {
    id: "hospital_recovery",
    name: "Hospital Recovery",
    description: "Injured person heals slowly",
    condition: (char) =>
      char.location === "hospital" &&
      char.energy < 50 &&
      Math.random() < 0.08,
    probability: 0.1,
    effect: (char) => {
      char.energy = Math.min(100, char.energy + 10);
      char.mood = "content";
    },
    dialogue: ["Feeling better", "Thanks for the help", "Much improved"]
  },

  // Police Station scenarios
  {
    id: "police_interrogation",
    name: "Police Interrogation",
    description: "Nervous character panics under questioning",
    condition: (char) =>
      char.location === "policeStation" &&
      char.traits.anxious > 60 &&
      Math.random() < 0.07,
    probability: 0.12,
    effect: (char) => {
      char.mood = "stressed";
      char.energy = Math.max(0, char.energy - 20);
    },
    dialogue: ["I didn't do it!", "This is a mistake", "Lawyer! Lawyer!"],
    animationType: "conflict"
  },

  // Restaurant scenarios
  {
    id: "restaurant_fancy_dinner",
    name: "Fancy Dinner",
    description: "Charming person enjoys romantic dinner",
    condition: (char) =>
      char.location === "restaurant" &&
      char.traits.charming > 65 &&
      Math.random() < 0.06,
    probability: 0.08,
    effect: (char) => {
      char.mood = "happy";
      char.energy = Math.min(100, char.energy + 8);
    },
    dialogue: ["Delicious!", "This is wonderful", "Perfect evening"]
  },

  // Home scenarios
  {
    id: "home_nap",
    name: "Relaxing Nap",
    description: "Tired person takes restorative nap",
    condition: (char) =>
      char.location === "home" &&
      char.energy < 30 &&
      Math.random() < 0.1,
    probability: 0.12,
    effect: (char) => {
      char.energy = Math.min(100, char.energy + 30);
      char.mood = "content";
    },
    dialogue: ["So sleepy...", "Time for rest", "Zzzzz"]
  },

  // Gym scenarios
  {
    id: "gym_show_off",
    name: "Show Off",
    description: "Competitive person flexes for attention",
    condition: (char, _world, allChars) => {
      const nearby = allChars.filter(c => 
        c.id !== char.id && 
        c.location === "gym" && 
        Math.hypot(c.x - char.x, c.y - char.y) < 100
      );
      return char.location === "gym" && char.traits.competitive > 70 && nearby.length > 0 && Math.random() < 0.07;
    },
    probability: 0.1,
    effect: (char) => {
      char.mood = "happy";
      char.traits.confident = Math.min(100, char.traits.confident + 3);
      char.energy = Math.max(0, char.energy - 10);
    },
    dialogue: ["Check this out!", "Look at those muscles!", "Pretty strong, huh?"]
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
