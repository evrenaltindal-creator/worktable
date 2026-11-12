import { ComponentRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { THEME_NAMES } from './game/wordlists';
import { lineBetween, makePuzzle, match } from './game/words';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c, currentLanguage } from './kit/i18n';
import { starsFor } from './kit/store';
import { t } from './text';

const native = Platform.OS !== 'web';
const BANDS = ['rgba(255,138,61,0.55)', 'rgba(60,140,231,0.55)', 'rgba(63,191,127,0.55)', 'rgba(232,80,91,0.55)', 'rgba(154,91,216,0.55)', 'rgba(245,184,46,0.6)', 'rgba(26,170,170,0.55)', 'rgba(255,138,179,0.6)', 'rgba(120,140,70,0.55)'];
const SOLID = ['#FF8A3D', '#3C8CE7', '#3FBF7F', '#E8505B', '#9A5BD8', '#F5B82E', '#1AAAAA', '#FF8AB3', '#788C46'];

/** İki hücre arasında yuvarlak uçlu şerit */
const Band = memo(function Band({ a, b, size, cell, color }: { a: number; b: number; size: number; cell: number; color: string }) {
  const x0 = (a % size) * cell + cell / 2;
  const y0 = Math.floor(a / size) * cell + cell / 2;
  const x1 = (b % size) * cell + cell / 2;
  const y1 = Math.floor(b / size) * cell + cell / 2;
  const len = Math.hypot(x1 - x0, y1 - y0) + cell * 0.82;
  const h = cell * 0.82;
  const angle = Math.atan2(y1 - y0, x1 - x0);
  return (
    <View
      style={{
        position: 'absolute',
        left: (x0 + x1) / 2 - len / 2,
        top: (y0 + y1) / 2 - h / 2,
        width: len,
        height: h,
        borderRadius: h / 2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}rad` }],
      }}
    />
  );
});

/** İpucu: ilk harfin etrafında yanıp sönen halka */
function Glow({ index, size, cell }: { index: number; size: number; cell: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: native }), Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: native })]));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      style={[
        styles.glow,
        {
          left: (index % size) * cell + 2,
          top: Math.floor(index / size) * cell + 2,
          width: cell - 4,
          height: cell - 4,
          borderRadius: cell / 2,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }],
        },
      ]}
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
  const lang = currentLanguage();
  const puzzle = useMemo(() => makePuzzle(lang, level, variant), [lang, level, variant]);
  const { size } = puzzle;
  const [found, setFound] = useState<boolean[]>(() => puzzle.words.map(() => false));
  const [order, setOrder] = useState<number[]>([]); // bulunma sırası (renk için)
  const [sel, setSel] = useState<number[] | null>(null);
  const [hint, setHint] = useState(-1);
  const [helps, setHelps] = useState(0);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [listH, setListH] = useState(120);
  const [reward] = useState(firstTime);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const start = useRef(-1);
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const done = wonStars !== null;
  const count = found.filter(Boolean).length;
  const cjk = lang === 'ja' || lang === 'ko';

  const cell = Math.floor(Math.min((area.width - 8) / size, (area.height - listH - 16) / size, 72));
  const gridPx = cell * size;
  const gx = (area.width - gridPx) / 2;
  const gy = 4;

  const cellAt = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.pageX - origin.current.x - gx;
    const y = e.nativeEvent.pageY - origin.current.y - gy;
    if (x < 0 || y < 0 || x >= gridPx || y >= gridPx) return -1;
    return Math.floor(y / cell) * size + Math.floor(x / cell);
  };

  const onGrant = (e: GestureResponderEvent) => {
    measure();
    if (done) return;
    start.current = cellAt(e);
    setSel(start.current >= 0 ? [start.current] : null);
  };
  const onMove = (e: GestureResponderEvent) => {
    if (start.current < 0 || done) return;
    const now = cellAt(e);
    if (now < 0) return;
    const line = lineBetween(start.current, now, size);
    if (line) setSel(line);
  };
  const onRelease = () => {
    const line = sel;
    start.current = -1;
    setSel(null);
    if (!line || line.length < 2 || done) return;
    const k = match(puzzle, line, found);
    if (k < 0) {
      playSound('wrong');
      return;
    }
    const next = found.slice();
    next[k] = true;
    setFound(next);
    setOrder((o) => [...o, k]);
    if (hint >= 0 && puzzle.words[k].cells[0] === hint) setHint(-1);
    playSound('match');
    haptic('light');
    if (next.every(Boolean)) {
      const stars = starsFor(helps);
      setTimeout(() => {
        setWonStars(stars);
        playSound('win');
        haptic('success');
        onWin(stars);
      }, 500);
    }
  };

  const showHint = () => {
    if (done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const k = puzzle.words.findIndex((_, i) => !found[i] && puzzle.words[i].cells[0] !== hint);
    const pick = k >= 0 ? k : found.findIndex((f) => !f);
    if (pick < 0) return;
    onUseHint();
    setHelps((h) => h + 1);
    setHint(puzzle.words[pick].cells[0]);
    playSound('hint');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const selCells = new Set(sel ?? []);
  const fontSize = cell * (cjk ? 0.5 : 0.56);
  const chipSize = Math.max(18, Math.min(30, cell * 0.42));

  return (
    <GameFrame
      title={isDaily ? c.daily : c.level(level)}
      info={t.found(count, puzzle.words.length)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared, THEME_NAMES[lang][puzzle.theme]]}
      reward={reward ? t.reward : false}
      onNext={onNext}
      lost={null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={showHint} />
        </View>
      }
    >
      <View style={styles.area} onLayout={onLayout}>
        <View
          testID="words-grid"
          ref={areaRef}
          style={StyleSheet.absoluteFill}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onGrant}
          onResponderMove={onMove}
          onResponderRelease={onRelease}
          onResponderTerminate={() => setSel(null)}
        >
          {cell > 0 ? (
            <View pointerEvents="none" style={[styles.grid, { left: gx, top: gy, width: gridPx, height: gridPx }]}>
              {order.map((k, n) => (
                <Band key={k} a={puzzle.words[k].cells[0]} b={puzzle.words[k].cells[puzzle.words[k].cells.length - 1]} size={size} cell={cell} color={BANDS[n % BANDS.length]} />
              ))}
              {sel && sel.length > 1 ? <Band a={sel[0]} b={sel[sel.length - 1]} size={size} cell={cell} color="rgba(255,255,255,0.55)" /> : null}
              {hint >= 0 ? <Glow index={hint} size={size} cell={cell} /> : null}
              {puzzle.grid.map((ch, i) => (
                <View key={i} style={[styles.cell, { left: (i % size) * cell, top: Math.floor(i / size) * cell, width: cell, height: cell }, selCells.has(i) && sel?.length === 1 && styles.cellSel]}>
                  <Text style={[styles.letter, { fontSize, lineHeight: cell * 0.9 }]}>{ch}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <View
          pointerEvents="none"
          style={[styles.list, { top: gy + gridPx + 12, left: 8, right: 8 }]}
          onLayout={(e) => {
            const h = Math.ceil(e.nativeEvent.layout.height);
            if (Math.abs(h - listH) > 2) setListH(h);
          }}
        >
          <Text style={[styles.theme, { fontSize: chipSize * 0.95 }]}>{`${t.theme}: ${THEME_NAMES[lang][puzzle.theme]}`}</Text>
          {level === 1 && !isDaily && count === 0 ? <Text style={styles.tip}>{t.dragTip}</Text> : null}
          <View style={styles.chips}>
            {puzzle.words.map((w, k) => {
              const n = order.indexOf(k);
              return (
                <View key={k} style={[styles.chip, found[k] && { backgroundColor: SOLID[n % SOLID.length] }]}>
                  <Text style={[styles.chipText, { fontSize: chipSize }, found[k] && styles.chipFound]}>{w.word}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  grid: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(255,253,245,0.94)' },
  cell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  cellSel: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999 },
  letter: { color: '#24324A', fontWeight: '800', textAlign: 'center' },
  glow: { position: 'absolute', borderWidth: 4, borderColor: '#2FA866', backgroundColor: 'rgba(126,224,161,0.45)' },
  list: { position: 'absolute', alignItems: 'center' },
  theme: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  tip: { color: '#FFE066', fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(10,20,40,0.45)' },
  chipText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  chipFound: { textDecorationLine: 'line-through', opacity: 0.9 },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 60 },
});
