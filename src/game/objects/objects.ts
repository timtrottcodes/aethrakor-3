export enum Rarity {
  Ordinary = "Ordinary",
  Common = "Common",
  Uncommon = "Uncommon",
  Rare = "Rare",
  Epic = "Epic",
  Legendary = "Legendary",
}

export enum SpecialAbility {
  None = "None",
  Taunt = "Taunt",
  DualStrike = "DualStrike",
  Healer = "Healer",
}

export const rarityOrder: Record<Rarity, number> = {
  [Rarity.Legendary]: 0,
  [Rarity.Epic]: 1,
  [Rarity.Rare]: 2,
  [Rarity.Uncommon]: 3,
  [Rarity.Common]: 4,
  [Rarity.Ordinary]: 5,
};

export const rarityCost: Record<Rarity, number> = {
  [Rarity.Legendary]: 12,
  [Rarity.Epic]: 8,
  [Rarity.Rare]: 5,
  [Rarity.Uncommon]: 3,
  [Rarity.Common]: 2,
  [Rarity.Ordinary]: 1,
};

export const rarityColors: Record<Rarity, string> = {
  [Rarity.Ordinary]: "#bbbbbb",
  [Rarity.Common]: "#cccccc",
  [Rarity.Uncommon]: "#279f27",
  [Rarity.Rare]: "#3399ff",
  [Rarity.Epic]: "#aa00ff",
  [Rarity.Legendary]: "#ffaa00",
};

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  attack: number;
  health: number;
  specialAbility: SpecialAbility;
}

export interface PlayerProgress {
  completedStages: number[];
  currentStage: number;
  currentStep: number;
}

export interface PlayerData {
  level: number;
  currentExp: number;
  expToNextLevel: number;
  collection: string[];
  equippedCards: string[];
  progress: PlayerProgress;
  settings: AudioPreferences;
}

export type AudioPreferences = {
  muteAll: boolean;
  muteMusic: boolean;
  muteSound: boolean;
  musicVolume: number;
  soundVolume: number;
  vibration: boolean;
  performanceEnabled: boolean;
};

export interface Stage {
  stageNumber: number;
  title: string;
  image: string;
  description: string;
  story: StoryItem[];
  steps: StepItem[];
}

export interface StoryItem {
  name: string;
  lines: string;
  image: string;
}

export interface StepItem {
  type: StepType;
  enemies: string[];
}

export enum StepType {
  Random = "Random",
  Boss = "Boss",
  Miniboss = "Miniboss",
  FixedMob = "FixedMob",
}

export enum CardFace {
  Front = "Front",
  Back = "Back",
}
