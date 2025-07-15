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
    this.load.image("bg_main", "backgrounds/menu.jpg");

    cardData.forEach((card) => {
      this.load.image(`${card.id}`, `cards/${card.id}.jpg`);
    });

    monsterData.forEach((monster) => {
      this.load.image(`${monster.id}`, `monsters/${monster.id}.jpg`);
    });

    this.load.image("card_back", "ui/card-back.jpg");
    this.load.image("card-back-adventure", "ui/card-back-adventure.jpg");
    this.load.image("card_selection", "ui/card-back-selection.jpg");
    this.load.image("card_continue", "ui/card_continue.jpg");
    this.load.image("card_battle", "ui/card_battle.jpg");
    this.load.image("card_drop", "ui/card_drop.jpg");
    this.load.image("deck-builder", "backgrounds/deck-builder.jpg");
    this.load.image("scratch", "ui/scratch.png");
    this.load.image("star", "ui/11571051.png");
    this.load.image("confetti", "ui/confetti.png");

    this.load.audio('click', 'sfx/button-click-289742.mp3');
    this.load.audio('foot', 'sfx/st2-footstep-sfx-323055.mp3');
    this.load.audio('horn', 'sfx/relaxing-music-original-viking-attacking-battle-horn-116623.mp3');
    this.load.audio('fanfare', 'sfx/success-fanfare-trumpets-6185.mp3');
    this.load.audio('punch', 'sfx/punch-140236.mp3');
    this.load.audio('swordhit', 'sfx/hit-swing-sword-small-2-95566.mp3');
    this.load.audio('scratch', 'sfx/paper-rip-fast-252617.mp3');

    this.load.audio('title', 'sfx/music-intro.mp3');
    this.load.audio('battle', 'sfx/music-battle.mp3');
    this.load.audio('bossbattle', 'sfx/music-boss-battle.mp3');
    this.load.audio('defeat', 'sfx/music-defeat.mp3');
    this.load.audio('victory', 'sfx/music-victory.mp3');

    this.load.audio('music_stage_1', 'sfx/music_stage_1.mp3');
    this.load.audio('music_stage_2', 'sfx/music_stage_2.mp3');
    this.load.audio('music_stage_3', 'sfx/music_stage_3.mp3');
    this.load.audio('music_stage_4', 'sfx/music_stage_4.mp3');
    this.load.audio('music_stage_5', 'sfx/music_stage_5.mp3');
    this.load.audio('music_stage_6', 'sfx/music_stage_6.mp3');
    this.load.audio('music_stage_7', 'sfx/music_stage_7.mp3');
    this.load.audio('music_stage_8', 'sfx/music_stage_8.mp3');
    this.load.audio('music_stage_9', 'sfx/music_stage_9.mp3');
    this.load.audio('music_stage_10', 'sfx/music_stage_10.mp3');
  }

  async create() {
    await this.loadWebFont("Cinzel", "https://fonts.gstatic.com/s/cinzel/v25/8vIJ7ww63mVu7gt79mT7.woff2");
    await this.loadWebFont("Trade Winds", "https://fonts.gstatic.com/s/tradewinds/v17/AYCPpXPpYNIIT7h8-QenM0Jt5vM.woff2");

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenuScene");
  }

  async loadWebFont(fontName: string, url: string): Promise<void> {
    // Build a FontFace instance with Google Fonts URL
    const font = new FontFace(
      fontName,
      'url('+url+')'
    );

    try {
      const loadedFont = await font.load();
      (document as any).fonts.add(loadedFont);

      await (document as any).fonts.ready;
    } catch (err) {
      console.warn(`Failed to load font ${fontName}`, err);
    }
  }
}
