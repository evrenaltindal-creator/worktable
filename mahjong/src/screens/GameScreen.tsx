import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Image, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BASE_POINTS,
  BoosterKind,
  Boosters,
  COMBO_WINDOW_MS,
  COMPLETE_BONUS,
  MAX_COMBO_MULTIPLIER,
  levelRewards,
  starsFor,
} from '../boosters';
import { Board, Burst } from '../components/Board';
import { BigButton, RoundIconButton, ToolButton } from '../components/Buttons';
import { Confetti, StarRow } from '../components/Effects';
import { Overlay } from '../components/Overlay';
import { haptic, playSound } from '../feedback';
import { availablePairs, computeRelations, dealSolvable, findHint, freeTiles, isFree, reshuffle } from '../game/engine';
import { LEVEL_COUNT, getLevel } from '../game/levels';
import { canMatch } from '../game/tiles';
import { FX } from '../images';
import { formatTime, t } from '../i18n';
import { SavedGame, Settings } from '../storage';
import { colors, font } from '../theme';

export interface WinResult {
  level: number;
  seconds: number;
  stars: number;
  score: number;
}

interface Props {
  level: number;
  saved: SavedGame | null;
  settings: Settings;
  boosters: Boosters;
  /** Seviye daha önce bitirilmediyse ödül verilir */
  firstTime: boolean;
  onUseBooster: (kind: BoosterKind) => void;
  onSave: (game: SavedGame | null) => void;
  onWin: (result: WinResult) => void;
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
  score: number;
  gains: number[];
  combo: number;
  hintsUsed: number;
  shufflesUsed: number;
  bursts: Burst[];
  wonSeconds: number | null;
  stars: number;
  /** Değişince tahta yeniden kurulur (taşlar tekrar düşerek gelir) */
  dealKey: number;
}

const native = Platform.OS !== 'web';

export function GameScreen(props: Props) {
  const { level, saved, settings, boosters, onUseBooster, onSave, onWin, onNext, onHome } = props;
  const insets = useSafeAreaInsets();
  const info = useMemo(() => getLevel(level), [level]);
  const positions = info.layout.positions;
  const rel = useMemo(() => computeRelations(positions), [positions]);
  // Ödül bilgisi açılışta sabitlenir (kazanınca ilerleme güncellense de değişmesin)
  const [firstTime] = useState(props.firstTime);

  const freshState = useCallback(
    (dealKey: number): State => ({
      faces: dealSolvable(positions, rel, info.seed),
      present: positions.map(() => true),
      history: [],
      shuffles: 0,
      selected: null,
      hint: null,
      shake: null,
      score: 0,
      gains: [],
      combo: 0,
      hintsUsed: 0,
      shufflesUsed: 0,
      bursts: [],
      wonSeconds: null,
      stars: 0,
      dealKey,
    }),
    [positions, rel, info.seed],
  );

  const [state, setState] = useState<State>(() => {
    if (saved && saved.level === level && saved.faces.length === positions.length) {
      return {
        ...freshState(0),
        faces: saved.faces,
        present: saved.present,
        history: saved.history,
        shuffles: saved.shuffles,
        score: saved.score ?? 0,
        gains: saved.gains ?? saved.history.map(() => BASE_POINTS),
        hintsUsed: saved.hintsUsed ?? 0,
        shufflesUsed: saved.shufflesUsed ?? 0,
      };
    }
    return freshState(0);
  });

  const elapsed = useRef(saved && saved.level === level ? saved.elapsed : 0);
  const lastMatchAt = useRef(0);
  const burstId = useRef(0);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [showWin, setShowWin] = useState(false);

  const free = useMemo(() => new Set(freeTiles(state.present, rel)), [state.present, rel]);
  const remaining = useMemo(() => state.present.filter(Boolean).length, [state.present]);
  const won = state.wonSeconds !== null;
  const stuck = !won && remaining > 0 && availablePairs(state.faces, state.present, rel).length === 0;

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
      score: state.score,
      gains: state.gains,
      hintsUsed: state.hintsUsed,
      shufflesUsed: state.shufflesUsed,
    });
  }, [state.faces, state.present, state.history, state.shuffles, state.score, state.gains, state.hintsUsed, state.shufflesUsed, level, won, onSave]);

  // Kazanınca son patlama görünsün, sonra kutlama penceresi açılsın
  useEffect(() => {
    if (!won) return;
    const id = setTimeout(() => setShowWin(true), 1100);
    return () => clearTimeout(id);
  }, [won]);

  // Bilgi mesajı birkaç saniye sonra kaybolur
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((text: string) => setToast({ text, id: Date.now() }), []);

  // Tüm durum değişiklikleri commit'ten geçer; işleyiciler yan etkileri bir kez çalıştırır.
  const stateRef = useRef(state);
  const commit = useCallback((next: State) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const onTilePress = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (!s.present[i] || s.wonSeconds !== null) return;
      if (!isFree(i, s.present, rel)) {
        playSound('wrong');
        haptic('warning');
        commit({ ...s, shake: { index: i, nonce: (s.shake?.nonce ?? 0) + 1 } });
        return;
      }
      if (s.selected === null) {
        playSound('tap');
        haptic('select');
        commit({ ...s, selected: i });
        return;
      }
      if (s.selected === i) {
        commit({ ...s, selected: null });
        return;
      }
      if (!canMatch(s.faces[s.selected], s.faces[i])) {
        playSound('tap');
        haptic('select');
        commit({ ...s, selected: i });
        return;
      }

      const present = s.present.slice();
      present[s.selected] = false;
      present[i] = false;
      const now = Date.now();
      const combo = now - lastMatchAt.current <= COMBO_WINDOW_MS ? s.combo + 1 : 1;
      lastMatchAt.current = now;
      const points = BASE_POINTS * Math.min(combo, MAX_COMBO_MULTIPLIER);
      const burst: Burst = { id: ++burstId.current, a: s.selected, b: i, points, label: combo >= 2 ? t.combo(combo) : null };
      const finished = !present.some(Boolean);
      let score = s.score + points;
      let wonSeconds: number | null = null;
      let stars = 0;
      if (finished) {
        score += COMPLETE_BONUS;
        wonSeconds = elapsed.current;
        stars = starsFor(s.hintsUsed + s.shufflesUsed);
        playSound('win');
        haptic('success');
        onSave(null);
        onWin({ level, seconds: wonSeconds, stars, score });
      } else {
        playSound('match');
        haptic(combo >= 3 ? 'success' : 'light');
      }
      commit({
        ...s,
        present,
        history: [...s.history, [s.selected, i]],
        gains: [...s.gains, points],
        score,
        combo,
        selected: null,
        hint: null,
        bursts: [...s.bursts.slice(-2), burst],
        wonSeconds,
        stars,
      });
    },
    [rel, commit, level, onSave, onWin],
  );

  const undo = useCallback(() => {
    const s = stateRef.current;
    const last = s.history[s.history.length - 1];
    if (!last || s.wonSeconds !== null) return;
    if (boosters.undo <= 0) {
      playSound('wrong');
      showToast(t.outOf.undo);
      return;
    }
    onUseBooster('undo');
    const present = s.present.slice();
    present[last[0]] = true;
    present[last[1]] = true;
    lastMatchAt.current = 0;
    playSound('tap');
    commit({
      ...s,
      present,
      history: s.history.slice(0, -1),
      gains: s.gains.slice(0, -1),
      score: Math.max(0, s.score - (s.gains[s.gains.length - 1] ?? 0)),
      combo: 0,
      selected: null,
      hint: null,
    });
  }, [commit, boosters.undo, onUseBooster, showToast]);

  const showHint = useCallback(() => {
    const s = stateRef.current;
    if (s.hint || s.wonSeconds !== null) return;
    const h = findHint(positions, s.faces, s.present, rel);
    if (!h) {
      showToast(t.noHint);
      return;
    }
    if (boosters.hint <= 0) {
      playSound('wrong');
      showToast(t.outOf.hint);
      return;
    }
    onUseBooster('hint');
    playSound('hint');
    haptic('select');
    commit({ ...s, hint: h, selected: null, hintsUsed: s.hintsUsed + 1 });
  }, [positions, rel, commit, boosters.hint, onUseBooster, showToast]);

  const doShuffle = useCallback(() => {
    const s = stateRef.current;
    const faces = reshuffle(positions, rel, s.faces, s.present, info.seed + 1000 * (s.shuffles + 1));
    playSound('shuffle');
    haptic('light');
    commit({ ...s, faces, shuffles: s.shuffles + 1, shufflesUsed: s.shufflesUsed + 1, selected: null, hint: null });
  }, [positions, rel, info.seed, commit]);

  const shuffle = useCallback(() => {
    if (stateRef.current.wonSeconds !== null) return;
    if (boosters.shuffle <= 0) {
      playSound('wrong');
      showToast(t.outOf.shuffle);
      return;
    }
    onUseBooster('shuffle');
    doShuffle();
  }, [boosters.shuffle, onUseBooster, doShuffle, showToast]);

  const restart = useCallback(() => {
    elapsed.current = 0;
    lastMatchAt.current = 0;
    setShowWin(false);
    commit(freshState(stateRef.current.dealKey + 1));
  }, [freshState, commit]);

  const onBoardLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardSize((old) => (old.width === width && old.height === height ? old : { width, height }));
  }, []);

  const rewards = firstTime && won ? levelRewards(level, state.stars) : null;
  const isLast = level >= LEVEL_COUNT;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="home" label={t.home} onPress={onHome} />
        <View style={styles.hud}>
          <Text style={styles.title} accessibilityRole="header">
            {t.level(level)}
          </Text>
          <View style={styles.hudRow}>
            <ScoreBadge score={state.score} />
            <Text style={styles.tilesLeft}>{t.tilesLeft(remaining)}</Text>
          </View>
        </View>
        <RoundIconButton icon="restart" label={t.restart} onPress={restart} />
      </View>

      <View style={styles.boardArea} onLayout={onBoardLayout}>
        {boardSize.width > 0 ? (
          <Board
            key={state.dealKey}
            positions={positions}
            faces={state.faces}
            present={state.present}
            history={state.history}
            free={free}
            selected={state.selected}
            hint={state.hint}
            highlightFree={settings.highlightFree}
            shake={state.shake}
            bursts={state.bursts}
            width={boardSize.width}
            height={boardSize.height}
            onTilePress={onTilePress}
          />
        ) : null}
        {toast ? (
          <View key={toast.id} style={styles.toast} pointerEvents="none">
            <Text lineBreakStrategyIOS="hangul-word" style={styles.toastText}>{toast.text}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <ToolButton tone="teal" icon="undo" label={t.undo} count={boosters.undo} onPress={undo} disabled={state.history.length === 0} />
        <ToolButton tone="amber" icon="hint" label={t.hint} count={boosters.hint} onPress={showHint} />
        <ToolButton tone="violet" icon="shuffle" label={t.shuffle} count={boosters.shuffle} onPress={shuffle} />
      </View>

      <Overlay
        visible={showWin}
        title={t.winTitle}
        decoration={showWin ? <Confetti /> : null}
        footer={
          <>
            {isLast ? null : <BigButton variant="primary" icon="play" label={t.nextLevel} onPress={onNext} />}
            <BigButton icon="home" label={t.home} onPress={onHome} />
          </>
        }
      >
        <StarRow stars={state.stars} size={54} />
        <Text style={styles.bigScore}>{t.points(state.score)}</Text>
        <Text style={styles.bodySoft}>
          {t.winBody(level)} · {t.time(formatTime(state.wonSeconds ?? 0))}
        </Text>
        {rewards ? (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardTitle}>{t.reward}</Text>
            <View style={styles.rewardRow}>
              {(['hint', 'shuffle', 'undo'] as BoosterKind[])
                .filter((k) => rewards[k])
                .map((k) => (
                  <Text key={k} style={styles.rewardChip}>
                    {t.rewardItem(t.booster[k], rewards[k] ?? 0)}
                  </Text>
                ))}
            </View>
          </View>
        ) : (
          <Text style={styles.bodySoft}>{t.replayNoReward}</Text>
        )}
        {isLast ? <Text style={styles.body}>{t.allDone}</Text> : null}
      </Overlay>

      <Overlay
        visible={stuck}
        title={t.stuckTitle}
        footer={
          <>
            <BigButton variant="primary" icon="shuffle" label={t.freeShuffle} onPress={doShuffle} />
            {state.history.length > 0 && boosters.undo > 0 ? (
              <BigButton icon="undo" label={`${t.undo} (${boosters.undo})`} onPress={undo} />
            ) : null}
            <BigButton icon="restart" label={t.restart} onPress={restart} />
          </>
        }
      >
        <Text lineBreakStrategyIOS="hangul-word" style={styles.body}>{t.stuckBody}</Text>
      </Overlay>
    </View>
  );
}

/** Puan rozeti: puan artınca "zıplar". */
function ScoreBadge({ score }: { score: number }) {
  const [pop] = useState(() => new Animated.Value(1));
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    pop.setValue(1.35);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: native }).start();
  }, [score, pop]);
  return (
    <Animated.View style={[styles.scoreBadge, { transform: [{ scale: pop }] }]}>
      <Image source={FX.starGold} style={styles.scoreStar} />
      <Text style={styles.scoreText}>{score}</Text>
    </Animated.View>
  );
}

const shadowText = {
  textShadowColor: 'rgba(0,0,0,0.55)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 4 },
  hud: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  title: { color: colors.text, fontSize: font.big, fontWeight: '900', ...shadowText },
  tilesLeft: { color: colors.textSoft, fontSize: font.small, fontWeight: '700', ...shadowText },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  scoreStar: { width: 20, height: 20 },
  scoreText: { color: '#FFE066', fontSize: font.small, fontWeight: '900', ...shadowText, fontVariant: ['tabular-nums'] },
  boardArea: { flex: 1, marginVertical: 4 },
  toolbar: { flexDirection: 'row', marginTop: 10 },
  body: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 28 },
  bodySoft: { color: colors.textSoft, fontSize: font.small, textAlign: 'center' },
  bigScore: { color: '#FFE066', fontSize: font.title, fontWeight: '900', textAlign: 'center', ...shadowText },
  rewardBox: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
  },
  rewardTitle: { color: colors.textSoft, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5 },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  rewardChip: {
    color: '#3A2A08',
    backgroundColor: colors.accent,
    fontSize: 15,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    backgroundColor: 'rgba(20,20,30,0.85)',
    borderRadius: 14,
    padding: 14,
  },
  toastText: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 26 },
});
