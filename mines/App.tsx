import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/GameScreen';
import { DIFFICULTIES, Difficulty } from './src/game/mines';
import { Home } from './src/kit/components/Home';
import { SceneBackground } from './src/kit/components/SceneBackground';
import { initFeedback, setFeedbackSettings } from './src/kit/feedback';
import { setLanguage } from './src/kit/i18n';
import { BaseSettings, MAX_HINTS, START_HINTS, dateSeed, load, save, todayKey } from './src/kit/store';
import { THEMES } from './src/kit/themes';
import { t } from './src/text';

interface Progress {
  next: Record<Difficulty, number>;
  stars: Record<string, number>;
  hints: number;
  daily: Record<string, number>;
  settings: BaseSettings;
}

const KEY = 'huzur-mines:progress:v1';
const DEFAULTS: Progress = {
  next: { easy: 1, medium: 1, hard: 1 },
  stars: {},
  hints: START_HINTS,
  daily: {},
  settings: { sound: true, haptics: true, language: 'auto' },
};
const COLORS: Record<Difficulty, [string, string]> = { easy: ['#2FA866', '#1F7A49'], medium: ['#3C7DE0', '#2A5AA6'], hard: ['#E07A3F', '#A9542A'] };
const THEME_OF: Record<Difficulty | 'home', number> = { home: 0, easy: 0, medium: 3, hard: 1 };

type Route = { name: 'home' } | { name: 'game'; difficulty: Difficulty; number: number; daily?: string };

export default function App() {
  const [p, setP] = useState<Progress | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    initFeedback();
    load(KEY, DEFAULTS).then((v) => {
      const merged = { ...DEFAULTS, ...v, next: { ...DEFAULTS.next, ...v.next }, settings: { ...DEFAULTS.settings, ...v.settings } };
      setFeedbackSettings(merged.settings.sound, merged.settings.haptics);
      setLanguage(merged.settings.language);
      setP(merged);
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

  const update = useCallback((fn: (q: Progress) => Progress) => {
    setP((old) => {
      if (!old) return old;
      const next = fn(old);
      save(KEY, next);
      return next;
    });
  }, []);

  const today = todayKey();
  const theme = THEMES[route.name === 'game' ? THEME_OF[route.difficulty] : THEME_OF.home];

  return (
    <SafeAreaProvider>
      <SceneBackground key={theme.id} theme={theme} />
      <StatusBar style="light" />
      <View style={styles.root}>
        {!p ? null : route.name === 'home' ? (
          <Home
            logo={require('./assets/splash-icon.png')}
            title={t.title}
            tagline={t.tagline}
            choices={DIFFICULTIES.map((d) => ({
              key: d,
              label: t.difficulty[d],
              sub: t.game(p.next[d]),
              color: COLORS[d][0],
              edge: COLORS[d][1],
              onPress: () => setRoute({ name: 'game', difficulty: d, number: p.next[d] }),
            }))}
            daily={{ done: !!p.daily[today], onPress: () => setRoute({ name: 'game', difficulty: 'medium', number: 1, daily: today }) }}
            rules={t.rules}
            settings={p.settings}
            onSettingsChange={(s) => {
              setFeedbackSettings(s.sound, s.haptics);
              setLanguage(s.language);
              update((q) => ({ ...q, settings: s }));
            }}
          />
        ) : (
          (() => {
            const r = route;
            const key = r.daily ? `daily-${r.daily}` : `${r.difficulty}-${r.number}`;
            return (
              <GameScreen
                key={key}
                difficulty={r.difficulty}
                number={r.number}
                seed={r.daily ? (dateSeed(r.daily) % 100000) + 50000 : r.number}
                isDaily={!!r.daily}
                hints={p.hints}
                firstTime={p.stars[key] === undefined}
                onUseHint={() => update((q) => ({ ...q, hints: Math.max(0, q.hints - 1) }))}
                onWin={(stars) =>
                  update((q) => ({
                    ...q,
                    stars: { ...q.stars, [key]: Math.max(q.stars[key] ?? 0, stars) },
                    hints: q.stars[key] === undefined ? Math.min(MAX_HINTS, q.hints + 1) : q.hints,
                    next: r.daily ? q.next : { ...q.next, [r.difficulty]: Math.max(q.next[r.difficulty], r.number + 1) },
                    daily: r.daily ? { ...q.daily, [r.daily]: Math.max(q.daily[r.daily] ?? 0, stars) } : q.daily,
                  }))
                }
                onNext={r.daily ? undefined : () => setRoute({ ...r, number: r.number + 1 })}
                onHome={() => setRoute({ name: 'home' })}
              />
            );
          })()
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
