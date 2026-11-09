/* Bu dosya görsellerin statik require haritasıdır (Metro paketleyici için gerekli). */
import { ImageSourcePropType } from 'react-native';

export const TILE_IMAGES: Record<string, ImageSourcePropType> = {
  d1: require('../assets/tiles/d1.png'),
  d2: require('../assets/tiles/d2.png'),
  d3: require('../assets/tiles/d3.png'),
  d4: require('../assets/tiles/d4.png'),
  d5: require('../assets/tiles/d5.png'),
  d6: require('../assets/tiles/d6.png'),
  d7: require('../assets/tiles/d7.png'),
  d8: require('../assets/tiles/d8.png'),
  d9: require('../assets/tiles/d9.png'),
  b1: require('../assets/tiles/b1.png'),
  b2: require('../assets/tiles/b2.png'),
  b3: require('../assets/tiles/b3.png'),
  b4: require('../assets/tiles/b4.png'),
  b5: require('../assets/tiles/b5.png'),
  b6: require('../assets/tiles/b6.png'),
  b7: require('../assets/tiles/b7.png'),
  b8: require('../assets/tiles/b8.png'),
  b9: require('../assets/tiles/b9.png'),
  c1: require('../assets/tiles/c1.png'),
  c2: require('../assets/tiles/c2.png'),
  c3: require('../assets/tiles/c3.png'),
  c4: require('../assets/tiles/c4.png'),
  c5: require('../assets/tiles/c5.png'),
  c6: require('../assets/tiles/c6.png'),
  c7: require('../assets/tiles/c7.png'),
  c8: require('../assets/tiles/c8.png'),
  c9: require('../assets/tiles/c9.png'),
  we: require('../assets/tiles/we.png'),
  ws: require('../assets/tiles/ws.png'),
  ww: require('../assets/tiles/ww.png'),
  wn: require('../assets/tiles/wn.png'),
  dr: require('../assets/tiles/dr.png'),
  dg: require('../assets/tiles/dg.png'),
  dw: require('../assets/tiles/dw.png'),
  f1: require('../assets/tiles/f1.png'),
  f2: require('../assets/tiles/f2.png'),
  f3: require('../assets/tiles/f3.png'),
  f4: require('../assets/tiles/f4.png'),
  s1: require('../assets/tiles/s1.png'),
  s2: require('../assets/tiles/s2.png'),
  s3: require('../assets/tiles/s3.png'),
  s4: require('../assets/tiles/s4.png'),
};

export const UI_ICONS = {
  undo: require('../assets/ui/undo.png'),
  hint: require('../assets/ui/hint.png'),
  shuffle: require('../assets/ui/shuffle.png'),
  home: require('../assets/ui/home.png'),
  settings: require('../assets/ui/settings.png'),
  lock: require('../assets/ui/lock.png'),
  check: require('../assets/ui/check.png'),
  restart: require('../assets/ui/restart.png'),
  grid: require('../assets/ui/grid.png'),
  play: require('../assets/ui/play.png'),
  back: require('../assets/ui/back.png'),
  close: require('../assets/ui/close.png'),
} satisfies Record<string, ImageSourcePropType>;

export type IconName = keyof typeof UI_ICONS;

/** Cilalı taş gövdesi (yüz + kalınlık), tüm taşlarda ortak */
export const TILE_BODY: ImageSourcePropType = require('../assets/tiles/body.png');

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
