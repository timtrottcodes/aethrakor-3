import cardData from "../data/cards.json";
import { Card, Rarity, rarityCost, SpecialAbility } from "./objects";

export class CardManager {
  private cards: Card[];

  constructor() {
    this.cards = cardData.map((c) => ({
      ...c,
      rarity: Rarity[c.rarity as keyof typeof Rarity],
      specialAbility: SpecialAbility[c.specialAbility as keyof typeof SpecialAbility],
    }));
  }

  public getById(id: string): Card | undefined {
    return this.cards.find((card) => card.id === id);
  }

  public getAll(): Card[] {
    return [...this.cards]; // return a copy
  }

  public getUsedCardCost(selectedCards: string[]) {
    let totalCost = 0;

    for (const id of selectedCards) {
      const card = this.getById(id);
      if (card) totalCost += rarityCost[card.rarity];
    }

    return totalCost;
  }

  public getMaxCardCost(level: number): number {
    const minCost = 5;
    const maxCost = 60;
    const maxLevel = 50;

    // Shape parameters
    const midpoint = 19; // Center of the curve
    const steepness = 0.16; // Lower = smoother S-curve

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

  public isValidCardSelection(level: number, selectedCards: Card[]): boolean {
    const maxCost = this.getMaxCardCost(level);
    const totalCost = selectedCards.reduce((sum, card) => sum + rarityCost[card.rarity], 0);
    return totalCost <= maxCost;
  }

  public playerHasEligibleCardDrops(currentCards: string[]) {
    const eligibleCards = this.cards.filter((card) => !currentCards.includes(card.id));
    return eligibleCards.length > 0;
  }

  getRandomCardsByRarity(rarities: Rarity[], count: number, excludeIds: string[] = []): Card[] {
    // Filter cards by rarity and excludeIds
    const eligibleCards = this.cards.filter((card) => rarities.includes(card.rarity) && !excludeIds.includes(card.id));

    // Shuffle the eligible cards
    Phaser.Utils.Array.Shuffle(eligibleCards);

    // Return the first `count` cards
    return eligibleCards.slice(0, count);
  }

  getWeightedRandomCardDrop(playerCollection: string[], playerLevel: number): Card | null {
    const rarityWeights: Record<Rarity, number> = {
      [Rarity.Ordinary]: 230,
      [Rarity.Common]: 220,
      [Rarity.Uncommon]: 200,
      [Rarity.Rare]: 140,
      [Rarity.Epic]: 110,
      [Rarity.Legendary]: 100,
    };

    const levelThresholds: Record<Rarity, number> = {
      [Rarity.Ordinary]: 0,
      [Rarity.Common]: 0,
      [Rarity.Uncommon]: 4,
      [Rarity.Rare]: 8,
      [Rarity.Epic]: 18,
      [Rarity.Legendary]: 30,
    };

    const eligibleCardsByRarity: Record<Rarity, Card[]> = {
      [Rarity.Ordinary]: [],
      [Rarity.Common]: [],
      [Rarity.Uncommon]: [],
      [Rarity.Rare]: [],
      [Rarity.Epic]: [],
      [Rarity.Legendary]: [],
    };

    // Filter cards not in collection
    for (const card of this.cards) {
      if (!playerCollection.includes(card.id)) {
        eligibleCardsByRarity[card.rarity].push(card);
      }
    }

    // Only include rarities allowed by level and with at least one available card
    const availableRarities: { rarity: Rarity; weight: number }[] = [];

    for (const rarity of Object.values(Rarity)) {
      const threshold = levelThresholds[rarity];
      if (playerLevel >= threshold && eligibleCardsByRarity[rarity].length > 0) {
        availableRarities.push({ rarity, weight: rarityWeights[rarity] });
      }
    }

    if (availableRarities.length === 0) return null;

    const totalWeight = availableRarities.reduce((sum, r) => sum + r.weight, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedRarity: Rarity = availableRarities[0].rarity; // fallback

    for (const { rarity, weight } of availableRarities) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    const pool = eligibleCardsByRarity[selectedRarity];
    return Phaser.Utils.Array.GetRandom(pool);
  }
}
