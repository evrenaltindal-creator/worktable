import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { IconName, UI_ICONS } from '../images';
import { colors, font } from '../theme';

interface BigButtonProps {
  label: string;
  sublabel?: string;
  icon?: IconName;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

/** Büyük, kolay basılan düğme (en az 64 pt yükseklik). */
export function BigButton({ label, sublabel, icon, onPress, variant = 'secondary', style }: BigButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.big,
        primary ? styles.bigPrimary : styles.bigSecondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Image source={UI_ICONS[icon]} style={[styles.bigIcon, primary && styles.iconDark]} /> : null}
      <View>
        <Text style={[styles.bigLabel, primary && styles.textDark]}>{label}</Text>
        {sublabel ? <Text style={[styles.bigSub, primary && styles.textDark]}>{sublabel}</Text> : null}
      </View>
    </Pressable>
  );
}

interface ToolButtonProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  /** Kalan hak sayısı (köşede rozet olarak görünür) */
  count?: number;
  tone?: 'teal' | 'amber' | 'violet';
  disabled?: boolean;
}

const TONES = {
  teal: { bg: '#2A9D8F', edge: '#1C6E64', fg: '#FFFFFF' },
  amber: { bg: '#F4B942', edge: '#B9822A', fg: '#3A2A08' },
  violet: { bg: '#7A5AC8', edge: '#563B93', fg: '#FFFFFF' },
};

/** Oyun altındaki güçlendirici düğmesi: simge + yazı + kalan hak rozeti. */
export function ToolButton({ label, icon, onPress, count, tone = 'teal', disabled }: ToolButtonProps) {
  const c = TONES[tone];
  const empty = count !== undefined && count <= 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count !== undefined ? `${label}, ${count}` : label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tool,
        { backgroundColor: c.bg, borderBottomColor: c.edge },
        pressed && styles.pressed,
        (disabled || empty) && styles.disabled,
      ]}
    >
      <Image source={UI_ICONS[icon]} style={[styles.toolIcon, { tintColor: c.fg }]} />
      <Text style={[styles.toolLabel, { color: c.fg }]} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <View style={[styles.badge, empty && styles.badgeEmpty]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Üst çubuktaki yuvarlak simge düğmesi. */
export function RoundIconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <Image source={UI_ICONS[icon]} style={styles.roundIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  big: {
    minHeight: 68,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  bigPrimary: {
    backgroundColor: colors.accent,
    borderBottomWidth: 5,
    borderBottomColor: colors.accentDark,
  },
  bigSecondary: {
    backgroundColor: colors.button,
    borderBottomWidth: 5,
    borderBottomColor: colors.buttonDark,
  },
  bigIcon: { width: 30, height: 30 },
  iconDark: { tintColor: '#3A2A08' },
  bigLabel: { color: colors.text, fontSize: font.big, fontWeight: '800', textAlign: 'center' },
  bigSub: { color: colors.textSoft, fontSize: font.small, fontWeight: '600', textAlign: 'center' },
  textDark: { color: '#3A2A08' },
  pressed: { opacity: 0.8, transform: [{ translateY: 2 }] },
  disabled: { opacity: 0.5 },
  tool: {
    flex: 1,
    minHeight: 76,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: colors.button,
    borderBottomWidth: 4,
    borderBottomColor: colors.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  toolIcon: { width: 32, height: 32, marginBottom: 4 },
  toolLabel: { color: colors.text, fontSize: font.small, fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: -8,
    right: -6,
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 6,
    backgroundColor: '#E5484D',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmpty: { backgroundColor: '#7D7D7D' },
  badgeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIcon: { width: 26, height: 26 },
});
