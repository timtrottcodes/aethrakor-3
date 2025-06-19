// scenes/AdventureScene.ts
import Phaser from 'phaser';
import stagesData from '../data/stages.json';
import { loadPlayerData } from '../utils/playerDataUtils';
import { PlayerData, Stage, StepType } from '../objects/objects';
import { createDisabledSlantedFancyButton, createFancyButton, createSlantedFancyButton } from '../utils/button';
import { GlobalState } from '../objects/globalState';

export default class AdventureScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;
  private stagesInChapter = 5;
  private visibleStageRange = { start: 1, end: this.stagesInChapter };
  private stages: Stage[] = [];
  private playerData: PlayerData;

  constructor() {
    super('AdventureScene');
    
  }

  async preload() {
    this.stages = stagesData.map(stage => ({
      ...stage,
      steps: stage.steps.map(step => ({
        ...step,
        type: StepType[step.type as keyof typeof StepType]  // Convert string to enum
      }))
    }));

    this.playerData = loadPlayerData();

    if (this.playerData) {
      console.log("AdventureScene")
      console.log("currentExp: " + this.playerData.currentExp + "; current step: " + this.playerData.progress.currentStep + "; currentStage: " + this.playerData.progress.currentStage);

      const currentStageGroup = Math.floor((this.playerData.progress.currentStage - 1) / this.stagesInChapter) + 1;
      const stageImage = `bg_stage_${currentStageGroup}`;
      this.load.image(stageImage, `assets/backgrounds/${stageImage}.png`);
    }
  }

  create() {
    const stageGroup = Math.floor((this.playerData.progress.currentStage - 1) / this.stagesInChapter) + 1;
    const stageImage = `bg_stage_${stageGroup}`;
    this.bg = this.add.image(0, 0, stageImage).setOrigin(0, 0);

    this.visibleStageRange.start = (stageGroup - 1) * this.stagesInChapter + 1;
    this.visibleStageRange.end = Math.min(this.visibleStageRange.start + this.stagesInChapter - 1, this.stages.length);

    this.setBackgroundPosition();
    this.placeStageMarkers();
    this.addDeckBuilderButton();
  }

  public getCurrentStage(): number {
    return this.playerData.progress.currentStage;
  }

  private setBackgroundPosition() {
    this.bg.setScale(1);
    const scale = this.scale.width / this.bg.width;
    this.bg.setScale(scale);

    const totalHeight = this.bg.height * scale;
    const offsetY = totalHeight - this.scale.height;

    // Calculate scroll progress from the bottom (start of story) to top (end of story)
    const groupStart = this.visibleStageRange.start;
    const groupEnd = this.visibleStageRange.end;
    const groupRange = groupEnd - groupStart;

    const stageProgressInGroup = this.playerData.progress.currentStage - groupStart;
    const scrollProgress = 1 - ((stageProgressInGroup / groupRange) * 0.9);

    const scrollY = offsetY * scrollProgress;
    this.bg.setY(-scrollY);
  }

  private placeStageMarkers() {
    const markerCount = this.visibleStageRange.end - this.visibleStageRange.start + 1;
    const spacing = this.scale.height / (markerCount + 1);
    const baseY = this.scale.height - spacing;

    for (let i = this.visibleStageRange.start; i <= this.visibleStageRange.end; i++) {
      const stageIndex = i - this.visibleStageRange.start;
      const x = this.scale.width / 2;
      const y = baseY - stageIndex * spacing;
      const stage = this.stages.find(s => s.stageNumber === i);

      if (i === this.playerData.progress.currentStage) {
        createSlantedFancyButton(this, x, y, stage ? stage.title : `Stage ${i}`, () => {
          if (this.playerData.progress.currentStep == 0)
            this.scene.start('StoryScene')
          else
            this.scene.start('ExplorationScene')
        }, 18, 30);
      } else {
        createDisabledSlantedFancyButton(this, x, y, stage ? stage.title : `Stage ${i}`, 18, 30);
      } 
    }
  }

  private addDeckBuilderButton() {
    createFancyButton(
      this,
      this.scale.width / 2,
      this.scale.height - 80,
      'Deck Builder',
      () => {
        this.scene.stop("AdventureScene");
        GlobalState.lastScene = this.scene.key;
        this.scene.start('DeckBuilderScene');
      }
    );    
  }
}
