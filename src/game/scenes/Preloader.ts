import { Scene } from "phaser";
import cardData from "../data/cards.json";
import monsterData from "../data/monsters.json";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const barWidth = 468;
    const barHeight = 32;

    // Black background covering entire scene
    this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    );

    // Outline of progress bar (centered)
    const outline = this.add.rectangle(centerX, centerY, barWidth, barHeight);
    outline.setStrokeStyle(2, 0xffffff);

    // Progress bar itself: start with minimal width
    const bar = this.add.rectangle(
      centerX - barWidth / 2,
      centerY,
      1,
      barHeight - 4,
      0xffffff
    );
    bar.setOrigin(0, 0.5); // anchor left center to grow width to the right

    // Optional: percentage text below bar
    const percentText = this.add
      .text(centerX, centerY + barHeight, "0%", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0);

    // Listen to progress event to update bar width and percent
    this.load.on("progress", (progress: number) => {
      bar.width = barHeight - 4 + (barWidth - (barHeight - 4)) * progress;
      percentText.setText(Math.round(progress * 100) + "%");
    });

    // Clean up after load completes (optional)
    this.load.on("complete", () => {
      percentText.destroy();
      bar.destroy();
      outline.destroy();
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
    this.load.image("logo", "logo.png");
    this.load.image("sublogo", "sublogo.png");
    this.load.image("bg_main", "backgrounds/menu.png");

    cardData.forEach((card) => {
      this.load.image(`${card.id}`, `cards/${card.id}.png`);
    });

    monsterData.forEach((monster) => {
      this.load.image(`${monster.id}`, `monsters/${monster.id}.png`);
    });

    this.load.image("card_back", "ui/card-back.png");
    this.load.image("card-back-adventure", "ui/card-back-adventure.png");
    this.load.image("card_selection", "ui/card-back-selection.png");
    this.load.image("card_continue", "ui/card_continue.png");
    this.load.image("card_battle", "ui/card_battle.png");
    this.load.image("card_drop", "ui/card_drop.png");
    this.load.image("deck-builder", "backgrounds/deck-builder.png");
    this.load.image("scratch", "ui/scratch.png");
    this.load.image("star", "ui/11571051.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenuScene");
  }
}
