import { Boot } from './scenes/Boot';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

import MainMenuScene from './scenes/MainMenuScene';
import AdventureScene from './scenes/AdventureScene';
import CombatScene from './scenes/CombatScene';
import DeckBuilderScene from './scenes/DeckBuilderScene';
import CardDropScene from './scenes/CardDropScene';
import VictoryScene from './scenes/VictoryScene';
import ExplorationScene from './scenes/ExplorationScene';
import { CardPreviewScene } from './scenes/CardPreviewScene ';
import StoryScene from './scenes/StoryScene';

const config: Phaser.Types.Core.GameConfig = {
     type: Phaser.AUTO,
    width: 720,
    height: 1280,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
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
        StoryScene
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
