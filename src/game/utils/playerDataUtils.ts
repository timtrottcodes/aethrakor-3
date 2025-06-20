// utils/playerDataUtils.ts

import { CardManager } from '../objects/CardManager';
import { Card, PlayerData, Rarity } from '../objects/objects';

const STORAGE_KEY = 'ccgPlayerData';

export function savePlayerData(data: PlayerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save player data:', err);
  }
}

export function loadPlayerData(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayerData) : newPlayer();
  } catch (err) {
    console.error('Failed to load player data:', err);
    return newPlayer();
  }
}

export function getMaxCardCost(level: number): number {
  const minCost = 5;
  const maxCost = 50;
  const maxLevel = 50;

  if (level <= 1) return minCost;
  if (level >= maxLevel) return maxCost;

  const progress = (level - 1) / (maxLevel - 1);
  const adjustedProgress = Math.sqrt(progress); // Ease-out curve
  const cost = minCost + adjustedProgress * (maxCost - minCost);

  return Math.round(cost);
}

export function isValidCardSelection(level: number, selectedCards: Card[]): boolean {
  const maxCost = getMaxCardCost(level);
  const totalCost = selectedCards.reduce((sum, card) => sum + card.cost, 0);
  return totalCost <= maxCost;
}

export function grantPlayerExp(playerData: PlayerData, expGain: number) {
  playerData.currentExp += expGain;
  playerData.expToNextLevel -= expGain;
  if (playerData.expToNextLevel <= 0) {
    playerData.level++;
    playerData.expToNextLevel = Math.floor((Math.pow(1.135, playerData.level + 1) - 1) * 1000);
  }
}

function newPlayer() {
  const defaultPlayerData: PlayerData = {
    level: 1,
    currentExp: 0,
    expToNextLevel: 175,
    collection: [],
    equippedCards: [],
    progress: {
      completedStages: [],
      currentStage: 1,
      currentStep: 0
    }
  };

  const cardManager = new CardManager();
  const randomCards = cardManager.getRandomCardsByRarity(Rarity.Common, 1, 8);
  defaultPlayerData.collection =  randomCards.map(card => card.id);
  const shuffled = Phaser.Utils.Array.Shuffle([...defaultPlayerData.collection]);
  defaultPlayerData.equippedCards = shuffled.slice(0, 5);
  return defaultPlayerData;
}
