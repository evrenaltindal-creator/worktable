import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SceneBackground } from './src/components/SceneBackground';
import { initFeedback, setFeedbackSettings } from './src/feedback';
import { Difficulty, dateSeed, todayKey } from './src/game/sudoku';
import { setLanguage } from './src/i18n';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MAX_HINTS, Progress, SavedGame, Settings, loadGame, loadProgress, saveGame, saveProgress } from './src/storage';
import { THEMES } from './src/themes';

type Route = { name: 'home' } | { name: 'game'; difficulty: Difficulty; number: number; dailyKey?: string };

/** Her zorluğun sahnesi */
const THEME_OF: Record<Difficulty | 'home', number> = { home: 0, easy: 0, medium: 3, hard: 1, expert: 2 };
const DAILY_DIFFICULTY: Difficulty = 'medium';

const seedOf = (r: Extract<Route, { name: 'game' }>) => (r.dailyKey ? (dateSeed(r.dailyKey) % 1000000) + 100000 : r.number);
const starKey = (r: Extract<Route, { name: 'game' }>) => (r.dailyKey ? `daily-${r.dailyKey}` : `${r.difficulty}-${r.number}`);

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

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false;
      setRoute({ name: 'home' });
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
      setLanguage(s.language);
      updateProgress((p) => ({ ...p, settings: s }));
    },
    [updateProgress],
  );

  const onSaveGame = useCallback((g: SavedGame | null) => {
    setSaved(g);
    saveGame(g);
  }, []);

  const onUseHint = useCallback(() => updateProgress((p) => ({ ...p, hints: Math.max(0, p.hints - 1) })), [updateProgress]);

  const today = todayKey();
  const theme = THEMES[route.name === 'game' ? THEME_OF[route.difficulty] : THEME_OF.home];

  const renderGame = (r: Extract<Route, { name: 'game' }>, p: Progress) => {
    const key = starKey(r);
    return (
      <GameScreen
        key={key}
        difficulty={r.difficulty}
        number={r.number}
        dailyKey={r.dailyKey}
        seed={seedOf(r)}
        saved={saved}
        settings={p.settings}
        hints={p.hints}
        firstTime={p.stars[key] === undefined}
        onUseHint={onUseHint}
        onSave={onSaveGame}
        onWin={(stars) =>
          updateProgress((q) => {
            const first = q.stars[key] === undefined;
            return {
              ...q,
              stars: { ...q.stars, [key]: Math.max(q.stars[key] ?? 0, stars) },
              hints: first ? Math.min(MAX_HINTS, q.hints + 1) : q.hints,
              next: r.dailyKey ? q.next : { ...q.next, [r.difficulty]: Math.max(q.next[r.difficulty], r.number + 1) },
              daily: r.dailyKey ? { ...q.daily, [r.dailyKey]: Math.max(q.daily[r.dailyKey] ?? 0, stars) } : q.daily,
            };
          })
        }
        onNext={r.dailyKey ? undefined : () => setRoute({ ...r, number: r.number + 1 })}
        onHome={() => setRoute({ name: 'home' })}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SceneBackground key={theme.id} theme={theme} />
      <StatusBar style="light" />
      <View style={styles.root}>
        {!progress ? null : route.name === 'home' ? (
          <HomeScreen
            progress={progress}
            saved={saved}
            dailyDone={!!progress.daily[today]}
            onContinue={() => saved && setRoute({ name: 'game', difficulty: saved.difficulty, number: saved.number, dailyKey: saved.dailyKey })}
            onPlay={(d) => setRoute({ name: 'game', difficulty: d, number: progress.next[d] })}
            onDaily={() => setRoute({ name: 'game', difficulty: DAILY_DIFFICULTY, number: 1, dailyKey: today })}
            onSettingsChange={onSettingsChange}
          />
        ) : (
          renderGame(route, progress)
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
