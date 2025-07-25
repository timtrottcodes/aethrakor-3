// scenes/ExplorationScene.ts
import Phaser from "phaser";
import { CardFace, Stage, StepType } from "../objects/objects";
import { CardManager } from "../objects/CardManager";
import { renderPlayerCard } from "../utils/renderPlayerCard";
import { GlobalState } from "../objects/globalState";
import { createFancyButton } from "../utils/button";
import { initAudioManager, playMusic, playSound } from "../utils/audio";
import { addUIOverlay } from "../utils/addUIOverlay";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { StageManager } from "../objects/StageManager";

export default class ExplorationScene extends Phaser.Scene {
  private stageId!: number;
  private stepIndex: number = 0;
  private cards: Phaser.GameObjects.Image[] = [];
  private cardManager: CardManager;
  private stages: Stage[];
  private currentStage: Stage;
  private isFlippingCard: boolean = false;

  constructor() {
    super("ExplorationScene");
    this.cardManager = new CardManager();
  }

  init() {
    this.stageId = PlayerDataManager.instance.data.progress.currentStage;
    this.stepIndex = PlayerDataManager.instance.data.progress.currentStep;
    this.isFlippingCard = false;
    this.stages = StageManager.instance.stages;
    this.currentStage = this.stages.find((s) => s.stageNumber === this.stageId)!;

    if (PlayerDataManager.instance.data.progress.currentStep >= this.currentStage.steps.length) {
      PlayerDataManager.instance.data.progress.currentStage += 1;
      PlayerDataManager.instance.data.progress.currentStep = 0;

      const isChapterEnd = PlayerDataManager.instance.data.progress.currentStage % 5 === 1; // we just entered stage 6, 11, etc.

      if (PlayerDataManager.instance.data.progress.currentStage > 50) {
        this.scene.start("VictoryScene");
      } else if (this.cardManager.playerHasEligibleCardDrops(PlayerDataManager.instance.data.collection)) {
        // Guarentee card drop after each stage
        GlobalState.lastScene = isChapterEnd ? "StoryScene" : "AdventureScene";
        this.scene.start("CardDropScene");
      } else {
        this.scene.start(isChapterEnd ? "StoryScene" : "AdventureScene");
      }
    }
  }

  preload() {
    if (this.currentStage) {
      this.load.image(this.currentStage.image, `assets/backgrounds/stages/${this.currentStage.image}`);
    }
  }

  create() {
    initAudioManager(this);
    addUIOverlay(this);

    this.add.image(0, 0, this.currentStage.image).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);

    const stageGroup = Math.floor((PlayerDataManager.instance.data.progress.currentStage - 1) / 5) + 1;
    const stageMusic = `music_stage_${stageGroup}`;
    playMusic(this, stageMusic);

    // Display player cards
    const spacing = 140;
    const startX = 15;
    for (let i = 0; i < PlayerDataManager.instance.data.equippedCards.length; i++) {
      const x = startX + i * spacing;
      const card = this.cardManager.getById(PlayerDataManager.instance.data.equippedCards[i]);
      if (card) {
        var cardContainer = renderPlayerCard(this, card, x, this.scale.height - 300, 0.17, CardFace.Front, () => this.scene.launch("CardPreviewScene", { data: card }));
        cardContainer.setDepth(2);
      }
    }

    this.add
      .text(20, this.scale.height - 90, `Level: ${PlayerDataManager.instance.data.level}`, {
        fontFamily: "Cinzel, serif",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setDepth(2);

    // Display progress bar
    const progressPercent = Math.floor((this.stepIndex / this.currentStage.steps.length) * 100);
    this.add
      .text(20, this.scale.height - 70, `${this.currentStage.title} - Progress: ${progressPercent}%`, {
        fontFamily: "Cinzel, serif",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setDepth(2);

    if (PlayerDataManager.instance.data.level < 50)
      this.add
        .text(20, this.scale.height - 50, `EXP to next level: ${PlayerDataManager.instance.data.expToNextLevel}`, {
          fontFamily: "Cinzel, serif",
          fontSize: "16px",
          color: "#ffffff",
        })
        .setDepth(2);

    const maxPoints = this.cardManager.getMaxCardCost(PlayerDataManager.instance.data.level);
    const usedPoints = this.cardManager.getUsedCardCost(PlayerDataManager.instance.data.equippedCards);
    const availablePoints = maxPoints - usedPoints;
    if (availablePoints > 0) {
      this.add
        .text(20, this.scale.height - 30, `Available points: ${availablePoints}`, {
          fontFamily: "Cinzel, serif",
          fontSize: "16px",
          color: "#ffffff",
        })
        .setDepth(2);

      createFancyButton(
        this,
        this.scale.width - 100,
        this.scale.height - 30,
        "Deck Builder",
        () => {
          this.scene.stop("ExplorationScene");
          GlobalState.lastScene = this.scene.key;
          this.scene.start("DeckBuilderScene");
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
      const card = this.add
        .image(x, this.scale.height - 600, "card-back-adventure")
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5)
        .setScale(0.25)
        .setDepth(2);

      card.on("pointerdown", () => this.handleCardChoice(card));

      this.cards.push(card);
    }
  }

  private flipCard(card: Phaser.GameObjects.Image, newTextureKey: string, outcome: string) {
    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 150,
      ease: "Linear",
      onComplete: () => {
        card.setTexture(newTextureKey);

        this.tweens.add({
          targets: card,
          scaleX: 0.25,
          duration: 150,
          ease: "Linear",
          onComplete: () => {
            this.time.delayedCall(250, () => this.processCardChoice(outcome));
          },
        });
      },
    });
  }

  private handleCardChoice(card: Phaser.GameObjects.Image) {
    if (this.isFlippingCard) return;
    this.isFlippingCard = true;

    const rand = Math.random();

    let outcome = "continue";
    if (rand < 0.16 && this.cardManager.playerHasEligibleCardDrops(PlayerDataManager.instance.data.collection)) outcome = "rareDrop";
    else if (rand < 0.6) outcome = "battle";

    if (this.stepIndex == this.currentStage.steps.length - 1) outcome = "battle";

    if (this.currentStage.steps[this.stepIndex].type == StepType.Boss) outcome = "battle";

    let textureKey = "";

    if (outcome === "continue") textureKey = "card_continue";
    else if (outcome === "battle") textureKey = "card_battle";
    else if (outcome === "rareDrop") textureKey = "card_drop";

    this.flipCard(card, textureKey, outcome);
  }

  private processCardChoice(outcome: string) {
    if (outcome === "continue") {
      playSound(this, "foot");
      this.stepIndex++;
      PlayerDataManager.instance.data.progress.currentStep = this.stepIndex;
      PlayerDataManager.instance.grantExp(false);
      this.playForwardMotionEffect();
    } else if (outcome === "battle") {
      this.triggerAlarmEffect();
    } else {
      this.stepIndex++;
      PlayerDataManager.instance.grantExp(false);
      PlayerDataManager.instance.data.progress.currentStep = this.stepIndex;

      GlobalState.lastScene = this.scene.key;
      this.scene.start("CardDropScene");
    }
  }

  private playForwardMotionEffect() {
    // Create a duplicate of the background
    const bgZoom = this.add
      .image(this.scale.width / 2, this.scale.height / 2, this.currentStage.image)
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
      scale: initialScale * 2, // Zoom to 200%
      alpha: 0, // Fade out
      duration: 1000, // 1 second
      ease: "Cubic.easeOut",
      onComplete: () => {
        bgZoom.destroy();
        this.scene.restart();
      },
    });
  }

  private triggerAlarmEffect() {
    // Play klaxon sound
    playSound(this, "horn");

    // Create red overlay
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000, 0.5).setOrigin(0, 0).setDepth(100);

    // Create "BATTLE!" text
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "BATTLE!", {
        fontFamily: "Cinzel, serif",
        fontSize: "64px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 6,
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
        this.scene.start("CombatScene", { stageId: this.stageId, stepId: this.stepIndex });
      }

      this.tweens.add({
        targets: overlay,
        alpha: 0.5,
        duration: pulseDuration / 2,
        yoyo: true,
        ease: "Power2",
        onComplete: () => {
          pulseIndex++;
          pulse(); // next pulse
        },
      });
    };

    pulse();
  }
}
