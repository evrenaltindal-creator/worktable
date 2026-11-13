import { ComponentRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, Image, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { Board, COLS, ROWS, Tile, bestMove, groupAt, hasMoves, makeLevel, pop, smash, tilesLeft } from './game/colorpop';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { t } from './text';

const native = Platform.OS !== 'web';
export const TILE_IMG = [
  require('../assets/tiles/t0.png'),
  require('../assets/tiles/t1.png'),
  require('../assets/tiles/t2.png'),
  require('../assets/tiles/t3.png'),
  require('../assets/tiles/t4.png'),
];
const HAMMER = require('../assets/ui/hammer.png');

/** Tek karo: konumu değişince oraya düşer/kayar */
const TileView = memo(function TileView({ tile, col, row, size, mark }: { tile: Tile; col: number; row: number; size: number; mark: boolean }) {
  const x = col * size;
  const y = (ROWS - 1 - row) * size;
  const [pos] = useState(() => new Animated.ValueXY({ x, y }));
  const last = useRef({ x, y, size });
  useEffect(() => {
    const prev = last.current;
    last.current = { x, y, size };
    if (prev.size !== size) return pos.setValue({ x, y });
    const dist = Math.abs(prev.y - y) + Math.abs(prev.x - x);
    if (!dist) return;
    Animated.timing(pos, { toValue: { x, y }, duration: 140 + Math.min(260, (dist / size) * 50), easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
  }, [x, y, size, pos]);
  return (
    <Animated.View style={[styles.tile, { width: size, height: size, transform: pos.getTranslateTransform() }]}>
      <Image source={TILE_IMG[tile.color]} style={{ width: size * 0.94, height: size * 0.94, margin: size * 0.03 }} />
      {mark ? <View style={[styles.mark, { borderRadius: size * 0.24 }]} /> : null}
    </Animated.View>
  );
});

function Pop({ id, tile, col, row, size, delay, onDone }: { id: number; tile: Tile; col: number; row: number; size: number; delay: number; onDone: (id: number) => void }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 260, delay, easing: Easing.out(Easing.quad), useNativeDriver: native }).start(() => onDone(id));
  }, [v, id, delay, onDone]);
  return (
    <Animated.Image
      source={TILE_IMG[tile.color]}
      style={{
        position: 'absolute',
        left: col * size + size * 0.03,
        top: (ROWS - 1 - row) * size + size * 0.03,
        width: size * 0.94,
        height: size * 0.94,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
      }}
    />
  );
}

interface Props {
  level: number;
  variant: number;
  isDaily: boolean;
  undos: number;
  hints: number;
  hammers: number;
  firstTime: boolean;
  onUseUndo: () => void;
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

function Round({ level, variant, isDaily, undos, hints, hammers, firstTime, onUseUndo, onUseHint, onUseHammer, onWin, onNext, onHome, onRestart }: Props & { onRestart: () => void }) {
  const lv = useMemo(() => makeLevel(level, variant), [level, variant]);
  const [board, setBoard] = useState<Board>(lv.board);
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState<[number, number][] | null>(null);
  const [hammerMode, setHammerMode] = useState(false);
  const [pops, setPops] = useState<{ id: number; tile: Tile; col: number; row: number; delay: number }[]>([]);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [lost, setLost] = useState(false);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(() => (level === 1 && !isDaily ? { text: t.tapTip, id: 1 } : null));
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const popId = useRef(0);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const popDone = useCallback((id: number) => setPops((old) => old.filter((p) => p.id !== id)), []);
  const done = wonStars !== null || lost;
  const left = tilesLeft(board);

  const BAR = 60;
  const size = Math.floor(Math.min(area.width / COLS, (area.height - BAR) / ROWS, 84));
  const boardW = size * COLS;
  const boardH = size * ROWS;
  const ox = (area.width - boardW) / 2;
  const top = Math.max(0, (area.height - BAR - boardH) / 2);
  const oy = top + BAR;

  const apply = (res: { board: Board; removed: { c: number; r: number; tile: Tile }[]; points: number }) => {
    setHistory((h) => [...h.slice(-30), { board, score }]);
    setPops((old) => [...old.slice(-60), ...res.removed.map((x, k) => ({ id: ++popId.current, tile: x.tile, col: x.c, row: x.r, delay: Math.min(k * 18, 200) }))]);
    setBoard(res.board);
    const sc = score + res.points;
    setScore(sc);
    setHint(null);
    const n = res.removed.length;
    playSound(n >= 8 ? 'win' : n >= 2 ? 'match' : 'tap');
    haptic(n >= 8 ? 'success' : 'light');
    if (!hasMoves(res.board)) {
      const l = tilesLeft(res.board);
      if (l <= lv.allowed) {
        const stars = l === 0 || l <= lv.allowed * 0.35 ? 3 : l <= lv.allowed * 0.7 ? 2 : 1;
        setScore(sc + (l === 0 ? 500 : 0));
        setTimeout(() => {
          setWonStars(stars);
          playSound('win');
          haptic('success');
          onWin(stars);
        }, 450);
      } else
        setTimeout(() => {
          setLost(true);
          playSound('wrong');
          haptic('warning');
        }, 450);
    }
  };

  const tapCell = (col: number, row: number) => {
    if (done || !board[col]?.[row]) return;
    if (hammerMode) {
      const res = smash(board, col, row);
      if (!res) return;
      setHammerMode(false);
      onUseHammer();
      return apply(res);
    }
    const res = pop(board, col, row);
    if (!res) {
      playSound('wrong');
      setToast({ text: t.lone, id: Date.now() });
      return;
    }
    apply(res);
  };

  const onRelease = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.pageX - origin.current.x - ox;
    const y = e.nativeEvent.pageY - origin.current.y - oy;
    if (x < 0 || y < 0 || x >= boardW || y >= boardH) return;
    tapCell(Math.floor(x / size), ROWS - 1 - Math.floor(y / size));
  };

  const undo = () => {
    if (done || !history.length) return;
    if (undos <= 0) {
      playSound('wrong');
      return setToast({ text: t.outOfUndo, id: Date.now() });
    }
    onUseUndo();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBoard(prev.board);
    setScore(prev.score);
    setHint(null);
    playSound('tap');
  };

  const showHint = () => {
    if (done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const mv = bestMove(board, level * 31 + history.length);
    if (!mv) return;
    onUseHint();
    setHint(groupAt(board, mv[0], mv[1]));
    playSound('hint');
  };

  const toggleHammer = () => {
    if (done) return;
    if (hammerMode) return setHammerMode(false);
    if (hammers <= 0) {
      playSound('wrong');
      return setToast({ text: t.outOfHammers, id: Date.now() });
    }
    setHammerMode(true);
    setToast({ text: t.hammerOn, id: Date.now() });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const hintKeys = new Set(hint?.map(([x, y]) => `${x},${y}`));

  return (
    <GameFrame
      title={isDaily ? c.daily : c.level(level)}
      info={c.score(score)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared(left), c.score(score)]}
      reward={reward ? t.reward : false}
      onNext={onNext}
      lost={lost ? { title: t.lostTitle, body: t.lostBody(left, lv.allowed) } : null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <ToolButton tone="teal" icon="undo" label={c.undo} count={undos} onPress={undo} disabled={!history.length} />
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={showHint} />
          <ToolButton tone={hammerMode ? 'teal' : 'violet'} icon={HAMMER} label={hammerMode ? c.cancel : t.hammer} count={hammers} onPress={toggleHammer} />
        </View>
      }
    >
      <View
        testID="colorpop-area"
        ref={areaRef}
        style={styles.area}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={measure}
        onResponderRelease={onRelease}
      >
        {size > 0 ? (
          <View pointerEvents="none" style={[styles.bar, { left: ox, top, width: boardW, height: BAR - 8 }]}>
            <Text style={[styles.barText, left <= lv.allowed && styles.barOk]} numberOfLines={1} adjustsFontSizeToFit>
              {t.goal(left, lv.allowed)}
            </Text>
          </View>
        ) : null}
        {size > 0 ? (
          <View pointerEvents="none" style={[styles.board, { left: ox, top: oy, width: boardW, height: boardH }]}>
            {board.map((col, ci) =>
              col.map((tile, r) => (tile ? <TileView key={tile.id} tile={tile} col={ci} row={r} size={size} mark={hintKeys.has(`${ci},${r}`)} /> : null)),
            )}
            {pops.map((p) => (
              <Pop key={p.id} id={p.id} tile={p.tile} col={p.col} row={p.row} size={size} delay={p.delay} onDone={popDone} />
            ))}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  board: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(20,20,50,0.35)' },
  tile: { position: 'absolute', left: 0, top: 0 },
  mark: { position: 'absolute', left: 1, top: 1, right: 1, bottom: 1, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.25)' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 14 },
  bar: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(20,20,50,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  barText: { color: '#FFE066', fontSize: 22, fontWeight: '900' },
  barOk: { color: '#7EE0A1' },
});
