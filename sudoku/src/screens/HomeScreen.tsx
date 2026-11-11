import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../components/Buttons';
import { Overlay } from '../components/Overlay';
import { DIFFICULTIES, Difficulty } from '../game/sudoku';
import { LANGUAGES, LangSetting, t } from '../i18n';
import { Progress, SavedGame, Settings } from '../storage';
import { colors, font } from '../theme';

const native = Platform.OS !== 'web';
const LOGO = require('../../assets/splash-icon.png');

const DIFF_COLORS: Record<Difficulty, [string, string]> = {
  easy: ['#2FA866', '#1F7A49'],
  medium: ['#3C7DE0', '#2A5AA6'],
  hard: ['#E07A3F', '#A9542A'],
  expert: ['#7A5AC8', '#563B93'],
};

interface Props {
  progress: Progress;
  saved: SavedGame | null;
  dailyDone: boolean;
  onContinue: () => void;
  onPlay: (d: Difficulty) => void;
  onDaily: () => void;
  onSettingsChange: (s: Settings) => void;
}

export function HomeScreen({ progress, saved, dailyDone, onContinue, onPlay, onDaily, onSettingsChange }: Props) {
  const insets = useSafeAreaInsets();
  const settings = progress.settings;
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [bob] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  return (
    <ScrollView contentContainerStyle={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} bounces={false}>
      <Animated.Image
        source={LOGO}
        style={[styles.logo, { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }, { rotate: '-4deg' }] }]}
      />
      <Text style={styles.title} accessibilityRole="header">
        {t.appName}
      </Text>
      <Text style={styles.tagline}>{t.tagline}</Text>

      <View style={styles.buttons}>
        {saved ? (
          <BigButton
            variant="primary"
            icon="play"
            label={t.continueGame}
            sublabel={saved.dailyKey ? t.daily : `${t.difficulty[saved.difficulty]} · ${t.puzzle(saved.number)}`}
            onPress={onContinue}
          />
        ) : null}

        <View style={styles.grid}>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d}
              accessibilityRole="button"
              accessibilityLabel={`${t.difficulty[d]}, ${t.puzzle(progress.next[d])}`}
              onPress={() => onPlay(d)}
              style={({ pressed }) => [
                styles.diff,
                { backgroundColor: DIFF_COLORS[d][0], borderBottomColor: DIFF_COLORS[d][1] },
                pressed && { opacity: 0.85, transform: [{ translateY: 2 }] },
              ]}
            >
              <Text style={styles.diffName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {t.difficulty[d]}
              </Text>
              <Text style={styles.diffSub}>{t.puzzle(progress.next[d])}</Text>
            </Pressable>
          ))}
        </View>

        <BigButton
          icon="grid"
          label={t.daily}
          sublabel={dailyDone ? t.dailyDone : t.dailyNew}
          onPress={onDaily}
          style={styles.dailyButton}
        />
        <BigButton icon="help" label={t.howToPlay} onPress={() => setShowRules(true)} />
        <BigButton icon="settings" label={t.settings} onPress={() => setShowSettings(true)} />
      </View>

      <Overlay
        visible={showRules}
        title={t.howToPlay}
        onRequestClose={() => setShowRules(false)}
        footer={<BigButton variant="primary" label={t.close} onPress={() => setShowRules(false)} />}
      >
        {t.rules.map((r, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={styles.ruleNum}>{i + 1}</Text>
            <Text lineBreakStrategyIOS="hangul-word" style={styles.ruleText}>
              {r}
            </Text>
          </View>
        ))}
      </Overlay>

      <Overlay
        visible={showSettings}
        title={t.settings}
        onRequestClose={() => setShowSettings(false)}
        footer={<BigButton variant="primary" label={t.close} onPress={() => setShowSettings(false)} />}
      >
        <SettingRow label={t.sound} value={settings.sound} onChange={(v) => onSettingsChange({ ...settings, sound: v })} />
        <SettingRow label={t.haptics} value={settings.haptics} onChange={(v) => onSettingsChange({ ...settings, haptics: v })} />
        <SettingRow label={t.showMistakes} value={settings.showMistakes} onChange={(v) => onSettingsChange({ ...settings, showMistakes: v })} />
        <SettingRow label={t.highlightSame} value={settings.highlightSame} onChange={(v) => onSettingsChange({ ...settings, highlightSame: v })} />
        <View style={styles.langBox}>
          <Text style={styles.settingLabel}>{t.language}</Text>
          <View style={styles.langRow}>
            {([{ code: 'auto', name: t.languageAuto }, ...LANGUAGES] as { code: LangSetting; name: string }[]).map((l) => {
              const active = settings.language === l.code;
              return (
                <Pressable
                  key={l.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={l.name}
                  onPress={() => onSettingsChange({ ...settings, language: l.code })}
                  style={({ pressed }) => [styles.langChip, active && styles.langChipActive, pressed && { opacity: 0.8 }]}
                >
                  <Text style={[styles.langText, active && styles.langTextActive]}>{l.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Overlay>
    </ScrollView>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <Text lineBreakStrategyIOS="hangul-word" style={styles.settingLabel}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: colors.accent, false: 'rgba(255,255,255,0.3)' }}
        thumbColor="#FFFFFF"
        style={styles.switch}
      />
    </View>
  );
}

const shadow = { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 };

const styles = StyleSheet.create({
  root: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20 },
  logo: { width: 190, height: 190, marginBottom: 0 },
  title: { color: colors.text, fontSize: font.huge, fontWeight: '900', textAlign: 'center', ...shadow },
  tagline: { color: colors.text, fontSize: font.normal, fontWeight: '600', textAlign: 'center', marginTop: 4, marginBottom: 22, ...shadow },
  buttons: { width: '100%', maxWidth: 460, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  diff: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 84,
    borderRadius: 18,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  diffName: { color: '#FFFFFF', fontSize: font.big, fontWeight: '900' },
  diffSub: { color: 'rgba(255,255,255,0.9)', fontSize: font.small, fontWeight: '700' },
  dailyButton: { backgroundColor: '#C8507E', borderBottomColor: '#923A5C' },
  ruleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ruleNum: {
    color: '#3A2A08',
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '800',
    fontSize: font.small,
    overflow: 'hidden',
  },
  ruleText: { color: colors.text, fontSize: font.normal, lineHeight: 28, flex: 1 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingLabel: { color: colors.text, fontSize: font.normal, fontWeight: '600', flex: 1 },
  switch: { transform: [{ scale: 1.15 }] },
  langBox: { backgroundColor: colors.panel, borderRadius: 14, padding: 14, gap: 12 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langChipActive: { backgroundColor: colors.accent, borderColor: '#FFFFFF' },
  langText: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  langTextActive: { color: '#3A2A08' },
});
