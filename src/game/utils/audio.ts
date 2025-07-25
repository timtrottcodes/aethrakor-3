// AudioManager.ts
import Phaser from "phaser";
import { PlayerDataManager } from "../objects/PlayerDataManager";

const AudioState: {
  music: Phaser.Sound.BaseSound | null;
  tween?: Phaser.Tweens.Tween;
  pendingKey?: string;
  currentScene?: Phaser.Scene;
  wasPlaying?: boolean;
  tempSounds: Phaser.Sound.BaseSound[];
} = {
  music: null,
  tempSounds: [],
};

// Initialize global listeners once
let _initialized = false;

export function initAudioManager(scene: Phaser.Scene) {
  AudioState.currentScene = scene;

  if (_initialized) return;
  _initialized = true;

  // Auto-play when unlocked
  scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
    if (AudioState.music && !AudioState.music.isPlaying) {
      AudioState.music.play();
    }
  });

  // Pause on blur/visibility
  scene.game.events.on(Phaser.Core.Events.BLUR, () => handleLoseFocus());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) handleLoseFocus();
  });

  // Clean up temp sounds on scene shutdown
  scene.events.on("shutdown", () => {
    cleanupSounds();
  });
}

function handleLoseFocus() {
  const scene = AudioState.currentScene;
  if (!scene) return;

  if (scene.scene.isActive("paused")) return;

  if (AudioState.music?.isPlaying) {
    AudioState.music.pause();
    AudioState.wasPlaying = true;
  }

  if (scene.scene.isActive(scene.scene.key)) scene.scene.pause(scene.scene.key);
  scene.scene.run("paused", {
    onResume: () => {
      scene.scene.stop("paused");
      scene.scene.resume(scene.scene.key);
      if (AudioState.music && AudioState.wasPlaying) {
        AudioState.music.resume();
        AudioState.wasPlaying = false;
      }
    },
  });
}

// Play a sound effect
export function playSound(scene: Phaser.Scene, key: string, volume = 1) {
  if (PlayerDataManager.instance.data.settings.muteAll || PlayerDataManager.instance.data.settings.muteSound) return;

  const sfx = scene.sound.add(key, {
    volume: volume * PlayerDataManager.instance.data.settings.soundVolume,
  });

  AudioState.tempSounds.push(sfx);

  sfx.once("complete", () => {
    cleanupSound(scene, sfx);
  });

  sfx.once("stop", () => {
    cleanupSound(scene, sfx);
  });

  sfx.play();
}

// Play music, fade old music out if needed
export function playMusic(scene: Phaser.Scene, key: string) {
  if (PlayerDataManager.instance.data.settings.muteAll || PlayerDataManager.instance.data.settings.muteMusic) return;
  if (AudioState.music?.isPlaying && AudioState.music.key === key) return;

  AudioState.currentScene = scene;

  if (AudioState.tween?.isPlaying()) AudioState.tween.stop();

  if (AudioState.music?.isPlaying) {
    AudioState.pendingKey = key;

    AudioState.tween = scene.tweens.add({
      targets: AudioState.music,
      volume: 0,
      duration: 1000,
      onComplete: () => {
        if (AudioState.music) {
          AudioState.music.stop();
          scene.sound.remove(AudioState.music);
          AudioState.music.destroy();
          AudioState.music = null;
        }
        if (AudioState.pendingKey) {
          const nextKey = AudioState.pendingKey;
          AudioState.pendingKey = undefined;
          playMusicTrack(scene, nextKey);
        }
      },
    });
  } else {
    playMusicTrack(scene, key);
  }
}

function playMusicTrack(scene: Phaser.Scene, key: string) {
  const newMusic = scene.sound.add(key, {
    loop: true,
    volume: 0,
  });

  AudioState.music = newMusic;

  if (!scene.sound.locked) {
    newMusic.play();
  } else {
    scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      newMusic.play();
    });
  }

  AudioState.tween = scene.tweens.add({
    targets: newMusic,
    volume: PlayerDataManager.instance.data.settings.musicVolume,
    duration: 1000,
  });
}

function cleanupSound(scene: Phaser.Scene, sfx: Phaser.Sound.BaseSound) {
  if (sfx.isPlaying) sfx.stop();
  scene.sound.remove(sfx);
  sfx.destroy();

  // Remove from tempSounds array
  const idx = AudioState.tempSounds.indexOf(sfx);
  if (idx !== -1) AudioState.tempSounds.splice(idx, 1);
}

export function cleanupSounds() {
  const scene = AudioState.currentScene;
  if (!scene) return;

  AudioState.tempSounds.forEach((sfx) => {
    if (sfx.isPlaying) sfx.stop();
    scene.sound.remove(sfx);
    sfx.destroy();
  });

  AudioState.tempSounds = [];
}

export function updateMusicState() {
  if (!AudioState.music) return;

  if (PlayerDataManager.instance.data.settings.muteAll || PlayerDataManager.instance.data.settings.muteMusic || PlayerDataManager.instance.data.settings.musicVolume === 0) {
    if (AudioState.music.isPlaying) {
      AudioState.music.stop();
    }
  } else {
    if (!AudioState.music.isPlaying) {
      AudioState.music.play({ loop: true });
    }

    (AudioState.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound)
      .setVolume(PlayerDataManager.instance.data.settings.musicVolume)
      .setVolume(PlayerDataManager.instance.data.settings.musicVolume);
  }
}
