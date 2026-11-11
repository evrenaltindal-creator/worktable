import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundIconButton } from '../components/Buttons';
import { SimpleTile } from '../components/SimpleTile';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { MODES, ModeId, todayKey } from '../modes';
import { Progress } from '../storage';
import { colors, font } from '../theme';

interface Props {
  progress: Progress;
  onPick: (mode: ModeId) => void;
  onBack: () => void;
}

/** Tüm oyunlar: her mod büyük, renkli bir kart. */
export function ModesScreen({ progress, onPick, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 3 : 2;

  const status = (id: ModeId) => {
    if (id === 'classic') return t.level(progress.unlocked);
    if (id === 'daily') return progress.daily[todayKey()] ? mt().done : mt().newPuzzle;
    return t.level(progress.modes[id]?.level ?? 1);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <RoundIconButton icon="back" label={t.back} onPress={onBack} />
        <Text style={styles.title} accessibilityRole="header">
          {mt().allGames}
        </Text>
        <View style={{ width: 52 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 20 }]}>
        {MODES.map((m) => {
          const text = mt().modes[m.id];
          const done = m.id === 'daily' && !!progress.daily[todayKey()];
          return (
            <View key={m.id} style={{ width: `${100 / columns}%`, padding: 6 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${text.name}. ${text.desc} ${status(m.id)}`}
                onPress={() => onPick(m.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: m.color, borderBottomColor: m.edge },
                  pressed && { opacity: 0.85, transform: [{ translateY: 2 }] },
                ]}
              >
                <View style={styles.icons}>
                  <View style={{ transform: [{ rotate: '-8deg' }] }}>
                    <SimpleTile face={m.icons[0]} faceW={34} />
                  </View>
                  <View style={{ transform: [{ rotate: '7deg' }], marginLeft: -8 }}>
                    <SimpleTile face={m.icons[1]} faceW={34} />
                  </View>
                </View>
                <Text style={styles.name} numberOfLines={2}>
                  {text.name}
                </Text>
                <Text lineBreakStrategyIOS="hangul-word" style={styles.desc}>
                  {text.desc}
                </Text>
                <View style={[styles.chip, done && styles.chipDone]}>
                  <Text style={[styles.chipText, done && styles.chipTextDone]} numberOfLines={1}>
                    {status(m.id)}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 6 },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  card: {
    flex: 1,
    minHeight: 200,
    borderRadius: 20,
    borderBottomWidth: 5,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  icons: { flexDirection: 'row', marginBottom: 2 },
  name: { color: '#FFFFFF', fontSize: font.normal, fontWeight: '900', textAlign: 'center' },
  desc: { color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 20, textAlign: 'center', flexGrow: 1 },
  chip: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  chipDone: { backgroundColor: '#FFE066' },
  chipText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  chipTextDone: { color: '#3A2A08' },
});
