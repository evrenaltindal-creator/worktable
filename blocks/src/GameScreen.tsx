import { ComponentRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { Board, Dealer, N, Piece, SHAPES, bestMove, fits, fullCells, isStuck, makeLevel, place, shapeSize } from './game/blocks';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { starsFor } from './kit/store';
import { t } from './text';

const native = Platform.OS !== 'web';
const REFRESH = require('../assets/ui/refresh.png');

/** Blok renkleri: [yüz, alt kenar] — son renk taş (gri) */
export const COLORS: [string, string][] = [
  ['#E8505B', '#A3303A'],
  ['#3C8CE7', '#2560A8'],
  ['#3FBF7F', '#26845A'],
  ['#F5B82E', '#B07F0E'],
  ['#9A5BD8', '#673A99'],
  ['#FF8A3D', '#B85A1E'],
  ['#8D96A8', '#5E6678'],
];

const Block = memo(function Block({ color, size, ghost, glow }: { color: number; size: number; ghost?: boolean; glow?: boolean }) {
  const [face, edge] = COLORS[color];
  const r = Math.max(3, size * 0.18);
  return (
    <View style={{ width: size, height: size, padding: Math.max(1, size * 0.04), opacity: ghost ? 0.45 : 1 }}>
      <View style={[styles.block, { backgroundColor: face, borderBottomColor: edge, borderRadius: r, borderBottomWidth: Math.max(2, size * 0.1) }, glow && styles.glow]}>
        <View style={[styles.shine, { borderRadius: r * 0.7 }]} />
      </View>
    </View>
  );
});

function PieceView({ piece, cell }: { piece: Piece; cell: number }) {
  const { rows, cols } = shapeSize(piece.shape);
  return (
    <View style={{ width: cols * cell, height: rows * cell }}>
      {SHAPES[piece.shape].cells.map(([r, col], k) => (
        <View key={k} style={{ position: 'absolute', left: col * cell, top: r * cell }}>
          <Block color={piece.color} size={cell} />
        </View>
      ))}
    </View>
  );
}

/** Temizlenen hücre efekti */
function Flash({ id, index, size, color, onDone }: { id: number; index: number; size: number; color: number; onDone: (id: number) => void }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: native }).start(() => onDone(id));
  }, [v, id, onDone]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: (index % N) * size,
        top: Math.floor(index / N) * size,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.15, 0.2] }) }],
      }}
    >
      <Block color={color} size={size} glow />
    </Animated.View>
  );
}

interface Props {
  mode: 'level' | 'classic';
  level: number;
  variant: number;
  isDaily: boolean;
  best: number;
  hints: number;
  refreshes: number;
  firstTime: boolean;
  onUseHint: () => void;
  onUseRefresh: () => void;
  onWin: (stars: number) => void;
  onClassicEnd: (score: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

/** "Yeniden başla" tüm durumu sıfırlamak için oyunu yeni bir anahtarla baştan kurar */
export function GameScreen(props: Props) {
  const [round, setRound] = useState(0);
  return <Round key={round} {...props} onRestart={() => setRound((r) => r + 1)} />;
}

type Drag = { slot: number; x: number; y: number };

function Round(props: Props & { onRestart: () => void }) {
  const { mode, level, variant, isDaily, best, hints, refreshes, firstTime, onUseHint, onUseRefresh, onWin, onClassicEnd, onNext, onHome, onRestart } = props;
  const classic = mode === 'classic';
  const lv = useMemo(() => makeLevel(level, variant), [level, variant]);
  const [dealer] = useState(() => new Dealer(classic ? Date.now() % 1000000 : lv.seed));
  const [board, setBoard] = useState<Board>(() => (classic ? Array(N * N).fill(-1) : lv.board.slice()));
  const [hand, setHand] = useState<(Piece | null)[]>(() => dealer.deal(classic ? Array(N * N).fill(-1) : lv.board));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hint, setHint] = useState<{ slot: number; r: number; c: number } | null>(null);
  const [helps, setHelps] = useState(0);
  const [flashes, setFlashes] = useState<{ id: number; index: number; color: number }[]>([]);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const showTip = level === 1 && !classic && !isDaily;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const [startBest] = useState(best);
  const flashId = useRef(0);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const flashDone = useCallback((id: number) => setFlashes((old) => old.filter((f) => f.id !== id)), []);
  const done = wonStars !== null || over;

  // Yerleşim: tahta üstte, parça tepsisi altta
  const TRAY = Math.max(110, Math.min(240, area.height * 0.22));
  const size = Math.floor(Math.min(area.width / N, (area.height - TRAY - 12) / N, 68));
  const boardPx = size * N;
  const left = (area.width - boardPx) / 2;
  const top = Math.max(0, (area.height - TRAY - 12 - boardPx) / 2);
  const trayTop = top + boardPx + 12;
  const slotW = area.width / 3;
  const trayCell = Math.min(size * 0.7, (slotW - 20) / 5, (TRAY - 20) / 5, 42);
  const LIFT = size * 2.2; // sürüklerken parça parmağın üstünde dursun

  /** Sürüklenen/ seçilen parçanın tahtadaki sol üst hücresi (parmak noktası parçanın ortası) */
  const anchor = (slot: number, x: number, y: number) => {
    const p = hand[slot];
    if (!p) return null;
    const { rows, cols } = shapeSize(p.shape);
    const r = Math.round((y - top) / size - rows / 2);
    const col = Math.round((x - left) / size - cols / 2);
    return { r, c: col, ok: fits(board, p.shape, r, col) };
  };

  const preview = useMemo(() => {
    if (!drag) return null;
    const a = anchor(drag.slot, drag.x, drag.y - LIFT);
    if (!a || !a.ok) return null;
    const p = hand[drag.slot] as Piece;
    const cells = SHAPES[p.shape].cells.map(([dr, dc]) => (a.r + dr) * N + a.c + dc);
    const tmp = board.slice();
    cells.forEach((i) => (tmp[i] = p.color));
    return { cells, clear: fullCells(tmp).cells, color: p.color };
    // anchor her çizimde yeniden kurulur; girdileri aşağıda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, board, hand, size, top, left, LIFT]);

  const finishTurn = (b: Board, h: (Piece | null)[], sc: number) => {
    let nextHand = h;
    if (h.every((p) => !p)) {
      nextHand = dealer.deal(b);
      setHand(nextHand);
    }
    if (!classic && sc >= lv.target) {
      const stars = starsFor(helps);
      setWonStars(stars);
      playSound('win');
      haptic('success');
      onWin(stars);
      return;
    }
    if (isStuck(b, nextHand)) {
      setOver(true);
      playSound('wrong');
      haptic('warning');
      if (classic) onClassicEnd(sc);
    }
  };

  const drop = (slot: number, r: number, col: number) => {
    const p = hand[slot];
    if (!p || done) return false;
    const res = place(board, p, r, col, combo);
    if (!res) return false;
    const h = hand.slice();
    h[slot] = null;
    const sc = score + res.points;
    setBoard(res.board);
    setHand(h);
    setScore(sc);
    setCombo(res.lines ? combo + 1 : 0);
    setSelected(-1);
    setHint(null);
    if (res.lines) {
      setFlashes((old) => [...old.slice(-80), ...res.cleared.map((i) => ({ id: ++flashId.current, index: i, color: res.placed.includes(i) ? p.color : board[i] >= 0 ? board[i] : p.color }))]);
      playSound(res.lines > 1 || combo > 0 ? 'win' : 'match');
      haptic(res.lines > 1 ? 'success' : 'light');
    } else {
      playSound('tap');
      haptic('select');
    }
    finishTurn(res.board, h, sc);
    return true;
  };

  const point = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX - origin.current.x, y: e.nativeEvent.pageY - origin.current.y });
  const slotAt = (x: number, y: number) => (y >= trayTop - 10 ? Math.min(2, Math.floor(x / slotW)) : -1);
  const start = useRef<{ x: number; y: number; slot: number; moved: boolean } | null>(null);

  const onGrant = (e: GestureResponderEvent) => {
    measure();
    if (done) return;
    const p = point(e);
    const slot = slotAt(p.x, p.y);
    start.current = { ...p, slot: slot >= 0 && hand[slot] ? slot : -1, moved: false };
  };
  const onMove = (e: GestureResponderEvent) => {
    const s = start.current;
    if (!s || s.slot < 0) return;
    const p = point(e);
    if (!s.moved && Math.hypot(p.x - s.x, p.y - s.y) < 8) return;
    s.moved = true;
    setDrag({ slot: s.slot, ...p });
  };
  const onRelease = (e: GestureResponderEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || done) return setDrag(null);
    const p = point(e);
    if (s.moved && s.slot >= 0) {
      const a = anchor(s.slot, p.x, p.y - LIFT);
      setDrag(null);
      if (!a || !a.ok || !drop(s.slot, a.r, a.c)) playSound('wrong');
      return;
    }
    // Dokunma: önce parça seç, sonra tahtaya dokun
    const slot = slotAt(p.x, p.y);
    if (slot >= 0) {
      if (hand[slot]) {
        setSelected(slot === selected ? -1 : slot);
        playSound('tap');
      }
      return;
    }
    if (selected >= 0) {
      const a = anchor(selected, p.x, p.y);
      if (!a || !a.ok || !drop(selected, a.r, a.c)) {
        playSound('wrong');
        haptic('warning');
      }
    }
  };

  const showHint = () => {
    if (done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const mv = bestMove(board, hand);
    if (!mv) return;
    onUseHint();
    setHelps((h) => h + 1);
    setHint(mv);
    setSelected(mv.slot);
    playSound('hint');
  };

  const refresh = () => {
    if (done) return;
    if (refreshes <= 0) {
      playSound('wrong');
      return setToast({ text: t.outOfRefresh, id: Date.now() });
    }
    onUseRefresh();
    setHelps((h) => h + 1);
    const h = dealer.deal(board);
    setHand(h);
    setSelected(-1);
    setHint(null);
    playSound('hint');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const hintCells = hint && hand[hint.slot] ? SHAPES[(hand[hint.slot] as Piece).shape].cells.map(([dr, dc]) => (hint.r + dr) * N + hint.c + dc) : [];
  const newBest = classic && over && score > startBest;

  return (
    <GameFrame
      title={classic ? t.classic : isDaily ? c.daily : c.level(level)}
      info={classic ? `${c.score(score)} · ${t.best(Math.max(best, score))}` : t.target(score, lv.target)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared, c.score(score)]}
      reward={reward ? t.reward : false}
      onNext={onNext}
      lost={over ? (classic ? { title: newBest ? t.newBest : t.overTitle, body: t.overBody(score, Math.max(best, score)) } : { title: t.lostTitle, body: t.lostBody }) : null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={showHint} />
          <ToolButton tone="violet" icon={REFRESH} label={t.refresh} count={refreshes} onPress={refresh} />
        </View>
      }
    >
      <View
        testID="blocks-area"
        ref={areaRef}
        style={styles.area}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onGrant}
        onResponderMove={onMove}
        onResponderRelease={onRelease}
        onResponderTerminate={() => setDrag(null)}
      >
        {size > 0 ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.board, { left: left - 6, top: top - 6, width: boardPx + 12, height: boardPx + 12 }]}>
              <View style={{ position: 'absolute', left: 6, top: 6, width: boardPx, height: boardPx }}>
                {board.map((v, i) => {
                  const x = (i % N) * size;
                  const y = Math.floor(i / N) * size;
                  const box = (Math.floor(Math.floor(i / N) / 3) + Math.floor((i % N) / 3)) % 2 === 0;
                  const willClear = preview?.clear.has(i);
                  return (
                    <View key={i} style={[styles.cell, { left: x, top: y, width: size, height: size }, box && styles.cellAlt]}>
                      {v >= 0 ? <Block color={willClear && preview ? preview.color : v} size={size} glow={willClear} /> : null}
                      {v < 0 && preview?.cells.includes(i) ? <Block color={preview.color} size={size} ghost /> : null}
                      {v < 0 && !preview && hintCells.includes(i) ? <Block color={(hand[hint!.slot] as Piece).color} size={size} ghost /> : null}
                    </View>
                  );
                })}
                {[1, 2].map((k) => (
                  <View key={`v${k}`} style={[styles.thick, { left: k * 3 * size - 1.5, top: 0, width: 3, height: boardPx }]} />
                ))}
                {[1, 2].map((k) => (
                  <View key={`h${k}`} style={[styles.thick, { top: k * 3 * size - 1.5, left: 0, height: 3, width: boardPx }]} />
                ))}
                {flashes.map((f) => (
                  <Flash key={f.id} id={f.id} index={f.index} size={size} color={f.color} onDone={flashDone} />
                ))}
              </View>
            </View>
            {hand.map((p, slot) => {
              if (!p || drag?.slot === slot) return null;
              const { rows, cols } = shapeSize(p.shape);
              const fitsNow = !done && SHAPES[p.shape] && isStuck(board, [p]) === false;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.slot,
                    { left: slot * slotW + 6, top: trayTop, width: slotW - 12, height: TRAY },
                    selected === slot && styles.slotSel,
                  ]}
                >
                  <View style={{ width: cols * trayCell, height: rows * trayCell, opacity: fitsNow ? 1 : 0.35 }}>
                    <PieceView piece={p} cell={trayCell} />
                  </View>
                </View>
              );
            })}
            {showTip && score === 0 && !drag ? <Text style={[styles.tip, { left: left + 12, width: boardPx - 24, top: top + boardPx * 0.36 }]}>{t.dragTip}</Text> : null}
            {drag && hand[drag.slot] ? (
              (() => {
                const p = hand[drag.slot] as Piece;
                const { rows, cols } = shapeSize(p.shape);
                return (
                  <View style={{ position: 'absolute', left: drag.x - (cols * size) / 2, top: drag.y - LIFT - (rows * size) / 2, opacity: 0.92 }}>
                    <PieceView piece={p} cell={size} />
                  </View>
                );
              })()
            ) : null}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}


const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  board: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(12,24,48,0.55)' },
  cell: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.05)' },
  cellAlt: { backgroundColor: 'rgba(255,255,255,0.12)' },
  thick: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 2 },
  block: { flex: 1, overflow: 'hidden' },
  shine: { position: 'absolute', top: '10%', left: '12%', right: '12%', height: '26%', backgroundColor: 'rgba(255,255,255,0.3)' },
  glow: { borderWidth: 3, borderColor: '#FFFFFF' },
  slot: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: 'rgba(12,24,48,0.35)' },
  slotSel: { backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 3, borderColor: '#FFFFFF' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 20 },
  tip: { position: 'absolute', color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
});
