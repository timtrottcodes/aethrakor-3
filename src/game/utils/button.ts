export function createFantasyButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: {
    fontSize?: string;
    paddingX?: number;
    paddingY?: number;
    enabled?: boolean;
    origin?: [number, number];
  } = {}
): Phaser.GameObjects.Container {
  const {
    fontSize = '20px',
    paddingX = 20,
    paddingY = 10,
    enabled = true,
    origin = [0.5, 0.5]
  } = options;

  // 1. Create the text object
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Cinzel',
    fontSize,
    color: enabled ? '#ffffff' : '#888888',
    align: 'center'
  }).setOrigin(0.5);

  // 2. Calculate button dimensions
  const width = text.width + paddingX * 2;
  const height = text.height + paddingY * 2;

  // 3. Draw outer border (royal blue)
  const outer = scene.add.rectangle(0, 0, width + 4, height + 4, 0x4169e1) // Royal blue
    .setStrokeStyle(2, 0x4169e1)
    .setOrigin(0.5);

  // 4. Draw gold border rectangle
  const border = scene.add.rectangle(0, 0, width + 2, height + 2)
    .setStrokeStyle(2, 0xffd700) // Gold
    .setFillStyle(0x4169e1) // Royal blue fill
    .setOrigin(0.5);

  // 5. Create a container for the button
  const container = scene.add.container(x, y, [outer, border, text]);
  container.setSize(width, height);
  container.setDepth(10);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
    Phaser.Geom.Rectangle.Contains
  );

  if (enabled) {
    container.on('pointerover', () => {
      border.setFillStyle(0x27408b); // Darker blue hover
      text.setColor('#ffffaa');
    });

    container.on('pointerout', () => {
      border.setFillStyle(0x4169e1); // Reset fill
      text.setColor('#ffffff');
    });

    container.on('pointerdown', () => {
      onClick();
    });
  } else {
    container.disableInteractive();
  }

  return container;
}
