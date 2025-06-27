export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary'
}

export enum SpecialAbility {
  None = 'None',
  Taunt = 'Taunt',
  DualStrike = 'DualStrike',
  Healer = 'Healer',
}

export const rarityOrder: Record<Rarity, number> = {
  [Rarity.Legendary]: 0,
  [Rarity.Epic]: 1,
  [Rarity.Rare]: 2,
  [Rarity.Uncommon]: 3,
  [Rarity.Common]: 4,
};

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  cost: number;
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
}

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
  FixedMob = "FixedMob"
}

export enum CardFace {
  Front = 'Front',
  Back = 'Back'
}