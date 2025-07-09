// utils/playerDataUtils.ts

import { CardManager } from "../objects/CardManager";
import { Card, PlayerData, Rarity, rarityCost, StepType } from "../objects/objects";
import stagesData from '../data/stages.json';
const STORAGE_KEY = "ccgPlayerData";

export function savePlayerData(data: PlayerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save player data:", err);
  }
}

export function loadPlayerData(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayerData) : newPlayer();
  } catch (err) {
    console.error("Failed to load player data:", err);
    return newPlayer();
  }
}

export function getMaxCardCost(level: number): number {
  const minCost = 5;
  const maxCost = 60;
  const maxLevel = 50;

  // Shape parameters
  const midpoint = 22; // Center of the curve
  const steepness = 0.17; // Lower = smoother S-curve

  // Clamp level to range
  const clampedLevel = Math.max(1, Math.min(level, maxLevel));

  // Sigmoid S-curve scaled to [0, 1]
  const sigmoid = 1 / (1 + Math.exp(-steepness * (clampedLevel - midpoint)));

  // Normalize sigmoid to start at 0 and end at 1
  const minSigmoid = 1 / (1 + Math.exp(-steepness * (1 - midpoint)));
  const maxSigmoid = 1 / (1 + Math.exp(-steepness * (maxLevel - midpoint)));
  const normalized = (sigmoid - minSigmoid) / (maxSigmoid - minSigmoid);

  // Scale to cost range
  const cost = minCost + normalized * (maxCost - minCost);

  return Math.round(cost);
}

export function isValidCardSelection(
  level: number,
  selectedCards: Card[]
): boolean {
  const maxCost = getMaxCardCost(level);
  const totalCost = selectedCards.reduce((sum, card) => sum + rarityCost[card.rarity], 0);
  return totalCost <= maxCost;
}

/* exp calc */

export function getTotalStepCount(): number {
  const stages = loadStageData();
  return stages.reduce((total, stage) => total + stage.steps.length, 0);
}

export function getExpToNextLevel(level: number): number {
  // Linear growth + a small curve
  return 100 + Math.round(Math.pow(level, 0.80) * 5);
}

export function grantPlayerExp(playerData: PlayerData, combatBonus: boolean): void {
  const { currentStage, currentStep } = playerData.progress;
  const stepIndex = (currentStage - 1) * 5 + (currentStep); // 0-based
  const totalSteps = getTotalStepCount(); // e.g. 245

  const progress = stepIndex / totalSteps;

  // Ease-in curve (starts fast, slows down)
  let expGain = Math.round(10 + 50 * Math.pow(progress, 0.85)); // gain 10–50 per step

  if (combatBonus) {
    expGain = expGain * 1.5;
  }

  playerData.currentExp += expGain;
  playerData.expToNextLevel -= expGain;

  while (playerData.expToNextLevel <= 0 && playerData.level < 50) {
    playerData.level++;
    playerData.expToNextLevel = getExpToNextLevel(playerData.level);
  }
}

export function loadStageData() {
  return stagesData.map(stage => ({
    ...stage,
    steps: stage.steps.map(step => {
      const formattedType = step.type.charAt(0).toUpperCase() + step.type.slice(1).toLowerCase();
      return {
        ...step,
        type: StepType[formattedType as keyof typeof StepType]
      };
    })
  }));
}

/* end exp calc */

function newPlayer() {
  const defaultPlayerData: PlayerData = {
    level: 1,
    currentExp: 0,
    expToNextLevel: getExpToNextLevel(1),
    collection: [],
    equippedCards: [],
    progress: {
      completedStages: [],
      currentStage: 1,
      currentStep: 0,
    },
  };

  const cardManager = new CardManager();
  const randomCards = cardManager.getRandomCardsByRarity([Rarity.Ordinary], 8);
  defaultPlayerData.collection = randomCards.map((card) => card.id);
  const shuffled = Phaser.Utils.Array.Shuffle([
    ...defaultPlayerData.collection,
  ]);
  defaultPlayerData.equippedCards = shuffled.slice(0, 5);
  return defaultPlayerData;
}
