import Phaser from 'phaser';

const AudioState: {
  music: Phaser.Sound.BaseSound | null;
  tween?: Phaser.Tweens.Tween;
} = {
  music: null,
};

export function playSound(scene: Phaser.Scene, key: string) {
  scene.sound.play(key);
}

export function playMusic(scene: Phaser.Scene, key: string) {
  if (AudioState.music?.isPlaying && AudioState.music?.key === key) return;

  // If a previous fade tween is running, stop it
  if (AudioState.tween?.isPlaying()) {
    AudioState.tween.stop();
  }

  if (AudioState.music && AudioState.music.isPlaying) {
    AudioState.tween = scene.tweens.add({
      targets: AudioState.music,
      volume: 0,
      duration: 1000,
      onComplete: () => {
        AudioState.music?.stop();
        playMusicTrack(scene, key);
      },
    });
  } else {
    playMusicTrack(scene, key);
  }
}

function playMusicTrack(scene: Phaser.Scene, key: string) {
  const newMusic = scene.sound.add(key, { loop: true, volume: 0 });

  newMusic.play();

  // Fade in to desired volume
  AudioState.tween = scene.tweens.add({
    targets: newMusic,
    volume: 0.45,
    duration: 1000,
  });

  AudioState.music = newMusic;
}

export function stopSound(scene: Phaser.Scene, key: string) {
  scene.sound.stopByKey(key);
}

export function stopMusic(scene: Phaser.Scene) {
  if (AudioState.music) {
    if (AudioState.tween?.isPlaying()) {
      AudioState.tween.stop();
    }

    AudioState.tween = scene.tweens.add({
      targets: AudioState.music,
      volume: 0,
      duration: 500,
      onComplete: () => {
        AudioState.music?.stop();
        AudioState.music = null;
      },
    });
  }
}
