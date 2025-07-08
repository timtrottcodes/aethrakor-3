// scenes/MainMenuScene.ts
import Phaser from 'phaser';
import { createFancyButton } from '../utils/button';
import { getMaxCardCost, loadPlayerData, loadStageData } from '../utils/playerDataUtils';
import { PlayerData, Stage, StepItem } from '../objects/objects';

export default class MainMenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private logo!: Phaser.GameObjects.Image;  
  private sublogo!: Phaser.GameObjects.Image;
  private playerData: PlayerData;
  
  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.playerData = loadPlayerData();
    this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_main').setDisplaySize(this.scale.width, this.scale.height).setAlpha(0);
    this.tweens.add({
      targets: this.background,
      alpha: 1,
      duration: 1000,
      onComplete: () => this.showLogo()
    });
  }

  private showLogo() {
    this.logo = this.add.image(this.scale.width / 2, 200, 'logo')
      .setAlpha(0)
      .setScale(0.8)
      .setOrigin(0.5);
    
    this.sublogo = this.add.image(this.scale.width / 2, 350, 'sublogo')
      .setAlpha(0)
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      duration: 1000,
      onComplete: () => this.showButton()
    });

    this.tweens.add({
      targets: this.sublogo,
      alpha: 1,
      duration: 1000
    });
  }  
    
  private showButton() {
    const x = this.scale.width / 2;
    const y = this.scale.height * 0.5;

    if (this.playerData.progress.currentStage == 1 && this.playerData.progress.currentStep == 0) {
      createFancyButton(this, x, y, "Start Adventure", () => { this.scene.start('AdventureScene')}, 30);
    } else {
      createFancyButton(this, x, y, "Continue Adventure", () => { this.scene.start('AdventureScene')}, 30);
      
      const { stage, stepIndex } = this.getRandomPastStep();
      
      createFancyButton(this, x, y + 80, "Random Battle", () => { this.scene.start('CombatScene', { stageId: stage.stageNumber, stepId: stepIndex })}, 30);

      createFancyButton(this, x, y + 160, "Collection", () => { this.scene.start('CollectionScene')}, 30);
    }
  }

  private getRandomPastStep(): { stage: Stage, stepIndex: number } {
    const maxStage = this.playerData.progress.currentStage;
    const currentStep = this.playerData.progress.currentStep;

    const stages = loadStageData();
    const eligibleStages = stages.filter(s => s.stageNumber <= maxStage);

    if (eligibleStages.length === 0) {
      throw new Error("No eligible stages found.");
    }

    const stage = Phaser.Utils.Array.GetRandom(eligibleStages);
    let maxStepIndex = stage.steps.length - 1;

    if (stage.stageNumber === maxStage) {
      maxStepIndex = Math.min(currentStep - 1, maxStepIndex); // ensure it's within bounds
    }

    const stepIndex = Phaser.Math.Between(0, maxStepIndex);
    return { stage, stepIndex };
  }

}
