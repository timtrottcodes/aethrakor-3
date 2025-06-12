import cardData from '../data/cards.json';
import { Card, Rarity } from './objects';

export class CardManager {
  private cards: Card[];

  constructor() {
    this.cards = cardData.map(c => ({
      ...c,
      rarity: Rarity[c.rarity as keyof typeof Rarity]
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

}