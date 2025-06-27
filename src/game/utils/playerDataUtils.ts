// utils/playerDataUtils.ts

import { CardManager } from "../objects/CardManager";
import { Card, PlayerData, Rarity, StepType } from "../objects/objects";
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
  const midCost = 10;
  const maxCost = 50;
  const maxLevel = 50;
  const rampEndLevel = 6;

  if (level <= 1) return minCost;
  if (level <= rampEndLevel) {
    const t = (level - 1) / (rampEndLevel - 1);
    return Math.round(minCost + t * (midCost - minCost));
  }
  if (level >= maxLevel) return maxCost;
  const t = (level - rampEndLevel) / (maxLevel - rampEndLevel);
  const eased = Math.sqrt(t);
  return Math.round(midCost + eased * (maxCost - midCost));
}

export function isValidCardSelection(
  level: number,
  selectedCards: Card[]
): boolean {
  const maxCost = getMaxCardCost(level);
  const totalCost = selectedCards.reduce((sum, card) => sum + card.cost, 0);
  return totalCost <= maxCost;
}

/* exp calc */

function getTotalStepCount(): number {
  const stages = loadStageData();
  return stages.reduce((total, stage) => total + stage.steps.length, 0);
}

function getExpToNextLevel(level: number): number {
  // Linear growth + a small curve
  return 100 + Math.round(Math.pow(level, 1.5) * 5);
}

export function grantPlayerExp(playerData: PlayerData, combatBonus: boolean): void {
  const { currentStage, currentStep } = playerData.progress;
  const stepIndex = (currentStage - 1) * 5 + (currentStep); // 0-based
  const totalSteps = getTotalStepCount(); // e.g. 245

  const progress = stepIndex / totalSteps;

  // Ease-in curve (starts fast, slows down)
  let expGain = Math.round(10 + 40 * Math.pow(progress, 1.5)); // gain 10–50 per step

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
  const randomCards = cardManager.getRandomCardsByRarity(Rarity.Common, 1, 8);
  defaultPlayerData.collection = randomCards.map((card) => card.id);
  const shuffled = Phaser.Utils.Array.Shuffle([
    ...defaultPlayerData.collection,
  ]);
  defaultPlayerData.equippedCards = shuffled.slice(0, 5);
  return defaultPlayerData;
}
