import { useEffect, useState } from 'react';
import { Animated, Easing, ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { c, LANGUAGES, LangSetting } from '../i18n';
import { BaseSettings } from '../store';
import { colors, font } from '../theme';
import { BigButton } from './Buttons';
import { Overlay } from './Overlay';

const native = Platform.OS !== 'web';

export interface Choice {
  key: string;
  label: string;
  sub: string;
  color: string;
  edge: string;
  onPress: () => void;
}

interface Props<S extends BaseSettings> {
  logo: ImageSourcePropType;
  title: string;
  tagline: string;
  /** Yarım oyun varsa "Devam et" */
  resume?: { sub: string; onPress: () => void } | null;
  choices: Choice[];
  daily?: { done: boolean; onPress: () => void };
  rules: string[];
  settings: S;
  /** Uygulamaya özel açık/kapalı ayarlar */
  toggles?: { key: keyof S & string; label: string }[];
  onSettingsChange: (s: S) => void;
}

/** Tüm Huzur oyunlarının ana sayfası */
export function Home<S extends BaseSettings>(props: Props<S>) {
  const { logo, title, tagline, resume, choices, daily, rules, settings, toggles = [], onSettingsChange } = props;
  const insets = useSafeAreaInsets();
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

  const set = (patch: Partial<S>) => onSettingsChange({ ...settings, ...patch });

  return (
    <ScrollView contentContainerStyle={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} bounces={false}>
      <Animated.Image
        source={logo}
        style={[styles.logo, { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }, { rotate: '-4deg' }] }]}
      />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text lineBreakStrategyIOS="hangul-word" style={styles.tagline}>
        {tagline}
      </Text>

      <View style={styles.buttons}>
        {resume ? <BigButton variant="primary" icon="play" label={c.continueGame} sublabel={resume.sub} onPress={resume.onPress} /> : null}
        <View style={styles.grid}>
          {choices.map((ch) => (
            <Pressable
              key={ch.key}
              accessibilityRole="button"
              accessibilityLabel={`${ch.label}, ${ch.sub}`}
              onPress={ch.onPress}
              style={({ pressed }) => [
                styles.choice,
                choices.length === 1 && styles.choiceFull,
                { backgroundColor: ch.color, borderBottomColor: ch.edge },
                pressed && { opacity: 0.85, transform: [{ translateY: 2 }] },
              ]}
            >
              <Text style={styles.choiceName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {ch.label}
              </Text>
              <Text style={styles.choiceSub} numberOfLines={1}>
                {ch.sub}
              </Text>
            </Pressable>
          ))}
        </View>
        {daily ? (
          <BigButton icon="grid" label={c.daily} sublabel={daily.done ? c.dailyDone : c.dailyNew} onPress={daily.onPress} style={styles.daily} />
        ) : null}
        <BigButton icon="help" label={c.howToPlay} onPress={() => setShowRules(true)} />
        <BigButton icon="settings" label={c.settings} onPress={() => setShowSettings(true)} />
      </View>

      <Overlay
        visible={showRules}
        title={c.howToPlay}
        onRequestClose={() => setShowRules(false)}
        footer={<BigButton variant="primary" label={c.close} onPress={() => setShowRules(false)} />}
      >
        <RulesList rules={rules} />
      </Overlay>

      <Overlay
        visible={showSettings}
        title={c.settings}
        onRequestClose={() => setShowSettings(false)}
        footer={<BigButton variant="primary" label={c.close} onPress={() => setShowSettings(false)} />}
      >
        <SettingRow label={c.sound} value={settings.sound} onChange={(v) => set({ sound: v } as Partial<S>)} />
        <SettingRow label={c.haptics} value={settings.haptics} onChange={(v) => set({ haptics: v } as Partial<S>)} />
        {toggles.map((tg) => (
          <SettingRow key={tg.key} label={tg.label} value={settings[tg.key] === true} onChange={(v) => set({ [tg.key]: v } as Partial<S>)} />
        ))}
        <View style={styles.langBox}>
          <Text style={styles.settingLabel}>{c.language}</Text>
          <View style={styles.langRow}>
            {([{ code: 'auto', name: c.languageAuto }, ...LANGUAGES] as { code: LangSetting; name: string }[]).map((l) => {
              const active = settings.language === l.code;
              return (
                <Pressable
                  key={l.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={l.name}
                  onPress={() => set({ language: l.code } as Partial<S>)}
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

export function RulesList({ rules }: { rules: string[] }) {
  return (
    <>
      {rules.map((r, i) => (
        <View key={i} style={styles.ruleRow}>
          <Text style={styles.ruleNum}>{i + 1}</Text>
          <Text lineBreakStrategyIOS="hangul-word" style={styles.ruleText}>
            {r}
          </Text>
        </View>
      ))}
    </>
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
  logo: { width: 190, height: 190 },
  title: { color: colors.text, fontSize: font.huge, fontWeight: '900', textAlign: 'center', ...shadow },
  tagline: { color: colors.text, fontSize: font.normal, fontWeight: '600', textAlign: 'center', marginTop: 4, marginBottom: 22, ...shadow },
  buttons: { width: '100%', maxWidth: 460, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  choice: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 84,
    borderRadius: 18,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  choiceFull: { width: '100%' },
  choiceName: { color: '#FFFFFF', fontSize: font.big, fontWeight: '900' },
  choiceSub: { color: 'rgba(255,255,255,0.9)', fontSize: font.small, fontWeight: '700' },
  daily: { backgroundColor: '#C8507E', borderBottomColor: '#923A5C' },
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
