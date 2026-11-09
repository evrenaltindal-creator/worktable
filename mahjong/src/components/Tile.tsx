import { memo, useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { TILE_IMAGES } from '../images';
import { colors } from '../theme';

export type TileLook = 'normal' | 'blocked' | 'selected' | 'hint';

interface Props {
  index: number;
  face: string;
  left: number;
  top: number;
  faceW: number;
  faceH: number;
  depth: number;
  look: TileLook;
  /** Üst katlardaki taşlar alttakilerin üzerine hafif gölge düşürür */
  raised: boolean;
  removed: boolean;
  /** Değeri değişince taş "hayır" der gibi sallanır */
  shake: number;
  onPress: (index: number) => void;
}

const native = Platform.OS !== 'web';

function TileView({ index, face, left, top, faceW, faceH, depth, look, raised, removed, shake, onPress }: Props) {
  // Animasyon değerleri bir kez oluşturulur (useState başlatıcısı ile)
  const [presence] = useState(() => new Animated.Value(removed ? 0 : 1));
  const [shakeX] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (removed) {
      Animated.timing(presence, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: native,
      }).start();
    } else {
      Animated.timing(presence, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: native,
      }).start();
    }
  }, [removed, presence]);

  useEffect(() => {
    if (!shake) return;
    shakeX.setValue(0);
    Animated.sequence(
      [6, -6, 4, -4, 0].map((v) => Animated.timing(shakeX, { toValue: v, duration: 50, useNativeDriver: native })),
    ).start();
  }, [shake, shakeX]);

  useEffect(() => {
    if (look !== 'hint') {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 450, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [look, pulse]);

  const w = faceW + depth;
  const h = faceH + depth;
  const radius = Math.max(4, faceW * 0.12);
  const faceColor =
    look === 'selected' ? colors.tileSelected : look === 'hint' ? colors.tileHint : look === 'blocked' ? colors.tileFaceBlocked : colors.tileFace;
  const borderColor =
    look === 'selected' ? colors.tileSelectedBorder : look === 'hint' ? colors.tileHintBorder : 'rgba(0,0,0,0.10)';
  const borderWidth = look === 'selected' || look === 'hint' ? Math.max(2, faceW * 0.05) : 1;

  const scale = Animated.add(
    presence.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
    pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] }),
  );

  return (
    <Animated.View
      pointerEvents={removed ? 'none' : 'auto'}
      style={[
        styles.wrap,
        {
          left,
          top,
          width: w,
          height: h,
          opacity: presence,
          transform: [{ translateX: shakeX }, { scale }],
        },
      ]}
    >
      {raised ? (
        <View
          pointerEvents="none"
          style={[styles.shadow, { borderRadius: radius, left: depth * 0.9, top: depth * 1.1, width: faceW + depth, height: faceH + depth }]}
        />
      ) : null}
      <Pressable onPress={() => onPress(index)} style={styles.fill} hitSlop={0}>
        {/* Taşın kalınlığı (sağ ve alt kenar) */}
        <View style={[styles.side, { borderRadius: radius, left: depth * 0.35, top: depth * 0.35, width: faceW + depth * 0.65, height: faceH + depth * 0.65 }]} />
        <View style={[styles.sideDark, { borderRadius: radius, left: depth, top: depth, width: faceW, height: faceH }]} />
        <View
          style={[
            styles.face,
            { width: faceW, height: faceH, borderRadius: radius, backgroundColor: faceColor, borderColor, borderWidth },
          ]}
        >
          <Image
            source={TILE_IMAGES[face]}
            style={[styles.img, look === 'blocked' && styles.imgBlocked]}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  fill: { flex: 1 },
  shadow: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.22)' },
  side: { position: 'absolute', backgroundColor: colors.tileSide },
  sideDark: { position: 'absolute', backgroundColor: colors.tileSideDark },
  face: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  imgBlocked: { opacity: 0.55 },
});

export const Tile = memo(TileView);
