import { ComponentRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, Image, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import {
  Grid,
  MAX_ROWS,
  RAINBOW,
  ROW_H,
  WIDTH,
  buildLevel,
  center,
  colorsOnBoard,
  dropCeiling,
  isEmpty,
  place,
  reachedBottom,
  simulateShot,
} from './game/bubbles';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { createRng, randInt } from './kit/rng';
import { starsFor } from './kit/store';
import { t } from './text';

const native = Platform.OS !== 'web';
const IMG = [
  require('../assets/bubbles/b0.png'),
  require('../assets/bubbles/b1.png'),
  require('../assets/bubbles/b2.png'),
  require('../assets/bubbles/b3.png'),
  require('../assets/bubbles/b4.png'),
  require('../assets/bubbles/b5.png'),
];
const RAINBOW_IMG = require('../assets/bubbles/rainbow.png');
const SWAP = require('../assets/ui/swap.png');
const RAINBOW_ICON = require('../assets/ui/rainbow.png');
const img = (color: number) => (color === RAINBOW ? RAINBOW_IMG : IMG[color]);

const MISS_LIMIT = 6;
const SHOOTER = { x: WIDTH / 2, y: 1 + (MAX_ROWS + 1.6) * ROW_H };
const HEIGHT_UNITS = SHOOTER.y + 1.6;

const Bubble = memo(function Bubble({ color, x, y, d }: { color: number; x: number; y: number; d: number }) {
  return <Image source={img(color)} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d }} />;
});

/** Patlayan ya da düşen balon efekti */
function Fx({ id, color, x, y, d, kind, delay, onDone }: { id: number; color: number; x: number; y: number; d: number; kind: 'pop' | 'drop'; delay: number; onDone: (id: number) => void }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: kind === 'pop' ? 260 : 650, delay, easing: kind === 'pop' ? Easing.out(Easing.quad) : Easing.in(Easing.quad), useNativeDriver: native }).start(() => onDone(id));
  }, [v, kind, delay, id, onDone]);
  const transform =
    kind === 'pop'
      ? [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }]
      : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, d * 9] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '40deg'] }) }];
  return (
    <Animated.Image
      source={img(color)}
      style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, opacity: v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, kind === 'pop' ? 0.3 : 1, 0] }), transform }}
    />
  );
}

function pickColor(rng: () => number, g: Grid) {
  const cs = colorsOnBoard(g);
  return cs.length ? cs[randInt(rng, cs.length)] : 0;
}

interface Props {
  level: number;
  isDaily: boolean;
  seed: number;
  rainbows: number;
  firstTime: boolean;
  onUseRainbow: () => void;
  onWin: (stars: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

/** "Yeniden başla" tüm durumu sıfırlamak için oyunu yeni bir anahtarla baştan kurar */
export function GameScreen(props: Props) {
  const [round, setRound] = useState(0);
  return <Round key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

function Round({ level, isDaily, seed, rainbows, firstTime, onUseRainbow, onWin, onNext, onHome, onRestart }: Props & { onRestart: () => void }) {
  const start = useMemo(() => buildLevel(level, seed === level ? 0 : seed), [level, seed]);
  // Sıradaki balon renkleri bu seviyeye özgü, tekrarlanabilir bir rastgele diziden gelir
  const [rng] = useState(() => createRng(seed * 31 + 7));
  const pick = useCallback((g: Grid) => pickColor(rng, g), [rng]);
  const [grid, setGrid] = useState<Grid>(start.grid);
  const [current, setCurrent] = useState(() => pick(start.grid));
  const [next, setNext] = useState(() => pick(start.grid));
  const [angle, setAngle] = useState<number | null>(null);
  const [flying, setFlying] = useState<number | null>(null);
  const [fx, setFx] = useState<{ id: number; color: number; r: number; c: number; kind: 'pop' | 'drop'; delay: number }[]>([]);
  const [misses, setMisses] = useState(0);
  const [drops, setDrops] = useState(0);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [shots, setShots] = useState(0);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const [pos] = useState(() => new Animated.ValueXY());
  const fxId = useRef(0);
  const fxDone = useCallback((id: number) => setFx((old) => old.filter((f) => f.id !== id)), []);
  // Dokunma noktası pencere koordinatıyla gelir; alanın penceredeki yeri ölçülüp çıkarılır
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));

  const u = area.width ? Math.min(area.width / WIDTH, area.height / HEIGHT_UNITS) : 0;
  const boardW = u * WIDTH;
  const ox = (area.width - boardW) / 2;
  const d = u * 2;
  const px = useCallback((p: { x: number; y: number }) => ({ x: ox + p.x * u, y: p.y * u }), [ox, u]);

  const aimPath = useMemo(() => (angle === null || flying !== null ? null : simulateShot(grid, SHOOTER, angle)), [angle, grid, flying]);

  // Ateşle: yol boyunca uçar, sonra yapışır, patlar, düşer
  const shoot = useCallback(
    (a: number) => {
      if (flying !== null || lost || wonStars !== null) return;
      const shot = simulateShot(grid, SHOOTER, a);
      if (!shot.cell) return;
      const color = current;
      setFlying(color);
      setAngle(null);
      setShots((n) => n + 1);
      const pts = shot.path.map(px);
      pos.setValue({ x: pts[0].x - d / 2, y: pts[0].y - d / 2 });
      // Hız saniyede 70 balon yarıçapı; çok sekmeli atışlar da en fazla 0,9 sn sürer
      const total = pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
      const speed = Math.max((u * 70) / 1000, total / 900); // piksel/ms
      Animated.sequence(
        pts.slice(1).map((p, i) =>
          Animated.timing(pos, {
            toValue: { x: p.x - d / 2, y: p.y - d / 2 },
            duration: Math.max(16, Math.hypot(p.x - pts[i].x, p.y - pts[i].y) / speed),
            easing: Easing.linear,
            useNativeDriver: native,
          }),
        ),
      ).start(() => {
        const cell = shot.cell as [number, number];
        const res = place(grid, cell, color);
        let g = res.grid;
        const popped = res.popped.length;
        if (popped) {
          const pc = res.colorsOf(res.popped);
          const dc = res.colorsOf(res.dropped);
          setFx((old) => [
            ...old.slice(-60),
            ...res.popped.map(([r, cc], k) => ({ id: ++fxId.current, color: pc[k], r, c: cc, kind: 'pop' as const, delay: k * 25 })),
            ...res.dropped.map(([r, cc], k) => ({ id: ++fxId.current, color: dc[k], r, c: cc, kind: 'drop' as const, delay: 120 + k * 15 })),
          ]);
          setScore((s) => s + popped * 10 + res.dropped.length * 20);
          playSound(res.dropped.length ? 'win' : 'match');
          haptic(res.dropped.length ? 'success' : 'light');
          setMisses(0);
        } else {
          playSound('tap');
          const m = misses + 1;
          if (m >= MISS_LIMIT) {
            g = dropCeiling(g, colorsOnBoard(g).length ? colorsOnBoard(g) : [0, 1, 2], seed * 97 + drops);
            setDrops((x) => x + 1);
            setMisses(0);
            setToast({ text: t.ceilingDown, id: Date.now() });
            haptic('warning');
          } else setMisses(m);
        }
        setGrid(g);
        setFlying(null);
        if (isEmpty(g)) {
          const stars = starsFor(drops);
          setWonStars(stars);
          playSound('win');
          haptic('success');
          onWin(stars);
          return;
        }
        if (reachedBottom(g)) {
          setLost(true);
          playSound('wrong');
          haptic('warning');
          return;
        }
        const cs = colorsOnBoard(g);
        const fix = (col: number) => (col === RAINBOW || cs.includes(col) ? col : pick(g));
        setCurrent(fix(next));
        setNext(pick(g));
      });
    },
    [flying, lost, wonStars, grid, current, next, px, pos, d, u, misses, drops, seed, onWin, pick],
  );

  const aimAt = (e: GestureResponderEvent) => {
    if (!u) return;
    const x = e.nativeEvent.pageX - origin.current.x;
    const y = e.nativeEvent.pageY - origin.current.y;
    const s = px(SHOOTER);
    const a = Math.atan2(s.y - y, x - s.x);
    setAngle(Math.min(Math.PI - 0.16, Math.max(0.16, a < 0 ? (a < -Math.PI / 2 ? Math.PI - 0.16 : 0.16) : a)));
  };

  const swap = () => {
    if (flying !== null) return;
    setCurrent(next);
    setNext(current);
    playSound('tap');
  };

  const useRainbow = () => {
    if (flying !== null || current === RAINBOW) return;
    if (rainbows <= 0) {
      playSound('wrong');
      return setToast({ text: t.outOfRainbow, id: Date.now() });
    }
    onUseRainbow();
    setNext(current);
    setCurrent(RAINBOW);
    playSound('hint');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const dots = useMemo(() => {
    if (!aimPath) return [];
    const out: { x: number; y: number }[] = [];
    const p = aimPath.path;
    for (let i = 1; i < p.length; i++) {
      const len = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      for (let s = 1.2; s < len; s += 1.2) out.push({ x: p[i - 1].x + ((p[i].x - p[i - 1].x) * s) / len, y: p[i - 1].y + ((p[i].y - p[i - 1].y) * s) / len });
    }
    return out.slice(0, 40);
  }, [aimPath]);

  const shooterPx = u ? px(SHOOTER) : { x: 0, y: 0 };
  const lineY = u ? (1 + (MAX_ROWS - 0.5) * ROW_H) * u : 0;

  return (
    <GameFrame
      title={isDaily ? c.daily : c.level(level)}
      info={c.score(score)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared, c.score(score)]}
      reward={reward ? t.reward : false}
      onNext={onNext}
      lost={lost ? { title: t.lostTitle, body: t.lostBody } : null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <ToolButton tone="teal" icon={SWAP} label={t.swap} onPress={swap} />
          <ToolButton tone="violet" icon={RAINBOW_ICON} label={t.rainbow} count={rainbows} onPress={useRainbow} />
        </View>
      }
    >
      <View
        testID="bubble-area"
        ref={areaRef}
        style={styles.area}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          measure();
          aimAt(e);
        }}
        onResponderMove={aimAt}
        // Nişan alırken sürükleme üst bileşene (kaydırma vb.) devredilmesin
        onResponderTerminationRequest={() => false}
        onResponderTerminate={() => setAngle(null)}
        onResponderRelease={() => angle !== null && shoot(angle)}
      >
        {u ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.board, { left: ox, width: boardW, height: lineY + d * 0.3 }]} />
            <View style={[styles.line, { left: ox, width: boardW, top: lineY }]} />
            {grid.map((row, r) => row.map((col, cc) => (col >= 0 ? <Bubble key={`${r}-${cc}`} color={col} d={d} {...px(center(r, cc))} /> : null)))}
            {fx.map((f) => (
              <Fx key={f.id} id={f.id} onDone={fxDone} color={f.color} d={d} kind={f.kind} delay={f.delay} {...px(center(f.r, f.c))} />
            ))}
            {dots.map((p, i) => {
              const q = px(p);
              return <View key={i} style={[styles.dot, { left: q.x - 4, top: q.y - 4, opacity: 1 - i / 45 }]} />;
            })}
            {flying !== null ? <Animated.Image testID="flying" source={img(flying)} style={{ position: 'absolute', width: d, height: d, transform: pos.getTranslateTransform() }} /> : null}
            <View style={[styles.cannon, { left: shooterPx.x - d * 0.9, top: shooterPx.y - d * 0.9, width: d * 1.8, height: d * 1.8, borderRadius: d }]} />
            {flying === null ? <Image source={img(current)} style={{ position: 'absolute', left: shooterPx.x - d * 0.65, top: shooterPx.y - d * 0.65, width: d * 1.3, height: d * 1.3 }} /> : null}
            <Image source={img(next)} style={{ position: 'absolute', left: shooterPx.x - d * 3.2, top: shooterPx.y - d * 0.1, width: d * 0.85, height: d * 0.85, opacity: 0.9 }} />
            <View style={[styles.pill, { left: shooterPx.x + d * 1.3, top: shooterPx.y - 18, maxWidth: boardW / 2 - d * 1.4 }, MISS_LIMIT - misses <= 2 && styles.pillWarn]}>
              <Text style={styles.pillText} numberOfLines={2}>
                {t.shotsToCeiling(MISS_LIMIT - misses)}
              </Text>
            </View>
            {level === 1 && !isDaily && shots === 0 && angle === null ? (
              <Text style={[styles.tip, { left: ox + 16, width: boardW - 32, top: lineY * 0.62 }]}>{t.aimTip}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  board: { position: 'absolute', top: 0, backgroundColor: 'rgba(10,30,60,0.35)', borderRadius: 18 },
  line: { position: 'absolute', height: 3, backgroundColor: 'rgba(255,210,63,0.75)', borderRadius: 2 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  cannon: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 20 },
  pill: { position: 'absolute', minHeight: 36, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 18, backgroundColor: 'rgba(10,30,60,0.55)', justifyContent: 'center' },
  pillWarn: { backgroundColor: '#C8507E' },
  pillText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  tip: { position: 'absolute', color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 6 },
});
