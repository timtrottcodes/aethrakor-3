import { Card, CardFace } from "../objects/objects";
import { renderPlayerCard } from "../utils/renderPlayerCard";

export class CardPreviewScene extends Phaser.Scene {
  private cardData!: Card;

  constructor() {
    super({ key: "CardPreviewScene" });
  }

  init(data: { data: Card }) {
    this.cardData = data.data;
  }

  create() {
    const { width: screenWidth, height: screenHeight } = this.scale;

    const overlay = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.9).setOrigin(0).setInteractive();

    const scaleFactor = Math.min(screenWidth / 768, screenHeight / 1024) * 0.8;

    const card = renderPlayerCard(this, this.cardData, 0, 0, 1, CardFace.Front);
    const bounds = card.getBounds();

    // Create a parent container to center-scale the card
    const centeredContainer = this.add.container(screenWidth / 2, screenHeight / 2);
    card.x = -bounds.width / 2;
    card.y = -bounds.height / 2;
    centeredContainer.add(card);
    centeredContainer.setScale(0); // Start small for tween animation

    this.tweens.add({
      targets: centeredContainer,
      scale: scaleFactor,
      ease: "Back.Out",
      duration: 300,
    });

    overlay.once("pointerdown", () => {
      this.closePreview(centeredContainer);
    });

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Cinzel",
      fontSize: "22px",
      color: "#ffd700", // gold
      stroke: "#000",
      strokeThickness: 2,
      align: "center",
    };
    const descriptionText = this.add
      .text(this.scale.width / 2, screenHeight - 200, "", style)
      .setDepth(10)
      .setOrigin(0.5, 0)
      .setWordWrapWidth(600);
    descriptionText.setText(this.cardData.description);
  }

  private closePreview(container: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: container,
      scale: 0,
      ease: "Back.In",
      duration: 250,
      onComplete: () => {
        this.scene.stop();
      },
    });
  }
}
