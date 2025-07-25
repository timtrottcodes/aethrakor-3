import { playSound } from "./audio";

export function createFancyButton(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, fontSize = 20, padding: number = 30): Phaser.GameObjects.Container {
  const backgroundColor = 0x2a2a2a;
  const borderColor = 0xffd700;

  // Create text first to measure it
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: "Cinzel",
      fontSize: `${fontSize}px`,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  const textWidth = text.width;
  const textHeight = text.height;

  const width = textWidth + padding * 2;
  const height = textHeight + padding;

  const container = scene.add.container(x, y);

  // Background rectangle
  const background = scene.add.rectangle(0, 0, width, height, backgroundColor).setOrigin(0.5);

  // Inner gold border
  const inner = scene.add.graphics();
  inner.lineStyle(1, borderColor);
  inner.strokeRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10);

  // Glow rectangle
  const glow = scene.add.rectangle(0, 0, width, height).setOrigin(0.5).setStrokeStyle(2, 0xffffaa).setVisible(false);

  // Interactive zone
  const buttonZone = scene.add.zone(0, 0, width, height).setOrigin(0.5, 0.5).setSize(width, height).setInteractive({ useHandCursor: true });

  // Hover and click behavior
  buttonZone.on("pointerover", () => {
    glow.setVisible(true);
    text.setColor("#ffffaa");
  });

  buttonZone.on("pointerout", () => {
    glow.setVisible(false);
    text.setColor("#ffffff");
  });

  buttonZone.on("pointerdown", () => {
    playSound(scene, "click");
    onClick();
  });

  container.add([background, inner, glow, text, buttonZone]);
  return container;
}

export function createSlantedFancyButton(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, fontSize = 32, padding: number = 30): Phaser.GameObjects.Container {
  const slant = 20; // how much the sides slant in pixels
  const inset = 5;

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: "Cinzel",
      fontSize: `${fontSize}px`,
      color: "#ffffff",
      align: "center",
    })
    .setOrigin(0.5);

  const width = text.width + padding * 2;
  const height = text.height + padding;

  const background = scene.add.graphics();
  const points = [
    new Phaser.Geom.Point(-width / 2 + slant, -height / 2),
    new Phaser.Geom.Point(width / 2, -height / 2),
    new Phaser.Geom.Point(width / 2 - slant, height / 2),
    new Phaser.Geom.Point(-width / 2, height / 2),
  ];

  background.fillStyle(0x333333, 1);
  background.fillPoints(points, true);

  const inner = scene.add.graphics();
  const innerPoints = [
    new Phaser.Geom.Point(-width / 2 + slant + inset, -height / 2 + inset),
    new Phaser.Geom.Point(width / 2 - inset, -height / 2 + inset),
    new Phaser.Geom.Point(width / 2 - slant - inset, height / 2 - inset),
    new Phaser.Geom.Point(-width / 2 + inset, height / 2 - inset),
  ];
  inner.lineStyle(1, 0xffcc00, 1);
  inner.strokePoints(innerPoints, true);

  const glow = scene.add.graphics();
  glow.fillStyle(0xffffaa, 0.1);
  glow.fillPoints(points, true);
  glow.setVisible(false);

  const buttonZone = scene.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });

  buttonZone.on("pointerover", () => glow.setVisible(true));
  buttonZone.on("pointerout", () => glow.setVisible(false));
  buttonZone.on("pointerdown", () => {
    playSound(scene, "click");
    onClick();
  });

  const container = scene.add.container(x, y, [background, inner, glow, text, buttonZone]);

  return container;
}

export function createDisabledSlantedFancyButton(scene: Phaser.Scene, x: number, y: number, label: string, fontSize = 32, padding: number = 20): Phaser.GameObjects.Container {
  const slant = 20; // how much the sides slant in pixels
  const inset = 5;
  const alpha = 0.65;

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: "Cinzel",
      fontSize: `${fontSize}px`,
      color: "#ffffff",
      align: "center",
    })
    .setOrigin(0.5)
    .setAlpha(alpha);

  const width = text.width + padding * 2;
  const height = text.height + padding;

  const background = scene.add.graphics();
  const points = [
    new Phaser.Geom.Point(-width / 2 + slant, -height / 2),
    new Phaser.Geom.Point(width / 2, -height / 2),
    new Phaser.Geom.Point(width / 2 - slant, height / 2),
    new Phaser.Geom.Point(-width / 2, height / 2),
  ];

  background.fillStyle(0x333333, alpha);
  background.fillPoints(points, true);

  const inner = scene.add.graphics();
  const innerPoints = [
    new Phaser.Geom.Point(-width / 2 + slant + inset, -height / 2 + inset),
    new Phaser.Geom.Point(width / 2 - inset, -height / 2 + inset),
    new Phaser.Geom.Point(width / 2 - slant - inset, height / 2 - inset),
    new Phaser.Geom.Point(-width / 2 + inset, height / 2 - inset),
  ];
  inner.lineStyle(1, 0xffcc00, alpha);
  inner.strokePoints(innerPoints, true);

  const container = scene.add.container(x, y, [background, inner, text]);

  return container;
}
