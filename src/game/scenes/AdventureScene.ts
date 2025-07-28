// scenes/AdventureScene.ts
import Phaser from "phaser";
import { Stage } from "../objects/objects";
import { createDisabledSlantedFancyButton, createFancyButton, createSlantedFancyButton } from "../utils/button";
import { GlobalState } from "../objects/globalState";
import { initAudioManager, playMusic } from "../utils/audio";
import { addUIOverlay } from "../utils/addUIOverlay";
import { StageManager } from "../objects/StageManager";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { BaseScene } from "./BaseScene";

export default class AdventureScene extends BaseScene {
  private bg!: Phaser.GameObjects.Image;
  private stagesInChapter = 5;
  private visibleStageRange = { start: 1, end: this.stagesInChapter };
  private stages: Stage[] = [];

  constructor() {
    super("AdventureScene");
  }

  async preload() {
    this.stages = StageManager.instance.stages;

    const currentStageGroup = Math.floor((PlayerDataManager.instance.data.progress.currentStage - 1) / this.stagesInChapter) + 1;
    const stageImage = `bg_stage_${currentStageGroup}`;
    this.load.image(stageImage, `assets/backgrounds/chapters/${stageImage}.jpg`);
  }

  create() {
    super.create();
    initAudioManager(this);

    const stageGroup = Math.floor((PlayerDataManager.instance.data.progress.currentStage - 1) / this.stagesInChapter) + 1;
    const stageImage = `bg_stage_${stageGroup}`;
    const stageMusic = `music_stage_${stageGroup}`;
    this.bg = this.add.image(0, 0, stageImage).setOrigin(0, 0);
    this.contentContainer.add(this.bg);

    this.visibleStageRange.start = (stageGroup - 1) * this.stagesInChapter + 1;
    this.visibleStageRange.end = Math.min(this.visibleStageRange.start + this.stagesInChapter - 1, this.stages.length);

    playMusic(this, stageMusic);

    this.setBackgroundPosition();
    this.placeStageMarkers();
    this.addDeckBuilderButton();
    this.addMainMenuButton();
    addUIOverlay(this);
  }

  public getCurrentStage(): number {
    return PlayerDataManager.instance.data.progress.currentStage;
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

    const stageProgressInGroup = PlayerDataManager.instance.data.progress.currentStage - groupStart;
    const scrollProgress = 1 - (stageProgressInGroup / groupRange) * 0.9;

    const scrollY = offsetY * scrollProgress;
    this.bg.setY(-scrollY);
  }

  private placeStageMarkers() {
    const markerCount = this.visibleStageRange.end - this.visibleStageRange.start + 1;
    const spacing = this.scale.height / (markerCount + 1);
    const baseY = this.scale.height - spacing - 100;

    for (let i = this.visibleStageRange.start; i <= this.visibleStageRange.end; i++) {
      const stageIndex = i - this.visibleStageRange.start;
      const x = this.scale.width / 2;
      const y = baseY - stageIndex * spacing;
      const stage = this.stages.find((s) => s.stageNumber === i);

      if (i === PlayerDataManager.instance.data.progress.currentStage) {
        createSlantedFancyButton(
          this,
          x,
          y,
          stage ? stage.title : `Stage ${i}`,
          () => {
            if (PlayerDataManager.instance.data.progress.currentStep == 0) this.scene.start("StoryScene");
            else this.scene.start("ExplorationScene");
          },
          18,
          30
        );
      } else {
        createDisabledSlantedFancyButton(this, x, y, stage ? stage.title : `Stage ${i}`, 18, 30);
      }
    }
  }

  private addDeckBuilderButton() {
    createFancyButton(this, this.scale.width / 2, this.scale.height - 150, "Deck Builder", () => {
      this.scene.stop("AdventureScene");
      GlobalState.lastScene = this.scene.key;
      this.scene.start("DeckBuilderScene");
    });
  }

  private addMainMenuButton() {
    createFancyButton(this, this.scale.width / 2, this.scale.height - 80, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
