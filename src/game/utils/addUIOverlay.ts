import Phaser from "phaser";
import { updateMusicState } from "./audio";
import { StageManager } from "../objects/StageManager";
import { PlayerDataManager } from "../objects/PlayerDataManager";
import { AudioPreferences } from "../objects/objects";
import { BaseScene } from "../scenes/BaseScene";

type BooleanAudioPrefKeys = {
  [K in keyof AudioPreferences]: AudioPreferences[K] extends boolean ? K : never;
}[keyof AudioPreferences];

export function addUIOverlay(scene: BaseScene) {
  // --- 1. PROGRESS BAR ---
  const totalSteps = StageManager.instance.stages.length;
  const currentStep = PlayerDataManager.instance.data.progress.currentStage;
  const progressRatio = Phaser.Math.Clamp(currentStep / totalSteps, 0, 1);

  const barWidth = scene.scale.width;
  const barHeight = 5;
  const barY = scene.scale.height - barHeight;

  const progressBar = scene.add
    .rectangle(0, barY, barWidth * progressRatio, barHeight, 0xffd700)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1000);

  // --- 2. SETTINGS BUTTON (COG) ---
  const cogIcon = scene.add
    .text(scene.scale.width - 30, 20, "⚙️", {
      fontSize: "28px",
      color: "#ffffff",
    })
    .setOrigin(0.5, 0)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setDepth(1000);

  cogIcon.on("pointerdown", () => {
    openSettingsPanel(scene);
  });

  scene.contentContainer.add([progressBar,cogIcon])
}

function openSettingsPanel(scene: BaseScene) {
  const bg = scene.add
    .rectangle(scene.scale.width / 2, scene.scale.height / 2, 300, 280, 0x000000, 0.8)
    .setStrokeStyle(1, 0xffd700)
    .setDepth(1001);

  const labelStyle = { fontSize: "16px", color: "#ffffff" };
  const toggleStyle = { fontSize: "18px", color: "#FFD700" };

  const booleanToggles: { key: BooleanAudioPrefKeys; label: string }[] = [
    { key: "muteAll", label: "Mute All" },
    { key: "muteMusic", label: "Mute Music" },
    { key: "muteSound", label: "Mute Sound" },
    { key: "vibration", label: "Vibration" },
  ];

  const elements: Phaser.GameObjects.GameObject[] = [bg];

  booleanToggles.forEach((item, i) => {
    const text = scene.add
      .text(bg.x! - 100, bg.y! - 90 + i * 40, item.label, labelStyle)
      .setOrigin(0, 0.5)
      .setDepth(1001);
    const toggle = scene.add
      .text(bg.x! + 60, bg.y! - 90 + i * 40, PlayerDataManager.instance.data.settings[item.key as keyof AudioPreferences] ? "ON" : "OFF", toggleStyle)
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    toggle.on("pointerdown", () => {
      PlayerDataManager.instance.data.settings[item.key] = !PlayerDataManager.instance.data.settings[item.key];
      toggle.setText(PlayerDataManager.instance.data.settings[item.key as keyof AudioPreferences] ? "ON" : "OFF");
      updateMusicState();
    });

    elements.push(text, toggle);
  });

  // Volume Sliders (text-based for simplicity)
  const musicLabel = scene.add
    .text(bg.x! - 100, bg.y! + 70, "Music Vol", labelStyle)
    .setOrigin(0, 0.5)
    .setDepth(1001);
  const soundLabel = scene.add
    .text(bg.x! - 100, bg.y! + 110, "Sound Vol", labelStyle)
    .setOrigin(0, 0.5)
    .setDepth(1001);

  const musicValue = scene.add
    .text(bg.x! + 60, bg.y! + 70, `${Math.round(PlayerDataManager.instance.data.settings.musicVolume * 100)}%`, toggleStyle)
    .setOrigin(0, 0.5)
    .setDepth(1001)
    .setInteractive({ useHandCursor: true });

  const soundValue = scene.add
    .text(bg.x! + 60, bg.y! + 110, `${Math.round(PlayerDataManager.instance.data.settings.soundVolume * 100)}%`, toggleStyle)
    .setOrigin(0, 0.5)
    .setDepth(1001)
    .setInteractive({ useHandCursor: true });



  musicValue.on("pointerdown", () => {
    PlayerDataManager.instance.data.settings.musicVolume = (PlayerDataManager.instance.data.settings.musicVolume + 0.1) % 1.1;
    musicValue.setText(`${Math.round(PlayerDataManager.instance.data.settings.musicVolume * 100)}%`);
    updateMusicState();
  });

  soundValue.on("pointerdown", () => {
    PlayerDataManager.instance.data.settings.soundVolume = (PlayerDataManager.instance.data.settings.soundVolume + 0.1) % 1.1;
    soundValue.setText(`${Math.round(PlayerDataManager.instance.data.settings.soundVolume * 100)}%`);
    updateMusicState();
  });

  elements.push(musicLabel, soundLabel, musicValue, soundValue);

  // Close on click anywhere
  bg.setInteractive().on("pointerdown", () => {
    elements.forEach((e) => e.destroy());
  });

  scene.contentContainer.add(elements);
}
