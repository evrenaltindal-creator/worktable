import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { starsFor } from '../boosters';
import { Board } from '../components/Board';
import { ToolButton } from '../components/Buttons';
import { ModeShell } from '../components/ModeShell';
import { SimpleTile, tileSize } from '../components/SimpleTile';
import { haptic, playSound } from '../feedback';
import { TRAY_SIZE, addToTray, buildTripleLevel, isOpen } from '../game/triple';
import { FaceId } from '../game/tiles';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { ModeScreenProps } from './modeProps';

interface State {
  present: boolean[];
  tray: FaceId[];
  /** Geri alınabilecek hamleler (son üçlü temizlendikten sonrakiler) */
  history: { index: number; tray: FaceId[] }[];
  undos: number;
  shake: { index: number; nonce: number } | null;
  lost: boolean;
  wonStars: number | null;
  dealKey: number;
}

export function TripleScreen({ level, settings, boosters, onUseBooster, onWin, onNext, onHome, onGames }: ModeScreenProps) {
  const lv = useMemo(() => buildTripleLevel(level), [level]);
  const fresh = useCallback(
    (dealKey: number): State => ({
      present: lv.positions.map(() => true),
      tray: [],
      history: [],
      undos: 0,
      shake: null,
      lost: false,
      wonStars: null,
      dealKey,
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

  const open = useMemo(() => new Set(lv.positions.map((_, i) => i).filter((i) => isOpen(i, state.present, lv.rel))), [state.present, lv]);

  const onTilePress = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (s.lost || s.wonStars !== null || !s.present[i]) return;
      if (!isOpen(i, s.present, lv.rel)) {
        playSound('wrong');
        haptic('warning');
        commit({ ...s, shake: { index: i, nonce: (s.shake?.nonce ?? 0) + 1 } });
        return;
      }
      const present = s.present.slice();
      present[i] = false;
      const { tray, cleared } = addToTray(s.tray, lv.faces[i]);
      const history = cleared ? [] : [...s.history, { index: i, tray: s.tray }];
      const lost = !cleared && tray.length >= TRAY_SIZE;
      const finished = !present.some(Boolean) && tray.length === 0;
      let wonStars: number | null = null;
      if (finished) {
        wonStars = starsFor(s.undos);
        playSound('win');
        haptic('success');
        onWin(wonStars);
      } else if (lost) {
        playSound('wrong');
        haptic('warning');
      } else if (cleared) {
        playSound('match');
        haptic('light');
      } else {
        playSound('tap');
        haptic('select');
      }
      commit({ ...s, present, tray, history, lost, wonStars });
    },
    [lv, commit, onWin],
  );

  const undo = useCallback(() => {
    const s = stateRef.current;
    const last = s.history[s.history.length - 1];
    if (!last || s.wonStars !== null) return;
    if (boosters.undo <= 0) {
      playSound('wrong');
      setToast({ text: t.outOf.undo, id: Date.now() });
      return;
    }
    onUseBooster('undo');
    const present = s.present.slice();
    present[last.index] = true;
    playSound('tap');
    commit({ ...s, present, tray: last.tray, history: s.history.slice(0, -1), undos: s.undos + 1, lost: false });
  }, [boosters.undo, onUseBooster, commit]);

  const restart = useCallback(() => commit(fresh(stateRef.current.dealKey + 1)), [commit, fresh]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((o) => (o.width === width && o.height === height ? o : { width, height }));
  }, []);

  // Raf: 7 yer, ekran genişliğine göre
  const slotFaceW = Math.min(52, (size.width - 24) / TRAY_SIZE / 1.14 - 4);
  const slot = tileSize(Math.max(20, slotFaceW));

  const left = state.present.filter(Boolean).length + state.tray.length;

  return (
    <ModeShell
      title={mt().modes.triple.name}
      info={`${t.level(level)} · ${t.tilesLeft(left)}`}
      rules={mt().modes.triple.rules}
      onHome={onHome}
      onRestart={restart}
      onGames={onGames}
      onNext={onNext}
      wonStars={state.wonStars}
      lost={state.lost ? { title: mt().trayFullTitle, body: mt().trayFullBody } : null}
      toast={toast}
      footer={
        <View>
          <View style={[styles.tray, { height: slot.h + 16 }]}>
            {Array.from({ length: TRAY_SIZE }, (_, k) => (
              <View key={k} style={[styles.slot, { width: slot.w + 4, height: slot.h + 4 }]}>
                {state.tray[k] ? <SimpleTile key={`${state.tray[k]}-${k}-${state.tray.length}`} face={state.tray[k]} faceW={Math.max(20, slotFaceW)} /> : null}
              </View>
            ))}
          </View>
          <View style={styles.toolbar}>
            <ToolButton tone="teal" icon="undo" label={t.undo} count={boosters.undo} onPress={undo} disabled={state.history.length === 0} />
          </View>
        </View>
      }
    >
      <View style={styles.boardArea} onLayout={onLayout}>
        {size.width > 0 ? (
          <Board
            key={state.dealKey}
            positions={lv.positions}
            faces={lv.faces}
            present={state.present}
            history={[]}
            free={open}
            selected={null}
            hint={null}
            highlightFree={settings.highlightFree}
            shake={state.shake}
            bursts={[]}
            width={size.width}
            height={size.height}
            onTilePress={onTilePress}
          />
        ) : null}
      </View>
    </ModeShell>
  );
}

const styles = StyleSheet.create({
  boardArea: { flex: 1, marginVertical: 4 },
  tray: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(60,30,10,0.55)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,220,150,0.5)',
    marginTop: 6,
  },
  slot: {
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: { flexDirection: 'row', marginTop: 10, paddingHorizontal: 60 },
});
