import { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundIconButton } from '../components/Buttons';
import { LEVEL_COUNT } from '../game/levels';
import { UI_ICONS } from '../images';
import { t } from '../i18n';
import { colors, font } from '../theme';

interface Props {
  unlocked: number;
  best: Record<number, number>;
  onPick: (level: number) => void;
  onBack: () => void;
}

export function LevelsScreen({ unlocked, best, onPick, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 6 : 4;
  const levels = useMemo(() => Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1), []);
  const initialRow = Math.max(0, Math.floor((unlocked - 1) / columns) - 2);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <RoundIconButton icon="back" label={t.back} onPress={onBack} />
        <Text style={styles.title} accessibilityRole="header">
          {t.levels}
        </Text>
        <View style={{ width: 52 }} />
      </View>
      <FlatList
        data={levels}
        key={columns}
        numColumns={columns}
        keyExtractor={(n) => String(n)}
        // Çok sütunlu listede bu ikisi SATIR numarası ile çalışır
        initialScrollIndex={initialRow}
        getItemLayout={(_, row) => ({ length: 96, offset: 96 * row, index: row })}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 10 }}
        renderItem={({ item: n }) => {
          const locked = n > unlocked;
          const done = best[n] !== undefined;
          return (
            <View style={styles.cellWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={locked ? `${t.level(n)}, ${t.locked}` : t.level(n)}
                accessibilityState={{ disabled: locked }}
                disabled={locked}
                onPress={() => onPick(n)}
                style={({ pressed }) => [
                  styles.cell,
                  done && styles.cellDone,
                  n === unlocked && styles.cellCurrent,
                  locked && styles.cellLocked,
                  pressed && { opacity: 0.8 },
                ]}
              >
                {locked ? (
                  <Image source={UI_ICONS.lock} style={styles.lock} />
                ) : (
                  <Text style={[styles.num, n === unlocked && styles.numCurrent]}>{n}</Text>
                )}
                {done ? (
                  <View style={styles.check}>
                    <Image source={UI_ICONS.check} style={styles.checkIcon} />
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 10 },
  title: { color: colors.text, fontSize: font.title, fontWeight: '800' },
  cellWrap: { flex: 1, height: 96, padding: 7 },
  cell: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.button,
    borderBottomWidth: 4,
    borderBottomColor: colors.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDone: { backgroundColor: '#2E7D5B', borderBottomColor: '#1F5A40' },
  cellCurrent: { backgroundColor: colors.accent, borderBottomColor: colors.accentDark },
  cellLocked: { backgroundColor: 'rgba(0,0,0,0.25)', borderBottomColor: 'rgba(0,0,0,0.3)' },
  num: { color: colors.text, fontSize: 28, fontWeight: '800' },
  numCurrent: { color: '#3A2A08' },
  lock: { width: 26, height: 26, opacity: 0.6 },
  check: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2FA866',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkIcon: { width: 14, height: 14 },
});
