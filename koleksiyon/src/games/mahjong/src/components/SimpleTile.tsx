import { memo, useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { TILE_BACK, TILE_BODY, TILE_IMAGES } from '../images';

const native = Platform.OS !== 'web';
export const DEPTH = 0.14;
export const FACE_RATIO = 116 / 88;

/** Yüz genişliğinden taşın toplam boyutu (kalınlık dahil) */
export function tileSize(faceW: number) {
  const depth = faceW * DEPTH;
  return { w: faceW + depth, h: faceW * FACE_RATIO + depth, faceH: faceW * FACE_RATIO, depth };
}

export type SimpleLook = 'normal' | 'selected' | 'hint' | 'blocked';

interface Props {
  /** 'back' = kapalı taş */
  face: string;
  faceW: number;
  look?: SimpleLook;
  /** true olunca küçülüp kaybolur */
  gone?: boolean;
  /** Değişince taş "hayır" der gibi sallanır */
  shake?: number;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/** Düz yerleşimli oyunlar (Bağlantı, Hafıza, Zirve, raf) için taş. */
function SimpleTileView({ face, faceW, look = 'normal', gone = false, shake = 0, onPress, style, accessibilityLabel }: Props) {
  const { w, h, faceH } = tileSize(faceW);
  const radius = Math.max(4, faceW * 0.12);
  const [v] = useState(() => new Animated.Value(0));
  const [presence] = useState(() => new Animated.Value(gone ? 0 : 1));
  const [shakeX] = useState(() => new Animated.Value(0));

  // ilk görünüşte hafifçe büyüyerek gelir
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(1.6)), useNativeDriver: native }).start();
  }, [v]);

  useEffect(() => {
    Animated.timing(presence, { toValue: gone ? 0 : 1, duration: gone ? 320 : 200, useNativeDriver: native }).start();
  }, [gone, presence]);

  useEffect(() => {
    if (!shake) return;
    Animated.sequence(
      [7, -7, 5, -5, 0].map((x) => Animated.timing(shakeX, { toValue: x, duration: 45, useNativeDriver: native })),
    ).start();
  }, [shake, shakeX]);

  // Dokunma işi yoksa düz View: iç içe düğmelerde dokunmayı yutmasın (web'de devre dışı düğme tıklamayı engeller)
  const Wrapper = (onPress ? Pressable : View) as typeof Pressable;
  const wrapperProps = onPress
    ? { onPress, style: styles.fill, accessibilityRole: 'button' as const, accessibilityLabel }
    : { style: styles.fill, accessibilityLabel };

  const scale = Animated.multiply(
    v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
    presence.interpolate({ inputRange: [0, 1], outputRange: [1.25, 1] }),
  );

  return (
    <Animated.View
      pointerEvents={gone ? 'none' : 'auto'}
      style={[{ width: w, height: h, opacity: Animated.multiply(v, presence), transform: [{ translateX: shakeX }, { scale }] }, style]}
    >
      <Wrapper {...wrapperProps}>
        <Image source={face === 'back' ? TILE_BACK : TILE_BODY} style={{ width: w, height: h }} resizeMode="stretch" />
        {face !== 'back' ? (
          <Image source={TILE_IMAGES[face]} style={[styles.abs, { width: faceW, height: faceH }]} resizeMode="contain" />
        ) : null}
        {look !== 'normal' ? (
          <View
            pointerEvents="none"
            style={[
              styles.abs,
              { width: faceW, height: faceH, borderRadius: radius },
              look === 'blocked' && styles.blocked,
              look === 'selected' && [styles.selected, { borderWidth: Math.max(2.5, faceW * 0.06) }],
              look === 'hint' && [styles.hint, { borderWidth: Math.max(2.5, faceW * 0.06) }],
            ]}
          />
        ) : null}
      </Wrapper>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  abs: { position: 'absolute', left: 0, top: 0 },
  blocked: { backgroundColor: 'rgba(60,40,20,0.24)' },
  selected: { backgroundColor: 'rgba(255,205,60,0.30)', borderColor: '#FFB300' },
  hint: { backgroundColor: 'rgba(80,220,130,0.32)', borderColor: '#1FB25A' },
});

export const SimpleTile = memo(SimpleTileView);
