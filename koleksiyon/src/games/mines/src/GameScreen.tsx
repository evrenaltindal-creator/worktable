import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Board, Difficulty, SIZES, deduce, generate, isWon, neighbors, reveal } from './game/mines';
import { ToolButton } from './kit/components/Buttons';
import { GameFrame } from './kit/components/GameFrame';
import { haptic, playSound } from './kit/feedback';
import { c, formatTime } from './kit/i18n';
import { starsFor } from './kit/store';
import { t } from './text';

const FLAG = require('../assets/ui/flag.png');
const FLAG_RED = require('../assets/ui/flag-red.png');
const MINE = require('../assets/ui/mine.png');

const NUM_COLORS = ['', '#1F5FA8', '#1E7F4F', '#C42F2A', '#1B2A4A', '#8B2E1F', '#1A7F86', '#333333', '#6B6B6B'];

interface CellProps {
  i: number;
  size: number;
  open: boolean;
  flag: boolean;
  mine: boolean;
  count: number;
  exploded: boolean;
  hint: boolean;
  onPress: (i: number) => void;
  onLong: (i: number) => void;
}

const Cell = memo(function Cell({ i, size, open, flag, mine, count, exploded, hint, onPress, onLong }: CellProps) {
  const r = Math.max(4, size * 0.16);
  return (
    <Pressable
      onPress={() => onPress(i)}
      onLongPress={() => onLong(i)}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={open ? (mine ? 'mine' : `${count}`) : flag ? 'flag' : 'closed'}
      style={{ width: size, height: size, padding: 1.5 }}
    >
      {open ? (
        <View style={[styles.open, { borderRadius: r }, exploded && styles.exploded]}>
          {mine ? (
            <Image source={MINE} style={{ width: size * 0.7, height: size * 0.7 }} />
          ) : count ? (
            <Text style={[styles.num, { fontSize: size * 0.62, lineHeight: size * 0.8, color: NUM_COLORS[count] }]}>{count}</Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.closed, { borderRadius: r }, hint && styles.hint]}>
          <View style={[styles.shine, { borderRadius: r * 0.7 }]} />
          {flag ? <Image source={FLAG_RED} style={{ width: size * 0.72, height: size * 0.72 }} /> : null}
        </View>
      )}
    </Pressable>
  );
});

interface Props {
  difficulty: Difficulty;
  number: number;
  seed: number;
  isDaily: boolean;
  hints: number;
  firstTime: boolean;
  onUseHint: () => void;
  onWin: (stars: number) => void;
  onNext?: () => void;
  onHome: () => void;
}

export function GameScreen({ difficulty, number, seed, isDaily, hints, firstTime, onUseHint, onWin, onNext, onHome }: Props) {
  const { cols, rows, mines } = SIZES[difficulty];
  const n = cols * rows;
  const [board, setBoard] = useState<Board | null>(null);
  const [opened, setOpened] = useState<boolean[]>(() => Array(n).fill(false));
  const [flags, setFlags] = useState<boolean[]>(() => Array(n).fill(false));
  const [flagMode, setFlagMode] = useState(false);
  const [exploded, setExploded] = useState(-1);
  const [hintCell, setHintCell] = useState(-1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [round, setRound] = useState(0);
  const [reward] = useState(firstTime);
  const secRef = useRef(0);
  const lost = exploded >= 0;

  useEffect(() => {
    if (!board || lost || wonStars !== null) return;
    let active = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (s) => (active = s === 'active'));
    const id = setInterval(() => {
      if (!active) return;
      secRef.current += 1;
      setSeconds(secRef.current);
    }, 1000);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [board, lost, wonStars]);

  const finish = useCallback(
    (b: Board, nextOpened: boolean[]) => {
      if (!isWon(b, nextOpened)) return false;
      setFlags(b.mines.slice());
      const stars = starsFor(hintsUsed);
      setWonStars(stars);
      playSound('win');
      haptic('success');
      onWin(stars);
      return true;
    },
    [hintsUsed, onWin],
  );

  const toggleFlag = useCallback(
    (i: number) => {
      if (lost || wonStars !== null || opened[i]) return;
      const f = flags.slice();
      f[i] = !f[i];
      setFlags(f);
      playSound('tap');
      haptic('select');
    },
    [lost, wonStars, opened, flags],
  );

  const open = useCallback(
    (i: number) => {
      if (lost || wonStars !== null) return;
      if (flagMode && !opened[i]) return toggleFlag(i);
      if (flags[i]) return;
      setHintCell(-1);
      let b = board;
      if (!b) {
        b = generate(difficulty, seed, i);
        setBoard(b);
      }
      const next = opened.slice();
      let targets = [i];
      if (opened[i]) {
        // Sayıya dokunma: çevresindeki bayraklar tamsa diğerlerini aç
        const nb = neighbors(cols, rows, i);
        if (!b.counts[i] || nb.filter((j) => flags[j]).length !== b.counts[i]) return;
        targets = nb.filter((j) => !opened[j] && !flags[j]);
        if (!targets.length) return;
      }
      let count = 0;
      for (const j of targets) {
        if (b.mines[j]) {
          next[j] = true;
          b.mines.forEach((m, k) => m && !flags[k] && (next[k] = true));
          setOpened(next);
          setExploded(j);
          playSound('wrong');
          haptic('warning');
          return;
        }
        count += reveal(b, next, flags, j).length;
      }
      setOpened(next);
      if (finish(b, next)) return;
      playSound(count > 6 ? 'match' : 'tap');
      haptic(count > 6 ? 'light' : 'select');
    },
    [lost, wonStars, flagMode, opened, flags, board, difficulty, seed, cols, rows, toggleFlag, finish],
  );

  const hint = useCallback(() => {
    if (lost || wonStars !== null) return;
    if (!board) return setToast({ text: t.firstTap, id: Date.now() });
    if (hints <= 0) {
      playSound('wrong');
      return setToast({ text: c.outOfHints, id: Date.now() });
    }
    const { safe } = deduce(board, opened, flags);
    let cell = [...safe][0];
    if (cell === undefined) cell = board.mines.findIndex((m, k) => !m && !opened[k] && neighbors(cols, rows, k).some((j) => opened[j]));
    if (cell === undefined || cell < 0) return;
    onUseHint();
    setHintsUsed((h) => h + 1);
    setHintCell(cell);
    playSound('hint');
    haptic('select');
  }, [lost, wonStars, board, hints, opened, flags, cols, rows, onUseHint]);

  const restart = useCallback(() => {
    setBoard(null);
    setOpened(Array(n).fill(false));
    setFlags(Array(n).fill(false));
    setExploded(-1);
    setHintCell(-1);
    setHintsUsed(0);
    setWonStars(null);
    secRef.current = 0;
    setSeconds(0);
    setRound((r) => r + 1);
  }, [n]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);
  const size = Math.floor(Math.min(area.width / cols, area.height / rows, 104));
  const flagsLeft = mines - flags.filter(Boolean).length;
  const title = isDaily ? c.daily : `${t.difficulty[difficulty]} · ${t.game(number)}`;

  return (
    <GameFrame
      title={title}
      info={`${t.minesLeft(flagsLeft)} · ${formatTime(seconds)}`}
      rules={t.rules}
      onHome={onHome}
      onRestart={restart}
      wonStars={wonStars}
      wonLines={[t.cleared, c.time(formatTime(seconds))]}
      reward={reward}
      onNext={onNext}
      lost={lost ? { title: t.lostTitle, body: t.lostBody } : null}
      toast={toast}
      footer={
        <View style={styles.tools}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: flagMode }}
            accessibilityLabel={t.flag}
            onPress={() => setFlagMode((m) => !m)}
            style={({ pressed }) => [styles.flagBtn, flagMode && styles.flagOn, pressed && { opacity: 0.85 }]}
          >
            <Image source={FLAG} style={[styles.flagIcon, { tintColor: flagMode ? '#3A2A08' : '#FFFFFF' }]} />
            <Text style={[styles.flagText, flagMode && { color: '#3A2A08' }]}>{t.flag}</Text>
          </Pressable>
          <ToolButton tone="amber" icon="hint" label={c.hint} count={hints} onPress={hint} />
        </View>
      }
    >
      <View style={styles.area} onLayout={onLayout}>
        {size > 0 ? (
          <View key={round} style={[styles.board, { width: size * cols + 12, padding: 6 }]}>
            {Array.from({ length: rows }, (_, y) => (
              <View key={y} style={styles.row}>
                {Array.from({ length: cols }, (_, x) => {
                  const i = y * cols + x;
                  return (
                    <Cell
                      key={i}
                      i={i}
                      size={size}
                      open={opened[i]}
                      flag={flags[i]}
                      mine={!!board?.mines[i]}
                      count={board?.counts[i] ?? 0}
                      exploded={exploded === i}
                      hint={hintCell === i}
                      onPress={open}
                      onLong={toggleFlag}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  board: { backgroundColor: '#D9B573', borderRadius: 18, borderBottomWidth: 6, borderBottomColor: '#8A5A22' },
  row: { flexDirection: 'row' },
  open: { flex: 1, backgroundColor: '#FFFBF0', alignItems: 'center', justifyContent: 'center' },
  exploded: { backgroundColor: '#F28B82' },
  num: { fontWeight: '900', textAlign: 'center' },
  closed: {
    flex: 1,
    backgroundColor: '#2FA38F',
    borderBottomWidth: 3,
    borderBottomColor: '#1C6E64',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shine: { position: 'absolute', top: 3, left: 4, right: 4, height: '28%', backgroundColor: 'rgba(255,255,255,0.22)' },
  hint: { backgroundColor: '#7EE0A1', borderBottomColor: '#2FA866', borderWidth: 3, borderColor: '#FFFFFF' },
  tools: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 20 },
  flagBtn: {
    flex: 1,
    minHeight: 76,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#C8507E',
    borderBottomWidth: 4,
    borderBottomColor: '#923A5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagOn: { backgroundColor: '#FFD54F', borderBottomColor: '#C49A1C' },
  flagIcon: { width: 32, height: 32, marginBottom: 4 },
  flagText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
