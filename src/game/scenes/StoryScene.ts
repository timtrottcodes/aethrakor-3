import Phaser from 'phaser';
import { loadPlayerData } from '../utils/playerDataUtils';
import { PlayerData, Stage, StepType } from '../objects/objects';
import stagesData from '../data/stages.json';

export default class StoryScene extends Phaser.Scene {
  private playerData: PlayerData; 
  private stages: Stage[]; 
  private currentStage: Stage;
  private dialogContainer: Phaser.GameObjects.Container;
  private storyIndex: number = 0;

  constructor() {
    super('StoryScene');
  }

  preload() {
    this.playerData = loadPlayerData();
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
    this.storyIndex = 0;
    this.currentStage = this.stages.find(s => s.stageNumber === this.playerData.progress.currentStage)!;
    this.load.image(this.currentStage.image, `assets/backgrounds/stages/${this.currentStage.image}`);
    this.currentStage.story.forEach(s => {
      if (s.image != "")
        this.load.image(s.image, `assets/characters/${s.image}.jpg`);
    });
  }

  create() {
    
    this.add.image(0, 0, this.currentStage.image).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
    this.dialogContainer = this.add.container();
    this.showDialog();

    this.input.on('pointerdown', () => {
      this.storyIndex++;
      if (this.storyIndex < this.currentStage.story.length) {
        this.showDialog();
      } else {
          this.scene.start('ExplorationScene');
      }
    });
  }

  showDialog() {
    this.dialogContainer.removeAll(true);

    const entry = this.currentStage.story[this.storyIndex];
    const isNarrator = entry.name === 'Narrator';
    const isLeft = this.storyIndex % 2 === 0;

    // Portrait image
    const portrait = this.add.image(0, 0, entry.image).setDisplaySize(128, 128);
    if (entry.image === "") portrait.setVisible(false);

    // Create the text box
    const textBox = this.add.text(0, 0, entry.lines, {
      fontFamily: "Cinzel, serif",
      fontSize: '22px',
      color: '#ffffff',
      wordWrap: { width: 450 },
      padding: { x: 20, y: 20 },
    });

    // Calculate background dimensions
    const padding = 10;
    const bgWidth = textBox.width + padding * 2;
    const bgHeight = textBox.height + padding * 2;

    // Create a rounded rectangle background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6); // 60% transparent black
    bg.fillRoundedRect(0, 0, bgWidth, bgHeight, 16); // 16px radius

    // Group them in a container so they stay together
    const container = this.add.container(0, 0, [bg, textBox]);
    textBox.setPosition(padding, padding); // Offset text inside the background

    // Position everything
    if (isNarrator) {
      portrait.setPosition(this.scale.width / 2, 100).setOrigin(0.5, 0);
      container.setPosition(this.scale.width / 2 - bgWidth / 2, 240);
    } else if (isLeft) {
      portrait.setPosition(50, this.scale.height - 400).setOrigin(0, 0);
      container.setPosition(190, this.scale.height - 380);
    } else {
      portrait.setPosition(this.scale.width - 50, this.scale.height - 400).setOrigin(1, 0);
      container.setPosition(this.scale.width - 190 - bgWidth, this.scale.height - 380);
    }

    this.dialogContainer.add([portrait, container]);
  }

}
