import Phaser from "phaser";
import { CardFace, rarityOrder } from "../objects/objects";
import { renderPlayerCard } from "../utils/renderPlayerCard";
import { CardManager } from "../objects/CardManager";
import { createFancyButton } from "../utils/button";
import { addUIOverlay } from "../utils/addUIOverlay";
import { PlayerDataManager } from "../objects/PlayerDataManager";

export default class CollectionScene extends Phaser.Scene {
  private cardManager: CardManager;
  private collectionContainer!: Phaser.GameObjects.Container;
  private scrollbar?: Phaser.GameObjects.Rectangle;
  private listBackground!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("CollectionScene");
    this.cardManager = new CardManager();
  }

  create() {
    addUIOverlay(this);

    this.add.image(0, 0, "deck-builder").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.4).setOrigin(0);

    this.add
      .text(this.scale.width / 2, 40, "Card Collection", {
        fontFamily: "Cinzel",
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    createFancyButton(this, this.scale.width / 2, this.scale.height - 60, "Back to Menu", () => this.scene.start("MainMenuScene")).setDepth(10);

    this.createCollectionList();
  }

  private createCollectionList() {
    const listX = 50;
    const listY = 90;
    const listWidth = this.scale.width - 100;
    const listHeight = this.scale.height - 200;
    const cardScale = 0.24;
    const columns = 3;
    const padding = 20;

    // Destroy previous if reloaded
    if (this.collectionContainer) this.collectionContainer.destroy(true);
    if (this.scrollbar) this.scrollbar.destroy();
    if (this.listBackground) this.listBackground.destroy();

    this.listBackground = this.add.rectangle(listX - 10, listY - 10, listWidth + 20, listHeight + 20, 0x000000, 0.7).setOrigin(0);

    const maskShape = this.add.graphics();
    maskShape.fillRect(listX, listY, listWidth, listHeight);
    const mask = maskShape.createGeometryMask();

    this.collectionContainer = this.add.container(listX, listY);
    this.collectionContainer.setMask(mask);

    const allCards = this.cardManager.getAll().sort((a, b) => {
      const rarityCompare = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityCompare !== 0) return rarityCompare;
      return a.name.localeCompare(b.name);
    });

    let scrollY = 0;
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;

    allCards.forEach((card, index) => {
      const isOwned = PlayerDataManager.instance.data.collection.includes(card.id);
      const face = isOwned ? CardFace.Front : CardFace.Back;

      const cardContainer = renderPlayerCard(this, card, 0, 0, cardScale, face, () => {
        if (face === CardFace.Front) this.scene.launch("CardPreviewScene", { data: card });
        else null;
      });

      const cardWidth = cardContainer.getBounds().width;
      const cardHeight = cardContainer.getBounds().height;

      cardContainer.x = currentX;
      cardContainer.y = currentY;

      this.collectionContainer.add(cardContainer);

      currentX += cardWidth + padding;
      rowHeight = Math.max(rowHeight, cardHeight);

      if ((index + 1) % columns === 0) {
        currentX = 0;
        currentY += rowHeight + padding;
        rowHeight = 0;
      }
    });

    // Set height of scrollable container
    this.collectionContainer.height = currentY + rowHeight;

    // Scrollbar
    const scrollbarWidth = 6;
    const scrollbarHeight = Math.max((listHeight / this.collectionContainer.height) * listHeight, 20);
    this.scrollbar = this.add.rectangle(listX + listWidth - scrollbarWidth, listY, scrollbarWidth, scrollbarHeight, 0xffffff, 0.4).setOrigin(0, 0);

    // Scrolling logic
    const updateScroll = () => {
      scrollY = Phaser.Math.Clamp(scrollY, 0, Math.max(0, this.collectionContainer.height - listHeight));
      this.collectionContainer.y = listY - scrollY;
      const percent = scrollY / (this.collectionContainer.height - listHeight);
      this.scrollbar!.y = listY + percent * (listHeight - this.scrollbar!.displayHeight);
    };

    this.input.on("wheel", (_pointer: any, _go: any, _dx: any, dy: number) => {
      scrollY += dy;
      updateScroll();
    });

    let isDragging = false;
    let startY = 0;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      isDragging = pointer.y >= listY && pointer.y <= listY + listHeight;
      startY = pointer.y;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!isDragging || !pointer.isDown) return;
      const dragDelta = pointer.y - startY;
      scrollY = scrollY - dragDelta;
      updateScroll();
      startY = pointer.y;
    });

    this.input.on("pointerup", () => (isDragging = false));

    updateScroll();
  }
}
