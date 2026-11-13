import { ComponentRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, Image, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { Cube, findPair, freeCubes, makeLevel, reshuffle, rotate } from './game/cube';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { starsFor } from './kit/store';
import { t } from './text';

const native = Platform.OS !== 'web';
export const CUBE_IMG = Array.from({ length: 12 }, (_, i) => i).map(
  (i) =>
    [
      require('../assets/cubes/c0.png'),
      require('../assets/cubes/c1.png'),
      require('../assets/cubes/c2.png'),
      require('../assets/cubes/c3.png'),
      require('../assets/cubes/c4.png'),
      require('../assets/cubes/c5.png'),
      require('../assets/cubes/c6.png'),
      require('../assets/cubes/c7.png'),
      require('../assets/cubes/c8.png'),
      require('../assets/cubes/c9.png'),
      require('../assets/cubes/c10.png'),
      require('../assets/cubes/c11.png'),
    ][i],
);
const ROTATE = require('../assets/ui/rotate.png');

/** Küpün ekrandaki yeri (s = küp kenarı, piksel). Görüntü (1.732s x 2s) sol üst köşesi. */
function project(cube: Cube, r: number, width: number, depth: number, s: number) {
  const p = rotate(cube.x, cube.y, r, width, depth);
  return { left: (p.x - p.y) * 0.866 * s - 0.866 * s, top: (p.x + p.y) * 0.5 * s - cube.z * s, order: (p.x + p.y) * 100 + cube.z };
}

/** Görüntünün altıgen kenar çizgisi içinde mi (görüntüye göre koordinat) */
function insideHex(px: number, py: number, s: number) {
  const w = 1.732 * s;
  if (px < 0 || px > w || py < 0 || py > 2 * s) return false;
  const half = w / 2;
  const dx = Math.abs(px - half) / half; // 0 ortada, 1 kenarda
  // üst ve alt uçlardaki eğik kenarlar
  return py >= dx * 0.5 * s && py <= 2 * s - dx * 0.5 * s;
}

const CubeView = memo(function CubeView({ id, symbol, left, top, s, state }: { id: number; symbol: number; left: number; top: number; s: number; state: 'free' | 'blocked' | 'sel' | 'hint' }) {
  const size = { width: 1.732 * s, height: 2 * s };
  return (
    <View testID={`cube-${id}-${state}`} style={{ position: 'absolute', left, top, ...size }}>
      <Image source={CUBE_IMG[symbol]} style={size} />
      {state !== 'free' ? (
        <Image
          source={CUBE_IMG[symbol]}
          style={[size, styles.overlay, { tintColor: state === 'blocked' ? '#000000' : state === 'sel' ? '#FFD34E' : '#5BE08F', opacity: state === 'blocked' ? 0.4 : 0.5 }]}
        />
      ) : null}
    </View>
  );
});

function Leaving({ symbol, left, top, s, onDone, id }: { symbol: number; left: number; top: number; s: number; onDone: (id: number) => void; id: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: native }).start(() => onDone(id));
  }, [v, id, onDone]);
  return (
    <Animated.Image
      source={CUBE_IMG[symbol]}
      style={{
        position: 'absolute',
        left,
        top,
        width: 1.732 * s,
        height: 2 * s,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -s * 0.8] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
      }}
    />
  );
}

interface Props {
  level: number;
  variant: number;
  isDaily: boolean;
  hints: number;
  firstTime: boolean;
  onUseHint: () => void;
  onWin: (stars: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

/** "Yeniden başla" tüm durumu sıfırlamak için oyunu yeni bir anahtarla baştan kurar */
export function GameScreen(props: Props) {
  const [round, setRound] = useState(0);
  return <Round key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

function Round({ level, variant, isDaily, hints, firstTime, onUseHint, onWin, onNext, onHome, onRestart }: Props & { onRestart: () => void }) {
  const lv = useMemo(() => makeLevel(level, variant), [level, variant]);
  const [cubes, setCubes] = useState<Cube[]>(lv.cubes);
  const [view, setView] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [hint, setHint] = useState<number[]>([]);
  const [helps, setHelps] = useState(0);
  const [shuffles, setShuffles] = useState(0);
  const [leaving, setLeaving] = useState<{ id: number; symbol: number; cube: Cube }[]>([]);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(() => (level === 1 && !isDaily ? { text: t.tapTip, id: 1 } : null));
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const leaveId = useRef(0);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const leaveDone = useCallback((id: number) => setLeaving((old) => old.filter((l) => l.id !== id)), []);
  const done = wonStars !== null;

  const free = useMemo(() => new Set(freeCubes(cubes).map((q) => q.id)), [cubes]);

  // Ölçek: tüm seviye (başlangıç küpleri) bu görünümde ekrana sığsın; küpler kalktıkça zıplamasın
  const layout = useMemo(() => {
    const unit = lv.cubes.map((q) => project(q, view, lv.width, lv.depth, 1));
    const minX = Math.min(...unit.map((u) => u.left));
    const maxX = Math.max(...unit.map((u) => u.left + 1.732));
    const minY = Math.min(...unit.map((u) => u.top));
    const maxY = Math.max(...unit.map((u) => u.top + 2));
    const s = area.width ? Math.min((area.width - 16) / (maxX - minX), (area.height - 16) / (maxY - minY), 92) : 0;
    const ox = (area.width - (maxX - minX) * s) / 2 - minX * s;
    const oy = (area.height - (maxY - minY) * s) / 2 - minY * s;
    return { s, ox, oy };
  }, [lv, view, area]);

  const placed = useMemo(
    () =>
      cubes
        .map((q) => {
          const p = project(q, view, lv.width, lv.depth, layout.s);
          return { cube: q, left: p.left + layout.ox, top: p.top + layout.oy, order: p.order };
        })
        .sort((a, b) => a.order - b.order),
    [cubes, view, lv, layout],
  );

  const tapAt = (x: number, y: number) => {
    if (done) return;
    for (let k = placed.length - 1; k >= 0; k--) {
      const p = placed[k];
      if (insideHex(x - p.left, y - p.top, layout.s)) return choose(p.cube);
    }
  };

  const choose = (q: Cube) => {
    if (!free.has(q.id)) {
      playSound('wrong');
      haptic('warning');
      setToast({ text: t.blocked, id: Date.now() });
      return;
    }
    const other = cubes.find((x) => x.id === selected);
    if (!other) {
      setSelected(q.id);
      playSound('tap');
      return;
    }
    if (other.id === q.id) return setSelected(-1);
    if (other.symbol !== q.symbol) {
      setSelected(q.id);
      playSound('tap');
      return;
    }
    // eşleşme
    let next = cubes.filter((x) => x.id !== q.id && x.id !== other.id);
    setLeaving((old) => [...old.slice(-10), { id: ++leaveId.current, symbol: q.symbol, cube: q }, { id: ++leaveId.current, symbol: other.symbol, cube: other }]);
    setSelected(-1);
    setHint([]);
    playSound('match');
    haptic('light');
    if (!next.length) {
      setCubes(next);
      const stars = starsFor(helps + shuffles);
      setTimeout(() => {
        setWonStars(stars);
        playSound('win');
        haptic('success');
        onWin(stars);
      }, 450);
      return;
    }
    if (!findPair(next)) {
      next = reshuffle(next, level * 131 + shuffles * 17 + next.length);
      setShuffles((n) => n + 1);
      setToast({ text: t.shuffled, id: Date.now() });
    }
    setCubes(next);
  };

  const showHint = () => {
    if (done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const pair = findPair(cubes);
    if (!pair) return;
    onUseHint();
    setHelps((h) => h + 1);
    setHint(pair.map((q) => q.id));
    setSelected(-1);
    playSound('hint');
  };

  const turn = () => {
    setView((v) => (v + 1) % 4);
    playSound('tap');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const onRelease = (e: GestureResponderEvent) => tapAt(e.nativeEvent.pageX - origin.current.x, e.nativeEvent.pageY - origin.current.y);

  return (
    <GameFrame
      title={isDaily ? c.daily : c.level(level)}
      info={t.left(cubes.length)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared]}
      reward={reward ? t.reward : false}
      onNext={onNext}
      lost={null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <ToolButton tone="teal" icon={ROTATE} label={t.rotate} onPress={turn} />
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={showHint} />
        </View>
      }
    >
      <View
        testID="cube-area"
        ref={areaRef}
        style={styles.area}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={measure}
        onResponderRelease={onRelease}
      >
        {layout.s > 0 ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {placed.map((p) => (
              <CubeView
                key={p.cube.id}
                id={p.cube.id}
                symbol={p.cube.symbol}
                left={p.left}
                top={p.top}
                s={layout.s}
                state={selected === p.cube.id ? 'sel' : hint.includes(p.cube.id) ? 'hint' : free.has(p.cube.id) ? 'free' : 'blocked'}
              />
            ))}
            {leaving.map((l) => {
              const p = project(l.cube, view, lv.width, lv.depth, layout.s);
              return <Leaving key={l.id} id={l.id} symbol={l.symbol} left={p.left + layout.ox} top={p.top + layout.oy} s={layout.s} onDone={leaveDone} />;
            })}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  overlay: { position: 'absolute', left: 0, top: 0 },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 20 },
});
