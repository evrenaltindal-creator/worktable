import { useHub } from '../../hub/HubContext';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/GameScreen';
import { Home } from './src/kit/components/Home';
import { SceneBackground } from './src/kit/components/SceneBackground';
import { initFeedback, setFeedbackSettings } from './src/kit/feedback';
import { c, setLanguage } from './src/kit/i18n';
import { BaseSettings, MAX_HINTS, START_HINTS, dateSeed, load, save, todayKey } from './src/kit/store';
import { THEMES } from './src/kit/themes';
import { t } from './src/text';

interface Progress {
  next: number;
  stars: Record<string, number>;
  hints: number;
  daily: Record<string, number>;
  settings: BaseSettings;
}

const KEY = 'huzur-jigsaw:progress:v1';
const DEFAULTS: Progress = {
  next: 1,
  stars: {},
  hints: START_HINTS,
  daily: {},
  settings: { sound: true, haptics: true, language: 'auto' },
};
/** Günlük oyun orta zorlukta bir seviyenin farklı dizilimidir */
const DAILY_LEVEL = 15;

type Route = { name: 'home' } | { name: 'game'; level: number; daily?: string };

export default function Game() {
  const [p, setP] = useState<Progress | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const hub = useHub(route.name === 'home');

  useEffect(() => {
    initFeedback();
    load(KEY, DEFAULTS).then((v) => {
      const merged = { ...DEFAULTS, ...v, settings: { ...DEFAULTS.settings, ...v.settings } };
      setFeedbackSettings(merged.settings.sound, merged.settings.haptics);
      setLanguage(merged.settings.language);
      setP(merged);
    });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') {
        hub.exit();
        return true;
      }
      setRoute({ name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [route.name, hub]);

  const update = useCallback((fn: (q: Progress) => Progress) => {
    setP((old) => {
      if (!old) return old;
      const next = fn(old);
      save(KEY, next);
      return next;
    });
  }, []);

  const today = todayKey();
  const theme = THEMES[route.name === 'game' ? (route.daily ? 2 : Math.floor((route.level - 1) / 5) % THEMES.length) : 3];

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
            choices={[
              {
                key: 'play',
                label: p.next > 1 ? c.continueGame : c.play,
                sub: c.level(p.next),
                color: '#2E7DBA',
                edge: '#1F5A88',
                onPress: () => setRoute({ name: 'game', level: p.next }),
              },
              ...(p.next > 1
                ? [
                    {
                      key: 'replay',
                      label: c.level(p.next - 1),
                      sub: '★'.repeat(p.stars[`${p.next - 1}`] ?? 0) || ' ',
                      color: '#2FA866',
                      edge: '#1F7A49',
                      onPress: () => setRoute({ name: 'game', level: p.next - 1 }),
                    },
                  ]
                : []),
            ]}
            daily={{ done: !!p.daily[today], onPress: () => setRoute({ name: 'game', level: DAILY_LEVEL, daily: today }) }}
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
            const key = r.daily ? `daily-${r.daily}` : `${r.level}`;
            return (
              <GameScreen
                key={key}
                level={r.level}
                variant={r.daily ? (dateSeed(r.daily) % 100000) + 1 : 0}
                isDaily={!!r.daily}
                hints={p.hints}
                firstTime={p.stars[key] === undefined}
                onUseHint={() => update((q) => ({ ...q, hints: Math.max(0, q.hints - 1) }))}
                onWin={(stars) =>
                  update((q) => ({
                    ...q,
                    stars: { ...q.stars, [key]: Math.max(q.stars[key] ?? 0, stars) },
                    hints: q.stars[key] === undefined ? Math.min(MAX_HINTS, q.hints + 1) : q.hints,
                    next: r.daily ? q.next : Math.max(q.next, r.level + 1),
                    daily: r.daily ? { ...q.daily, [r.daily]: Math.max(q.daily[r.daily] ?? 0, stars) } : q.daily,
                  }))
                }
                onNext={r.daily ? undefined : () => setRoute({ name: 'game', level: r.level + 1 })}
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
