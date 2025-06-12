// scenes/CardDropScene.ts
import Phaser from 'phaser';

export default class CardDropScene extends Phaser.Scene {
  constructor() {
    super('CardDropScene');
  }

  preload() {
    this.load.image('bg_drop', 'assets/backgrounds/drop.jpg');
  }

  create() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_drop').setDisplaySize(this.scale.width, this.scale.height);

    const continueBtn = this.add.text(this.scale.width / 2, this.scale.height * 0.6, 'Continue', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    continueBtn.on('pointerdown', () => this.scene.start('VictoryScene'));
  }
}
