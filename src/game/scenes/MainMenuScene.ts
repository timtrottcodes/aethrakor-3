// scenes/MainMenuScene.ts
import Phaser from 'phaser';

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

  // Create a container to hold the button background and text
  const container = this.add.container(x, y).setAlpha(0).setSize(250, 60).setInteractive();

  // Create a graphics object for the button background with gradient
  const graphics = this.add.graphics();

  // Draw a rounded rectangle with gradient fill
  const width = 250;
  const height = 60;
  const radius = 10;

  // Create a dark grey vertical gradient using texture
  const gradientTexture = this.textures.createCanvas('buttonGradient', width, height);
  if (gradientTexture) {
    const ctx = gradientTexture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2f2f2f'); // dark grey top
    gradient.addColorStop(1, '#1a1a1a'); // darker grey bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    gradientTexture.refresh();
  }

  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  graphics.lineStyle(2, 0xffffff, 0.3);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  // Instead of fillStyle using texture (not straightforward in Phaser.Graphics), 
  // just use the texture as an image behind text for gradient effect:
  graphics.clear();
  const bgImage = this.add.image(0, 0, 'buttonGradient').setDisplaySize(width, height).setOrigin(0.5);
  bgImage.setMask(
    new Phaser.Display.Masks.GeometryMask(this, graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius))
  );

  // Add the rounded rectangle background
  graphics.fillStyle(0x2f2f2f, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  graphics.lineStyle(2, 0xffffff, 0.3);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  // Add the background and graphics to container
  container.add([graphics, bgImage]);

  // Create the text label centered on button
  const playBtn = this.add.text(0, 0, 'Start Adventure', {
    fontFamily: 'Cinzel',
    fontSize: '28px',   
  }).setOrigin(0.5);

  container.add(playBtn);

  // Make the container interactive (pointer cursor)
  container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
  container.on('pointerover', () => {
    graphics.clear();
    graphics.fillStyle(0x444444, 1);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  });
  container.on('pointerout', () => {
    graphics.clear();
    graphics.fillStyle(0x2f2f2f, 1);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  });
  container.on('pointerdown', () => {
    this.scene.start('StoryScene');
  });

  // Fade in the button container
  this.tweens.add({
    targets: container,
    alpha: 1,
    duration: 500,
  });
}

}
