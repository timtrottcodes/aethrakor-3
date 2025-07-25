import { Card, CardFace, Rarity, rarityColors, rarityCost } from "../objects/objects";

export function renderPlayerCard(scene: Phaser.Scene, card: Card, x: number, y: number, scale: number = 1, face: CardFace = CardFace.Front, onClick?: () => void): Phaser.GameObjects.Container {
  const baseWidth = 768;
  const baseHeight = 1024;
  const cornerRadius = 6;

  const scaleWidth = baseWidth * scale;
  const scaleHeight = baseHeight * scale;

  // Create the container positioned at x, y
  const container = scene.add.container(x, y);
  container.setSize(scaleWidth, scaleHeight);

  // Background image or front rendering
  if (face === CardFace.Front) {
    renderCardFront(scene, container, card, scale, baseWidth, baseHeight, cornerRadius);

    const health = 100;
    const healthPercent = health / 100;
    const healthOverlayHeight = scaleHeight * healthPercent;
    const healthOverlayColor = 0x808080;
    const healthOverlay = scene.add
      .rectangle(0, healthOverlayHeight, scaleWidth, scaleHeight - healthOverlayHeight, healthOverlayColor, 0.7) // Initial height is 0 (full health)
      .setOrigin(0) // Anchor to bottom center
      .setVisible(true);

    // Name this child so we can find it later
    healthOverlay.name = "healthOverlay";
    container.add(healthOverlay);
  } else {
    const backImage = scene.add.image(0, 0, "card_back").setOrigin(0).setDisplaySize(scaleWidth, scaleHeight);
    container.add(backImage);
  }

  if (onClick) {
    const hitArea = scene.add.rectangle(0, 0, scaleWidth, scaleHeight).setOrigin(0).setInteractive({ useHandCursor: true }).setVisible(true);
    hitArea.on("pointerdown", () => {
      onClick();
    });
    container.add(hitArea);
  }

  container.name = card.id;
  return container;
}

export function updateHealthOverlay(container: Phaser.GameObjects.Container, healthPercent: number = 100) {
  const overlay = container.getByName("healthOverlay") as Phaser.GameObjects.Rectangle;
  if (!overlay) return;

  const healthOverlayHeight = container.height - container.height * (healthPercent / 100);
  const healthOverlayColor = 0x333333;
  overlay.height = healthOverlayHeight;
  overlay.y = container.height - healthOverlayHeight;
  overlay.fillColor = healthOverlayColor;
}

function renderCardFront(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number, width: number, height: number, cornerRadius: number) {
  const cardImage = scene.add
    .image(0, 0, `${card.id}`)
    .setOrigin(0)
    .setDisplaySize(width * scale, height * scale);
  container.add(cardImage);

  renderLevelBadge(scene, container, card, scale);
  renderRarityStars(scene, container, card, scale, width);
  renderNameBar(scene, container, card, scale, width, height);
  renderAttackBadge(scene, container, card, scale, width, height);
  renderHealthBadge(scene, container, card, scale, height);
  renderCardBorder(scene, container, scale, width, height, cornerRadius, card.rarity);
}

function renderLevelBadge(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number) {
  const levelX = 80 * scale;
  const levelY = 80 * scale;

  const backgroundfontSize = Math.max(120 * scale, 30);

  // Create the text object
  const levelBackground = scene.add
    .text(levelX, levelY, "⬟", {
      fontFamily: "Arial",
      fontSize: `${backgroundfontSize}px`,
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  scene.time.delayedCall(0, () => {
    applyStyledGradient(levelBackground, rarityColors[card.rarity]);
  });

  container.add(levelBackground);

  // Draw cost text
  const levelfontSize = Math.max(70 * scale, 14);
  const levelText = scene.add
    .text(levelX, levelY, rarityCost[card.rarity].toString(), {
      fontFamily: "Cinzel",
      fontSize: `${levelfontSize}px`,
      fontStyle: `bold`,
      color: "#111",
    })
    .setOrigin(0.5);
  container.add(levelText);
}

function renderHealthBadge(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number, height: number) {
  const levelX = 80 * scale;
  const levelY = height * scale - Math.max(80 * scale, 12);

  const backgroundfontSize = Math.max(120 * scale, 21);
  const levelBackground = scene.add
    .text(levelX, levelY, "❤", {
      fontFamily: "Arial",
      fontSize: `${backgroundfontSize}px`,
      fontStyle: `bold`,
      color: "#000000",
    })
    .setOrigin(0.5);

  scene.time.delayedCall(0, () => {
    applyStyledGradient(levelBackground, "#ea2803");
  });
  container.add(levelBackground);

  // Draw cost text
  const levelfontSize = Math.max(70 * scale, 14);
  const levelText = scene.add
    .text(levelX, levelY, card.health.toString(), {
      fontFamily: "Cinzel",
      fontSize: `${levelfontSize}px`,
      fontStyle: `bold`,
      color: "#fff",
    })
    .setOrigin(0.5);
  container.add(levelText);
}

function renderAttackBadge(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number, width: number, height: number) {
  const backgroundfontSize = Math.max(120 * scale, 21);

  const levelX = width * scale - Math.max(80 * scale, 12);
  const levelY = height * scale - Math.max(80 * scale, 12);

  const levelBackground = scene.add
    .text(levelX, levelY, "⛊", {
      fontFamily: "Arial",
      fontSize: `${backgroundfontSize}px`,
      fontStyle: `bold`,
      color: "#000",
    })
    .setOrigin(0.5);

  scene.time.delayedCall(0, () => {
    applyStyledGradient(levelBackground, "#627d4d");
  });
  container.add(levelBackground);

  // Draw cost text
  const levelfontSize = Math.max(70 * scale, 15);
  const levelText = scene.add
    .text(levelX, levelY, card.attack.toString(), {
      fontFamily: "Cinzel",
      fontSize: `${levelfontSize}px`,
      fontStyle: `bold`,
      color: "#fff",
    })
    .setOrigin(0.5);
  container.add(levelText);
}

function renderRarityStars(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number, width: number) {
  const starCount = getRarityStarCount(card.rarity);
  const starSymbol = "\u2605\uFE0E";
  const baseStarSize = 80 * scale;
  const starSize = Math.max(baseStarSize, 24);
  const spacing = -5;
  const totalWidth = starCount > 0 ? starSize * starCount + spacing * (starCount - 1) : 0;
  let startX = (width * scale - totalWidth) / 2 + starSize / 2;

  if (card.rarity === Rarity.Epic || card.rarity === Rarity.Legendary) {
    startX += 10;
  }

  for (let i = 0; i < starCount; i++) {
    const starText = scene.add
      .text(startX + i * (starSize + spacing), 0, starSymbol, {
        fontSize: `${starSize}px`,
        color: rarityColors[card.rarity],
        fontFamily: "Arial",
      })
      .setOrigin(0.5, 0)
      .setShadow(2, 2, "#000000", 2, false, true);

    container.add(starText);
  }
}

function renderNameBar(scene: Phaser.Scene, container: Phaser.GameObjects.Container, card: Card, scale: number, width: number, height: number) {
  const nameBarHeightOffset = 64 * scale;
  const nameBarHeight = Math.max(nameBarHeightOffset, 36);

  const nameBarYOffset = height * scale - nameBarHeight;
  const nameBarY = Math.max(nameBarYOffset, 36);

  const fontSize = Math.max(40 * scale, 12);

  const nameBar = scene.add.graphics();
  nameBar.fillStyle(0x000000, 0.6);
  nameBar.fillRect(0, nameBarY, width * scale, nameBarHeight);
  container.add(nameBar);

  const nameText = scene.add
    .text((width * scale) / 2, nameBarY + nameBarHeight / 2, card.name, {
      fontFamily: "Cinzel",
      fontSize: `${fontSize}px`,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width * scale - 40 },
    })
    .setOrigin(0.5);
  container.add(nameText);
}

function renderCardBorder(scene: Phaser.Scene, container: Phaser.GameObjects.Container, scale: number, width: number, height: number, cornerRadius: number, rarity: Rarity) {
  const border = scene.add.graphics();
  border.lineStyle(2, parseInt(rarityColors[rarity].replace("#", ""), 16));
  border.strokeRoundedRect(0, 0, width * scale, height * scale, cornerRadius);
  container.add(border);
}

function getRarityStarCount(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.Common:
      return 1;
    case Rarity.Uncommon:
      return 2;
    case Rarity.Rare:
      return 3;
    case Rarity.Epic:
      return 4;
    case Rarity.Legendary:
      return 5;
    default:
      return 1;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToRgbaString(r: number, g: number, b: number, a = 1): string {
  return `rgba(${r},${g},${b},${a})`;
}

function lighten(rgb: { r: number; g: number; b: number }, percent: number): string {
  return rgbToRgbaString(Math.min(255, rgb.r + 255 * percent), Math.min(255, rgb.g + 255 * percent), Math.min(255, rgb.b + 255 * percent));
}

function darken(rgb: { r: number; g: number; b: number }, percent: number): string {
  return rgbToRgbaString(Math.max(0, rgb.r - 255 * percent), Math.max(0, rgb.g - 255 * percent), Math.max(0, rgb.b - 255 * percent));
}

function applyStyledGradient(
  textObj: Phaser.GameObjects.Text,
  baseColor: string // hex like "#d8e1e7"
) {
  const ctx = textObj.canvas.getContext("2d")!;
  const width = textObj.width;

  const base = hexToRgb(baseColor);
  const colorStart = lighten(base, 0.4); // lightest
  const colorMid1 = rgbToRgbaString(base.r, base.g, base.b); // base
  const colorMid2 = darken(base, 0.2); // subtle highlight
  const colorEnd = darken(base, 0.05); // darkest

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0.0, colorStart);
  gradient.addColorStop(0.5, colorMid1);
  gradient.addColorStop(0.51, colorMid2);
  gradient.addColorStop(1.0, colorEnd);

  textObj.setFill(gradient);
}
