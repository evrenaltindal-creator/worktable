/* Görsellerin statik require haritası (Metro paketleyici için gerekli). */
import { ImageSourcePropType } from 'react-native';

export const UI_ICONS = {
  undo: require('../assets/ui/undo.png'),
  hint: require('../assets/ui/hint.png'),
  home: require('../assets/ui/home.png'),
  settings: require('../assets/ui/settings.png'),
  restart: require('../assets/ui/restart.png'),
  play: require('../assets/ui/play.png'),
  back: require('../assets/ui/back.png'),
  close: require('../assets/ui/close.png'),
  help: require('../assets/ui/help.png'),
  grid: require('../assets/ui/grid.png'),
  erase: require('../assets/ui/erase.png'),
  notes: require('../assets/ui/notes.png'),
} satisfies Record<string, ImageSourcePropType>;

export type IconName = keyof typeof UI_ICONS;

export const SCENES = {
  spring: require('../assets/scenes/spring.png'),
  sunset: require('../assets/scenes/sunset.png'),
  dawn: require('../assets/scenes/dawn.png'),
  sea: require('../assets/scenes/sea.png'),
} satisfies Record<string, ImageSourcePropType>;

export const FX = {
  petal: require('../assets/fx/petal.png'),
  sparkle: require('../assets/fx/sparkle.png'),
  glow: require('../assets/fx/glow.png'),
  gull: require('../assets/fx/gull.png'),
  boat: require('../assets/fx/boat.png'),
  balloonRed: require('../assets/fx/balloon-red.png'),
  balloonBlue: require('../assets/fx/balloon-blue.png'),
  balloonGreen: require('../assets/fx/balloon-green.png'),
  starGold: require('../assets/fx/star-gold.png'),
  starEmpty: require('../assets/fx/star-empty.png'),
} satisfies Record<string, ImageSourcePropType>;

export type FxName = keyof typeof FX;
