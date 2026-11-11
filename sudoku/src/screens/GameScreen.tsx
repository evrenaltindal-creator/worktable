import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Image, LayoutChangeEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton, RoundIconButton, ToolButton } from '../components/Buttons';
import { Confetti, StarRow } from '../components/Effects';
import { Overlay } from '../components/Overlay';
import { SudokuBoard } from '../components/SudokuBoard';
import { haptic, playSound } from '../feedback';
import { Difficulty, PEERS, UNITS, makePuzzle, unitComplete } from '../game/sudoku';
import { UI_ICONS } from '../images';
import { formatTime, t } from '../i18n';
import { SavedGame, Settings, starsFor } from '../storage';
import { colors, font } from '../theme';

interface Props {
  difficulty: Difficulty;
  number: number;
  /** Günün sudokusu için tarih; o zaman bulmaca tarihten üretilir */
  dailyKey?: string;
  seed: number;
  saved: SavedGame | null;
  settings: Settings;
  hints: number;
  /** İlk kez çözülüyorsa ödül verilir */
  firstTime: boolean;
  onUseHint: () => void;
  onSave: (g: SavedGame | null) => void;
  onWin: (stars: number, seconds: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

type Change = { cell: number; value: number; notes: number };

export function GameScreen(props: Props) {
  const { difficulty, number, dailyKey, seed, saved, settings, hints, onUseHint, onSave, onWin, onNext, onHome } = props;
  const insets = useSafeAreaInsets();
  // iPad: tahta ve tuşlar büyür
  const { width: screenW } = useWindowDimensions();
  const tablet = screenW >= 700;
  const puzzle = useMemo(() => makePuzzle(difficulty, seed), [difficulty, seed]);
  const given = useMemo(() => puzzle.puzzle.map((v) => v !== 0), [puzzle]);
  const [firstTime] = useState(props.firstTime);

  const resume = saved && saved.difficulty === difficulty && saved.number === number && saved.dailyKey === dailyKey ? saved : null;
  const [values, setValues] = useState<number[]>(() => resume?.values ?? puzzle.puzzle.slice());
  const [notes, setNotes] = useState<number[]>(() => resume?.notes ?? Array(81).fill(0));
  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<Change[][]>([]);
  const [mistakes, setMistakes] = useState(resume?.mistakes ?? 0);
  const [hintsUsed, setHintsUsed] = useState(resume?.hintsUsed ?? 0);
  const [won, setWon] = useState<{ stars: number; seconds: number } | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [flash, setFlash] = useState<{ cells: number[]; id: number } | null>(null);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [seconds, setSeconds] = useState(resume?.elapsed ?? 0);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const secondsRef = useRef(seconds);

  // Süre (uygulama arka plandayken durur)
  useEffect(() => {
    if (won) return;
    let active = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (s) => (active = s === 'active'));
    const id = setInterval(() => {
      if (!active) return;
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [won]);

  // Her hamleden sonra kayıt
  useEffect(() => {
    if (won) return;
    onSave({ difficulty, number, dailyKey, values, notes, mistakes, hintsUsed, elapsed: secondsRef.current });
  }, [values, notes, mistakes, hintsUsed, won, difficulty, number, dailyKey, onSave]);

  useEffect(() => {
    if (!won) return;
    const id = setTimeout(() => setShowWin(true), 900);
    return () => clearTimeout(id);
  }, [won]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  /** Bir rakam doğru yerleşince: biten birimler parlar, bulmaca bittiyse kazanılır */
  const afterCorrect = useCallback(
    (next: number[], cell: number) => {
      const done = UNITS.filter((u) => u.includes(cell) && unitComplete(next, puzzle.solution, u));
      if (next.every((v, i) => v === puzzle.solution[i])) {
        const stars = starsFor(mistakes, hintsUsed);
        setWon({ stars, seconds: secondsRef.current });
        setSelected(null);
        setFlash({ cells: Array.from({ length: 81 }, (_, i) => i), id: Date.now() });
        playSound('win');
        haptic('success');
        onSave(null);
        onWin(stars, secondsRef.current);
        return;
      }
      if (done.length) {
        setFlash({ cells: [...new Set(done.flat())], id: Date.now() });
        playSound('match');
        haptic('light');
      } else {
        playSound('tap');
        haptic('select');
      }
    },
    [puzzle, mistakes, hintsUsed, onSave, onWin],
  );

  const input = useCallback(
    (d: number) => {
      if (won) return;
      if (selected === null || given[selected]) {
        setToast({ text: t.selectCell, id: Date.now() });
        return;
      }
      const i = selected;
      if (notesMode) {
        if (values[i]) return;
        const nextNotes = notes.slice();
        nextNotes[i] ^= 1 << d;
        setHistory((h) => [...h, [{ cell: i, value: values[i], notes: notes[i] }]]);
        setNotes(nextNotes);
        playSound('tap');
        return;
      }
      if (values[i] === d) return;
      const changes: Change[] = [{ cell: i, value: values[i], notes: notes[i] }];
      const nextValues = values.slice();
      const nextNotes = notes.slice();
      nextValues[i] = d;
      nextNotes[i] = 0;
      if (d === puzzle.solution[i]) {
        // Akraba hücrelerdeki bu rakamın notlarını temizle
        for (const j of PEERS[i]) {
          if (nextNotes[j] & (1 << d)) {
            changes.push({ cell: j, value: values[j], notes: notes[j] });
            nextNotes[j] &= ~(1 << d);
          }
        }
      }
      setHistory((h) => [...h, changes]);
      setValues(nextValues);
      setNotes(nextNotes);
      if (d !== puzzle.solution[i]) {
        setMistakes((m) => m + 1);
        playSound('wrong');
        haptic('warning');
      } else afterCorrect(nextValues, i);
    },
    [won, selected, given, notesMode, values, notes, puzzle, afterCorrect],
  );

  const erase = useCallback(() => {
    if (won || selected === null || given[selected]) return;
    const i = selected;
    if (!values[i] && !notes[i]) return;
    setHistory((h) => [...h, [{ cell: i, value: values[i], notes: notes[i] }]]);
    const nv = values.slice();
    const nn = notes.slice();
    nv[i] = 0;
    nn[i] = 0;
    setValues(nv);
    setNotes(nn);
    playSound('tap');
  }, [won, selected, given, values, notes]);

  const undo = useCallback(() => {
    if (won || !history.length) return;
    const last = history[history.length - 1];
    const nv = values.slice();
    const nn = notes.slice();
    for (const c of last) {
      nv[c.cell] = c.value;
      nn[c.cell] = c.notes;
    }
    setValues(nv);
    setNotes(nn);
    setHistory(history.slice(0, -1));
    setSelected(last[0].cell);
    playSound('tap');
  }, [won, history, values, notes]);

  const hint = useCallback(() => {
    if (won) return;
    if (hints <= 0) {
      playSound('wrong');
      setToast({ text: t.outOfHints, id: Date.now() });
      return;
    }
    // Seçili kare boşsa ya da yanlışsa onu, değilse en kolay boş kareyi doldur
    const open = (i: number) => !given[i] && values[i] !== puzzle.solution[i];
    let i = selected !== null && open(selected) ? selected : -1;
    if (i < 0) {
      let best = 99;
      for (let k = 0; k < 81; k++) {
        if (!open(k)) continue;
        const filled = PEERS[k].filter((j) => values[j]).length;
        if (20 - filled < best) {
          best = 20 - filled;
          i = k;
        }
      }
    }
    if (i < 0) return;
    onUseHint();
    setHintsUsed((h) => h + 1);
    const nv = values.slice();
    const nn = notes.slice();
    const changes: Change[] = [{ cell: i, value: values[i], notes: notes[i] }];
    nv[i] = puzzle.solution[i];
    nn[i] = 0;
    for (const j of PEERS[i]) {
      if (nn[j] & (1 << nv[i])) {
        changes.push({ cell: j, value: values[j], notes: notes[j] });
        nn[j] &= ~(1 << nv[i]);
      }
    }
    setHistory((h) => [...h, changes]);
    setValues(nv);
    setNotes(nn);
    setSelected(i);
    playSound('hint');
    afterCorrect(nv, i);
  }, [won, hints, given, values, notes, selected, puzzle, onUseHint, afterCorrect]);

  const restart = useCallback(() => {
    setConfirmRestart(false);
    setValues(puzzle.puzzle.slice());
    setNotes(Array(81).fill(0));
    setHistory([]);
    setMistakes(0);
    setHintsUsed(0);
    setSelected(null);
    setWon(null);
    setShowWin(false);
    secondsRef.current = 0;
    setSeconds(0);
  }, [puzzle]);

  // Rakam başına kalan sayı (tuş takımında gösterilir)
  const remaining = useMemo(() => {
    const r = Array(10).fill(9);
    values.forEach((v, i) => {
      if (v && v === puzzle.solution[i]) r[v]--;
    });
    return r;
  }, [values, puzzle]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);
  const boardSize = Math.min(area.width, area.height, tablet ? 980 : 620);

  const title = dailyKey ? t.daily : `${t.difficulty[difficulty]} · ${t.puzzle(number)}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="home" label={t.home} onPress={onHome} />
        <View style={styles.hud}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.info}>
            {t.mistakes(mistakes)} · {formatTime(seconds)}
          </Text>
        </View>
        <View style={styles.right}>
          <RoundIconButton icon="help" label={t.howToPlay} onPress={() => setShowRules(true)} />
          <RoundIconButton icon="restart" label={t.restart} onPress={() => setConfirmRestart(true)} />
        </View>
      </View>

      <View style={styles.boardArea} onLayout={onLayout}>
        {boardSize > 0 ? (
          <SudokuBoard
            size={boardSize}
            values={values}
            notes={notes}
            given={given}
            solution={puzzle.solution}
            selected={selected}
            showMistakes={settings.showMistakes}
            highlightSame={settings.highlightSame}
            flash={flash}
            onSelect={setSelected}
          />
        ) : null}
        {toast ? (
          <View key={toast.id} style={styles.toast} pointerEvents="none">
            <Text lineBreakStrategyIOS="hangul-word" style={styles.toastText}>
              {toast.text}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.tools, tablet && styles.tabletWidth]}>
        <ToolButton tone="teal" icon="undo" label={t.undo} onPress={undo} disabled={!history.length} />
        <ToolButton tone="teal" icon="erase" label={t.erase} onPress={erase} />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: notesMode }}
          accessibilityLabel={t.notes}
          onPress={() => setNotesMode((m) => !m)}
          style={({ pressed }) => [styles.notesBtn, notesMode && styles.notesOn, pressed && { opacity: 0.85 }]}
        >
          <ToolLike active={notesMode} />
        </Pressable>
        <ToolButton tone="amber" icon="hint" label={t.hint} count={hints} onPress={hint} />
      </View>

      <View style={[styles.pad, tablet && styles.tabletWidth]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
          const done = remaining[d] <= 0;
          const sameAsSelected = selected !== null && values[selected] === d;
          return (
            <Pressable
              key={d}
              accessibilityRole="button"
              accessibilityLabel={`${d}`}
              disabled={done && !notesMode}
              onPress={() => input(d)}
              style={({ pressed }) => [
                styles.key,
                tablet && styles.keyTablet,
                notesMode && styles.keyNotes,
                sameAsSelected && styles.keySame,
                done && styles.keyDone,
                pressed && { transform: [{ translateY: 2 }], opacity: 0.9 },
              ]}
            >
              <Text style={[styles.keyText, tablet && styles.keyTextTablet, notesMode && styles.keyTextNotes]}>{d}</Text>
              <Text style={styles.keyLeft}>{done ? '' : remaining[d]}</Text>
            </Pressable>
          );
        })}
      </View>

      <Overlay
        visible={showRules}
        title={t.howToPlay}
        onRequestClose={() => setShowRules(false)}
        footer={<BigButton variant="primary" label={t.close} onPress={() => setShowRules(false)} />}
      >
        {t.rules.map((r, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={styles.ruleNum}>{i + 1}</Text>
            <Text lineBreakStrategyIOS="hangul-word" style={styles.ruleText}>
              {r}
            </Text>
          </View>
        ))}
      </Overlay>

      <Overlay
        visible={confirmRestart}
        title={t.restartTitle}
        onRequestClose={() => setConfirmRestart(false)}
        footer={
          <>
            <BigButton variant="primary" icon="restart" label={t.restartYes} onPress={restart} />
            <BigButton label={t.cancel} onPress={() => setConfirmRestart(false)} />
          </>
        }
      >
        <Text style={styles.body}>{t.restartBody}</Text>
      </Overlay>

      <Overlay
        visible={showWin}
        title={t.winTitle}
        decoration={showWin ? <Confetti /> : null}
        footer={
          <>
            {onNext ? <BigButton variant="primary" icon="play" label={t.nextPuzzle} onPress={onNext} /> : null}
            <BigButton icon="home" label={t.home} onPress={onHome} />
          </>
        }
      >
        <StarRow stars={won?.stars ?? 0} size={54} />
        <Text style={styles.body}>{dailyKey ? t.dailySolved : t.solved}</Text>
        <Text style={styles.bodySoft}>
          {t.time(formatTime(won?.seconds ?? 0))} · {t.mistakes(mistakes)}
        </Text>
        {firstTime ? <Text style={styles.reward}>{t.reward}</Text> : null}
      </Overlay>
    </View>
  );
}

/** "Not" düğmesinin içi (açıkken sarı) */
function ToolLike({ active }: { active: boolean }) {
  return (
    <View style={styles.notesInner} pointerEvents="none">
      <Image source={UI_ICONS.notes} style={[styles.notesIcon, { tintColor: active ? '#3A2A08' : '#FFFFFF' }]} />
      <Text style={[styles.notesLabel, active && styles.notesLabelOn]} numberOfLines={1}>
        {t.notes}
      </Text>
    </View>
  );
}

const shadowText = { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 };

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  hud: { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.28)' },
  title: { color: colors.text, fontSize: font.normal, fontWeight: '900', ...shadowText },
  info: { color: '#FFE066', fontSize: font.small, fontWeight: '800', fontVariant: ['tabular-nums'], ...shadowText },
  right: { flexDirection: 'row', gap: 6 },
  boardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tools: { flexDirection: 'row', marginTop: 10 },
  notesBtn: {
    flex: 1,
    minHeight: 76,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#2A9D8F',
    borderBottomWidth: 4,
    borderBottomColor: '#1C6E64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesOn: { backgroundColor: '#FFD54F', borderBottomColor: '#C49A1C' },
  notesInner: { alignItems: 'center' },
  notesIcon: { width: 32, height: 32, marginBottom: 4 },
  notesLabel: { color: '#FFFFFF', fontSize: font.small, fontWeight: '800' },
  notesLabelOn: { color: '#3A2A08' },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
  key: {
    width: '18%',
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: '#FFFBF0',
    borderBottomWidth: 4,
    borderBottomColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTablet: { minHeight: 84 },
  keyTextTablet: { fontSize: 42, lineHeight: 48 },
  tabletWidth: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  keyNotes: { backgroundColor: '#E9F1FF', borderBottomColor: '#8DA9D6' },
  keySame: { backgroundColor: '#FFE27A' },
  keyDone: { opacity: 0.35 },
  keyText: { color: '#1B2A4A', fontSize: 30, fontWeight: '900', lineHeight: 34 },
  keyTextNotes: { color: '#1F5FA8', fontSize: 24 },
  keyLeft: { color: '#8A6A3A', fontSize: 13, fontWeight: '700', lineHeight: 15 },
  body: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 28 },
  bodySoft: { color: colors.textSoft, fontSize: font.small, textAlign: 'center' },
  reward: {
    alignSelf: 'center',
    color: '#3A2A08',
    backgroundColor: colors.accent,
    fontSize: font.small,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ruleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ruleNum: {
    color: '#3A2A08',
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '800',
    fontSize: font.small,
    overflow: 'hidden',
  },
  ruleText: { color: colors.text, fontSize: font.normal, lineHeight: 28, flex: 1 },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 12, backgroundColor: 'rgba(20,20,30,0.85)', borderRadius: 14, padding: 14 },
  toastText: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 26 },
});
