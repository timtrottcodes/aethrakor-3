import Phaser from "phaser";

const AudioState: {
  music: Phaser.Sound.BaseSound | null;
  tween?: Phaser.Tweens.Tween;
  pendingKey?: string;
} = {
  music: null,
};

export function playSound(scene: Phaser.Scene, key: string, volume = 1) {
  const sfx = scene.sound.add(key, {
    volume,
    detune: 0,
    rate: 1,
  });

  sfx.once("complete", () => {
    scene.sound.remove(sfx);
    sfx.destroy();
  });

  sfx.play();

  // 🧪 Debug: Log SFX info
  console.log(`[SFX] Playing: ${key}`);
  logSoundManagerState(scene, AudioState.music);
}

export function playMusic(scene: Phaser.Scene, key: string) {
  if (AudioState.music?.isPlaying && AudioState.music.key === key) return;

  // Prevent triggering multiple fades at once
  if (AudioState.tween?.isPlaying()) {
    AudioState.tween.stop();
  }

  // Avoid duplicate fade logic
  if (AudioState.music && AudioState.music.isPlaying) {
    AudioState.pendingKey = key;

    AudioState.tween = scene.tweens.add({
      targets: AudioState.music,
      volume: 0,
      duration: 1000,
      onComplete: () => {
        AudioState.music?.stop();
        scene.sound.remove(AudioState.music!);
        AudioState.music = null;
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
    detune: 0,
    rate: 1,
  });
  AudioState.music = newMusic;
  newMusic.play();

  // 🧪 Debug: Log music instance info
  console.log(`[MUSIC] Playing: ${key}`);
  logSoundManagerState(scene, newMusic);

  AudioState.tween = scene.tweens.add({
    targets: newMusic,
    volume: 1,
    duration: 1000,
  });
}

function logSoundManagerState(scene: Phaser.Scene, music: Phaser.Sound.BaseSound | null) {
  console.log('--- Audio Debug ---');
  console.log('Global volume:', scene.sys.game.sound.volume);
  console.log('Scene volume:', scene.sound.volume);
  console.log('Mute status:', scene.sound.mute);
  console.log('Active sounds:', scene.sound.sounds.length);
  console.log('Sounds:');

  scene.sound.sounds.forEach((s, i) => {
    console.log(`  #${i + 1}: key=${s.key}, volume=${s.volume}, isPlaying=${s.isPlaying}`);
  });

  if (music) {
    console.log(`[MUSIC] Current: ${music.key}, volume=${music.volume}, isPlaying=${music.isPlaying}`);
  } else {
    console.log('[MUSIC] None');
  }

  console.log('-------------------');
}

