/**
 * Huzur: Bulmaca Koleksiyonu
 * Ana menüde oyunlar listelenir; her oyun kendi ekranları, ayarları ve kayıtlarıyla açılır.
 * Bir oyun içinden başka bir oyun açılabilir (Mahjong -> Küp); çıkınca öncekine dönülür.
 */
import { StatusBar } from 'expo-status-bar';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Image, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import BubblesGame from './src/games/bubbles/Game';
import ColorpopGame from './src/games/colorpop/Game';
import CubeGame from './src/games/cube/Game';
import JewelsGame from './src/games/jewels/Game';
import JigsawGame from './src/games/jigsaw/Game';
import MahjongGame from './src/games/mahjong/Game';
import MinesGame from './src/games/mines/Game';
import { SceneBackground } from './src/games/mines/src/kit/components/SceneBackground';
import { deviceLanguage } from './src/games/mines/src/kit/i18n';
import { THEMES } from './src/games/mines/src/kit/themes';
import SudokuGame from './src/games/sudoku/Game';
import WordsGame from './src/games/words/Game';
import { CATALOG, HUB_TEXT } from './src/hub/catalog';
import { GameId, Hub, HubContext } from './src/hub/HubContext';

const GAMES: Record<GameId, ComponentType> = {
  mahjong: MahjongGame,
  sudoku: SudokuGame,
  mines: MinesGame,
  bubbles: BubblesGame,
  jewels: JewelsGame,
  colorpop: ColorpopGame,
  jigsaw: JigsawGame,
  words: WordsGame,
  cube: CubeGame,
};

const PRIVACY_URL = 'https://evrenaltindal-creator.github.io/vardiox-legal/huzur-mahjong/gizlilik.html';
const PRIVACY_TEXT = {
  tr: { label: 'Gizlilik Politikası', error: 'Bağlantı açılamadı. Lütfen daha sonra tekrar deneyin.' },
  en: { label: 'Privacy Policy', error: 'The link could not be opened. Please try again later.' },
  pt: { label: 'Política de Privacidade', error: 'Não foi possível abrir o link. Tente novamente mais tarde.' },
  de: { label: 'Datenschutzerklärung', error: 'Der Link konnte nicht geöffnet werden. Bitte versuche es später erneut.' },
  fr: { label: 'Politique de confidentialité', error: 'Impossible d’ouvrir le lien. Veuillez réessayer plus tard.' },
  ja: { label: 'プライバシーポリシー', error: 'リンクを開けませんでした。しばらくしてからもう一度お試しください。' },
  ko: { label: '개인정보 처리방침', error: '링크를 열 수 없습니다. 나중에 다시 시도해 주세요.' },
};

export default function App() {
  /** Açık oyunlar: en sondaki görünür, altındakiler durumlarını korur */
  const [stack, setStack] = useState<GameId[]>([]);
  /** Her açık oyun kendi ana sayfasında mı */
  const [atHome, setAtHome] = useState<Partial<Record<GameId, boolean>>>({});

  const open = useCallback((id: GameId) => setStack((s) => (s.includes(id) ? s : [...s, id])), []);
  const exit = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  /** Her oyuna kendi bağlantısı: "ana sayfadayım" bilgisi oyuna göre tutulur */
  const hubs = useMemo(() => {
    const make = (id: GameId): Hub => ({
      exit,
      open,
      setAtHome: (v: boolean) => setAtHome((old) => (old[id] === v ? old : { ...old, [id]: v })),
    });
    return Object.fromEntries((Object.keys(GAMES) as GameId[]).map((id) => [id, make(id)])) as Record<GameId, Hub>;
  }, [exit, open]);

  // Android geri tuşu ana menüde uygulamadan çıkar; oyunlar kendi geri tuşunu yönetir
  useEffect(() => {
    if (stack.length) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => false);
    return () => sub.remove();
  }, [stack.length]);

  const top = stack[stack.length - 1];

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stack.length === 0 ? <Menu onOpen={open} /> : null}
      {stack.map((id) => {
        const Game = GAMES[id];
        const visible = id === top;
        return (
          <View key={id} style={[StyleSheet.absoluteFill, !visible && styles.hidden]} pointerEvents={visible ? 'auto' : 'none'}>
            <HubContext.Provider value={hubs[id]}>
              <Game />
            </HubContext.Provider>
          </View>
        );
      })}
      {top && atHome[top] ? <BackToMenu under={stack[stack.length - 2]} onPress={exit} /> : null}
    </SafeAreaProvider>
  );
}

function Menu({ onOpen }: { onOpen: (id: GameId) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const lang = deviceLanguage();
  const text = HUB_TEXT[lang];
  // iPad'de 8 oyun iki düzgün sıra olsun
  const columns = width >= 900 ? 4 : width >= 700 ? 3 : 2;

  return (
    <View style={styles.root}>
      <SceneBackground theme={THEMES[3]} />
      <ScrollView contentContainerStyle={[styles.menu, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Image source={require('./assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.title} accessibilityRole="header">
          {text.title}
        </Text>
        <Text style={styles.tagline}>{text.tagline}</Text>
        <View style={styles.grid}>
          {CATALOG.map((g) => (
            <View key={g.id} style={{ width: `${100 / columns}%`, padding: 7 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${g.name[lang]}. ${g.desc[lang]}`}
                onPress={() => onOpen(g.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: g.color, borderBottomColor: g.edge },
                  pressed && { opacity: 0.88, transform: [{ translateY: 2 }] },
                ]}
              >
                <Image source={g.icon} style={styles.icon} />
                <Text lineBreakStrategyIOS="hangul-word" style={styles.name} numberOfLines={2}>
                  {g.name[lang]}
                </Text>
                <Text lineBreakStrategyIOS="hangul-word" style={styles.desc} numberOfLines={2}>
                  {g.desc[lang]}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            void Linking.openURL(`${PRIVACY_URL}#${lang}`).catch(() => {
              Alert.alert(PRIVACY_TEXT[lang].label, PRIVACY_TEXT[lang].error);
            });
          }}
          style={styles.privacyLink}
        >
          <Text style={styles.privacyText}>{PRIVACY_TEXT[lang].label}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/** Oyunun ana sayfasında sol üstte: koleksiyona (ya da oyunu açan oyuna) dönüş */
function BackToMenu({ under, onPress }: { under?: GameId; onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const lang = deviceLanguage();
  const parent = under ? CATALOG.find((g) => g.id === under) : undefined;
  const label = parent ? parent.name[lang] : HUB_TEXT[lang].games;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.back, { top: insets.top + 8 }, pressed && { opacity: 0.8 }]}
    >
      <Image source={require('./src/games/mines/assets/ui/grid.png')} style={styles.backIcon} />
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

const shadow = { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 };

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
  menu: { alignItems: 'center', paddingHorizontal: 12 },
  logo: { width: 120, height: 120 },
  title: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', textAlign: 'center', ...shadow },
  tagline: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 18, ...shadow },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', maxWidth: 960 },
  card: {
    flex: 1,
    minHeight: 190,
    borderRadius: 22,
    borderBottomWidth: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: { width: 84, height: 84, borderRadius: 20 },
  name: { color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '900', textAlign: 'center' },
  desc: { color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 20, textAlign: 'center' },
  back: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backIcon: { width: 24, height: 24, tintColor: '#FFFFFF' },
  backText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  privacyLink: { minHeight: 48, padding: 14, justifyContent: 'center', marginTop: 12 },
  privacyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textDecorationLine: 'underline' },
});
