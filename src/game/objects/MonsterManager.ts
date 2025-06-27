import cardData from '../data/monsters.json';
import { Card, Rarity, SpecialAbility } from './objects';

export class MonsterManager {
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

  getRandomMonstersFromList(monsterIds: string[], count: number = 5): Card[] {
    const selected: Card[] = [];
    const available = this.shuffleArray([...monsterIds]);

    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Phaser.Math.Between(0, available.length - 1);
      const id = available.splice(index, 1)[0]; // remove selected ID
      const card = this.cards.find(card => card.id === id);
      if (card) {
        selected.push({ ...card }); // return a shallow clone to avoid mutation
      }
    }

    return selected;
  }

  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}