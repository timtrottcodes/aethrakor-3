import Phaser from 'phaser';
import stagesData from '../data/stages.json';
import { Card, CardFace, PlayerData, Rarity, SpecialAbility, Stage, StepItem, StepType } from '../objects/objects';
import { grantPlayerExp, loadPlayerData, savePlayerData } from '../utils/playerDataUtils';
import { renderPlayerCard, updateHealthOverlay } from '../utils/renderPlayerCard';
import { MonsterManager } from '../objects/MonsterManager';
import { CardManager } from '../objects/CardManager';
import { GlobalState } from '../objects/globalState';
import { createSlantedFancyButton } from '../utils/button';

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


export default class CombatScene extends Phaser.Scene {
  private playerData: PlayerData;
  private cardManager!: CardManager;
  private monsterManager!: MonsterManager;
  private playerCards: CombatCard[] = [];
  private monsterCards: CombatCard[] = [];
  private cardScale = 0.17;
  private currentStage: Stage;
  private stageId!: number;
  private stages: Stage[];

  constructor() {
    super("CombatScene");
  }

  create() {
    this.playerData = loadPlayerData();
    this.monsterManager = new MonsterManager();
    this.cardManager = new CardManager();
    this.stageId = this.playerData.progress.currentStage;
    this.stages = stagesData.map(stage => ({
      ...stage,
      steps: stage.steps.map(step => {
        const formattedType = step.type.charAt(0).toUpperCase() + step.type.slice(1).toLowerCase();
        return {
          ...step,
          type: StepType[formattedType as keyof typeof StepType]
        };
      })
    }));
    this.currentStage = this.stages.find(s => s.stageNumber === this.stageId)!;

    //this.load.image(this.currentStage.image, `assets/backgrounds/stages/${this.currentStage.image}`);
    this.add.image(0, 0, this.currentStage.image).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);
    this.add.text(20, 20, 'Combat Phase', { fontSize: '32px', color: '#ffffff' });

    const centerX = this.scale.width / 2;
    let spacing = 140;

    // Generate monsters
    let monsterData: Card[] = [];
    const currentStep = this.currentStage.steps[this.playerData.progress.currentStep];

    if (currentStep.type == StepType.Boss) {
      const bossId = currentStep.enemies.shift();
      const bossCard = this.monsterManager.getById(bossId!);
      monsterData = this.monsterManager.getRandomMonstersFromList(currentStep.enemies, 4);
      monsterData.splice(2, 0, bossCard!);
    } else {
      monsterData = this.monsterManager.getRandomMonstersFromList(currentStep.enemies);
    }

    let bossOffset = 0;
    if (currentStep.type == StepType.Boss) {
      spacing = 130; 
      this.monsterCards = monsterData.map((card, i) => {
        let x = centerX - (2 * spacing) + (i * spacing) - 65 + bossOffset;
        const y = 120;

        const isBoss = i === 2;
        const scale = isBoss ? this.cardScale + 0.01 : this.cardScale - 0.01;

        const sprite = renderPlayerCard(this, card, x, y, scale, CardFace.Front);

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
          specialAbility: SpecialAbility[card.specialAbility]
        };
      });
    } else {
      this.monsterCards = monsterData.map((card, i) => {
        const x = centerX - (2 * spacing) + (i * spacing) - 65;
        const y = 120;
        const sprite = renderPlayerCard(this, card, x, y, this.cardScale, CardFace.Front);
        return {
          id: card.id,
          name: card.name,
          sprite,
          baseAttack: card.attack,
          maxHealth: card.health,
          currentHealth: card.health,
          isPlayer: false,
          specialAbility: SpecialAbility[card.specialAbility]
        };
      });
    }

    // Player cards
    this.playerCards = this.playerData.equippedCards.map((cardId, i) => {
      const card = this.cardManager.getById(cardId);
      if (card) {
        const x = centerX - (2 * spacing) + (i * spacing) - 65;
        const y = this.scale.height - 200;
        const sprite = renderPlayerCard(this, card, x, y, this.cardScale, CardFace.Front);
        return {
          id: card.id,
          name: card.name,
          sprite,
          baseAttack: card.attack,
          maxHealth: card.health,
          currentHealth: card.health,
          isPlayer: true,
          specialAbility: SpecialAbility[card.specialAbility]
        } as CombatCard;
      }
    })
    .filter((c): c is CombatCard => c !== undefined);

    // Buttons
    const startButton = this.add.text(centerX, 550, 'Start Fight', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => this.runCombatLoop());

    const changeDeckButton = this.add.text(centerX, 600, 'Change Deck', {
      fontSize: '20px', color: '#cccccc', backgroundColor: '#222222', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive();

    changeDeckButton.on('pointerdown', () => this.scene.start('DeckBuilderScene'));
  }

  private async runCombatLoop() {
    while (this.playerCards.some(c => c && c.currentHealth > 0) &&
          this.monsterCards.some(c => c && c.currentHealth > 0)) {
      await this.runCombatRound();
    }

    if (this.playerCards.every(c => !c || c.currentHealth <= 0)) {
      this.showEndOverlay('defeat');
    } else if (this.monsterCards.every(c => !c || c.currentHealth <= 0)) {
      this.showEndOverlay('victory');
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

        const attackCount = player.specialAbility == SpecialAbility.DualStrike ? 2 : 1;

        for (let a = 0; a < attackCount; a++) {
          const target = this.findNextAlive(i, this.monsterCards);
          if (target) {
            const damageToMonster = this.calculateDamage(player.baseAttack);
            target.currentHealth = Math.max(target.currentHealth - damageToMonster, 0);
            const hpPercent = (target.currentHealth / target.maxHealth) * 100;
            await this.animateAttack(player, target, damageToMonster, false, hpPercent);
          }
        }
      }

      // Monster counter-attacks if still alive
      if (monster && monster.currentHealth > 0) {
        const target = this.findNextAlive(i, this.playerCards);
        if (target) {
          const damageToPlayer = this.calculateDamage(monster.baseAttack);
          target.currentHealth = Math.max(target.currentHealth - damageToPlayer, 0);
          const hpPercent = (target.currentHealth / target.maxHealth) * 100;
          await this.animateAttack(monster, target, damageToPlayer, false, hpPercent);
        }
      }
    }
  }

  private findNextAlive(initialTarget: number, cards: CombatCard[]): CombatCard | null {
    const tauntTarget = cards.find(c => c && c.currentHealth > 0 && c.specialAbility == SpecialAbility.Taunt);
    if (tauntTarget) 
      return tauntTarget;
    else if (cards[initialTarget].currentHealth > 0)
        return cards[initialTarget];
    else {
      for (let c of cards) {
        if (c && c.currentHealth > 0) return c;
      }
    }
    return null;
  }

  private calculateDamage(baseAttack: number): number {
    const variance = Phaser.Math.FloatBetween(0.9, 1.1);
    const isCritical = Phaser.Math.Between(1, 20) === 1;
    const critMultiplier = isCritical ? 1.15 : 1;
    return Math.round(baseAttack * variance * critMultiplier);
  }

  private applyHealing(allies: CombatCard[], healer: CombatCard) {
    const damagedAllies = allies.filter(c => c && c.currentHealth > 0 && c.currentHealth < c.maxHealth);
    if (damagedAllies.length === 0) return;

    const totalHeal = this.calculateDamage(healer.baseAttack);
    const healPerCard = Math.floor(totalHeal / damagedAllies.length);

    for (const card of damagedAllies) {
      card.currentHealth = Math.min(card.currentHealth + healPerCard, card.maxHealth);
      updateHealthOverlay(card.sprite, (card.currentHealth / card.maxHealth) * 100);
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
    const scratch = scene.add.sprite(defenderSprite.x, defenderSprite.y, 'scratch');
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
      new Promise<void>(resolve => {
        config.onComplete = () => resolve();
        scene.tweens.add(config);
      });

    // === Attacker moves smoothly up/down ===
    await tweenPromise({
      targets: attackerSprite,
      y: originalY + moveDistance * moveDirection,
      duration: moveDuration,
      ease: 'Power2'
    });

    // === Scratch zoom & fade in ===
    await tweenPromise({
      targets: scratch,
      alpha: 1,
      scale: defenderSprite.displayWidth / scratch.width,
      duration: moveDuration,
      ease: 'Power2'
    });

    updateHealthOverlay(defender.sprite, hpPercent);

    // === Defender shakes side to side ===
    for (let i = 0; i < 4; i++) {
      await tweenPromise({
        targets: defenderSprite,
        x: defenderSprite.x + (i % 2 === 0 ? shakeAmount : -shakeAmount),
        duration: shakeDuration / 2,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }

    // === Scratch zoom & fade out ===
    await tweenPromise({
      targets: scratch,
      alpha: 0,
      scale: defenderSprite.displayWidth / scratch.width * 1.5,
      duration: moveDuration,
      ease: 'Power2'
    });

    // === Attacker moves back ===
    const attackerBackTween = tweenPromise({
      targets: attackerSprite,
      y: originalY,
      duration: moveDuration,
      ease: 'Power2'
    });

    // Clean up scratch sprite
    scratch.destroy();

    // Wait for attacker back movement to finish (if not already)
    await attackerBackTween;

    // Optional: you can add tint flash or sound effects here as well
  }


  private tintContainer(container: Phaser.GameObjects.Container, color: number) {
    container.iterate((child: Phaser.GameObjects.Container) => {
      if ('setTint' in child && typeof child.setTint === 'function') {
        (child as Phaser.GameObjects.GameObject & { setTint: (color: number) => void }).setTint(color);
      }
    });
  }

  private showEndOverlay(result: 'victory' | 'defeat') {
    const { width, height } = this.scale;

    // Semi-transparent black background
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0);

    const title = this.add.text(width / 2, height / 2 - 100, result === 'victory' ? 'Victory!' : 'Defeat', {
      fontFamily: "Cinzel, serif",
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const messageText = result === 'victory'
      ? "You’ve triumphed! Your tactics are improving. Press on to your next challenge!"
      : "Your champions have fallen. Try playing your strongest cards and refining your deck in the builder.";

    const message = this.add.text(width / 2, height / 2 - 40, messageText, {
      fontFamily: "Cinzel, serif",
      fontSize: '20px',
      color: '#dddddd',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    if (result === 'victory') {
      // 2% card drop chance
      if (Phaser.Math.Between(1, 100) <= 2) {
        GlobalState.lastScene = this.scene.key;
        this.scene.start('CardDropScene');
        return;
      }

      createSlantedFancyButton(this, width / 2, height / 2 + 60, 'Continue Adventure', () => {
        grantPlayerExp(this.playerData)
        this.playerData.progress.currentStep = this.playerData.progress.currentStep + 1;
        savePlayerData(this.playerData);
        this.scene.start('ExplorationScene');
      });
    } else {
      createSlantedFancyButton(this, width / 2, height / 2 + 60, 'Fight Again', () => {
        this.scene.restart();
      });

      createSlantedFancyButton(this, width / 2, height / 2 + 120, 'Deck Builder', () => {
        this.scene.start('DeckBuilderScene');
      });
    }
  }

} 
