import cardData from '../data/cards.json';
import { Card, Rarity, SpecialAbility } from './objects';

export class CardManager {
  private cards: Card[];

  constructor() {
    this.cards = cardData.map(c => ({
      ...c,
      rarity: Rarity[c.rarity as keyof typeof Rarity],
      specialAbility: SpecialAbility[c.specialAbility as keyof typeof SpecialAbility]
    }));
  }

  public getById(id: string): Card | undefined {
    return this.cards.find(card => card.id === id);
  }

  public getAll(): Card[] {
    return [...this.cards]; // return a copy
  }

  getRandomCardsByRarity(
    rarity: Rarity,
    count: number,
    excludeIds: string[] = []
  ): Card[] {
    // Filter cards by rarity and excludeIds
    const eligibleCards = this.cards.filter(
      (card) => card.rarity === rarity && !excludeIds.includes(card.id)
    );

    // Shuffle the eligible cards
    Phaser.Utils.Array.Shuffle(eligibleCards);

    // Return the first `count` cards
    return eligibleCards.slice(0, count);
  }

  getWeightedRandomCardDrop(playerCollection: string[], playerLevel: number): Card | null {
    const rarityWeights: Record<Rarity, number> = {
      [Rarity.Common]: 900,
      [Rarity.Uncommon]: 50,
      [Rarity.Rare]: 30,
      [Rarity.Epic]: 15,
      [Rarity.Legendary]: 5
    };

    const levelThresholds: Record<Rarity, number> = {
      [Rarity.Common]: 0,
      [Rarity.Uncommon]: 5,
      [Rarity.Rare]: 20,
      [Rarity.Epic]: 35,
      [Rarity.Legendary]: 45
    };

    const eligibleCardsByRarity: Record<Rarity, Card[]> = {
      [Rarity.Common]: [],
      [Rarity.Uncommon]: [],
      [Rarity.Rare]: [],
      [Rarity.Epic]: [],
      [Rarity.Legendary]: []
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