import Phaser from "phaser";
import { playSound } from "../utils/audio";
import { PlayerDataManager } from "../objects/PlayerDataManager";

export class BaseScene extends Phaser.Scene {
  public contentContainer!: Phaser.GameObjects.Container;
  protected baseWidth = 720;
  protected baseHeight = 1280;

  constructor(sceneKey: string) {
    super(sceneKey);
  }

  create() {
    // Create a container to hold all scene content
    this.contentContainer = this.add.container(0, 0);

    // Initial scale
    this.scaleContent();

    // Recalculate on window resize
    this.scale.on('resize', this.scaleContent, this);

    this.input.on("pointerdown", () => {
        playSound(this, "click");
        if (PlayerDataManager.instance.data.settings.vibration && navigator.vibrate) {
            navigator.vibrate(10); // vibrate for 10ms
        }
    });
  }

  /**
   * Scale the content container to fit the screen
   */
  private scaleContent() {
    const { width, height } = this.scale.gameSize;

    const scaleX = width / this.baseWidth;
    const scaleY = height / this.baseHeight;
    const scale = Math.min(scaleX, scaleY);

    this.contentContainer.setScale(scale);

    // Center the content container
    const offsetX = (width - this.baseWidth * scale) / 2;
    const offsetY = (height - this.baseHeight * scale) / 2;

    this.contentContainer.setPosition(offsetX, offsetY);
  }
}
