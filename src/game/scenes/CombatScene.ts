import {
  Card,
  CardFace,
  PlayerData,
  SpecialAbility,
  Stage,
  StepItem,
  StepType,
} from "../objects/objects";
import {
  grantPlayerExp,
  loadPlayerData,
  loadStageData,
  savePlayerData,
} from "../utils/playerDataUtils";
import {
  renderPlayerCard,
  updateHealthOverlay,
} from "../utils/renderPlayerCard";
import { MonsterManager } from "../objects/MonsterManager";
import { CardManager } from "../objects/CardManager";
import { GlobalState } from "../objects/globalState";
import { createSlantedFancyButton } from "../utils/button";

type CombatCard = {
  id: string;
  name: string;
  sprite: Phaser.GameObjects.Container;
  baseAttack: number;
  maxHealth: number;
  currentHealth: number;
  isPlayer: boolean;
  healthText?: Phaser.GameObjects.Text;
  specialAbility: SpecialAbility;
};

interface CombatSceneData {
  stageId?: number;
  stepId?: number;
}

export default class CombatScene extends Phaser.Scene {
  private playerData: PlayerData;
  private cardManager!: CardManager;
  private monsterManager!: MonsterManager;
  private playerCards: CombatCard[] = [];
  private monsterCards: CombatCard[] = [];
  private cardScale = 0.17;
  private currentStage: Stage;
  private currentStep: StepItem;
  private stageId: number | undefined = undefined;
  private stepId: number | undefined = undefined;
  private stages: Stage[];
  private nextScene: string = "";

  constructor() {
    super("CombatScene");
  }

  init(data: CombatSceneData): void {
    this.stages = loadStageData();
    this.playerData = loadPlayerData();

    if (data.stageId) {
      this.stageId = data.stageId;
      this.stepId = data.stepId;
      this.nextScene = "MainMenuScene";
    }
  }

  preload() {
    if (!this.stageId) {
      this.stageId = this.playerData.progress.currentStage;
      this.currentStage = this.stages.find(
        (s) => s.stageNumber === this.stageId
      )!;
      this.currentStep =
        this.currentStage.steps[this.playerData.progress.currentStep];
    } else {
      this.currentStage = this.stages.find(
        (s) => s.stageNumber === this.stageId
      )!;
      this.currentStep = this.currentStage.steps[this.stepId!];
    }

    this.load.image(
      this.currentStage.image,
      `assets/backgrounds/stages/${this.currentStage.image}`
    );
  }

  create() {
    this.monsterManager = new MonsterManager();
    this.cardManager = new CardManager();
    this.playerData = loadPlayerData();

    this.add
      .image(0, 0, this.currentStage.image)
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(0);
    this.add.text(20, 20, "Combat Phase", {
      fontSize: "32px",
      color: "#ffffff",
    });

    const centerX = this.scale.width / 2;
    let spacing = 140;

    // Generate monsters
    let monsterData: Card[] = [];

    if (!this.currentStep) {
      this.stageId = this.playerData.progress.currentStage;
      this.currentStage = this.stages.find(
        (s) => s.stageNumber === this.stageId
      )!;
      this.currentStep =
        this.currentStage.steps[this.playerData.progress.currentStep];
    }

    if (this.currentStep.type == StepType.Boss) {
      const bossId = this.currentStep.enemies.shift();
      const bossCard = this.monsterManager.getById(bossId!);
      monsterData = this.monsterManager.getRandomMonstersFromList(
        this.currentStep.enemies,
        4
      );
      monsterData.splice(2, 0, bossCard!);
    } else {
      monsterData = this.monsterManager.getRandomMonstersFromList(
        this.currentStep.enemies
      );
    }

    let bossOffset = 0;
    if (
      this.currentStep.type == StepType.Boss ||
      this.currentStep.type == StepType.Miniboss
    ) {
      spacing = 130;
      this.monsterCards = monsterData.map((card, i) => {
        let x = centerX - 2 * spacing + i * spacing - 65 + bossOffset;
        const y = 120;

        const isBoss = i === 2;
        const scale = isBoss ? this.cardScale + 0.01 : this.cardScale - 0.01;

        const sprite = renderPlayerCard(
          this,
          card,
          x,
          y,
          scale,
          CardFace.Front
        );

        if (isBoss) {
          bossOffset = 15; // increase spacing to counter boss card size
        }

        return {
          id: card.id,
          name: card.name,
          sprite,
          baseAttack: card.attack,
          maxHealth: card.health,
          currentHealth: card.health,
          isPlayer: false,
          specialAbility: SpecialAbility[card.specialAbility],
        };
      });
    } else {
      this.monsterCards = monsterData.map((card, i) => {
        const x = centerX - 2 * spacing + i * spacing - 65;
        const y = 120;
        const sprite = renderPlayerCard(
          this,
          card,
          x,
          y,
          this.cardScale,
          CardFace.Front
        );
        return {
          id: card.id,
          name: card.name,
          sprite,
          baseAttack: card.attack,
          maxHealth: card.health,
          currentHealth: card.health,
          isPlayer: false,
          specialAbility: SpecialAbility[card.specialAbility],
        };
      });
    }

    this.add
      .text(20, this.scale.height - 90, `Level: ${this.playerData.level}`, {
        fontFamily: "Cinzel, serif",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setDepth(2);

    // Display progress bar
    this.add
      .text(20, this.scale.height - 70, `${this.currentStage.title}`, {
        fontFamily: "Cinzel, serif",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setDepth(2);

    this.add
      .text(
        20,
        this.scale.height - 50,
        `EXP to next level: ${this.playerData.expToNextLevel}`,
        {
          fontFamily: "Cinzel, serif",
          fontSize: "16px",
          color: "#ffffff",
        }
      )
      .setDepth(2);

    // Player cards
    this.playerCards = this.playerData.equippedCards
      .map((cardId, i) => {
        const card = this.cardManager.getById(cardId);
        if (card) {
          const x = centerX - 2 * spacing + i * spacing - 65;
          const y = this.scale.height - 300;
          const sprite = renderPlayerCard(
            this,
            card,
            x,
            y,
            this.cardScale,
            CardFace.Front
          );
          return {
            id: card.id,
            name: card.name,
            sprite,
            baseAttack: card.attack,
            maxHealth: card.health,
            currentHealth: card.health,
            isPlayer: true,
            specialAbility: SpecialAbility[card.specialAbility],
          } as CombatCard;
        }
      })
      .filter((c): c is CombatCard => c !== undefined);

    // Buttons
    /*const startButton = this.add.text(centerX, 550, 'Start Fight', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', );

    const changeDeckButton = this.add.text(centerX, 600, 'Change Deck', {
      fontSize: '20px', color: '#cccccc', backgroundColor: '#222222', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive();

    changeDeckButton.on('pointerdown', () => this.scene.start('DeckBuilderScene'));*/

    this.showBattleIntroAnimation(() => this.runCombatLoop());
  }

  private async runCombatLoop() {
    while (
      this.playerCards.some((c) => c && c.currentHealth > 0) &&
      this.monsterCards.some((c) => c && c.currentHealth > 0)
    ) {
      await this.runCombatRound();
    }

    if (this.playerCards.every((c) => !c || c.currentHealth <= 0)) {
      this.showEndOverlay("defeat");
    } else if (this.monsterCards.every((c) => !c || c.currentHealth <= 0)) {
      this.showEndOverlay("victory");
    }
  }

  private async runCombatRound() {
    for (let i = 0; i < 5; i++) {
      const player = this.playerCards[i];
      const monster = this.monsterCards[i];

      // Player attacks first if alive
      if (player && player.currentHealth > 0) {
        if (player.specialAbility == SpecialAbility.Healer) {
          this.applyHealing(this.playerCards, player);
        }

        const attackCount =
          player.specialAbility == SpecialAbility.DualStrike ? 2 : 1;

        for (let a = 0; a < attackCount; a++) {
          const target = this.findNextAlive(i, this.monsterCards);
          if (target) {
            const { damage, isCritical } = this.calculateDamage(
              player.baseAttack
            );
            target.currentHealth = Math.max(target.currentHealth - damage, 0);
            const hpPercent = (target.currentHealth / target.maxHealth) * 100;
            await this.animateAttack(
              player,
              target,
              damage,
              isCritical,
              hpPercent
            );
          }
        }
      }

      // Monster counter-attacks if still alive
      if (monster && monster.currentHealth > 0) {
        const target = this.findNextAlive(i, this.playerCards);
        if (target) {
          const { damage, isCritical } = this.calculateDamage(
            monster.baseAttack
          );
          target.currentHealth = Math.max(target.currentHealth - damage, 0);
          const hpPercent = (target.currentHealth / target.maxHealth) * 100;
          await this.animateAttack(
            monster,
            target,
            damage,
            isCritical,
            hpPercent
          );
        }
      }
    }
  }

  private findNextAlive(
    initialTarget: number,
    cards: CombatCard[]
  ): CombatCard | null {
    const tauntTarget = cards.find(
      (c) =>
        c && c.currentHealth > 0 && c.specialAbility == SpecialAbility.Taunt
    );
    if (tauntTarget) return tauntTarget;
    else if (cards[initialTarget].currentHealth > 0)
      return cards[initialTarget];
    else {
      for (let c of cards) {
        if (c && c.currentHealth > 0) return c;
      }
    }
    return null;
  }

  private calculateDamage(baseAttack: number): {
    damage: number;
    isCritical: boolean;
  } {
    const variance = Phaser.Math.FloatBetween(0.9, 1.1);
    const isCritical = Phaser.Math.Between(1, 20) === 1;
    const critMultiplier = isCritical ? 1.15 : 1;
    const damage = Math.round(baseAttack * variance * critMultiplier);

    return { damage, isCritical };
  }

  private applyHealing(allies: CombatCard[], healer: CombatCard) {
    const damagedAllies = allies.filter(
      (c) => c && c.currentHealth > 0 && c.currentHealth < c.maxHealth
    );
    if (damagedAllies.length === 0) return;

    const { damage } = this.calculateDamage(healer.baseAttack);
    const healPerCard = Math.floor(damage / damagedAllies.length);

    for (const card of damagedAllies) {
      card.currentHealth = Math.min(
        card.currentHealth + healPerCard,
        card.maxHealth
      );
      updateHealthOverlay(
        card.sprite,
        (card.currentHealth / card.maxHealth) * 100
      );
    }
  }

  private async animateAttack(
    attacker: CombatCard,
    defender: CombatCard,
    damage: number,
    isCritical: boolean,
    hpPercent: number
  ): Promise<void> {
    const attackerSprite = attacker.sprite;
    const defenderSprite = defender.sprite;
    const scene = attackerSprite.scene;

    const moveDuration = 120;
    const shakeAmount = 10;
    const shakeDuration = 30;

    // Store original position of attacker
    const originalY = attackerSprite.y;
    const moveDistance = 100;
    const moveDirection = this.playerCards.includes(attacker) ? -1 : 1; // up for player, down for monster

    // Create scratch effect sprite but keep invisible initially
    const scratch = scene.add.sprite(
      defenderSprite.x,
      defenderSprite.y,
      "scratch"
    );
    scratch.setOrigin(0.5, 0.5);
    scratch.setPosition(
      defenderSprite.x + defenderSprite.displayWidth / 2,
      defenderSprite.y + defenderSprite.displayHeight / 2
    );
    scratch.setAlpha(0);
    scratch.setDepth(defenderSprite.depth + 1); // on top of card
    scratch.setScale(0.01); // start tiny

    // Helper tween wrapper for promises
    const tweenPromise = (config: Phaser.Types.Tweens.TweenBuilderConfig) =>
      new Promise<void>((resolve) => {
        config.onComplete = () => resolve();
        scene.tweens.add(config);
      });

    // === Attacker moves smoothly up/down ===
    await tweenPromise({
      targets: attackerSprite,
      y: originalY + moveDistance * moveDirection,
      duration: moveDuration,
      ease: "Power2",
    });

    // === Scratch zoom & fade in ===
    await tweenPromise({
      targets: scratch,
      alpha: 1,
      scale: defenderSprite.displayWidth / scratch.width,
      duration: moveDuration,
      ease: "Power2",
    });

    // Floating damage text animation
    const damageText = scene.add
      .text(
        defenderSprite.x + defenderSprite.displayWidth / 2,
        defenderSprite.y + defenderSprite.displayHeight / 2,
        `-${damage}`,
        {
          fontFamily: "Trade Winds",
          fontSize: "42px",
          color: isCritical ? "#ff4444" : "#ffff00",
          fontStyle: isCritical ? "bold" : "normal",
          stroke: "#000000",
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.75)
      .setDepth(101);

    scene.tweens.add({
      targets: damageText,
      alpha: { from: 0, to: 1 },
      y: damageText.y - 20,
      scale: { from: 0.75, to: 1 },
      duration: 200,
      ease: "Cubic.easeOut",
      onComplete: () => {
        scene.tweens.add({
          targets: damageText,
          alpha: 0,
          duration: 300,
          delay: 300,
          onComplete: () => damageText.destroy(),
        });
      },
    });

    // Red screen pulse on critical hit to player
    if (isCritical && !this.playerCards.includes(attacker)) {
      const flash = scene.add
        .rectangle(0, 0, scene.scale.width, scene.scale.height, 0xff0000, 0.25)
        .setOrigin(0)
        .setDepth(200);

      scene.tweens.add({
        targets: flash,
        alpha: { from: 0.25, to: 0 },
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    }

    updateHealthOverlay(defender.sprite, hpPercent);

    // === Defender shakes side to side ===
    for (let i = 0; i < 4; i++) {
      await tweenPromise({
        targets: defenderSprite,
        x: defenderSprite.x + (i % 2 === 0 ? shakeAmount : -shakeAmount),
        duration: shakeDuration / 2,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    }

    // === Scratch zoom & fade out ===
    await tweenPromise({
      targets: scratch,
      alpha: 0,
      scale: (defenderSprite.displayWidth / scratch.width) * 1.5,
      duration: moveDuration,
      ease: "Power2",
    });

    // === Attacker moves back ===
    const attackerBackTween = tweenPromise({
      targets: attackerSprite,
      y: originalY,
      duration: moveDuration,
      ease: "Power2",
    });

    // Clean up scratch sprite
    scratch.destroy();

    // Wait for attacker back movement to finish (if not already)
    await attackerBackTween;

    // Optional: you can add tint flash or sound effects here as well
  }

  private showEndOverlay(result: "victory" | "defeat") {
    const { width, height } = this.scale;

    // Semi-transparent black background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    this.add
      .text(
        width / 2,
        height / 2 - 120,
        result === "victory" ? "Victory!" : "Defeat",
        {
          fontFamily: "Cinzel, serif",
          fontSize: "48px",
          color: "#ffffff",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);

    const messageText =
      result === "victory"
        ? "You’ve triumphed! Your tactics are improving. Press on to your next challenge!"
        : "Your champions have fallen. Try playing your strongest cards and refining your deck in the builder. Use the random battle feature to build your deck.";

    this.add
      .text(width / 2, height / 2 - 40, messageText, {
        fontFamily: "Cinzel, serif",
        fontSize: "20px",
        color: "#dddddd",
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    if (result === "victory") {
      // 5% card drop chance
      if (Phaser.Math.Between(1, 100) <= 5) {
        GlobalState.lastScene = "ExplorationScene";
        this.scene.start("CardDropScene");
        return;
      }

      if (this.nextScene == "") {
        createSlantedFancyButton(
          this,
          width / 2,
          height / 2 + 60,
          "Continue Adventure",
          () => {
            grantPlayerExp(this.playerData, true);
            this.playerData.progress.currentStep =
              this.playerData.progress.currentStep + 1;
            savePlayerData(this.playerData);
            this.scene.start("ExplorationScene");
          }
        );
      } else {
        createSlantedFancyButton(
          this,
          width / 2,
          height / 2 + 60,
          "Continue",
          () => {
            this.scene.start(this.nextScene);
          }
        );
      }
    } else {
      createSlantedFancyButton(
        this,
        width / 2,
        height / 2 + 60,
        "Fight Again",
        () => {
          this.scene.restart();
        }
      );

      if (this.nextScene == "") {
        createSlantedFancyButton(
          this,
          width / 2,
          height / 2 + 120,
          "Deck Builder",
          () => {
            GlobalState.lastScene = this.scene.key;
            this.scene.start("DeckBuilderScene");
          }
        );
      } else {
        createSlantedFancyButton(
          this,
          width / 2,
          height / 2 + 60,
          "Continue",
          () => {
            this.scene.start(this.nextScene);
          }
        );
      }
    }
  }

  private showBattleIntroAnimation(onComplete: () => void): void {
    const { width, height } = this.cameras.main;

    // Black overlay
    const overlay = this.add
      .rectangle(0, 0, width * 2, height * 2, 0x000000)
      .setOrigin(0)
      .setDepth(1000)
      .setAlpha(1);

    // "FIGHT" text
    const battleText = this.add
      .text(width + 200, height / 2, "FIGHT!", {
        fontFamily: "Cinzel, serif",
        fontSize: "64px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(1001);

    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        // Move in text from right
        this.tweens.add({
          targets: battleText,
          x: width / 2,
          alpha: 1,
          duration: 600,
          ease: "Power2",
          onComplete: () => {
            // Hold briefly
            this.time.delayedCall(600, () => {
              // Move text off to the left
              this.tweens.add({
                targets: battleText,
                x: -200,
                alpha: 0,
                duration: 600,
                ease: "Power2",
              });
              // Fade out overlay
              this.tweens.add({
                targets: overlay,
                alpha: 0,
                duration: 600,
                onComplete: () => {
                  overlay.destroy();
                  battleText.destroy();
                  onComplete();
                },
              });
            });
          },
        });
      },
    });
  }
}
