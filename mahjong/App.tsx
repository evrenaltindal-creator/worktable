import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BoosterKind, addBoosters, levelRewards } from './src/boosters';
import { SceneBackground } from './src/components/SceneBackground';
import { initFeedback, setFeedbackSettings } from './src/feedback';
import { CONNECT_LEVELS } from './src/game/connect';
import { LAYOUTS } from './src/game/layouts';
import { LEVEL_COUNT } from './src/game/levels';
import { MEMORY_LEVELS } from './src/game/memory';
import { PEAKS_LEVELS } from './src/game/peaks';
import { TRIPLE_LEVELS } from './src/game/triple';
import { setLanguage } from './src/i18n';
import { mt } from './src/i18nModes';
import { ModeId, dateSeed, todayKey } from './src/modes';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { GameScreen, WinResult } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LevelsScreen } from './src/screens/LevelsScreen';
import { MemoryScreen } from './src/screens/MemoryScreen';
import { ModesScreen } from './src/screens/ModesScreen';
import { PeaksScreen } from './src/screens/PeaksScreen';
import { TripleScreen } from './src/screens/TripleScreen';
import {
  Progress,
  SavedGame,
  Settings,
  loadGame,
  loadProgress,
  saveGame,
  saveProgress,
} from './src/storage';
import { themeForLevel } from './src/themes';

type Route =
  | { name: 'home' }
  | { name: 'levels' }
  | { name: 'game'; level: number }
  | { name: 'modes' }
  | { name: 'mode'; mode: Exclude<ModeId, 'classic'>; level: number };

/** Her modun seviye sayısı */
const MODE_LEVELS: Record<Exclude<ModeId, 'classic' | 'daily'>, number> = {
  timed: LEVEL_COUNT,
  sum10: LEVEL_COUNT,
  triple: TRIPLE_LEVELS,
  connect: CONNECT_LEVELS,
  memory: MEMORY_LEVELS,
  peaks: PEAKS_LEVELS,
};

/** Günün bulmacası: orta boy dizilimler arasından tarihe göre seçilir */
function dailyPuzzle(key: string) {
  const pool = LAYOUTS.filter((l) => l.positions.length >= 46 && l.positions.length <= 100);
  const seed = dateSeed(key);
  return { layout: pool[seed % pool.length], seed };
}

const noSave = () => {};

export default function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [saved, setSaved] = useState<SavedGame | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    initFeedback();
    Promise.all([loadProgress(), loadGame()]).then(([p, g]) => {
      setFeedbackSettings(p.settings.sound, p.settings.haptics);
      setLanguage(p.settings.language);
      setProgress(p);
      setSaved(g);
    });
  }, []);

  // Android geri tuşu: bir önceki ekrana dön
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false;
      setRoute(route.name === 'mode' ? { name: 'modes' } : { name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [route.name]);

  const updateProgress = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((old) => {
      if (!old) return old;
      const next = fn(old);
      saveProgress(next);
      return next;
    });
  }, []);

  const onSettingsChange = useCallback(
    (s: Settings) => {
      setFeedbackSettings(s.sound, s.haptics);
      // Dil değişince ekranlar yeni ayarlarla yeniden çizilir ve yeni dil görünür
      setLanguage(s.language);
      updateProgress((p) => ({ ...p, settings: s }));
    },
    [updateProgress],
  );

  const onSaveGame = useCallback((g: SavedGame | null) => {
    setSaved(g);
    saveGame(g);
  }, []);

  const onUseBooster = useCallback(
    (kind: BoosterKind) => {
      updateProgress((p) => ({ ...p, boosters: { ...p.boosters, [kind]: Math.max(0, p.boosters[kind] - 1) } }));
    },
    [updateProgress],
  );

  const onWin = useCallback(
    ({ level, seconds, stars }: WinResult) => {
      updateProgress((p) => {
        const firstTime = p.best[level] === undefined;
        return {
          ...p,
          unlocked: Math.min(LEVEL_COUNT, Math.max(p.unlocked, level + 1)),
          best: { ...p.best, [level]: Math.min(p.best[level] ?? Infinity, seconds) },
          stars: { ...p.stars, [level]: Math.max(p.stars[level] ?? 0, stars) },
          boosters: firstTime ? addBoosters(p.boosters, levelRewards(level, stars)) : p.boosters,
        };
      });
    },
    [updateProgress],
  );

  /** Diğer modlarda kazanma: o modun sıradaki seviyesi ve yıldızı kaydedilir */
  const onModeWin = useCallback(
    (mode: Exclude<ModeId, 'classic'>, level: number, stars: number) => {
      updateProgress((p) => {
        if (mode === 'daily') {
          const key = todayKey();
          return { ...p, daily: { ...p.daily, [key]: Math.max(p.daily[key] ?? 0, stars) } };
        }
        const cur = p.modes[mode] ?? { level: 1, stars: {} };
        return {
          ...p,
          modes: {
            ...p.modes,
            [mode]: {
              level: Math.min(MODE_LEVELS[mode], Math.max(cur.level, level + 1)),
              stars: { ...cur.stars, [level]: Math.max(cur.stars[level] ?? 0, stars) },
            },
          },
        };
      });
    },
    [updateProgress],
  );

  const openMode = useCallback(
    (mode: ModeId) => {
      if (!progress) return;
      if (mode === 'classic') setRoute({ name: 'game', level: saved?.level ?? progress.unlocked });
      else if (mode === 'daily') setRoute({ name: 'mode', mode, level: 1 });
      else setRoute({ name: 'mode', mode, level: progress.modes[mode]?.level ?? 1 });
    },
    [progress, saved],
  );

  const daily = useMemo(() => dailyPuzzle(todayKey()), []);

  const nextLevel = progress ? (saved?.level ?? progress.unlocked) : 1;
  const themeLevel =
    route.name === 'game' || route.name === 'mode'
      ? route.level
      : route.name === 'levels'
        ? (progress?.unlocked ?? 1)
        : nextLevel;
  const theme = themeForLevel(themeLevel);

  const renderMode = (r: Extract<Route, { name: 'mode' }>, p: Progress) => {
    const goHome = () => setRoute({ name: 'home' });
    const goGames = () => setRoute({ name: 'modes' });
    const win = (stars: number) => onModeWin(r.mode, r.level, stars);
    const next = () => setRoute({ ...r, level: Math.min(MODE_LEVELS[r.mode as keyof typeof MODE_LEVELS] ?? 1, r.level + 1) });
    const key = `${r.mode}-${r.level}`;
    const common = {
      level: r.level,
      settings: p.settings,
      boosters: p.boosters,
      onUseBooster,
      onWin: win,
      onNext: next,
      onHome: goHome,
      onGames: goGames,
    };
    switch (r.mode) {
      case 'triple':
        return <TripleScreen key={key} {...common} />;
      case 'connect':
        return <ConnectScreen key={key} {...common} />;
      case 'memory':
        return <MemoryScreen key={key} {...common} />;
      case 'peaks':
        return <PeaksScreen key={key} {...common} />;
      case 'timed':
      case 'sum10':
      case 'daily':
        return (
          <GameScreen
            key={key}
            level={r.level}
            saved={null}
            settings={p.settings}
            boosters={p.boosters}
            firstTime={false}
            onUseBooster={onUseBooster}
            onSave={noSave}
            onWin={({ stars }) => win(stars)}
            onNext={next}
            onHome={goHome}
            onGames={goGames}
            variant={r.mode}
            override={r.mode === 'daily' ? daily : undefined}
            title={r.mode === 'daily' ? mt().modes.daily.name : `${mt().modes[r.mode].name} · ${r.level}`}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SceneBackground key={theme.id} theme={theme} />
      <StatusBar style="light" />
      <View style={styles.root}>
        {!progress ? null : route.name === 'home' ? (
          <HomeScreen
            nextLevel={nextLevel}
            settings={progress.settings}
            onPlay={() => setRoute({ name: 'game', level: nextLevel })}
            onLevels={() => setRoute({ name: 'levels' })}
            onGames={() => setRoute({ name: 'modes' })}
            onSettingsChange={onSettingsChange}
          />
        ) : route.name === 'levels' ? (
          <LevelsScreen
            unlocked={progress.unlocked}
            stars={progress.stars}
            onBack={() => setRoute({ name: 'home' })}
            onPick={(level) => setRoute({ name: 'game', level })}
          />
        ) : route.name === 'modes' ? (
          <ModesScreen progress={progress} onPick={openMode} onBack={() => setRoute({ name: 'home' })} />
        ) : route.name === 'mode' ? (
          renderMode(route, progress)
        ) : (
          <GameScreen
            key={route.level}
            level={route.level}
            saved={saved}
            settings={progress.settings}
            boosters={progress.boosters}
            firstTime={progress.best[route.level] === undefined}
            onUseBooster={onUseBooster}
            onSave={onSaveGame}
            onWin={onWin}
            onNext={() => setRoute({ name: 'game', level: Math.min(LEVEL_COUNT, route.level + 1) })}
            onHome={() => setRoute({ name: 'home' })}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
