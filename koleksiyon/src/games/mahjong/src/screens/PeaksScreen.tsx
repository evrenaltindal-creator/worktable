import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { ModeShell } from '../components/ModeShell';
import { SimpleTile, tileSize } from '../components/SimpleTile';
import { haptic, playSound } from '../feedback';
import { PEAK_COVERS, PEAK_SLOTS, buildPeaksLevel, isFreePeak, isNeighbor, peakValue, peaksStars } from '../game/peaks';
import { FaceId } from '../game/tiles';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { colors, font } from '../theme';
import { ModeScreenProps } from './modeProps';

interface State {
  present: boolean[];
  current: FaceId;
  /** Desteden çekilecek sıradaki taş */
  next: number;
  streak: number;
  shake: { index: number; nonce: number } | null;
  lost: boolean;
  wonStars: number | null;
  round: number;
}

export function PeaksScreen({ level, onWin, onNext, onHome, onGames }: ModeScreenProps) {
  const lv = useMemo(() => buildPeaksLevel(level), [level]);
  const fresh = useCallback(
    (round: number): State => ({
      present: lv.faces.map(() => true),
      current: lv.stock[0],
      next: 1,
      streak: 0,
      shake: null,
      lost: false,
      wonStars: null,
      round,
    }),
    [lv],
  );
  const [state, setState] = useState<State>(() => fresh(0));
  const stateRef = useRef(state);
  const commit = useCallback((next: State) => {
    stateRef.current = next;
    setState(next);
  }, []);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);

  /** Oynanabilir taş kaldı mı? Kalmadıysa ve deste bittiyse kaybedilir. */
  const hasMove = (present: boolean[], current: FaceId) =>
    present.some((p, i) => p && isFreePeak(i, present) && isNeighbor(peakValue(current), peakValue(lv.faces[i])));

  const onTile = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (s.lost || s.wonStars !== null || !s.present[i] || !isFreePeak(i, s.present)) return;
      if (!isNeighbor(peakValue(s.current), peakValue(lv.faces[i]))) {
        playSound('wrong');
        haptic('warning');
        commit({ ...s, shake: { index: i, nonce: (s.shake?.nonce ?? 0) + 1 } });
        return;
      }
      const present = s.present.slice();
      present[i] = false;
      const streak = s.streak + 1;
      if (!present.some(Boolean)) {
        const stars = peaksStars(lv.stock.length - s.next);
        playSound('win');
        haptic('success');
        onWin(stars);
        commit({ ...s, present, current: lv.faces[i], streak, wonStars: stars });
        return;
      }
      playSound('match');
      haptic(streak >= 4 ? 'success' : 'light');
      if (streak >= 3) setToast({ text: t.combo(streak), id: Date.now() });
      const lost = s.next >= lv.stock.length && !hasMove(present, lv.faces[i]);
      commit({ ...s, present, current: lv.faces[i], streak, lost });
    },
    // hasMove sadece lv'ye bağlı
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lv, commit, onWin],
  );

  const draw = useCallback(() => {
    const s = stateRef.current;
    if (s.lost || s.wonStars !== null || s.next >= lv.stock.length) return;
    const current = lv.stock[s.next];
    const next = s.next + 1;
    playSound('tap');
    haptic('select');
    const lost = next >= lv.stock.length && !hasMove(s.present, current);
    commit({ ...s, current, next, streak: 0, lost });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lv, commit]);

  const restart = useCallback(() => commit(fresh(stateRef.current.round + 1)), [commit, fresh]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);

  // Tepeler: 8 taş genişliğinde, sıralar yarım taş üst üste biner
  const faceW = size.width ? Math.min(size.width / 8.4 / 1.14, (size.height * 0.62) / (3 * 0.62 + 1) / 1.458, 80) : 0;
  const ts = tileSize(faceW);
  const rowStep = ts.h * 0.62;
  const peaksW = 8 * ts.w;
  const ox = (size.width - peaksW) / 2;
  const bigFaceW = Math.min(faceW * 1.9, 110);
  const stockLeft = lv.stock.length - state.next;

  return (
    <ModeShell
      title={mt().modes.peaks.name}
      info={`${t.level(level)} · ${mt().deck(stockLeft)}`}
      rules={mt().modes.peaks.rules}
      onHome={onHome}
      onRestart={restart}
      onGames={onGames}
      onNext={onNext}
      wonStars={state.wonStars}
      lost={state.lost ? { title: mt().deckEmptyTitle, body: mt().deckEmptyBody } : null}
      toast={toast}
    >
      <View style={styles.area} onLayout={onLayout}>
        {faceW > 0 ? (
          <>
            <View key={state.round} style={{ height: rowStep * 3 + ts.h, marginTop: 8 }}>
              {PEAK_SLOTS.map((slot, i) => {
                const covered = state.present[i] && PEAK_COVERS[i].some((j) => state.present[j]);
                return (
                  <SimpleTile
                    key={i}
                    face={covered ? 'back' : lv.faces[i]}
                    faceW={faceW}
                    gone={!state.present[i]}
                    shake={state.shake && state.shake.index === i ? state.shake.nonce : 0}
                    onPress={() => onTile(i)}
                    style={{ position: 'absolute', left: ox + slot.x * ts.w, top: slot.row * rowStep }}
                  />
                );
              })}
            </View>

            <View style={styles.bottom}>
              <Pressable
                onPress={draw}
                disabled={stockLeft === 0}
                accessibilityRole="button"
                accessibilityLabel={`${mt().draw}, ${stockLeft}`}
                style={({ pressed }) => [styles.stock, pressed && { opacity: 0.8 }, stockLeft === 0 && { opacity: 0.4 }]}
              >
                <View>
                  {stockLeft > 1 ? <View style={[styles.stackShadow, { width: tileSize(bigFaceW).w, height: tileSize(bigFaceW).h }]} /> : null}
                  <SimpleTile face="back" faceW={bigFaceW} />
                </View>
                <Text style={styles.stockText}>
                  {mt().draw} ({stockLeft})
                </Text>
              </Pressable>
              <View style={styles.currentBox}>
                <SimpleTile key={`${state.current}-${state.next}-${state.present.filter(Boolean).length}`} face={state.current} faceW={bigFaceW} />
              </View>
            </View>
          </>
        ) : null}
      </View>
    </ModeShell>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, justifyContent: 'space-around' },
  bottom: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 40, marginBottom: 8 },
  stock: { alignItems: 'center', gap: 6 },
  stackShadow: { position: 'absolute', left: 5, top: 5, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  stockText: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  currentBox: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,214,90,0.25)',
    borderWidth: 2,
    borderColor: '#FFD23F',
  },
});
