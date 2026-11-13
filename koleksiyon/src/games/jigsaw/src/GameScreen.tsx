import { ComponentRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Image, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';
import { Edges, TAB, levelInfo, makePuzzle, near, pieceUnitPath } from './game/jigsaw';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c } from './kit/i18n';
import { starsFor } from './kit/store';
import { t } from './text';

const native = Platform.OS !== 'web';
export const PICTURE_IMG = [
  require('../assets/pictures/p0.jpg'),
  require('../assets/pictures/p1.jpg'),
  require('../assets/pictures/p2.jpg'),
  require('../assets/pictures/p3.jpg'),
  require('../assets/pictures/p4.jpg'),
  require('../assets/pictures/p5.jpg'),
  require('../assets/pictures/p6.jpg'),
  require('../assets/pictures/p7.jpg'),
  require('../assets/pictures/p8.jpg'),
  require('../assets/pictures/p9.jpg'),
  require('../assets/pictures/p10.jpg'),
  require('../assets/pictures/p11.jpg'),
];

interface PieceProps {
  uid: string;
  index: number;
  cols: number;
  rows: number;
  edges: Edges;
  picture: number;
  size: number;
  outline?: string;
}

/** Bir yapboz parçası: resmin kendi bölümü, çıkıntılı kenarlarla kırpılmış (kare boyu = size) */
const PieceSvg = memo(function PieceSvg({ uid, index, cols, rows, edges, picture, size, outline = 'rgba(255,255,255,0.85)' }: PieceProps) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const d = pieceUnitPath(edges);
  const full = size * (1 + 2 * TAB);
  return (
    <Svg width={full} height={full} viewBox={`${-TAB} ${-TAB} ${1 + 2 * TAB} ${1 + 2 * TAB}`}>
      <Defs>
        <ClipPath id={`clip-${uid}`}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <SvgImage href={PICTURE_IMG[picture]} x={-col} y={-row} width={cols} height={rows} preserveAspectRatio="none" clipPath={`url(#clip-${uid})`} />
      <Path d={d} fill="none" stroke={outline} strokeWidth={0.025} />
    </Svg>
  );
});

/** Yerine oturan parçanın kısa parlaması */
function Settle({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(1.12));
  useEffect(() => {
    Animated.spring(v, { toValue: 1, friction: 5, useNativeDriver: native }).start();
  }, [v]);
  return <Animated.View style={{ transform: [{ scale: v }] }}>{children}</Animated.View>;
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

type Drag = { index: number; x: number; y: number };

function Round({ level, variant, isDaily, hints, firstTime, onUseHint, onWin, onNext, onHome, onRestart }: Props & { onRestart: () => void }) {
  const info = useMemo(() => levelInfo(level, variant), [level, variant]);
  const puzzle = useMemo(() => makePuzzle(info.cols, info.rows, info.seed), [info]);
  const total = info.cols * info.rows;
  const [placed, setPlaced] = useState<boolean[]>(() => Array(total).fill(false));
  const [selected, setSelected] = useState(-1);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hint, setHint] = useState(-1);
  const [helps, setHelps] = useState(0);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const showTip = level === 1 && !isDaily;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [reward] = useState(firstTime);
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const start = useRef<{ x: number; y: number; index: number; moved: boolean } | null>(null);
  const measure = () => areaRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const done = wonStars !== null;
  const count = placed.filter(Boolean).length;

  // Yerleşim: üstte tahta, altta tepsi
  const TRAY_N = area.width > 700 ? 6 : 4;
  const trayH = Math.min(170, area.height * 0.26);
  const boardSide = Math.max(0, Math.min(area.width - 24, area.height - trayH - 20));
  const cell = boardSide / Math.max(info.cols, info.rows);
  const boardW = cell * info.cols;
  const boardH = cell * info.rows;
  const bx = (area.width - boardW) / 2;
  const by = Math.max(6, (area.height - trayH - 12 - boardH) / 2);
  const trayTop = by + boardH + 12;
  const slotW = area.width / TRAY_N;
  const trayCell = Math.min(cell, (slotW - 8) / (1 + 2 * TAB), (trayH - 8) / (1 + 2 * TAB));
  const tray = puzzle.order.filter((i) => !placed[i]).slice(0, TRAY_N);

  const slotOf = (index: number) => ({ x: bx + (index % info.cols) * cell, y: by + Math.floor(index / info.cols) * cell });

  const place = (index: number) => {
    const next = placed.slice();
    next[index] = true;
    setPlaced(next);
    setSelected(-1);
    setHint(-1);
    playSound('match');
    haptic('light');
    if (next.every(Boolean)) {
      const stars = starsFor(helps);
      setTimeout(() => {
        setWonStars(stars);
        playSound('win');
        haptic('success');
        onWin(stars);
      }, 1100);
    }
  };

  const wrong = () => {
    playSound('wrong');
    haptic('warning');
    setToast({ text: t.wrong, id: Date.now() });
  };

  const point = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX - origin.current.x, y: e.nativeEvent.pageY - origin.current.y });
  const trayIndexAt = (x: number, y: number) => {
    if (y < trayTop - 6) return -1;
    const k = Math.floor(x / slotW);
    return tray[k] ?? -1;
  };
  const cellAt = (x: number, y: number) => {
    const col = Math.floor((x - bx) / cell);
    const row = Math.floor((y - by) / cell);
    return col < 0 || row < 0 || col >= info.cols || row >= info.rows ? -1 : row * info.cols + col;
  };

  const onGrant = (e: GestureResponderEvent) => {
    measure();
    if (done) return;
    const p = point(e);
    start.current = { ...p, index: trayIndexAt(p.x, p.y), moved: false };
  };
  const onMove = (e: GestureResponderEvent) => {
    const s = start.current;
    if (!s || s.index < 0) return;
    const p = point(e);
    if (!s.moved && Math.hypot(p.x - s.x, p.y - s.y) < 8) return;
    s.moved = true;
    setDrag({ index: s.index, ...p });
  };
  const onRelease = (e: GestureResponderEvent) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    if (!s || done) return;
    const p = point(e);
    if (s.moved && s.index >= 0) {
      // parmak parçanın ortasını tutar; parça ortası doğru karenin ortasına yakın mı
      const slot = slotOf(s.index);
      const lift = cell * 0.9;
      if (near(p.x - (slot.x + cell / 2), p.y - lift - (slot.y + cell / 2), cell)) place(s.index);
      else if (p.y < trayTop - 6) wrong();
      return;
    }
    const ti = trayIndexAt(p.x, p.y);
    if (ti >= 0) {
      setSelected(ti === selected ? -1 : ti);
      playSound('tap');
      return;
    }
    const target = cellAt(p.x, p.y);
    if (selected >= 0 && target >= 0 && !placed[target]) {
      if (target === selected) place(selected);
      else wrong();
    }
  };

  const showHint = () => {
    if (done) return;
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const index = selected >= 0 ? selected : tray[0];
    if (index === undefined) return;
    onUseHint();
    setHelps((h) => h + 1);
    setSelected(index);
    setHint(index);
    playSound('hint');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
    measure();
  };

  const off = TAB * cell;

  return (
    <GameFrame
      title={isDaily ? c.daily : c.level(level)}
      info={t.placed(count, total)}
      rules={t.rules}
      onHome={onHome}
      onRestart={onRestart}
      wonStars={wonStars}
      wonLines={[t.cleared, t.pieces(total)]}
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
      <View
        testID="jigsaw-area"
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
        {cell > 0 ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.board, { left: bx - 6, top: by - 6, width: boardW + 12, height: boardH + 12 }]}>
              <Image source={PICTURE_IMG[info.picture]} style={{ position: 'absolute', left: 6, top: 6, width: boardW, height: boardH, opacity: done ? 1 : 0.22 }} />
            </View>
            {!done
              ? placed.map((p, i) =>
                  p ? (
                    <View key={i} style={{ position: 'absolute', left: slotOf(i).x - off, top: slotOf(i).y - off }}>
                      <Settle>
                        <PieceSvg uid={`b${i}`} index={i} cols={info.cols} rows={info.rows} edges={puzzle.edges[i]} picture={info.picture} size={cell} outline="rgba(255,255,255,0.35)" />
                      </Settle>
                    </View>
                  ) : null,
                )
              : null}
            {showTip && count === 0 && !drag ? <Text style={[styles.tip, { left: bx + 12, width: boardW - 24, top: by + boardH * 0.3 }]}>{t.dragTip}</Text> : null}
            {hint >= 0 && !placed[hint] ? <View style={[styles.hint, { left: slotOf(hint).x, top: slotOf(hint).y, width: cell, height: cell }]} /> : null}
            {tray.map((i, k) =>
              drag?.index === i ? null : (
                <View key={i} style={[styles.slot, { left: k * slotW + 4, top: trayTop, width: slotW - 8, height: trayH }, selected === i && styles.slotSel]}>
                  <PieceSvg uid={`t${i}`} index={i} cols={info.cols} rows={info.rows} edges={puzzle.edges[i]} picture={info.picture} size={trayCell} />
                </View>
              ),
            )}
            {drag ? (
              <View style={{ position: 'absolute', left: drag.x - cell / 2 - off, top: drag.y - cell * 0.9 - cell / 2 - off }}>
                <PieceSvg uid={`d${drag.index}`} index={drag.index} cols={info.cols} rows={info.rows} edges={puzzle.edges[drag.index]} picture={info.picture} size={cell} outline="#FFFFFF" />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, overflow: 'hidden', userSelect: 'none' },
  board: { position: 'absolute', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.55)' },
  hint: { position: 'absolute', borderWidth: 4, borderColor: '#7EE0A1', backgroundColor: 'rgba(126,224,161,0.3)', borderRadius: 8 },
  slot: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(12,24,48,0.35)' },
  slotSel: { backgroundColor: 'rgba(255,255,255,0.35)', borderWidth: 3, borderColor: '#FFFFFF' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 60 },
  tip: { position: 'absolute', color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 6 },
});
