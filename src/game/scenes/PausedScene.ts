import { BaseScene } from "./BaseScene";

export default class PausedScene extends BaseScene {
  private onResumeCallback?: () => void;

  constructor() {
    super("paused");
  }

  init(data: { onResume?: () => void }) {
    this.onResumeCallback = data.onResume;
  }

  create() {
    super.create();
    const { width, height } = this.scale;

    // Dim overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0);

    // Gold border inset by 15px
    const border = this.add.graphics();
    const inset = 15;
    border.lineStyle(1, 0xffd700, 1);
    border.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    // Pause text with Cinzel font
    const text = this.add.text(width / 2, height / 2, "Game Paused", {
      fontFamily: "Cinzel, serif",
      fontSize: "36px",
      color: "#FFD700",
      align: "center",
      stroke: "#000000",
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 4,
        fill: true,
      },
    });
    text.setOrigin(0.5);

    const subtext = this.add.text(width / 2, height / 2 + 50, "Click or press any key to resume", {
      fontFamily: "Cinzel, serif",
      fontSize: "18px",
      color: "#FFFFFF",
      align: "center",
    });
    subtext.setOrigin(0.5);

    // Input to resume
    this.input.once("pointerdown", () => this.resumeGame());
    this.input.keyboard?.once("keydown", () => this.resumeGame());

    this.contentContainer.add([overlay,border,text,subtext]);
  }

  private resumeGame() {
    if (this.onResumeCallback) {
      this.onResumeCallback();
    }
  }
}
