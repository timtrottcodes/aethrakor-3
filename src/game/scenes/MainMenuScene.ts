// scenes/MainMenuScene.ts
import Phaser from 'phaser';
import { createFancyButton } from '../utils/button';

export default class MainMenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private logo!: Phaser.GameObjects.Image;  
  private sublogo!: Phaser.GameObjects.Image;  
  
  constructor() {
    super('MainMenuScene');
  }

  create() {
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
  const y = this.scale.height * 0.7;
  
  createFancyButton(this, x, y, "Start Adventure", () => { this.scene.start('AdventureScene')});
}

}
