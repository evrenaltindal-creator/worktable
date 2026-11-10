import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../components/Buttons';
import { Overlay } from '../components/Overlay';
import { TILE_BODY, TILE_IMAGES } from '../images';
import { LANGUAGES, LangSetting, t } from '../i18n';
import { Settings } from '../storage';
import { colors, font } from '../theme';

interface Props {
  nextLevel: number;
  settings: Settings;
  onPlay: () => void;
  onLevels: () => void;
  onSettingsChange: (s: Settings) => void;
}

const SHOWCASE = ['dr', 'f2', 'd5', 'b1', 'we'];
const native = Platform.OS !== 'web';

/** Ana sayfadaki hafifçe süzülen taş */
function FloatingTile({ face, i }: { face: string; i: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1600 + i * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 1600 + i * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    const id = setTimeout(() => loop.start(), i * 220);
    return () => {
      clearTimeout(id);
      loop.stop();
    };
  }, [v, i]);
  return (
    <Animated.View
      style={[
        styles.miniTile,
        {
          transform: [
            { translateY: Animated.add(v.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }), Math.abs(i - 2) * 10) },
            { rotate: `${(i - 2) * 7}deg` },
          ],
        },
      ]}
    >
      <Image source={TILE_BODY} style={styles.miniBody} resizeMode="stretch" />
      <Image source={TILE_IMAGES[face]} style={styles.miniImg} resizeMode="contain" />
    </Animated.View>
  );
}

/** "Oyna" düğmesi dikkat çeksin diye hafifçe nefes alır */
function Pulse({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }] }}>{children}</Animated.View>;
}

export function HomeScreen({ nextLevel, settings, onPlay, onLevels, onSettingsChange }: Props) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]}
      bounces={false}
    >
      <View style={styles.showcase}>
        {SHOWCASE.map((f, i) => (
          <FloatingTile key={f} face={f} i={i} />
        ))}
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {t.appName}
      </Text>
      <Text lineBreakStrategyIOS="hangul-word" style={styles.tagline}>{t.tagline}</Text>

      <View style={styles.buttons}>
        <Pulse>
          <BigButton variant="primary" icon="play" label={t.play} sublabel={t.continueLevel(nextLevel)} onPress={onPlay} />
        </Pulse>
        <BigButton icon="grid" label={t.levels} onPress={onLevels} />
        <BigButton icon="hint" label={t.howToPlay} onPress={() => setShowRules(true)} />
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
            <Text lineBreakStrategyIOS="hangul-word" style={styles.ruleText}>{r}</Text>
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
        <SettingRow
          label={t.highlightFree}
          value={settings.highlightFree}
          onChange={(v) => onSettingsChange({ ...settings, highlightFree: v })}
        />
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
      <Text lineBreakStrategyIOS="hangul-word" style={styles.settingLabel}>{label}</Text>
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

const styles = StyleSheet.create({
  root: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  showcase: { flexDirection: 'row', justifyContent: 'center', marginBottom: 26, height: 110 },
  miniTile: { width: 66, height: 86, marginHorizontal: -2 },
  miniBody: { position: 'absolute', width: 66, height: 86 },
  miniImg: { position: 'absolute', left: 0, top: 0, width: 58, height: 76 },
  title: {
    color: colors.text,
    fontSize: font.huge,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  tagline: {
    color: colors.text,
    fontSize: font.normal,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  buttons: { width: '100%', maxWidth: 440, gap: 16 },
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
