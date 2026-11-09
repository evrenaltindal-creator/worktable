import { ReactNode } from 'react';
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
  disabled?: boolean;
  badge?: ReactNode;
}

/** Oyun altındaki araç düğmesi: simge + yazı. */
export function ToolButton({ label, icon, onPress, disabled }: ToolButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.tool, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Image source={UI_ICONS[icon]} style={styles.toolIcon} />
      <Text style={styles.toolLabel} numberOfLines={1}>
        {label}
      </Text>
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
  disabled: { opacity: 0.4 },
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
  toolLabel: { color: colors.text, fontSize: font.small, fontWeight: '700' },
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
