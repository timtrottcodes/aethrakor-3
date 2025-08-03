import Phaser from "phaser";
import { Card, CardFace, Rarity, rarityCost, rarityOrder, SpecialAbility } from "../objects/objects";
import { renderPlayerCard } from "../utils/renderPlayerCard";
import { CardManager } from "../objects/CardManager";
import { GlobalState } from "../objects/globalState";
import { createFancyButton } from "../utils/button";
import { addUIOverlay } from "../utils/addUIOverlay";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { BaseScene } from "./BaseScene";

export default class DeckBuilderScene extends BaseScene {
  private cardManager: CardManager;
  private collectionCardsContainers: Phaser.GameObjects.Container[] = [];
  private equippedGroup!: Phaser.GameObjects.Group;
  private collectionContainer: Phaser.GameObjects.Container;
  private listBackground: Phaser.GameObjects.Rectangle;
  private maxEquippedCards = 5;
  private isValidDeck: boolean = false;
  private pointsText?: Phaser.GameObjects.Text;
  private scrollbar?: Phaser.GameObjects.Rectangle;

  constructor() {
    super("DeckBuilderScene");
  }

  create() {
    super.create();
    this.cardManager = new CardManager();

    const bg = this.add.image(0, 0, "deck-builder").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.4).setOrigin(0);
    const title = this.add
      .text(this.scale.width / 2, 40, "Deck Builder", {
        fontFamily: "Cinzel",
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.contentContainer.add([bg,overlay,title]);

    createFancyButton(this, this.scale.width / 2, this.scale.height - 60, "Confirm Selection", () => {
      if (this.isValidDeck) {
        this.closeDeckBuilderScene();
      }
    });

    addUIOverlay(this);
    this.refreshUI();
  }

  private renderEquippedCards() {
    if (this.equippedGroup && this.equippedGroup.children) this.equippedGroup.clear(true, true);
    this.equippedGroup = this.add.group();

    const startX = 20;
    const startY = 80;
    const spacing = 140;

    for (let i = 0; i < this.maxEquippedCards; i++) {
      const cardId = PlayerDataManager.instance.data.equippedCards[i];
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
            specialAbility: SpecialAbility.None,
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
              PlayerDataManager.instance.data.equippedCards[i] = "";
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

    let previousScrollY = this.collectionContainer ? listY - this.collectionContainer.y : 0;

    if (this.collectionContainer) {
      this.collectionContainer.destroy(true); // true = also destroy all children recursively
    }

    if (this.scrollbar) {
      this.scrollbar.destroy();
    }

    // Create mask
    const maskShape = this.add.graphics();
    maskShape.fillRect(listX, listY, listWidth, listHeight);
    const mask = maskShape.createGeometryMask();

    if (!this.listBackground) {
      this.listBackground = this.add
        .rectangle(listX - 10, listY - 10, listWidth + 20, listHeight + 20, 0x000000, 0.7)
        .setOrigin(0)
        .setName("listBackground");
      this.contentContainer.add(this.listBackground);
    }

    // Scrollable container
    this.collectionContainer = this.make.container({x: listX, y:listY, add:false});

    this.collectionContainer.setMask(mask);

    this.collectionCardsContainers = [];
    let scrollY = 0;

    // Mouse wheel scroll
    const updateScroll = () => {
      scrollY = Phaser.Math.Clamp(scrollY, 0, Math.max(0, this.collectionContainer.height - listHeight));
      this.collectionContainer.y = listY - scrollY;

      // Update scrollbar position
      const percent = scrollY / (this.collectionContainer.height - listHeight);
      this.scrollbar!.y = listY + percent * (listHeight - this.scrollbar!.displayHeight);
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

    const sortedCollection = PlayerDataManager.instance.data.collection
      .map((cardId) => this.cardManager.getById(cardId))
      .filter((card): card is Card => !!card)
      .sort((a, b) => {
        // Sort by rarity descending
        const rarityCompare = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityCompare !== 0) return rarityCompare;

        // Sort by cost descending
        const costCompare = rarityCost[b.rarity] - rarityCost[a.rarity];
        if (costCompare !== 0) return costCompare;

        // Sort by (attack + health) descending
        const powerA = a.attack + a.health;
        const powerB = b.attack + b.health;
        return powerB - powerA;
      });

    sortedCollection.forEach((cardId) => {
      const cardData = this.cardManager.getById(cardId.id);
      if (!cardData) return;

      // Card visual
      const cardContainer = renderPlayerCard(this, cardData, 0, 0, 0.15, CardFace.Front, () => this.tryAddCard(cardId.id));

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
      const itemContainer = this.add.container(0, currentY, [cardContainer, nameText, descText]);
      itemContainer.setSize(listWidth, Math.max(cardContainer.height, descText.y + descText.height));
      itemContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, itemContainer.width, itemContainer.height), Phaser.Geom.Rectangle.Contains);

      // Dim if already selected
      const isAlreadySelected = PlayerDataManager.instance.data.equippedCards.includes(cardId.id);
      const maxCardsReached = PlayerDataManager.instance.data.equippedCards.filter((id) => id !== "").length >= this.maxEquippedCards;

      if (isAlreadySelected || maxCardsReached) {
        itemContainer.setAlpha(0.4);
      } else {
        itemContainer.on("pointerdown", () => this.tryAddCard(cardId.id));
      }

      this.collectionContainer.add(itemContainer);
      this.collectionCardsContainers.push(itemContainer);

      currentY += itemContainer.height + itemPadding;
    });

    // Set full height of scrollable content
    this.collectionContainer.height = currentY;

    // Scrollbar visual
    const scrollbarWidth = 6;
    const scrollbarHeight = Math.max((listHeight / this.collectionContainer.height) * listHeight, 20);
    this.scrollbar = this.add.rectangle(listX + listWidth - scrollbarWidth, listY, scrollbarWidth, scrollbarHeight, 0xffffff, 0.4).setOrigin(0, 0);

    scrollY = Phaser.Math.Clamp(previousScrollY, 0, Math.max(0, this.collectionContainer.height - listHeight));
    this.collectionContainer.y = listY - scrollY;
    this.contentContainer.add(this.collectionContainer);
    updateScroll(); // also updates scrollbar position
  }

  private tryAddCard(cardId: string) {
    const maxCost = this.cardManager.getMaxCardCost(PlayerDataManager.instance.data.level);

    // Check if max equipped reached
    if (PlayerDataManager.instance.data.equippedCards.filter((id) => id !== "").length >= this.maxEquippedCards) {
      return; // Cannot add more
    }

    // Check if already equipped
    if (PlayerDataManager.instance.data.equippedCards.includes(cardId)) {
      return; // Already equipped
    }

    const cardData = this.cardManager.getById(cardId);
    if (!cardData) return;

    // Calculate current total cost
    const totalCost = PlayerDataManager.instance.data.equippedCards.reduce((sum, id) => {
      if (!id) return sum;
      const card = this.cardManager.getById(id);
      return card ? sum + rarityCost[card.rarity] : sum;
    }, 0);

    if (totalCost + rarityCost[cardData.rarity] > maxCost) {
      // Exceeds cost limit
      return;
    }

    // Add to first empty slot
    for (let i = 0; i < this.maxEquippedCards; i++) {
      if (!PlayerDataManager.instance.data.equippedCards[i]) {
        PlayerDataManager.instance.data.equippedCards[i] = cardId;
        break;
      }
    }

    this.refreshUI();
  }

  private refreshUI() {
    this.renderEquippedCards();
    this.createCollectionList();
    this.renderPlayerStats();

    const maxCost = this.cardManager.getMaxCardCost(PlayerDataManager.instance.data.level);

    const totalCost = PlayerDataManager.instance.data.equippedCards.reduce((sum, id) => {
      if (!id) return sum;
      const card = this.cardManager.getById(id);
      return card ? sum + rarityCost[card.rarity] : sum;
    }, 0);

    const equippedCount = PlayerDataManager.instance.data.equippedCards.filter((id) => id !== "").length;
    this.isValidDeck = equippedCount === this.maxEquippedCards && totalCost <= maxCost;
  }

  closeDeckBuilderScene() {
    this.scene.stop("DeckBuilderScene");
    if (GlobalState.lastScene) {
      this.scene.start(GlobalState.lastScene);
    }
  }

  private renderPlayerStats() {
    const maxCost = this.cardManager.getMaxCardCost(PlayerDataManager.instance.data.level);

    const totalCost = PlayerDataManager.instance.data.equippedCards.reduce((sum, id) => {
      if (!id) return sum;
      const card = this.cardManager.getById(id);
      return card ? sum + rarityCost[card.rarity] : sum;
    }, 0);

    const available = maxCost - totalCost;

    if (this.pointsText) this.pointsText.destroy(true);

    const txtAvailable = this.pointsText = this.add
      .text(this.scale.width / 2, 280, `Available Points: ${available}/${maxCost}`, {
        fontSize: "20px",
        fontFamily: "Cinzel",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.contentContainer.add(txtAvailable);
  }
}
