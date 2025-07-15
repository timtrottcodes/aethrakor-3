// AudioManager.ts
import Phaser from "phaser";

export type AudioPreferences = {
  muteAll: boolean;
  muteMusic: boolean;
  muteSound: boolean;
  musicVolume: number;
  soundVolume: number;
};

const AudioState: {
  music: Phaser.Sound.BaseSound | null;
  tween?: Phaser.Tweens.Tween;
  pendingKey?: string;
  prefs: AudioPreferences;
  currentScene?: Phaser.Scene;
  wasPlaying?: boolean;
  tempSounds: Phaser.Sound.BaseSound[];
} = {
  music: null,
  prefs: {
    muteAll: false,
    muteMusic: false,
    muteSound: false,
    musicVolume: 0.8,
    soundVolume: 1,
  },
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
      console.log(scene.scene.key);
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
  if (AudioState.prefs.muteAll || AudioState.prefs.muteSound) return;

  const sfx = scene.sound.add(key, {
    volume: volume * AudioState.prefs.soundVolume,
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
  if (AudioState.prefs.muteAll || AudioState.prefs.muteMusic) return;
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
    volume: AudioState.prefs.musicVolume,
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
