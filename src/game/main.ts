import { Boot } from "./scenes/Boot";
import { Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

import MainMenuScene from "./scenes/MainMenuScene";
import AdventureScene from "./scenes/AdventureScene";
import CombatScene from "./scenes/CombatScene";
import DeckBuilderScene from "./scenes/DeckBuilderScene";
import CardDropScene from "./scenes/CardDropScene";
import VictoryScene from "./scenes/VictoryScene";
import ExplorationScene from "./scenes/ExplorationScene";
import { CardPreviewScene } from "./scenes/CardPreviewScene ";
import StoryScene from "./scenes/StoryScene";
import CollectionScene from "./scenes/CollectionScene";
import HowToPlayScene from "./scenes/HowToPlayScene";
import PausedScene from "./scenes/PausedScene";

const calculateGameSize = () => {
  const aspectRatio = 720 / 1280;
  let width = window.innerWidth;
  let height = window.visualViewport?.height || window.innerHeight;

  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }

  return { width, height };
};

const { width, height } = calculateGameSize();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width,
  height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  }, 
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [
    Boot,
    Preloader,
    MainMenuScene,
    AdventureScene,
    CombatScene,
    DeckBuilderScene,
    CardDropScene,
    VictoryScene,
    ExplorationScene,
    CardPreviewScene,
    StoryScene,
    CollectionScene,
    HowToPlayScene,
    PausedScene,
  ],
};

const StartGame = (parent: string) => {
  const game = new Game({ ...config, parent });

  window.addEventListener("resize", () => {
    const { width, height } = calculateGameSize();
    game.scale.resize(width, height);
    console.log("resize to",width, height)

    game.canvas.style.width = `${width}px`;
    game.canvas.style.height = `${height}px`;
  });

  return game;
};

export default StartGame;
