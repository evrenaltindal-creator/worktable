import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { starsFor } from '../boosters';
import { ToolButton } from '../components/Buttons';
import { ModeShell } from '../components/ModeShell';
import { SimpleLook, SimpleTile, tileSize } from '../components/SimpleTile';
import { haptic, playSound } from '../feedback';
import { Cell, buildConnectLevel, findMove, findPath, reshuffleConnect } from '../game/connect';
import { FaceId } from '../game/tiles';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { ModeScreenProps } from './modeProps';

interface State {
  cells: (FaceId | null)[];
  /** Eşleşip kaybolmakta olan taşlar */
  leaving: number[];
  selected: number | null;
  hint: [number, number] | null;
  path: { points: Cell[]; id: number } | null;
  hintsUsed: number;
  shuffles: number;
  shake: { index: number; nonce: number } | null;
  wonStars: number | null;
}

export function ConnectScreen({ level, boosters, onUseBooster, onWin, onNext, onHome, onGames }: ModeScreenProps) {
  const lv = useMemo(() => buildConnectLevel(level), [level]);
  const fresh = useCallback(
    (): State => ({
      cells: lv.cells.slice(),
      leaving: [],
      selected: null,
      hint: null,
      path: null,
      hintsUsed: 0,
      shuffles: 0,
      shake: null,
      wonStars: null,
    }),
    [lv],
  );
  const [state, setState] = useState<State>(fresh);
  const stateRef = useRef(state);
  const commit = useCallback((next: State) => {
    stateRef.current = next;
    setState(next);
  }, []);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [lineFade] = useState(() => new Animated.Value(0));

  // Izgara ölçüleri: tahtanın çevresinde yolun geçebileceği yarım taşlık pay bırakılır
  const faceW = useMemo(() => {
    if (!size.width) return 0;
    const byW = size.width / ((lv.cols + 1) * 1.14);
    const byH = size.height / ((lv.rows + 1) * 1.458);
    return Math.min(byW, byH, 90);
  }, [size, lv]);
  const ts = tileSize(faceW);
  const gridW = lv.cols * ts.w;
  const gridH = lv.rows * ts.h;
  const ox = (size.width - gridW) / 2;
  const oy = (size.height - gridH) / 2;
  const center = (p: Cell) => ({ x: ox + p.x * ts.w + faceW / 2, y: oy + p.y * ts.h + ts.faceH / 2 });

  const finishMatch = useCallback(
    (a: number, b: number) => {
      const s = stateRef.current;
      const cells = s.cells.slice();
      cells[a] = null;
      cells[b] = null;
      const remaining = cells.filter(Boolean).length;
      let next: State = { ...s, cells, leaving: [], path: null };
      if (remaining === 0) {
        const stars = starsFor(s.hintsUsed);
        next = { ...next, wonStars: stars };
        playSound('win');
        haptic('success');
        onWin(stars);
      } else if (!findMove({ ...lv, cells })) {
        next = { ...next, cells: reshuffleConnect({ ...lv, cells }, level * 997 + s.shuffles), shuffles: s.shuffles + 1 };
        playSound('shuffle');
        setToast({ text: mt().autoShuffled, id: Date.now() });
      }
      commit(next);
    },
    [lv, level, commit, onWin],
  );

  const onPress = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (!s.cells[i] || s.leaving.length || s.wonStars !== null) return;
      if (s.selected === null || s.selected === i) {
        playSound('tap');
        haptic('select');
        commit({ ...s, selected: s.selected === i ? null : i });
        return;
      }
      const a = s.selected;
      if (s.cells[a] !== s.cells[i]) {
        playSound('tap');
        commit({ ...s, selected: i });
        return;
      }
      const path = findPath({ ...lv, cells: s.cells }, a, i);
      if (!path) {
        playSound('wrong');
        haptic('warning');
        commit({ ...s, selected: null, shake: { index: i, nonce: (s.shake?.nonce ?? 0) + 1 } });
        return;
      }
      playSound('match');
      haptic('light');
      lineFade.setValue(1);
      Animated.timing(lineFade, { toValue: 0, duration: 450, delay: 150, useNativeDriver: false }).start();
      commit({ ...s, selected: null, hint: null, leaving: [a, i], path: { points: path, id: Date.now() } });
      setTimeout(() => finishMatch(a, i), 380);
    },
    [lv, commit, finishMatch, lineFade],
  );

  const hint = useCallback(() => {
    const s = stateRef.current;
    if (s.hint || s.wonStars !== null) return;
    if (boosters.hint <= 0) {
      playSound('wrong');
      setToast({ text: t.outOf.hint, id: Date.now() });
      return;
    }
    const m = findMove({ ...lv, cells: s.cells });
    if (!m) return;
    onUseBooster('hint');
    playSound('hint');
    commit({ ...s, hint: m, selected: null, hintsUsed: s.hintsUsed + 1 });
  }, [boosters.hint, lv, onUseBooster, commit]);

  const restart = useCallback(() => commit(fresh()), [commit, fresh]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);

  const left = state.cells.filter(Boolean).length;
  const lineW = Math.max(4, faceW * 0.09);

  return (
    <ModeShell
      title={mt().modes.connect.name}
      info={`${t.level(level)} · ${t.tilesLeft(left)}`}
      rules={mt().modes.connect.rules}
      onHome={onHome}
      onRestart={restart}
      onGames={onGames}
      onNext={onNext}
      wonStars={state.wonStars}
      lost={null}
      toast={toast}
      footer={
        <View style={styles.toolbar}>
          <ToolButton tone="amber" icon="hint" label={t.hint} count={boosters.hint} onPress={hint} />
        </View>
      }
    >
      <View style={styles.area} onLayout={onLayout}>
        {faceW > 0
          ? state.cells.map((f, i) => {
              if (!f) return null;
              const x = i % lv.cols;
              const y = Math.floor(i / lv.cols);
              let look: SimpleLook = 'normal';
              if (state.selected === i) look = 'selected';
              else if (state.hint && (state.hint[0] === i || state.hint[1] === i)) look = 'hint';
              return (
                <SimpleTile
                  key={`${i}-${f}`}
                  face={f}
                  faceW={faceW}
                  look={look}
                  gone={state.leaving.includes(i)}
                  shake={state.shake && state.shake.index === i ? state.shake.nonce : 0}
                  onPress={() => onPress(i)}
                  style={{ position: 'absolute', left: ox + x * ts.w, top: oy + y * ts.h }}
                />
              );
            })
          : null}
        {state.path
          ? state.path.points.slice(1).map((p, k) => {
              const a = center(state.path!.points[k]);
              const b = center(p);
              const horizontal = a.y === b.y;
              return (
                <Animated.View
                  key={`${state.path!.id}-${k}`}
                  pointerEvents="none"
                  style={[
                    styles.line,
                    {
                      opacity: lineFade,
                      left: Math.min(a.x, b.x) - lineW / 2,
                      top: Math.min(a.y, b.y) - lineW / 2,
                      width: horizontal ? Math.abs(b.x - a.x) + lineW : lineW,
                      height: horizontal ? lineW : Math.abs(b.y - a.y) + lineW,
                      borderRadius: lineW / 2,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>
    </ModeShell>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, marginVertical: 4 },
  line: {
    position: 'absolute',
    backgroundColor: '#FFD23F',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  toolbar: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 60 },
});
