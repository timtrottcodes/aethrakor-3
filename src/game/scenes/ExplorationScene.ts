// scenes/ExplorationScene.ts
import Phaser from 'phaser';
import stagesData from '../data/stages.json';
import { CardFace, PlayerData, Stage, StepType } from '../objects/objects';
import { loadPlayerData, savePlayerData } from '../utils/playerDataUtils';
import { CardManager } from '../objects/CardManager';
import { renderPlayerCard } from '../utils/renderPlayerCard';

export default class ExplorationScene extends Phaser.Scene {
  private stageId!: number;
  private stepIndex: number = 0;
  private cards: Phaser.GameObjects.Image[] = [];
  private progressText!: Phaser.GameObjects.Text;
  private expText!: Phaser.GameObjects.Text;
  private playerData: PlayerData = loadPlayerData();
  private cardManager: CardManager;
  private stages: Stage[];
  private currentStage: Stage;

  constructor() {
    super('ExplorationScene');
    this.cardManager = new CardManager();
  }

  init() {
    this.stageId = this.playerData.progress.currentStage;
    this.stepIndex = this.playerData.progress.currentStep;
  }

  preload() {
    this.stages = stagesData.map(stage => ({
      ...stage,
      steps: stage.steps.map(step => ({
        ...step,
        type: StepType[step.type as keyof typeof StepType]  // Convert string to enum
      }))
    }));
    this.currentStage = this.stages.find(s => s.stageNumber === this.stageId)!;
    if (this.currentStage) {
      this.load.image('stage-bg', `assets/backgrounds/${this.currentStage.image}`);
    }
  }

  create() {
    this.add.image(0, 0, 'stage-bg').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

    // Display player cards
    const spacing = 140;
    const startX = 15;
    for (let i = 0; i < this.playerData.equippedCards.length; i++) {
      const x = startX + i * spacing;
      const card = this.cardManager.getById(this.playerData.equippedCards[i]);
      if (card) {
        var cardContainer = renderPlayerCard(this, card, x, this.scale.height - 220, 0.17, CardFace.Front);
        cardContainer.on('card-clicked', () => {
          this.scene.launch('CardPreviewScene', { data: card });
        });
      }
    }

    // Display progress bar
    const progressPercent = Math.floor((this.stepIndex / this.currentStage.steps.length) * 100);
    this.progressText = this.add.text(20, 160, `Progress: ${progressPercent}%`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.expText = this.add.text(20, 190, `EXP to next level: ${this.playerData.expToNextLevel}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // Draw card choices
    this.showCardChoices();
  }

  private showCardChoices() {
    const spacing = 150;
    const startX = this.scale.width / 2 - spacing;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * spacing;
      const card = this.add.image(x, this.scale.height - 500, 'card-back-adventure')
      .setInteractive()
      .setOrigin(0.5)
      .setScale(0.17);

      card.on('pointerdown', () => this.handleCardChoice(card));

      this.cards.push(card);
    }
  }

  private flipCard(card: Phaser.GameObjects.Image, newTextureKey: string, outcome: string) {
    this.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
          card.setTexture(newTextureKey);

          this.tweens.add({
              targets: card,
              scaleX: 0.17,
              duration: 150,
              ease: 'Linear',
              onComplete: () => { 
                this.time.delayedCall(1000, () => this.processCardChoice(outcome));
              }
          });
        }
    });
  }

  private handleCardChoice(card: Phaser.GameObjects.Image) {
    const rand = Math.random();

    let outcome = 'continue';
    if (rand < 0.1) 
      outcome = 'rareDrop';
    else  if (rand < 0.5) 
      outcome = 'battle';

    if (this.stepIndex == this.currentStage.steps.length - 1)
       outcome = 'battle'; 

    let textureKey = '';

    if (outcome === 'continue') textureKey = 'card_continue';
    else if (outcome === 'battle') textureKey = 'card_battle';
    else if (outcome === 'rareDrop') textureKey = 'card_drop';

    this.flipCard(card, textureKey, outcome);
  }

  private processCardChoice(outcome: string) {
    if (outcome === 'continue') {
      this.stepIndex++;
      this.playerData.progress.currentStep = this.stepIndex;
      savePlayerData(this.playerData);
      this.scene.restart({ stageId: this.stageId });
    } else if (outcome === 'battle') {
      this.scene.start('CombatScene', { boss: false });
    } else {
      // Grant card, then continue
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'You found a rare card!', {
        fontSize: '24px', color: '#ffff00'
      }).setOrigin(0.5);
      this.time.delayedCall(2000, () => this.scene.restart({ stageId: this.stageId }));
    }
  }
}
