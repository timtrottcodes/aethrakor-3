// scenes/CardDropScene.ts
import Phaser from "phaser";
import { GlobalState } from "../objects/globalState";
import { CardManager } from "../objects/CardManager";
import { renderPlayerCard } from "../utils/renderPlayerCard";
import { CardFace } from "../objects/objects";
import { initAudioManager, playSound } from "../utils/audio";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { BaseScene } from "./BaseScene";

export default class CardDropScene extends BaseScene {
  constructor() {
    super("CardDropScene");
  }

  preload() {
    this.load.image("bg_drop", "assets/backgrounds/drop.jpg");
  }

  create() {
    super.create();
    const cardManager = new CardManager();

    initAudioManager(this);

    var randomCard = cardManager.getWeightedRandomCardDrop(PlayerDataManager.instance.data.collection, PlayerDataManager.instance.data.level);
    if (randomCard) {
      PlayerDataManager.instance.data.collection.push(randomCard.id);

      playSound(this, "fanfare");

      // Add overlay
      const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "bg_drop").setDisplaySize(this.scale.width, this.scale.height);
      const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0).setInteractive();
      overlay.once("pointerdown", () => {
        this.closeDropScene();
      });

      // Add fireworks
      const particles = this.add.particles(this.scale.width / 2, this.scale.height / 2, "star", {
        speed: { min: -400, max: 400 },
        lifespan: 3000,
        gravityY: 0,
      });

      // Show dropped card
      const { width: screenWidth, height: screenHeight } = this.scale;
      const scaleFactor = Math.min(screenWidth / 768, screenHeight / 1024) * 0.8;

      const card = renderPlayerCard(this, randomCard, 0, 0, 1, CardFace.Front, () => this.closeDropScene());
      const bounds = card.getBounds();
      const centeredContainer = this.add.container(screenWidth / 2, screenHeight / 2);
      card.x = -bounds.width / 2;
      card.y = -bounds.height / 2;
      centeredContainer.add(card);
      centeredContainer.setScale(0); // Start small for tween animation

      // Show description
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
      descriptionText.setText(randomCard.description);

      const title = this.add.text(this.scale.width / 2, 80, "New Companion Found!", { fontFamily: "Cinzel", fontSize: "32px", color: "#ffffff" }).setOrigin(0.5);
      const help = this.add.text(this.scale.width / 2, 125, "Visit the Deck Builder to add review and add to your champions.", { fontFamily: "Cinzel", fontSize: "18px", color: "#ffffff" }).setOrigin(0.5);

      // Animate
      this.tweens.add({
        targets: centeredContainer,
        scale: scaleFactor,
        ease: "Back.Out",
        duration: 300,
      });

      this.contentContainer.add([bg,overlay,particles,centeredContainer,descriptionText, title, help]);
    } else {
      this.closeDropScene();
    }
  }

  closeDropScene() {
    this.scene.stop("CardDropScene");
    if (GlobalState.lastScene) {
      this.scene.start(GlobalState.lastScene);
    }
  }
}
