import Phaser from "phaser";
import { addUIOverlay } from "../utils/addUIOverlay";
import { BaseScene } from "./BaseScene";

export default class HowToPlayScene extends BaseScene {
  private scrollY = 0;
  private contentHeight = 0;
  private scrollMask!: Phaser.Display.Masks.GeometryMask;
  private content!: Phaser.GameObjects.Container;
  private maxScrollY = 0;

  constructor() {
    super("HowToPlayScene");
  }

  create() {
    super.create();

    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, "deck-builder").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0);
    const title = this.add
      .text(width / 2, 80, "How to Play", {
        fontFamily: "Cinzel",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Scrollable content container
    this.content = this.make.container({x:0, y:0, add:false});

    const instructions = [
      "You start the game with 8 random cards.",
      "5 of these cards form your starting deck.",
      "As you progress, you discover more cards.",
      "Use the Deck Builder to customize your deck.",
      "",
      "The game has 10 chapters with 5 stages each.",
      "Each stage has an exploration phase.",
      "During exploration, choose 1 card out of 3.",
      "Cards may progress you, trigger combat, or give a new card.",
      "",
      "Combat is turn-based. You attack first.",
      "Use your 5-card deck during combat.",
      "Each card has a cost shown in the top-left.",
      "The cards HP is shown bottom left.",
      "The cards Attack is shown in the right.",
      "Your total deck cost cannot exceed your max cost.",
      "Max cost increases as you level up.",
      "",
      "If you're stuck, use Random Battle from the main menu.",
      "Random Battles give extra card rewards.",
      "",
      "Use the Deck Builder to choose your best 5 cards.",
      "Try to maximize power while staying within your cost limit.",
      "",
      "The Collection screen shows how many cards you've discovered.",
      "Aim to collect them all!",
    ];

    const style = {
      fontFamily: "Cinzel",
      fontSize: "24px",
      color: "#ffffff",
      wordWrap: { width: width - 100 },
      align: "left" as const,
    };

    let yOffset = 0;
    instructions.forEach((line) => {
      const lineText = this.add.text(50, yOffset, line, style);
      this.content.add(lineText);
      yOffset += line === "" ? 20 : lineText.height + 10;
    });

    this.contentHeight = yOffset;
    this.maxScrollY = Math.max(0, this.contentHeight - height + 180); // account for bottom button
    this.content.y = 150;

    // Scrolling mask
    const shape = this.make.graphics({});
    shape.fillStyle(0xffffff);
    shape.fillRect(0, 150, width, height - 300);
    this.scrollMask = shape.createGeometryMask();
    this.content.setMask(this.scrollMask);

    // Input: drag to scroll
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;

      this.scrollY -= pointer.velocity.y * 0.02;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY);
      this.content.y = 150 - this.scrollY;
    });

    // Main Menu Button
    const btn = this.add
      .text(width / 2, height - 80, "Main Menu", {
        fontFamily: "Cinzel",
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#444",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      this.scene.start("MainMenuScene");
    });

    this.contentContainer.add([bg,overlay,title,this.content,btn]);
    addUIOverlay(this);
  }
}
