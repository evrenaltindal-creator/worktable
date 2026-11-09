import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initFeedback, setFeedbackSettings } from './src/feedback';
import { LEVEL_COUNT } from './src/game/levels';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LevelsScreen } from './src/screens/LevelsScreen';
import {
  Progress,
  SavedGame,
  Settings,
  loadGame,
  loadProgress,
  saveGame,
  saveProgress,
} from './src/storage';
import { colors } from './src/theme';

type Route = { name: 'home' } | { name: 'levels' } | { name: 'game'; level: number };

export default function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [saved, setSaved] = useState<SavedGame | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    initFeedback();
    Promise.all([loadProgress(), loadGame()]).then(([p, g]) => {
      setFeedbackSettings(p.settings.sound, p.settings.haptics);
      setProgress(p);
      setSaved(g);
    });
  }, []);

  // Android geri tuşu: ana sayfaya dön
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
      updateProgress((p) => ({ ...p, settings: s }));
    },
    [updateProgress],
  );

  const onSaveGame = useCallback((g: SavedGame | null) => {
    setSaved(g);
    saveGame(g);
  }, []);

  const onWin = useCallback(
    (level: number, seconds: number) => {
      updateProgress((p) => ({
        ...p,
        unlocked: Math.min(LEVEL_COUNT, Math.max(p.unlocked, level + 1)),
        best: { ...p.best, [level]: Math.min(p.best[level] ?? Infinity, seconds) },
      }));
    },
    [updateProgress],
  );

  const nextLevel = progress ? (saved?.level ?? progress.unlocked) : 1;

  return (
    <SafeAreaProvider>
      <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" />
      <View style={styles.root}>
        {!progress ? null : route.name === 'home' ? (
          <HomeScreen
            nextLevel={nextLevel}
            settings={progress.settings}
            onPlay={() => setRoute({ name: 'game', level: nextLevel })}
            onLevels={() => setRoute({ name: 'levels' })}
            onSettingsChange={onSettingsChange}
          />
        ) : route.name === 'levels' ? (
          <LevelsScreen
            unlocked={progress.unlocked}
            best={progress.best}
            onBack={() => setRoute({ name: 'home' })}
            onPick={(level) => setRoute({ name: 'game', level })}
          />
        ) : (
          <GameScreen
            key={route.level}
            level={route.level}
            saved={saved}
            settings={progress.settings}
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
