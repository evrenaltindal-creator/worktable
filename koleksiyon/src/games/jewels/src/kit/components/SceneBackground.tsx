import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { FX, FxName, SCENES } from '../images';
import { ParticleSpec, Theme } from '../themes';

const native = Platform.OS !== 'web';

/** Parçacık resimlerinin en/boy oranı (genişlik / yükseklik) */
const ASPECT: Partial<Record<FxName, number>> = {
  gull: 2,
  balloonRed: 80 / 110,
  balloonBlue: 80 / 110,
  balloonGreen: 80 / 110,
};

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

interface ParticleProps {
  spec: ParticleSpec;
  seed: number;
  width: number;
  height: number;
}

function Particle({ spec, seed, width, height }: ParticleProps) {
  const p = useMemo(() => {
    const r = seeded(seed);
    const lerp = (range: [number, number]) => range[0] + r() * (range[1] - range[0]);
    const w = lerp(spec.size) * Math.min(width, 700);
    return {
      w,
      h: w / (ASPECT[spec.sprite] ?? 1),
      duration: lerp(spec.duration),
      phase: r(),
      x: r() * width,
      bandY: spec.band ? lerp(spec.band) * height : r() * height,
      sway: 20 + r() * 40,
      dir: r() > 0.5 ? 1 : -1,
    };
  }, [spec, seed, width, height]);

  const [v] = useState(() => new Animated.Value(p.phase));

  useEffect(() => {
    let stopped = false;
    let loop: Animated.CompositeAnimation | null = null;
    // Önce rastgele bir noktadan turu bitir, sonra sonsuz döngü (hepsi aynı anda başlamasın)
    v.setValue(p.phase);
    const first = Animated.timing(v, {
      toValue: 1,
      duration: p.duration * (1 - p.phase),
      easing: Easing.linear,
      useNativeDriver: native,
    });
    first.start(({ finished }) => {
      if (!finished || stopped) return;
      v.setValue(0);
      loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: native }));
      loop.start();
    });
    return () => {
      stopped = true;
      first.stop();
      loop?.stop();
    };
  }, [v, p]);

  let style;
  switch (spec.motion) {
    case 'fall':
      style = {
        left: p.x,
        top: 0,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-p.h * 2, height + p.h] }) },
          { translateX: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, p.sway, 0, -p.sway, 0] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.dir * 540}deg`] }) },
        ],
      };
      break;
    case 'rise':
      style = {
        left: p.x,
        top: 0,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [height + p.h, -p.h * 1.5] }) },
          { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sway * p.dir, 0] }) },
        ],
      };
      break;
    case 'glide':
      style = {
        left: 0,
        top: p.bandY,
        transform: [
          {
            translateX: v.interpolate({
              inputRange: [0, 1],
              outputRange: p.dir > 0 ? [-p.w * 1.5, width + p.w] : [width + p.w, -p.w * 1.5],
            }),
          },
          { translateY: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -8, 0, 8, 0] }) },
          { scaleX: p.dir > 0 ? 1 : -1 },
        ],
      };
      break;
    case 'twinkle':
      style = {
        left: p.x,
        top: p.bandY,
        opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] }) }],
      };
      break;
  }

  return (
    <Animated.Image
      source={FX[spec.sprite]}
      style={[styles.particle, { width: p.w, height: p.h, opacity: spec.opacity ?? 1 }, style]}
      resizeMode="contain"
    />
  );
}

function SceneBackgroundView({ theme }: { theme: Theme }) {
  const { width, height } = useWindowDimensions();
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: native }).start();
  }, [fade]);

  const particles = useMemo(
    () =>
      theme.particles.flatMap((spec, k) =>
        Array.from({ length: spec.count }, (_, i) => ({ spec, seed: (k + 1) * 7919 + i * 104729 + theme.id.length })),
      ),
    [theme],
  );

  return (
    // overflow: hidden -> büyük sahne resmi ve ekran dışına süzülen parçacıklar sayfayı genişletmesin
    <View style={[StyleSheet.absoluteFill, styles.clip]} pointerEvents="none">
      <LinearGradient colors={[theme.top, theme.bottom]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <Image source={SCENES[theme.id]} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {particles.map(({ spec, seed }) => (
          <Particle key={seed} spec={spec} seed={seed} width={width} height={height} />
        ))}
      </Animated.View>
    </View>
  );
}

export const SceneBackground = memo(SceneBackgroundView);

const styles = StyleSheet.create({
  particle: { position: 'absolute' },
  clip: { overflow: 'hidden' },
});
