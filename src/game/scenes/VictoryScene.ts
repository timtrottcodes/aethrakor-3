// scenes/VictoryScene.ts
import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  preload() {
    this.load.image('bg_victory', 'assets/backgrounds/victory.jpg');
  }

  create() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_victory').setDisplaySize(this.scale.width, this.scale.height);

    const menuBtn = this.add.text(this.scale.width / 2, this.scale.height * 0.6, 'Main Menu', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
