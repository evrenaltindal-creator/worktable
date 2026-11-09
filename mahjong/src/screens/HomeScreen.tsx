import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../components/Buttons';
import { Overlay } from '../components/Overlay';
import { TILE_IMAGES } from '../images';
import { t } from '../i18n';
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
          <View key={f} style={[styles.miniTile, { transform: [{ rotate: `${(i - 2) * 6}deg` }, { translateY: Math.abs(i - 2) * 8 }] }]}>
            <View style={styles.miniFace}>
              <Image source={TILE_IMAGES[f]} style={styles.miniImg} resizeMode="contain" />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {t.appName}
      </Text>
      <Text style={styles.tagline}>{t.tagline}</Text>

      <View style={styles.buttons}>
        <BigButton variant="primary" icon="play" label={t.play} sublabel={t.continueLevel(nextLevel)} onPress={onPlay} />
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
            <Text style={styles.ruleText}>{r}</Text>
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
      </Overlay>
    </ScrollView>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
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
  miniTile: {
    width: 62,
    height: 80,
    marginHorizontal: -3,
    borderRadius: 9,
    backgroundColor: colors.tileSide,
  },
  miniFace: {
    width: 56,
    height: 74,
    borderRadius: 9,
    backgroundColor: colors.tileFace,
    overflow: 'hidden',
  },
  miniImg: { width: '100%', height: '100%' },
  title: { color: colors.text, fontSize: font.huge, fontWeight: '900', textAlign: 'center' },
  tagline: { color: colors.textSoft, fontSize: font.normal, textAlign: 'center', marginTop: 6, marginBottom: 34 },
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
});
