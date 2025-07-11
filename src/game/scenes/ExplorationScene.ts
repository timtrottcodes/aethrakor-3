// scenes/ExplorationScene.ts
import Phaser from 'phaser';
import { CardFace, PlayerData, Stage, StepType } from '../objects/objects';
import { getMaxCardCost, grantPlayerExp, loadPlayerData, loadStageData, savePlayerData } from '../utils/playerDataUtils';
import { CardManager } from '../objects/CardManager';
import { renderPlayerCard } from '../utils/renderPlayerCard';
import { GlobalState } from '../objects/globalState';
import { createFancyButton } from '../utils/button';
import { playMusic, playSound } from '../utils/audio';

export default class ExplorationScene extends Phaser.Scene {
  private stageId!: number;
  private stepIndex: number = 0;
  private cards: Phaser.GameObjects.Image[] = [];
  private playerData: PlayerData;
  private cardManager: CardManager;
  private stages: Stage[];
  private currentStage: Stage;
  private isFlippingCard: boolean = false;

  constructor() {
    super('ExplorationScene');
    this.cardManager = new CardManager();
  }

  init() {
    this.playerData = loadPlayerData();
    this.stageId = this.playerData.progress.currentStage;
    this.stepIndex = this.playerData.progress.currentStep;
    this.isFlippingCard = false;
    this.stages = loadStageData();
    this.currentStage = this.stages.find(s => s.stageNumber === this.stageId)!;

    if (this.playerData.progress.currentStep >= this.currentStage.steps.length) {
      this.playerData.progress.currentStage += 1;
      this.playerData.progress.currentStep = 0;
      savePlayerData(this.playerData);

      //const isChapterEnd = this.playerData.progress.currentStage % 5 === 1; // we just entered stage 6, 11, etc.

      if (this.playerData.progress.currentStage > 50) {
        this.scene.start('VictoryScene');
      } else {
        // Guarentee card drop after each stage
        GlobalState.lastScene = 'StoryScene'; //isChapterEnd ? 'StoryScene' : 'AdventureScene';
        this.scene.start('CardDropScene');
      }
    }
  }

  preload() {
    if (this.currentStage) {
      this.load.image(this.currentStage.image, `assets/backgrounds/stages/${this.currentStage.image}`);
    }
  }

  create() {
    this.add.image(0, 0, this.currentStage.image).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);
    
    const stageGroup = Math.floor((this.playerData.progress.currentStage - 1) / 5) + 1;
    const stageMusic =  `music_stage_${stageGroup}`;
    playMusic(this, stageMusic);

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

    this.add.text(20, this.scale.height - 90, `Level: ${this.playerData.level}`, {
      fontFamily: "Cinzel, serif",
      fontSize: '16px',
      color: '#ffffff'
    }).setDepth(2);

    // Display progress bar
    const progressPercent = Math.floor((this.stepIndex / this.currentStage.steps.length) * 100);
    this.add.text(20, this.scale.height - 70, `${this.currentStage.title} - Progress: ${progressPercent}%`, {
      fontFamily: "Cinzel, serif",
      fontSize: '16px',
      color: '#ffffff'
    }).setDepth(2);

    if (this.playerData.level < 50)
      this.add.text(20, this.scale.height - 50, `EXP to next level: ${this.playerData.expToNextLevel}`, {
        fontFamily: "Cinzel, serif",
        fontSize: '16px',
        color: '#ffffff'
      }).setDepth(2);


    const maxPoints = getMaxCardCost(this.playerData.level);
    const usedPoints = this.cardManager.getUsedCardCost(this.playerData.equippedCards);
    const availablePoints = maxPoints - usedPoints;
    if (availablePoints > 0) {
      this.add.text(20, this.scale.height - 30, `Available points: ${availablePoints}`, {
        fontFamily: "Cinzel, serif",
        fontSize: '16px',
        color: '#ffffff'
      }).setDepth(2);
      
      createFancyButton(
            this,
            this.scale.width - 100,
            this.scale.height - 30,
            'Deck Builder',
            () => {
              this.scene.stop("ExplorationScene");
              GlobalState.lastScene = this.scene.key;
              this.scene.start('DeckBuilderScene');
            },
            16
          );   
    }

    // Draw card choices
    this.showCardChoices();
  }

  private showCardChoices() {
    const spacing = 220;
    const startX = this.scale.width / 2 - spacing;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * spacing;
      const card = this.add.image(x, this.scale.height - 600, 'card-back-adventure')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setScale(0.25)
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
              scaleX: 0.25,
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
    if (this.isFlippingCard) return;
    this.isFlippingCard = true;
    
    const rand = Math.random();

    let outcome = 'continue';
    if (rand < 0.16) 
      outcome = 'rareDrop';
    else  if (rand < 0.6) 
      outcome = 'battle';

    if (this.stepIndex == this.currentStage.steps.length - 1)
       outcome = 'battle';

    if (this.currentStage.steps[this.stepIndex].type == StepType.Boss)
       outcome = 'battle';

    let textureKey = '';

    if (outcome === 'continue') textureKey = 'card_continue';
    else if (outcome === 'battle') textureKey = 'card_battle';
    else if (outcome === 'rareDrop') textureKey = 'card_drop';

    this.flipCard(card, textureKey, outcome);
  }

  private processCardChoice(outcome: string) {
    if (outcome === 'continue') {
      playSound(this, 'foot');
      this.stepIndex++;
      this.playerData.progress.currentStep = this.stepIndex;
      grantPlayerExp(this.playerData, false);
      savePlayerData(this.playerData);
      this.playForwardMotionEffect();
    } else if (outcome === 'battle') {
      savePlayerData(this.playerData);
      this.triggerAlarmEffect();
    } else {
      this.stepIndex++;
      grantPlayerExp(this.playerData, false);
      this.playerData.progress.currentStep = this.stepIndex;
      savePlayerData(this.playerData);

      GlobalState.lastScene = this.scene.key;
      this.scene.start('CardDropScene');
    }
  }

  private playForwardMotionEffect() {
    // Create a duplicate of the background
    const bgZoom = this.add.image(this.scale.width / 2, this.scale.height / 2, this.currentStage.image)
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
      onComplete: () => {
        bgZoom.destroy();
        this.scene.restart();
      }
    });
  }

  private triggerAlarmEffect() {
    // Play klaxon sound
    playSound(this, 'horn');

    // Create red overlay
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000, 0.5)
      .setOrigin(0, 0)
      .setDepth(100);

    // Create "BATTLE!" text
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'BATTLE!', {
      fontFamily: "Cinzel, serif",
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    })
      .setOrigin(0.5)
      .setAlpha(0.75)
      .setDepth(101);

      // Define the pulse sequence (fade in/out) manually
    const pulseDuration = 500; // milliseconds per fade in/out
    const repeatCount = 3;
    let pulseIndex = 0;

    const pulse = () => {
      if (pulseIndex >= repeatCount) {
        this.scene.start('CombatScene', { stageId: this.stageId, stepId: this.stepIndex });
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