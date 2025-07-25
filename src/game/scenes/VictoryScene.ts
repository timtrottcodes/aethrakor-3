import Phaser from "phaser";
import { initAudioManager, playMusic } from "../utils/audio";

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  preload() {
    this.load.image("victory-bg", "assets/backgrounds/victory.jpg"); // Replace with your image path
    this.load.image("confetti", "assets/ui/confetti.png"); // Particle texture
  }

  create() {
    const { width, height } = this.scale;

    initAudioManager(this);
    playMusic(this, "victory");

    // Background
    this.add.image(width / 2, height / 2, "victory-bg").setDisplaySize(width, height);

    // Semi-transparent rounded rectangle overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRoundedRect(40, 100, width - 80, height - 300, 30);

    // Victory Text
    const storyText =
      "After a long and perilous journey,\n" +
      "you entered the realm of the Lich King,\n" +
      "braving darkness, monsters, and traps.\n\n" +
      "Against all odds, you triumphed in battle\n" +
      "and rescued the princess from her eternal prison.\n\n" +
      "Your tale became legend, and together,\n" +
      "you lived happily ever after.";

    this.add
      .text(width / 2, 140, storyText, {
        fontFamily: "Cinzel",
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 120 },
      })
      .setOrigin(0.5, 0)
      .setDepth(1);

    // Confetti Particle Emitter
    this.add.particles(0, 0, "confetti", {
      x: { min: 0, max: width },
      y: 0,
      lifespan: 4300,
      speedY: { min: 100, max: 300 },
      scale: { start: 0.5, end: 0 },
      quantity: 4,
      frequency: 200,
      rotate: { min: -180, max: 180 },
      blendMode: "ADD",
      color: [0xffffff, 0xffff00, 0x00ff00, 0xff0000],
    });

    // Main Menu Button
    const button = this.add
      .text(width / 2, height - 100, "Main Menu", {
        fontFamily: "Cinzel",
        fontSize: "36px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      this.scene.start("MainMenuScene"); // Adjust if your menu scene is named differently
    });
  }
}
