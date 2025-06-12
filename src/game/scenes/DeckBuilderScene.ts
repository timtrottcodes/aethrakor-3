import Phaser from "phaser";
import { Card, CardFace, PlayerData, Rarity } from "../objects/objects";
import { renderPlayerCard } from "../utils/renderPlayerCard";
import { getMaxCardCost, loadPlayerData, savePlayerData } from "../utils/playerDataUtils";
import { CardManager } from "../objects/CardManager";

export default class DeckBuilderScene extends Phaser.Scene {
  private playerData!: PlayerData;
  private cardManager: CardManager;
  private collectionCardsContainers: Phaser.GameObjects.Container[] = [];
  private confirmButton!: Phaser.GameObjects.Text;
  private equippedGroup!: Phaser.GameObjects.Group;
  private collectionContainer: Phaser.GameObjects.Container;

  private maxEquippedCards = 5;

  constructor() {
    super("DeckBuilderScene");
  }

  create() {
    this.playerData = loadPlayerData();
    this.cardManager = new CardManager();

    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x222222)
      .setOrigin(0);

    this.add
      .text(this.scale.width / 2, 20, "Deck Builder", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    // Confirm button
    this.confirmButton = this.add
      .text(this.scale.width / 2, this.scale.height - 60, "Confirm Selection", {
        fontSize: "24px",
        color: "#fff",
        backgroundColor: "#555",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.confirmButton.on("pointerdown", () => {
      if (!this.confirmButton.active) return;
      // Confirm logic, e.g. save deck and exit
      savePlayerData(this.playerData);
      this.scene.start('CombatScene');
    });

    this.refreshUI();
  }

  private renderEquippedCards() {
    if (this.equippedGroup) this.equippedGroup.clear(true, true);
    this.equippedGroup = this.add.group();

    const startX = 20;
    const startY = 80;
    const spacing = 140;

    for (let i = 0; i < this.maxEquippedCards; i++) {
      const cardId = this.playerData.equippedCards[i];
      const cardData = cardId
        ? this.cardManager.getById(cardId)
        : {
            id: "",
            name: "Empty",
            cost: 0,
            description: "",
            imageUrl: "",
            rarity: Rarity.Common,
            attack: 0,
            health: 0,
          };

      const face = cardId ? CardFace.Front : CardFace.Back;
      const x = startX + i * spacing;
      const y = startY;
      const cardContainer = renderPlayerCard(
        this,
        cardData!,
        x,
        y,
        0.17,
        face,
        cardId
          ? () => {
              this.playerData.equippedCards[i] = "";
              this.refreshUI();
            }
          : undefined
      );

      this.equippedGroup.add(cardContainer);
    }
  }

  private createCollectionList() {
    const listX = 50;
    const listY = 320;
    const listWidth = this.scale.width - 100;
    const listHeight = 800; // more height for better scrolling

    if (this.collectionContainer) {
      this.collectionContainer.destroy(true); // true = also destroy all children recursively
    }

    // Create mask
    const maskShape = this.add.graphics();
    maskShape.fillRect(listX, listY, listWidth, listHeight);
    const mask = maskShape.createGeometryMask();

    // Scrollable container
    this.collectionContainer = this.add.container(listX, listY);
    this.collectionContainer.setMask(mask);

    this.collectionCardsContainers = [];
    let scrollY = 0;

    // Mouse wheel scroll
    const updateScroll = () => {
      scrollY = Phaser.Math.Clamp(
        scrollY,
        0,
        Math.max(0, this.collectionContainer.height - listHeight)
      );
      this.collectionContainer.y = listY - scrollY;

      // Update scrollbar position
      const percent = scrollY / (this.collectionContainer.height - listHeight);
      scrollbar.y = listY + percent * (listHeight - scrollbar.displayHeight);
    };

    // Scroll by reversed mouse wheel
    this.input.on("wheel", (_pointer: any, _go: any, _dx: any, dy: number) => {
      scrollY += dy; // reversed
      updateScroll();
    });

    // Drag scroll
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

    // Layout items vertically
    const itemPadding = 20;
    let currentY = 0;

    this.playerData.collection.forEach((cardId) => {
      const cardData = this.cardManager.getById(cardId);
      if (!cardData) return;

      // Card visual
      const cardContainer = renderPlayerCard(
        this,
        cardData,
        0,
        0,
        0.15,
        CardFace.Front
      );

      // Text info
      const textX = cardContainer.width + 20;
      const nameText = this.add
        .text(textX, 0, cardData.name, {
          fontSize: "20px",
          fontFamily: "Cinzel",
          color: "#ffffff",
        })
        .setOrigin(0, 0);
      const descText = this.add
        .text(textX, 30, cardData.description || "No description", {
          fontSize: "16px",
          wordWrap: { width: listWidth - textX - 20 },
          color: "#cccccc",
        })
        .setOrigin(0, 0);

      // Group as a single item
      const itemContainer = this.add.container(0, currentY, [
        cardContainer,
        nameText,
        descText,
      ]);
      itemContainer.setSize(
        listWidth,
        Math.max(cardContainer.height, descText.y + descText.height)
      );
      itemContainer.setInteractive(
        new Phaser.Geom.Rectangle(
          0,
          0,
          itemContainer.width,
          itemContainer.height
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Dim if already selected
      const isAlreadySelected = this.playerData.equippedCards.includes(cardId);
      const maxCardsReached = this.playerData.equippedCards.filter((id) => id !== "").length >= this.maxEquippedCards;

      if (isAlreadySelected || maxCardsReached) {
        itemContainer.setAlpha(0.4);
      } else {
        itemContainer.on("pointerdown", () => this.tryAddCard(cardId));
        cardContainer.on("card-clicked", () => this.tryAddCard(cardId));
      }

      this.collectionContainer.add(itemContainer);
      this.collectionCardsContainers.push(itemContainer);

      currentY += itemContainer.height + itemPadding;
    });

    // Set full height of scrollable content
    this.collectionContainer.height = currentY;

    // Scrollbar visual
    const scrollbarWidth = 6;
    const scrollbarHeight = Math.max(
      (listHeight / this.collectionContainer.height) * listHeight,
      20
    );
    const scrollbar = this.add
      .rectangle(
        listX + listWidth - scrollbarWidth,
        listY,
        scrollbarWidth,
        scrollbarHeight,
        0xffffff,
        0.4
      )
      .setOrigin(0, 0);
  }

  private tryAddCard(cardId: string) {
    const maxCost = getMaxCardCost(this.playerData.level);

    // Check if max equipped reached
    if (
      this.playerData.equippedCards.filter((id) => id !== "").length >=
      this.maxEquippedCards
    ) {
      return; // Cannot add more
    }

    // Check if already equipped
    if (this.playerData.equippedCards.includes(cardId)) {
      return; // Already equipped
    }

    const cardData = this.cardManager.getById(cardId);
    if (!cardData) return;

    // Calculate current total cost
    const totalCost = this.playerData.equippedCards.reduce((sum, id) => {
      if (!id) return sum;
      const card = this.cardManager.getById(id);
      return card ? sum + card.cost : sum;
    }, 0);

    if (totalCost + cardData.cost > maxCost) {
      // Exceeds cost limit
      return;
    }

    // Add to first empty slot
    for (let i = 0; i < this.maxEquippedCards; i++) {
      if (!this.playerData.equippedCards[i]) {
        this.playerData.equippedCards[i] = cardId;
        break;
      }
    }

    this.refreshUI();
  }

  private refreshUI() {
    this.renderEquippedCards();
    this.createCollectionList();

    const maxCost = getMaxCardCost(this.playerData.level);

    const totalCost = this.playerData.equippedCards.reduce((sum, id) => {
      if (!id) return sum;
      const card = this.cardManager.getById(id);
      return card ? sum + card.cost : sum;
    }, 0);

    const equippedCount = this.playerData.equippedCards.filter(
      (id) => id !== ""
    ).length;

    const isValid =
      equippedCount === this.maxEquippedCards && totalCost <= maxCost;
    this.confirmButton.setAlpha(isValid ? 1 : 0.5);
    this.confirmButton.disableInteractive();
    if (isValid) this.confirmButton.setInteractive({ useHandCursor: true });
  }
}
