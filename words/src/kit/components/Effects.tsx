import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FX } from '../images';

const native = Platform.OS !== 'web';

interface BurstProps {
  x: number;
  y: number;
  /** Taş boyutu: efekt buna göre ölçeklenir */
  size: number;
  points: number;
  label: string | null;
}

/** Eşleşen iki taşın buluştuğu noktada parıltı patlaması ve uçan puan yazısı. */
export function MatchBurst({ x, y, size, points, label }: BurstProps) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 900, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
  }, [t]);

  const rays = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + 0.3), []);
  const spark = size * 0.55;
  const dist = size * 1.3;

  return (
    <View pointerEvents="none" style={[styles.burst, { left: x, top: y }]}>
      <Animated.Image
        source={FX.glow}
        style={{
          position: 'absolute',
          width: size * 2.4,
          height: size * 2.4,
          left: -size * 1.2,
          top: -size * 1.2,
          opacity: t.interpolate({ inputRange: [0, 0.05, 0.5], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 0.5], outputRange: [0.3, 1.4], extrapolate: 'clamp' }) }],
        }}
      />
      {rays.map((a, i) => (
        <Animated.Image
          key={i}
          source={FX.sparkle}
          style={{
            position: 'absolute',
            width: spark,
            height: spark,
            left: -spark / 2,
            top: -spark / 2,
            opacity: t.interpolate({ inputRange: [0, 0.05, 0.6], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
            transform: [
              { translateX: t.interpolate({ inputRange: [0, 0.6], outputRange: [0, Math.cos(a) * dist], extrapolate: 'clamp' }) },
              { translateY: t.interpolate({ inputRange: [0, 0.6], outputRange: [0, Math.sin(a) * dist], extrapolate: 'clamp' }) },
              { scale: t.interpolate({ inputRange: [0, 0.2, 0.6], outputRange: [0.3, 1, 0.4], extrapolate: 'clamp' }) },
            ],
          }}
        />
      ))}
      <Animated.View
        style={[
          styles.textBox,
          {
            opacity: t.interpolate({ inputRange: [0, 0.05, 0.75, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.2, -size * 1.6] }) },
              { scale: t.interpolate({ inputRange: [0, 0.12, 0.25], outputRange: [0.5, 1.25, 1], extrapolate: 'clamp' }) },
            ],
          },
        ]}
      >
        {label ? <Text style={[styles.label, { fontSize: Math.max(22, size * 0.42) }]}>{label}</Text> : null}
        <Text style={[styles.points, { fontSize: Math.max(18, size * 0.32) }]}>+{points}</Text>
      </Animated.View>
    </View>
  );
}

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

const CONFETTI_COLORS = ['#FFD23F', '#E53950', '#2FA866', '#3C7DE0', '#FF7AA2', '#F29A1D', '#8C5BD8'];

/** Kazanınca ekrana yağan konfeti (bir kez). */
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => {
    const r = seeded(12345);
    return Array.from({ length: 42 }, (_, i) => ({
      x: r() * width,
      w: 8 + r() * 8,
      h: 12 + r() * 10,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: r() * 700,
      duration: 2200 + r() * 1600,
      spin: (r() > 0.5 ? 1 : -1) * (360 + r() * 720),
      sway: 30 + r() * 60,
    }));
  }, [width]);
  const [values] = useState(() => pieces.map(() => new Animated.Value(0)));

  useEffect(() => {
    Animated.parallel(
      values.map((v, i) =>
        Animated.timing(v, {
          toValue: 1,
          duration: pieces[i].duration,
          delay: pieces[i].delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: native,
        }),
      ),
    ).start();
  }, [values, pieces]);

  return (
    // overflow: hidden -> ekran dışına taşan parçalar sayfayı kaydırmasın
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: 0,
            width: p.w,
            height: p.h,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: values[i].interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: values[i].interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }) },
              { translateX: values[i].interpolate({ inputRange: [0, 0.33, 0.66, 1], outputRange: [0, p.sway, -p.sway, 0] }) },
              { rotate: values[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** 1-3 yıldız: kazanılanlar sırayla "pat" diye belirir. */
export function StarRow({ stars, size = 64 }: { stars: number; size?: number }) {
  const [values] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));
  useEffect(() => {
    Animated.stagger(
      260,
      values.map((v) => Animated.spring(v, { toValue: 1, friction: 4, tension: 120, useNativeDriver: native })),
    ).start();
  }, [values]);
  return (
    <View style={styles.stars}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={{
            transform: [
              { scale: values[i] },
              { translateY: i === 1 ? -size * 0.18 : 0 },
              { rotate: values[i].interpolate({ inputRange: [0, 1], outputRange: [`${(i - 1) * 40}deg`, `${(i - 1) * 10}deg`] }) },
            ],
          }}
        >
          <Image source={i < stars ? FX.starGold : FX.starEmpty} style={{ width: size, height: size }} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  burst: { position: 'absolute', width: 0, height: 0, alignItems: 'center' },
  textBox: { position: 'absolute', width: 260, left: -130, top: -30, alignItems: 'center' },
  label: {
    color: '#FFE066',
    fontWeight: '900',
    textShadowColor: 'rgba(80,30,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  points: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  clip: { overflow: 'hidden' },
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 4 },
});
