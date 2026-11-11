/** Ses ve titreşim geri bildirimi (ayarlara göre açılıp kapanır). */
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundName = 'tap' | 'match' | 'wrong' | 'shuffle' | 'hint' | 'win';

const SOURCES: Record<SoundName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  match: require('../../assets/sounds/match.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  shuffle: require('../../assets/sounds/shuffle.wav'),
  hint: require('../../assets/sounds/hint.wav'),
  win: require('../../assets/sounds/win.wav'),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let soundOn = true;
let hapticsOn = true;
let ready = false;

export function initFeedback() {
  if (ready) return;
  ready = true;
  // Telefon sessizdeyken ses çalmaz; arkada çalan müziği durdurmaz.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
    } catch {
      // ses yüklenemezse sessiz devam
    }
  });
}

export function setFeedbackSettings(sound: boolean, haptics: boolean) {
  soundOn = sound;
  hapticsOn = haptics;
}

export function playSound(name: SoundName) {
  if (!soundOn) return;
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {
    // yok say
  }
}

export function haptic(kind: 'light' | 'success' | 'warning' | 'select') {
  if (!hapticsOn || Platform.OS === 'web') return;
  const run = () => {
    switch (kind) {
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'select':
        return Haptics.selectionAsync();
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  run()?.catch(() => {});
}
