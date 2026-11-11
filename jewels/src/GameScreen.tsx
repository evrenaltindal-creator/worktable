import { ComponentRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, Image, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { Board, Game, Gem, SIZE, Step, adjacent, findMove, makeLevel, stepScore } from './game/jewels';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { t } from './text';

const native = Platform.OS !== 'web';
export const GEM_IMG = [
  require('../assets/gems/g0.png'),
  require('../assets/gems/g1.png'),
  require('../assets/gems/g2.png'),
  require('../assets/gems/g3.png'),
  require('../assets/gems/g4.png'),
  require('../assets/gems/g5.png'),
];
const STAR = require('../assets/gems/star.png');
const OVERLAY = { row: require('../assets/gems/row.png'), col: require('../assets/gems/col.png'), bomb: require('../assets/gems/bomb.png') };
const HAMMER = require('../assets/ui/hammer.png');

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function GemImage({ gem, size }: { gem: Gem; size: number }) {
  const s = size * 0.86;
  const style = { position: 'absolute' as const, left: (size - s) / 2, top: (size - s) / 2, width: s, height: s };
  if (gem.special === 'star') return <Image source={STAR} style={style} />;
  return (
    <>
      <Image source={GEM_IMG[gem.kind]} style={style} />
      {gem.special !== 'none' ? <Image source={OVERLAY[gem.special]} style={style} /> : null}
    </>
  );
}

interface GemProps {
  gem: Gem;
  index: number;
  size: number;
  /** ilk çizimde kaç satır yukarıdan düşerek gelsin (yeni taşlar için negatif) */
  from: number;
  mark: 'sel' | 'hint' | null;
}

/** Tek bir taş: konumu değişince oraya kayar/düşer */
const GemView = memo(function GemView({ gem, index, size, from, mark }: GemProps) {
  const r = Math.floor(index / SIZE);
  const col = index % SIZE;
  const [pos] = useState(() => new Animated.ValueXY({ x: col * size, y: (r + from) * size }));
  const [scale] = useState(() => new Animated.Value(gem.special !== 'none' && from === 0 ? 0.3 : 1));
  const last = useRef<{ index: number; size: number } | null>(null);

  useEffect(() => {
    const prev = last.current;
    last.current = { index, size };
    if (prev && prev.size !== size) {
      pos.setValue({ x: col * size, y: r * size });
      return;
    }
    const prevRow = prev ? Math.floor(prev.index / SIZE) : r + from;
    const dist = Math.abs(r - prevRow) + (prev ? Math.abs(col - (prev.index % SIZE)) : 0);
    if (!dist) return;
    Animated.timing(pos, {
      toValue: { x: col * size, y: r * size },
      duration: 120 + 45 * Math.min(dist, 8),
      easing: dist > 1 ? Easing.bounce : Easing.out(Easing.quad),
      useNativeDriver: native,
    }).start();
  }, [index, size, r, col, from, pos]);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: native }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.cell, { width: size, height: size, transform: [...pos.getTranslateTransform(), { scale }] }]}>
      {mark ? <View style={[styles.mark, mark === 'sel' ? styles.sel : styles.hint, { borderRadius: size * 0.22 }]} /> : null}
      <GemImage gem={gem} size={size} />
    </Animated.View>
  );
});

/** Patlayan taş efekti */
function Pop({ id, gem, index, size, onDone }: { id: number; gem: Gem; index: number; size: number; onDone: (id: number) => void }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: native }).start(() => onDone(id));
  }, [v, id, onDone]);
  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          left: (index % SIZE) * size,
          top: Math.floor(index / SIZE) * size,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
        },
      ]}
    >
      <GemImage gem={gem} size={size} />
    </Animated.View>
  );
}

interface Props {
  level: number;
  variant: number;
  isDaily: boolean;
  hints: number;
  hammers: number;
  firstTime: boolean;
  onUseHint: () => void;
  onUseHammer: () => void;
  onWin: (stars: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

/** "Yeniden başla" tüm durumu sıfırlamak için oyunu yeni bir anahtarla baştan kurar */
export function GameScreen(props: Props) {
  const [round, setRound] = useState(0);
  return <Round key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

function Round({ level, variant, isDaily, hints, hammers, firstTime, onUseHint, onUseHammer, onWin, onNext, onHome, onRestart }: Props & { onRestart: () => void }) {
  const lv = useMemo(() => makeLevel(level, variant), [level, variant]);
  const [game] = useState(() => new Game(lv.kinds, lv.seed));
  const [view, setView] = useState<Board>(() => game.board.slice());
  const [from, setFrom] = useState<Record<number, number>>({});
  const [need, setNeed] = useState(() => lv.goals.map((g) => g.count));
  const [moves, setMoves] = useState(lv.moves);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [hammerMode, setHammerMode] = useState(false);
  const [pops, setPops] = useState<{ id: number; gem: Gem; index: number }[]>([]);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [lost, setLost] = useState(false);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(() => (level === 1 && !isDaily ? { text: t.swapTip, id: 1 } : null));
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const popId = useRef(0);
  const touch = useRef<{ cell: number; x: number; y: number; used: boolean } | null>(null);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const popDone = useCallback((id: number) => setPops((old) => old.filter((p) => p.id !== id)), []);

  const done = wonStars !== null || lost;
  const BAR = 74;
  const size = Math.floor(Math.min(area.width / SIZE, (area.height - BAR - 8) / SIZE, 96));
  const boardPx = size * SIZE;
  const boardLeft = (area.width - boardPx) / 2;
  // hedef çubuğu + tahta dikeyde ortalanır
  const top = Math.max(0, Math.floor((area.height - BAR - boardPx) / 2));

  /** Adımları sırayla canlandırır; hedef ve puanı günceller */
  const play = async (steps: Step[], movesLeft: number) => {
    const n = need.slice();
    let sc = score;
    for (const st of steps) {
      if (st.shuffled) {
        setToast({ text: t.shuffled, id: Date.now() });
        setView(st.board.slice());
        await sleep(450);
        continue;
      }
      const fr: Record<number, number> = {};
      st.falls.forEach((f) => f.fresh && (fr[f.id] = f.from));
      st.removed.forEach(({ gem }) => {
        const gi = lv.goals.findIndex((g) => g.kind === gem.kind);
        if (gi >= 0) n[gi] = Math.max(0, n[gi] - 1);
      });
      sc += stepScore(st);
      setPops((old) => [...old.slice(-80), ...st.removed.map(({ i, gem }) => ({ id: ++popId.current, gem, index: i }))]);
      setFrom((old) => ({ ...old, ...fr }));
      setView(st.board.slice());
      setNeed(n.slice());
      setScore(sc);
      playSound(st.chain > 1 || st.created.length ? 'win' : 'match');
      haptic(st.chain > 1 ? 'success' : 'light');
      await sleep(st.chain === 1 ? 360 : 400);
    }
    if (n.every((x) => x <= 0)) {
      const left = movesLeft / lv.moves;
      const stars = left >= 0.35 ? 3 : left >= 0.12 ? 2 : 1;
      setScore(sc + movesLeft * 50);
      setWonStars(stars);
      playSound('win');
      haptic('success');
      onWin(stars);
    } else if (movesLeft <= 0) {
      setLost(true);
      playSound('wrong');
      haptic('warning');
    }
    setBusy(false);
  };

  const trySwap = async (a: number, b: number) => {
    if (busy || done) return;
    setSelected(-1);
    setHint(null);
    setBusy(true);
    const before = view;
    const swapped = view.slice();
    [swapped[a], swapped[b]] = [swapped[b], swapped[a]];
    setView(swapped);
    await sleep(170);
    const steps = game.swap(a, b);
    if (!steps) {
      setView(before);
      playSound('wrong');
      haptic('warning');
      await sleep(200);
      setBusy(false);
      return;
    }
    const m = moves - 1;
    setMoves(m);
    await play(steps, m);
  };

  const smash = async (i: number) => {
    setHammerMode(false);
    setSelected(-1);
    setHint(null);
    setBusy(true);
    onUseHammer();
    await play(game.hammer(i), moves);
  };

  const tap = (cell: number) => {
    if (busy || done) return;
    if (hammerMode) return void smash(cell);
    if (selected < 0) {
      setSelected(cell);
      playSound('tap');
    } else if (selected === cell) setSelected(-1);
    else if (adjacent(selected, cell)) void trySwap(selected, cell);
    else {
      setSelected(cell);
      playSound('tap');
    }
  };

  const cellAt = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.pageX - origin.current.x - boardLeft;
    const y = e.nativeEvent.pageY - origin.current.y - top - BAR;
    if (x < 0 || y < 0 || x >= boardPx || y >= boardPx) return { cell: -1, x, y };
    return { cell: Math.floor(y / size) * SIZE + Math.floor(x / size), x, y };
  };

  const onGrant = (e: GestureResponderEvent) => {
    measure();
    const p = cellAt(e);
    touch.current = p.cell >= 0 ? { ...p, used: false } : null;
  };
  const onMove = (e: GestureResponderEvent) => {
    const s = touch.current;
    if (!s || s.used || hammerMode) return;
    const p = cellAt(e);
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < size * 0.35) return;
    s.used = true;
    const r = Math.floor(s.cell / SIZE);
    const col = s.cell % SIZE;
    const target = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (col < SIZE - 1 ? s.cell + 1 : -1) : col > 0 ? s.cell - 1 : -1) : dy > 0 ? (r < SIZE - 1 ? s.cell + SIZE : -1) : r > 0 ? s.cell - SIZE : -1;
    if (target >= 0) void trySwap(s.cell, target);
  };
  const onRelease = () => {
    const s = touch.current;
    touch.current = null;
    if (s && !s.used) tap(s.cell);
  };

  const showHint = () => {
    if (busy || done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const mv = findMove(game.board, lv.goals.filter((_, k) => need[k] > 0).map((g) => g.kind));
    if (!mv) return;
    onUseHint();
    setSelected(-1);
    setHint(mv);
    playSound('hint');
  };

  const toggleHammer = () => {
    if (busy || done) return;
    if (hammerMode) return setHammerMode(false);
    if (hammers <= 0) {
      playSound('wrong');
      return setToast({ text: t.outOfHammers, id: Date.now() });
    }
    setHammerMode(true);
    setSelected(-1);
    setToast({ text: t.hammerOn, id: Date.now() });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

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
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={showHint} />
          <ToolButton tone={hammerMode ? 'teal' : 'violet'} icon={HAMMER} label={hammerMode ? c.cancel : t.hammer} count={hammers} onPress={toggleHammer} />
        </View>
      }
    >
      <View
        testID="jewel-area"
        ref={areaRef}
        style={styles.area}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onGrant}
        onResponderMove={onMove}
        onResponderRelease={onRelease}
      >
        {size > 0 ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.bar, { top, height: BAR - 8, left: boardLeft, width: boardPx }]}>
              <View style={styles.goals}>
                {lv.goals.map((g, k) => (
                  <View key={k} style={styles.goal}>
                    <Image source={GEM_IMG[g.kind]} style={styles.goalImg} />
                    <Text style={[styles.goalText, need[k] <= 0 && styles.goalDone]}>{need[k] <= 0 ? '✓' : need[k]}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.movesPill, moves <= 3 && styles.movesLow]}>
                <Text style={styles.movesText} numberOfLines={1}>
                  {t.moves(moves)}
                </Text>
              </View>
            </View>
            <View style={[styles.board, { top: top + BAR, left: boardLeft, width: boardPx, height: boardPx }]}>
              {Array.from({ length: SIZE * SIZE }, (_, i) => (
                <View
                  key={i}
                  style={[styles.tile, { left: (i % SIZE) * size, top: Math.floor(i / SIZE) * size, width: size, height: size }, (Math.floor(i / SIZE) + i) % 2 === 0 && styles.tileAlt]}
                />
              ))}
              {view.map((g, i) =>
                g ? <GemView key={g.id} gem={g} index={i} size={size} from={from[g.id] ?? 0} mark={selected === i ? 'sel' : hint && hint.includes(i) ? 'hint' : null} /> : null,
              )}
              {pops.map((p) => (
                <Pop key={p.id} id={p.id} gem={p.gem} index={p.index} size={size} onDone={popDone} />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  bar: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 18, backgroundColor: 'rgba(10,10,40,0.45)' },
  goals: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  goalImg: { width: 44, height: 44 },
  goalText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', minWidth: 30 },
  goalDone: { color: '#7EE0A1' },
  movesPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', flexShrink: 1 },
  movesLow: { backgroundColor: '#C8507E' },
  movesText: { color: '#FFE066', fontSize: 20, fontWeight: '900' },
  board: { position: 'absolute', borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(20,14,60,0.55)' },
  tile: { position: 'absolute' },
  tileAlt: { backgroundColor: 'rgba(255,255,255,0.06)' },
  cell: { position: 'absolute', left: 0, top: 0 },
  mark: { position: 'absolute', left: 2, top: 2, right: 2, bottom: 2, borderWidth: 4 },
  sel: { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.22)' },
  hint: { borderColor: '#7EE0A1', backgroundColor: 'rgba(126,224,161,0.3)' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 20 },
});
