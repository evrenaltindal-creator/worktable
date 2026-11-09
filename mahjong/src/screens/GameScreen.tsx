import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board } from '../components/Board';
import { BigButton, RoundIconButton, ToolButton } from '../components/Buttons';
import { Overlay } from '../components/Overlay';
import { haptic, playSound } from '../feedback';
import {
  availablePairs,
  computeRelations,
  dealSolvable,
  findHint,
  freeTiles,
  isFree,
  reshuffle,
} from '../game/engine';
import { LEVEL_COUNT, getLevel } from '../game/levels';
import { canMatch } from '../game/tiles';
import { formatTime, t } from '../i18n';
import { SavedGame, Settings } from '../storage';
import { colors, font } from '../theme';

interface Props {
  level: number;
  saved: SavedGame | null;
  settings: Settings;
  onSave: (game: SavedGame | null) => void;
  onWin: (level: number, seconds: number) => void;
  onNext: () => void;
  onHome: () => void;
}

interface State {
  faces: string[];
  present: boolean[];
  history: [number, number][];
  shuffles: number;
  selected: number | null;
  hint: [number, number] | null;
  shake: { index: number; nonce: number } | null;
  noHintMessage: boolean;
  /** Seviye bittiyse bitirme süresi (saniye) */
  wonSeconds: number | null;
}

export function GameScreen({ level, saved, settings, onSave, onWin, onNext, onHome }: Props) {
  const insets = useSafeAreaInsets();
  const info = useMemo(() => getLevel(level), [level]);
  const positions = info.layout.positions;
  const rel = useMemo(() => computeRelations(positions), [positions]);

  const freshState = useCallback(
    (): State => ({
      faces: dealSolvable(positions, rel, info.seed),
      present: positions.map(() => true),
      history: [],
      shuffles: 0,
      selected: null,
      hint: null,
      shake: null,
      noHintMessage: false,
      wonSeconds: null,
    }),
    [positions, rel, info.seed],
  );

  const [state, setState] = useState<State>(() => {
    if (saved && saved.level === level && saved.faces.length === positions.length) {
      return {
        faces: saved.faces,
        present: saved.present,
        history: saved.history,
        shuffles: saved.shuffles,
        selected: null,
        hint: null,
        shake: null,
        noHintMessage: false,
        wonSeconds: null,
      };
    }
    return freshState();
  });

  // Süre: ekrana her saniye yazılmaz (gereksiz çizim olmasın), sadece sayılır.
  const elapsed = useRef(saved && saved.level === level ? saved.elapsed : 0);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  const free = useMemo(() => new Set(freeTiles(state.present, rel)), [state.present, rel]);
  const remaining = useMemo(() => state.present.filter(Boolean).length, [state.present]);
  const won = remaining === 0;
  const stuck = !won && availablePairs(state.faces, state.present, rel).length === 0;

  // Süre sayacı (uygulama arka plandayken durur)
  useEffect(() => {
    if (won) return;
    let active = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (s) => (active = s === 'active'));
    const id = setInterval(() => {
      if (active) elapsed.current += 1;
    }, 1000);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [won]);

  // Kayıt: her hamleden sonra
  useEffect(() => {
    if (won) return;
    onSave({
      level,
      faces: state.faces,
      present: state.present,
      history: state.history,
      elapsed: elapsed.current,
      shuffles: state.shuffles,
    });
  }, [state.faces, state.present, state.history, state.shuffles, level, won, onSave]);

  // Güncel durum ref'te de tutulur (tüm değişiklikler commit'ten geçer): dokunma
  // işleyicileri yan etkileri (ses, titreşim) durum güncelleyicisinin dışında,
  // tek sefer çalıştırabilsin.
  const stateRef = useRef(state);
  const commit = useCallback((next: State) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const onTilePress = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (!s.present[i]) return;
      if (!isFree(i, s.present, rel)) {
        playSound('wrong');
        haptic('warning');
        commit({ ...s, shake: { index: i, nonce: (s.shake?.nonce ?? 0) + 1 } });
        return;
      }
      if (s.selected === null) {
        playSound('tap');
        haptic('select');
        commit({ ...s, selected: i, noHintMessage: false });
        return;
      }
      if (s.selected === i) {
        commit({ ...s, selected: null });
        return;
      }
      if (canMatch(s.faces[s.selected], s.faces[i])) {
        const present = s.present.slice();
        present[s.selected] = false;
        present[i] = false;
        const finished = !present.some(Boolean);
        const wonSeconds = finished ? elapsed.current : null;
        if (wonSeconds !== null) {
          playSound('win');
          haptic('success');
          onSave(null);
          onWin(level, wonSeconds);
        } else {
          playSound('match');
          haptic('light');
        }
        commit({
          ...s,
          present,
          history: [...s.history, [s.selected, i]],
          selected: null,
          hint: null,
          noHintMessage: false,
          wonSeconds,
        });
        return;
      }
      // Eşleşmiyor: yeni dokunulan taşı seç
      playSound('tap');
      haptic('select');
      commit({ ...s, selected: i });
    },
    [rel, commit, level, onSave, onWin],
  );

  const undo = useCallback(() => {
    const s = stateRef.current;
    const last = s.history[s.history.length - 1];
    if (!last) return;
    const present = s.present.slice();
    present[last[0]] = true;
    present[last[1]] = true;
    playSound('tap');
    commit({ ...s, present, history: s.history.slice(0, -1), selected: null, hint: null, noHintMessage: false });
  }, [commit]);

  const showHint = useCallback(() => {
    const s = stateRef.current;
    const h = findHint(positions, s.faces, s.present, rel);
    if (!h) {
      commit({ ...s, noHintMessage: true });
      return;
    }
    playSound('hint');
    haptic('select');
    commit({ ...s, hint: h, selected: null });
  }, [positions, rel, commit]);

  const shuffle = useCallback(() => {
    const s = stateRef.current;
    const faces = reshuffle(positions, rel, s.faces, s.present, info.seed + 1000 * (s.shuffles + 1));
    playSound('shuffle');
    haptic('light');
    commit({ ...s, faces, shuffles: s.shuffles + 1, selected: null, hint: null, noHintMessage: false });
  }, [positions, rel, info.seed, commit]);

  const restart = useCallback(() => {
    elapsed.current = 0;
    commit(freshState());
  }, [freshState, commit]);

  const onBoardLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardSize((old) => (old.width === width && old.height === height ? old : { width, height }));
  }, []);

  const isLast = level >= LEVEL_COUNT;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="home" label={t.home} onPress={onHome} />
        <View style={styles.titleBox}>
          <Text style={styles.title} accessibilityRole="header">
            {t.level(level)}
          </Text>
          <Text style={styles.subtitle}>{t.tilesLeft(remaining)}</Text>
        </View>
        <RoundIconButton icon="restart" label={t.restart} onPress={restart} />
      </View>

      <View style={styles.boardArea} onLayout={onBoardLayout}>
        {boardSize.width > 0 ? (
          <Board
            positions={positions}
            faces={state.faces}
            present={state.present}
            free={free}
            selected={state.selected}
            hint={state.hint}
            highlightFree={settings.highlightFree}
            shake={state.shake}
            width={boardSize.width}
            height={boardSize.height}
            onTilePress={onTilePress}
          />
        ) : null}
        {state.noHintMessage ? (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{t.noHint}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <ToolButton icon="undo" label={t.undo} onPress={undo} disabled={state.history.length === 0} />
        <ToolButton icon="hint" label={t.hint} onPress={showHint} />
        <ToolButton icon="shuffle" label={t.shuffle} onPress={shuffle} />
      </View>

      <Overlay
        visible={won}
        title={t.winTitle}
        footer={
          <>
            {isLast ? null : <BigButton variant="primary" icon="play" label={t.nextLevel} onPress={onNext} />}
            <BigButton icon="home" label={t.home} onPress={onHome} />
          </>
        }
      >
        <Text style={styles.body}>{t.winBody(level)}</Text>
        <Text style={styles.bodySoft}>{t.time(formatTime(state.wonSeconds ?? 0))}</Text>
        {isLast ? <Text style={styles.body}>{t.allDone}</Text> : null}
      </Overlay>

      <Overlay
        visible={stuck}
        title={t.stuckTitle}
        footer={
          <>
            <BigButton variant="primary" icon="shuffle" label={t.shuffle} onPress={shuffle} />
            <BigButton icon="undo" label={t.undo} onPress={undo} />
            <BigButton icon="restart" label={t.restart} onPress={restart} />
          </>
        }
      >
        <Text style={styles.body}>{t.stuckBody}</Text>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  titleBox: { alignItems: 'center', flex: 1 },
  title: { color: colors.text, fontSize: font.big, fontWeight: '800' },
  subtitle: { color: colors.textSoft, fontSize: font.small, fontWeight: '600' },
  boardArea: { flex: 1, marginVertical: 4 },
  toolbar: { flexDirection: 'row', marginTop: 8 },
  body: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 28 },
  bodySoft: { color: colors.textSoft, fontSize: font.small, textAlign: 'center' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    padding: 14,
  },
  toastText: { color: colors.text, fontSize: font.normal, textAlign: 'center' },
});
