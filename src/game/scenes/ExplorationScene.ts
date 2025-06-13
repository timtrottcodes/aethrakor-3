// scenes/ExplorationScene.ts
import Phaser from 'phaser';
import stagesData from '../data/stages.json';
import { CardFace, PlayerData, Stage, StepType } from '../objects/objects';
import { loadPlayerData, savePlayerData } from '../utils/playerDataUtils';
import { CardManager } from '../objects/CardManager';
import { renderPlayerCard } from '../utils/renderPlayerCard';
import { GlobalState } from '../objects/globalState';

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
      this.load.image('stage-bg', `assets/backgrounds/stages/${this.currentStage.image}`);
    }
    this.load.image('star', 'assets/ui/star.png');
  }

  create() {
    this.add.image(0, 0, 'stage-bg').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);

    // Display player cards
    const spacing = 140;
    const startX = 15;
    for (let i = 0; i < this.playerData.equippedCards.length; i++) {
      const x = startX + i * spacing;
      const card = this.cardManager.getById(this.playerData.equippedCards[i]);
      if (card) {
        var cardContainer = renderPlayerCard(this, card, x, this.scale.height - 300, 0.17, CardFace.Front, () => this.scene.launch('CardPreviewScene', { data: card }));
        cardContainer.setDepth(2);
      }
    }

    // Display progress bar
    const progressPercent = Math.floor((this.stepIndex / this.currentStage.steps.length) * 100);
    this.progressText = this.add.text(20, this.scale.height - 70, `Progress: ${progressPercent}%`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setDepth(2);

    this.expText = this.add.text(20, this.scale.height - 50, `EXP to next level: ${this.playerData.expToNextLevel}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setDepth(2);

    // Draw card choices
    this.showCardChoices();
  }

  private showCardChoices() {
    const spacing = 200;
    const startX = this.scale.width / 2 - spacing;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * spacing;
      const card = this.add.image(x, this.scale.height - 500, 'card-back-adventure')
      .setInteractive()
      .setOrigin(0.5)
      .setScale(0.2)
      .setDepth(2);

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
              scaleX: 0.2,
              duration: 150,
              ease: 'Linear',
              onComplete: () => { 
                this.time.delayedCall(250, () => this.processCardChoice(outcome));
              }
          });
        }
    });
  }

  private handleCardChoice(card: Phaser.GameObjects.Image) {
    const rand = Math.random();

    let outcome = 'rareDrop';
    /*if (rand < 0.1) 
      outcome = 'rareDrop';
    else  if (rand < 0.5) 
      outcome = 'battle';

    if (this.stepIndex == this.currentStage.steps.length - 1)
       outcome = 'battle'; */

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
      this.playForwardMotionEffect();
    } else if (outcome === 'battle') {
      this.triggerAlarmEffect();
    } else {
      GlobalState.lastScene = this.scene.key;
      this.scene.start('CardDropScene');
    }
  }

  private playForwardMotionEffect() {
    // Create a duplicate of the background
    const bgZoom = this.add.image(this.scale.width / 2, this.scale.height / 2, 'stage-bg')
      .setOrigin(0.5, 0.5)
      .setScale(1)
      .setAlpha(1)
      .setDepth(1); // Between original background (0) and UI controls

    // Match its display size to the canvas (optional, if you need to fill screen exactly)
    const scaleX = this.scale.width / bgZoom.width;
    const scaleY = this.scale.height / bgZoom.height;
    const initialScale = Math.max(scaleX, scaleY);
    bgZoom.setScale(initialScale); // Set the starting scale to fill screen

    this.tweens.add({
      targets: bgZoom,
      scale: initialScale * 2,  // Zoom to 200%
      alpha: 0,                 // Fade out
      duration: 1000,           // 1 second
      ease: 'Cubic.easeOut',
      onComplete: () => bgZoom.destroy()
    });
  }

  private triggerAlarmEffect() {
    // Play klaxon sound
    //this.sound.play('klaxon');

    // Create red overlay
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000, 0.5)
      .setOrigin(0, 0)
      .setDepth(100);

    // Create "BATTLE!" text
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'BATTLE!', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .setDepth(101);

      // Define the pulse sequence (fade in/out) manually
    const pulseDuration = 500; // milliseconds per fade in/out
    const repeatCount = 3;
    let pulseIndex = 0;

    const pulse = () => {
      if (pulseIndex >= repeatCount) {
        this.scene.start('CombatScene', { boss: false });
      }

      this.tweens.add({
        targets: overlay,
        alpha: 0.5,
        duration: pulseDuration / 2,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          pulseIndex++;
          pulse(); // next pulse
        }
      });
    };

    pulse();
  }
}