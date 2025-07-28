// scenes/MainMenuScene.ts
import Phaser from "phaser";
import { createFancyButton } from "../utils/button";
import { Stage } from "../objects/objects";
import { initAudioManager, playMusic } from "../utils/audio";
import { addUIOverlay } from "../utils/addUIOverlay";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { StageManager } from "../objects/StageManager";
import { BaseScene } from "./BaseScene";

export default class MainMenuScene extends BaseScene {
  private logo!: Phaser.GameObjects.Image;
  private sublogo!: Phaser.GameObjects.Image;

  constructor() {
    super("MainMenuScene");
  }

  create() {
    super.create();
    const bg = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg_main")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0);
    this.contentContainer.add(bg);

    addUIOverlay(this);
    initAudioManager(this);
    playMusic(this, "title");

    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1000,
      onComplete: () => this.showLogo(),
    });
  }

  private showLogo() {
    this.logo = this.add
      .image(this.scale.width / 2, 200, "logo")
      .setAlpha(0)
      .setScale(0.8)
      .setOrigin(0.5);

    this.sublogo = this.add
      .image(this.scale.width / 2, 350, "sublogo")
      .setAlpha(0)
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      duration: 1000,
      onComplete: () => this.showButton(),
    });

    this.tweens.add({
      targets: this.sublogo,
      alpha: 1,
      duration: 1000,
    });

    this.contentContainer.add([this.logo,this.sublogo])
  }

  private showButton() {
    const x = this.scale.width / 2;
    const y = this.scale.height * 0.5;

    if (PlayerDataManager.instance.data.progress.currentStage == 1 && PlayerDataManager.instance.data.progress.currentStep == 0) {
      createFancyButton(
        this,
        x,
        y,
        "Start Adventure",
        () => {
          this.navigate("AdventureScene");
        },
        30
      );
      createFancyButton(
        this,
        x,
        y + 80,
        "How to Play",
        () => {
          this.navigate("HowToPlayScene");
        },
        30
      );
    } else {
      if (PlayerDataManager.instance.data.progress.currentStage > 50) {
        createFancyButton(
          this,
          x,
          y,
          "New Game",
          () => {
            PlayerDataManager.instance.newGame();
            this.scene.restart();
          },
          30
        );
      } else {
        createFancyButton(
          this,
          x,
          y,
          "Continue Adventure",
          () => {
            this.navigate("AdventureScene");
          },
          30
        );
      }

      const { stage, stepIndex } = this.getRandomPastStep();

      createFancyButton(
        this,
        x,
        y + 80,
        "Random Battle",
        () => {
          this.navigate("CombatScene", { random: true, stageId: stage.stageNumber, stepId: stepIndex });
        },
        30
      );

      createFancyButton(
        this,
        x,
        y + 160,
        "Collection",
        () => {
          this.navigate("CollectionScene");
        },
        30
      );
      createFancyButton(
        this,
        x,
        y + 240,
        "How to Play",
        () => {
          this.navigate("HowToPlayScene");
        },
        30
      );
    }
  }

  private getRandomPastStep(): { stage: Stage; stepIndex: number } {
    const maxStage = PlayerDataManager.instance.data.progress.currentStage;
    const currentStep = PlayerDataManager.instance.data.progress.currentStep;

    const stages = StageManager.instance.stages;
    const eligibleSteps: { stage: Stage; stepIndex: number }[] = [];

    for (const stage of stages) {
      if (stage.stageNumber < maxStage) {
        for (let i = 0; i < stage.steps.length; i++) {
          eligibleSteps.push({ stage, stepIndex: i });
        }
      } else if (stage.stageNumber === maxStage) {
        for (let i = 0; i < currentStep; i++) {
          eligibleSteps.push({ stage, stepIndex: i });
        }
      }
    }

    if (eligibleSteps.length === 0) {
      throw new Error("No eligible past steps found.");
    }

    return Phaser.Utils.Array.GetRandom(eligibleSteps);
  }

  private navigate(scene: string, data?: any) {
    this.scene.start(scene, data);
  }
}
