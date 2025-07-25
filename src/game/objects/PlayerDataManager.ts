// objects/PlayerDataManager.ts

import { CardManager } from "./CardManager";
import { PlayerData, Rarity } from "./objects";
import { StageManager } from "./StageManager";

const STORAGE_KEY = "ccgPlayerData";

export class PlayerDataManager {
  private static _instance: PlayerDataManager;
  public data: PlayerData;

  private constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const playerData = raw ? (JSON.parse(raw) as PlayerData) : this.createNewPlayer();
    playerData.settings ??= {
      muteAll: false,
      muteMusic: false,
      muteSound: false,
      musicVolume: 0.5,
      soundVolume: 0.9,
    };
    this.data = this.createAutoSavingProxy(playerData);
  }

  static get instance(): PlayerDataManager {
    if (!this._instance) {
      this._instance = new PlayerDataManager();
    }
    return this._instance;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error("Failed to save player data:", err);
    }
  }

  private createAutoSavingProxy(obj: any, path: string[] = []): any {
    const manager = this;

    return new Proxy(obj, {
      get(target, prop: string) {
        const value = target[prop];
        if (value && typeof value === "object") {
          return manager.createAutoSavingProxy(value, [...path, prop]);
        }
        return value;
      },
      set(target, prop: string, value) {
        target[prop] = value;
        manager.saveToStorage();
        return true;
      },
      deleteProperty(target, prop: string) {
        delete target[prop];
        manager.saveToStorage();
        return true;
      },
    });
  }

  private createNewPlayer(): PlayerData {
    const defaultData: PlayerData = {
      level: 1,
      currentExp: 0,
      expToNextLevel: PlayerDataManager.getExpToNextLevel(1),
      collection: [],
      equippedCards: [],
      progress: {
        completedStages: [],
        currentStage: 1,
        currentStep: 0,
      },
      settings: {
        muteAll: false,
        muteMusic: false,
        muteSound: false,
        musicVolume: 0.5,
        soundVolume: 0.9,
      },
    };

    const cardManager = new CardManager();
    const randomCards = cardManager.getRandomCardsByRarity([Rarity.Ordinary], 8);
    defaultData.collection = randomCards.map((card) => card.id);
    const shuffled = Phaser.Utils.Array.Shuffle([...defaultData.collection]);
    defaultData.equippedCards = shuffled.slice(0, 5);

    return defaultData;
  }

  static getExpToNextLevel(level: number): number {
    return 100 + Math.round(Math.pow(level, 0.8) * 5);
  }

  grantExp(combatBonus: boolean): void {
    const { currentStage, currentStep } = this.data.progress;
    const stepIndex = (currentStage - 1) * 5 + currentStep;
    const totalSteps = StageManager.instance.getTotalStepCount();
    let expGain = Math.round(10 + 50 * Math.pow(stepIndex / totalSteps, 0.85));
    if (combatBonus) expGain *= 1.5;

    this.data.currentExp += expGain;
    this.data.expToNextLevel -= expGain;

    while (this.data.expToNextLevel <= 0 && this.data.level < 50) {
      this.data.level++;
      this.data.expToNextLevel = PlayerDataManager.getExpToNextLevel(this.data.level);
    }
  }

  newGame(): void {
    this.data = this.createNewPlayer();
  }
}
