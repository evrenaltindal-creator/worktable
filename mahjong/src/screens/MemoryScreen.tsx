import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ModeShell } from '../components/ModeShell';
import { SimpleTile, tileSize } from '../components/SimpleTile';
import { haptic, playSound } from '../feedback';
import { buildMemoryLevel, memoryStars } from '../game/memory';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { ModeScreenProps } from './modeProps';

const native = Platform.OS !== 'web';

/** Çevrilen taş: yatayda daralıp yüzü değişir, sonra açılır */
const FlipTile = memo(function FlipTile({
  face,
  up,
  gone,
  faceW,
  onPress,
}: {
  face: string;
  up: boolean;
  gone: boolean;
  faceW: number;
  onPress: () => void;
}) {
  const [flip] = useState(() => new Animated.Value(1));
  const [shown, setShown] = useState(up);

  useEffect(() => {
    if (up === shown) return;
    Animated.timing(flip, { toValue: 0, duration: 130, easing: Easing.in(Easing.quad), useNativeDriver: native }).start(({ finished }) => {
      if (!finished) return;
      setShown(up);
      Animated.timing(flip, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
    });
  }, [up, shown, flip]);

  return (
    <Pressable onPress={onPress} disabled={gone} accessibilityRole="button">
      <Animated.View style={{ transform: [{ scaleX: flip }] }}>
        <SimpleTile face={shown ? face : 'back'} faceW={faceW} gone={gone} />
      </Animated.View>
    </Pressable>
  );
});

export function MemoryScreen({ level, onWin, onNext, onHome, onGames }: ModeScreenProps) {
  const lv = useMemo(() => buildMemoryLevel(level), [level]);
  const pairs = lv.faces.length / 2;
  const [matched, setMatched] = useState<boolean[]>(() => lv.faces.map(() => false));
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [wonStars, setWonStars] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const busy = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onPress = useCallback(
    (i: number) => {
      if (busy.current || matched[i] || open.includes(i) || wonStars !== null) return;
      playSound('tap');
      haptic('select');
      if (open.length === 0) {
        setOpen([i]);
        return;
      }
      const a = open[0];
      const nextMoves = moves + 1;
      setOpen([a, i]);
      setMoves(nextMoves);
      busy.current = true;
      if (lv.faces[a] === lv.faces[i]) {
        setTimeout(() => {
          const m = matched.slice();
          m[a] = m[i] = true;
          setMatched(m);
          setOpen([]);
          busy.current = false;
          if (m.every(Boolean)) {
            const stars = memoryStars(nextMoves, pairs);
            setWonStars(stars);
            playSound('win');
            haptic('success');
            onWin(stars);
          } else {
            playSound('match');
            haptic('light');
          }
        }, 550);
      } else {
        setTimeout(() => {
          setOpen([]);
          busy.current = false;
        }, 950);
      }
    },
    [matched, open, moves, wonStars, lv, pairs, onWin],
  );

  const restart = useCallback(() => {
    busy.current = false;
    setMatched(lv.faces.map(() => false));
    setOpen([]);
    setMoves(0);
    setWonStars(null);
    setRound((r) => r + 1);
  }, [lv]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);

  const gap = 8;
  const faceW = size.width
    ? Math.min((size.width - gap * (lv.cols + 1)) / lv.cols / 1.14, (size.height - gap * (lv.rows + 1)) / lv.rows / 1.458, 110)
    : 0;
  const ts = tileSize(faceW);

  return (
    <ModeShell
      title={mt().modes.memory.name}
      info={`${t.level(level)} · ${mt().moves(moves)}`}
      rules={mt().modes.memory.rules}
      onHome={onHome}
      onRestart={restart}
      onGames={onGames}
      onNext={onNext}
      wonStars={wonStars}
      wonText={wonStars !== null ? mt().moves(moves) : undefined}
      lost={null}
    >
      <View style={styles.area} onLayout={onLayout}>
        {faceW > 0 ? (
          <View key={round} style={[styles.grid, { width: lv.cols * (ts.w + gap), gap }]}>
            {lv.faces.map((f, i) => (
              <FlipTile key={i} face={f} up={open.includes(i) || matched[i]} gone={matched[i]} faceW={faceW} onPress={() => onPress(i)} />
            ))}
          </View>
        ) : null}
      </View>
    </ModeShell>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
