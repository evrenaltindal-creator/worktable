import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { TILE_BODY, TILE_IMAGES } from '../images';

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
  /** Üst katlardaki taşların gölgesi daha belirgindir */
  raised: boolean;
  removed: boolean;
  /** Eşleşince eşine doğru uçacağı mesafe (piksel) */
  flyX: number;
  flyY: number;
  /** Seviye başında düşerek gelme gecikmesi (ms) */
  introDelay: number;
  /** Değeri değişince taş "hayır" der gibi sallanır */
  shake: number;
  onPress: (index: number) => void;
}

const native = Platform.OS !== 'web';

function TileView(props: Props) {
  const { index, face, left, top, faceW, faceH, depth, look, raised, removed, flyX, flyY, introDelay, shake, onPress } = props;

  // Animasyon değerleri bir kez oluşturulur
  const [presence] = useState(() => new Animated.Value(removed ? 0 : 1));
  const [intro] = useState(() => new Animated.Value(0));
  const [lift] = useState(() => new Animated.Value(0));
  const [shakeX] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  // Seviye başı: taşlar sırayla yukarıdan düşer
  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 420,
      delay: introDelay,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: native,
    }).start();
    // sadece ilk açılışta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Eşleşme: önce büyür, sonra eşine doğru uçar ve kaybolur. Geri alınınca geri gelir.
  useEffect(() => {
    Animated.timing(presence, {
      toValue: removed ? 0 : 1,
      duration: removed ? 520 : 260,
      easing: removed ? Easing.linear : Easing.out(Easing.back(1.5)),
      useNativeDriver: native,
    }).start();
  }, [removed, presence]);

  useEffect(() => {
    Animated.spring(lift, {
      toValue: look === 'selected' ? 1 : 0,
      friction: 5,
      tension: 160,
      useNativeDriver: native,
    }).start();
  }, [look, lift]);

  useEffect(() => {
    if (!shake) return;
    shakeX.setValue(0);
    Animated.sequence(
      [7, -7, 5, -5, 2, 0].map((v) => Animated.timing(shakeX, { toValue: v, duration: 45, useNativeDriver: native })),
    ).start();
  }, [shake, shakeX]);

  useEffect(() => {
    if (look !== 'hint') {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [look, pulse]);

  const w = faceW + depth;
  const h = faceH + depth;
  const radius = Math.max(4, faceW * 0.12);

  const anim = useMemo(() => {
    // presence: 1 = yerinde, 0 = kalktı.  1 -> 0.75 büyüme, 0.75 -> 0.15 uçuş, 0.15 -> 0 sönme
    const range = [0, 0.15, 0.75, 1];
    const translateX = Animated.add(shakeX, presence.interpolate({ inputRange: range, outputRange: [flyX, flyX, 0, 0] }));
    const translateY = Animated.add(
      Animated.add(
        presence.interpolate({ inputRange: range, outputRange: [flyY, flyY, 0, 0] }),
        intro.interpolate({ inputRange: [0, 1], outputRange: [-h * 0.9, 0] }),
      ),
      lift.interpolate({ inputRange: [0, 1], outputRange: [0, -depth * 0.9] }),
    );
    const scale = Animated.add(
      Animated.add(
        presence.interpolate({ inputRange: range, outputRange: [0.2, 0.8, 1.14, 1] }),
        pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.07] }),
      ),
      lift.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] }),
    );
    const opacity = Animated.multiply(
      presence.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 1] }),
      intro.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    );
    return { translateX, translateY, scale, opacity };
  }, [presence, intro, lift, shakeX, pulse, flyX, flyY, h, depth]);

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
          opacity: anim.opacity,
          transform: [{ translateX: anim.translateX }, { translateY: anim.translateY }, { scale: anim.scale }],
        },
      ]}
    >
      {/* Arka plana ve alt kattaki taşlara düşen gölge */}
      <View
        pointerEvents="none"
        style={[
          styles.shadow,
          raised && styles.shadowRaised,
          { borderRadius: radius, left: depth * 0.6, top: depth * 0.9, width: w, height: h },
        ]}
      />
      <Pressable onPress={() => onPress(index)} style={styles.fill}>
        <Image source={TILE_BODY} style={{ width: w, height: h }} resizeMode="stretch" />
        <Image source={TILE_IMAGES[face]} style={[styles.symbol, { width: faceW, height: faceH }]} resizeMode="contain" />
        {look !== 'normal' ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.overlay,
              { width: faceW, height: faceH, borderRadius: radius },
              look === 'blocked' && styles.blocked,
              look === 'selected' && styles.selected,
              look === 'hint' && styles.hint,
              (look === 'selected' || look === 'hint') && { borderWidth: Math.max(2.5, faceW * 0.06) },
            ]}
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  fill: { flex: 1 },
  shadow: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.18)' },
  shadowRaised: { backgroundColor: 'rgba(0,0,0,0.3)' },
  symbol: { position: 'absolute', left: 0, top: 0 },
  overlay: { position: 'absolute', left: 0, top: 0 },
  blocked: { backgroundColor: 'rgba(60,40,20,0.24)' },
  selected: { backgroundColor: 'rgba(255,205,60,0.30)', borderColor: '#FFB300' },
  hint: { backgroundColor: 'rgba(80,220,130,0.32)', borderColor: '#1FB25A' },
});

export const Tile = memo(TileView);
