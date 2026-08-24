export type TraitId = 
  | "sociable" | "introverted" | "outgoing" | "shy" | "emotional" | "stoic" | "charming" | "irritable" | "anxious" | "calm"
  | "ambitious" | "lazy" | "perfectionist" | "carefree" | "focused" | "distracted" | "industrious" | "procrastinator"
  | "clumsy" | "graceful" | "forgetful" | "meticulous" | "honest" | "deceptive" | "joker" | "serious" | "competitive" | "cooperative"
  | "energetic" | "sluggish" | "cheerful" | "moody" | "confident" | "insecure" | "optimistic" | "pessimistic"
  | "empathetic" | "selfish" | "flirty" | "professional" | "loyal" | "backstabber" | "protective" | "reckless"
  | "fashionable" | "unkempt" | "cultured" | "crude" | "adventurous" | "traditional";

export type TraitCategory = "social" | "work" | "quirk" | "mood" | "interaction" | "aesthetic";

export type Trait = {
  id: TraitId;
  name: string;
  category: TraitCategory;
  volatility: number;
  conflictsWith?: TraitId[];
};

export const TRAITS: Record<TraitId, Trait> = {
  // Social & Emotional (10)
  sociable: { id: "sociable", name: "Sociable", category: "social", volatility: 0.3, conflictsWith: ["introverted"] },
  introverted: { id: "introverted", name: "Introverted", category: "social", volatility: 0.3, conflictsWith: ["sociable"] },
  outgoing: { id: "outgoing", name: "Outgoing", category: "social", volatility: 0.4, conflictsWith: ["shy"] },
  shy: { id: "shy", name: "Shy", category: "social", volatility: 0.4, conflictsWith: ["outgoing"] },
  emotional: { id: "emotional", name: "Emotional", category: "social", volatility: 0.6, conflictsWith: ["stoic"] },
  stoic: { id: "stoic", name: "Stoic", category: "social", volatility: 0.3, conflictsWith: ["emotional"] },
  charming: { id: "charming", name: "Charming", category: "social", volatility: 0.4 },
  irritable: { id: "irritable", name: "Irritable", category: "social", volatility: 0.7, conflictsWith: ["calm"] },
  anxious: { id: "anxious", name: "Anxious", category: "social", volatility: 0.6, conflictsWith: ["calm"] },
  calm: { id: "calm", name: "Calm", category: "social", volatility: 0.2, conflictsWith: ["irritable", "anxious"] },

  // Work & Drive (8)
  ambitious: { id: "ambitious", name: "Ambitious", category: "work", volatility: 0.2, conflictsWith: ["lazy"] },
  lazy: { id: "lazy", name: "Lazy", category: "work", volatility: 0.4, conflictsWith: ["ambitious", "industrious"] },
  perfectionist: { id: "perfectionist", name: "Perfectionist", category: "work", volatility: 0.3, conflictsWith: ["carefree"] },
  carefree: { id: "carefree", name: "Carefree", category: "work", volatility: 0.5, conflictsWith: ["perfectionist"] },
  focused: { id: "focused", name: "Focused", category: "work", volatility: 0.3, conflictsWith: ["distracted"] },
  distracted: { id: "distracted", name: "Distracted", category: "work", volatility: 0.6, conflictsWith: ["focused"] },
  industrious: { id: "industrious", name: "Industrious", category: "work", volatility: 0.3, conflictsWith: ["lazy"] },
  procrastinator: { id: "procrastinator", name: "Procrastinator", category: "work", volatility: 0.5 },

  // Personality Quirks (10)
  clumsy: { id: "clumsy", name: "Clumsy", category: "quirk", volatility: 0.5, conflictsWith: ["graceful"] },
  graceful: { id: "graceful", name: "Graceful", category: "quirk", volatility: 0.3, conflictsWith: ["clumsy"] },
  forgetful: { id: "forgetful", name: "Forgetful", category: "quirk", volatility: 0.6, conflictsWith: ["meticulous"] },
  meticulous: { id: "meticulous", name: "Meticulous", category: "quirk", volatility: 0.2, conflictsWith: ["forgetful"] },
  honest: { id: "honest", name: "Honest", category: "quirk", volatility: 0.2, conflictsWith: ["deceptive"] },
  deceptive: { id: "deceptive", name: "Deceptive", category: "quirk", volatility: 0.4, conflictsWith: ["honest"] },
  joker: { id: "joker", name: "Joker", category: "quirk", volatility: 0.5, conflictsWith: ["serious"] },
  serious: { id: "serious", name: "Serious", category: "quirk", volatility: 0.3, conflictsWith: ["joker"] },
  competitive: { id: "competitive", name: "Competitive", category: "quirk", volatility: 0.4 },
  cooperative: { id: "cooperative", name: "Cooperative", category: "quirk", volatility: 0.3, conflictsWith: ["competitive"] },

  // Mood/Energy (8)
  energetic: { id: "energetic", name: "Energetic", category: "mood", volatility: 0.5, conflictsWith: ["sluggish"] },
  sluggish: { id: "sluggish", name: "Sluggish", category: "mood", volatility: 0.6, conflictsWith: ["energetic"] },
  cheerful: { id: "cheerful", name: "Cheerful", category: "mood", volatility: 0.6, conflictsWith: ["moody"] },
  moody: { id: "moody", name: "Moody", category: "mood", volatility: 0.8, conflictsWith: ["cheerful"] },
  confident: { id: "confident", name: "Confident", category: "mood", volatility: 0.4, conflictsWith: ["insecure"] },
  insecure: { id: "insecure", name: "Insecure", category: "mood", volatility: 0.7, conflictsWith: ["confident"] },
  optimistic: { id: "optimistic", name: "Optimistic", category: "mood", volatility: 0.4, conflictsWith: ["pessimistic"] },
  pessimistic: { id: "pessimistic", name: "Pessimistic", category: "mood", volatility: 0.5, conflictsWith: ["optimistic"] },

  // Interaction Style (8)
  empathetic: { id: "empathetic", name: "Empathetic", category: "interaction", volatility: 0.3, conflictsWith: ["selfish"] },
  selfish: { id: "selfish", name: "Selfish", category: "interaction", volatility: 0.4, conflictsWith: ["empathetic", "protective"] },
  flirty: { id: "flirty", name: "Flirty", category: "interaction", volatility: 0.5, conflictsWith: ["professional"] },
  professional: { id: "professional", name: "Professional", category: "interaction", volatility: 0.3, conflictsWith: ["flirty"] },
  loyal: { id: "loyal", name: "Loyal", category: "interaction", volatility: 0.2, conflictsWith: ["backstabber"] },
  backstabber: { id: "backstabber", name: "Backstabber", category: "interaction", volatility: 0.5, conflictsWith: ["loyal"] },
  protective: { id: "protective", name: "Protective", category: "interaction", volatility: 0.4, conflictsWith: ["selfish"] },
  reckless: { id: "reckless", name: "Reckless", category: "interaction", volatility: 0.6 },

  // Aesthetic & Preference (6)
  fashionable: { id: "fashionable", name: "Fashionable", category: "aesthetic", volatility: 0.4, conflictsWith: ["unkempt"] },
  unkempt: { id: "unkempt", name: "Unkempt", category: "aesthetic", volatility: 0.4, conflictsWith: ["fashionable"] },
  cultured: { id: "cultured", name: "Cultured", category: "aesthetic", volatility: 0.3, conflictsWith: ["crude"] },
  crude: { id: "crude", name: "Crude", category: "aesthetic", volatility: 0.5, conflictsWith: ["cultured"] },
  adventurous: { id: "adventurous", name: "Adventurous", category: "aesthetic", volatility: 0.4, conflictsWith: ["traditional"] },
  traditional: { id: "traditional", name: "Traditional", category: "aesthetic", volatility: 0.3, conflictsWith: ["adventurous"] },
};

export function getTrait(id: TraitId): Trait {
  return TRAITS[id];
}

export function getAllTraits(): Trait[] {
  return Object.values(TRAITS);
}

export function getConflicts(traitId: TraitId): TraitId[] {
  return TRAITS[traitId].conflictsWith || [];
}

export function initializeTraits(): Record<TraitId, number> {
  const traits: Partial<Record<TraitId, number>> = {};
  for (const trait of getAllTraits()) {
    traits[trait.id] = 50;
  }
  return traits as Record<TraitId, number>;
}
