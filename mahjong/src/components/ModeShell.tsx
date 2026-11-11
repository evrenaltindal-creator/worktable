import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { mt } from '../i18nModes';
import { colors, font } from '../theme';
import { BigButton, RoundIconButton } from './Buttons';
import { Confetti, StarRow } from './Effects';
import { Overlay } from './Overlay';

interface Props {
  title: string;
  /** Başlığın altındaki küçük bilgi (ör. "Seviye 3 · 12 hamle") */
  info: string;
  /** "Nasıl oynanır?" penceresindeki kurallar */
  rules: string[];
  onHome: () => void;
  onRestart: () => void;
  onGames: () => void;
  /** Varsa "Sonraki seviye" düğmesi görünür */
  onNext?: () => void;
  /** Kazanınca yıldız sayısı (1-3); null = oyun sürüyor */
  wonStars: number | null;
  wonText?: string;
  lost: { title: string; body: string } | null;
  /** Kısa bilgi mesajı (birkaç saniye görünür) */
  toast?: { text: string; id: number } | null;
  children: ReactNode;
  footer?: ReactNode;
}

/** Yeni oyun modlarının ortak çerçevesi: üst çubuk, kurallar, kazanma/kaybetme pencereleri. */
export function ModeShell(props: Props) {
  const { title, info, rules, onHome, onRestart, onGames, onNext, wonStars, wonText, lost, toast, children, footer } = props;
  const insets = useSafeAreaInsets();
  const [showRules, setShowRules] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [hiddenToastId, setHiddenToastId] = useState(0);
  const won = wonStars !== null;

  // Son hamlenin efekti görünsün, sonra kutlama (oyun yeniden başlayınca kapanır)
  useEffect(() => {
    if (!won) return;
    const id = setTimeout(() => setShowWin(true), 900);
    return () => {
      clearTimeout(id);
      setShowWin(false);
    };
  }, [won]);

  // Bilgi mesajı birkaç saniye sonra kaybolur
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setHiddenToastId(toast.id), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  const visibleToast = toast && toast.id !== hiddenToastId ? toast : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="home" label={t.home} onPress={onHome} />
        <View style={styles.hud}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.info} numberOfLines={1}>
            {info}
          </Text>
        </View>
        <View style={styles.rightButtons}>
          <RoundIconButton icon="help" label={t.howToPlay} onPress={() => setShowRules(true)} />
          <RoundIconButton icon="restart" label={t.restart} onPress={onRestart} />
        </View>
      </View>

      <View style={styles.content}>
        {children}
        {visibleToast ? (
          <View key={visibleToast.id} style={styles.toast} pointerEvents="none">
            <Text lineBreakStrategyIOS="hangul-word" style={styles.toastText}>
              {visibleToast.text}
            </Text>
          </View>
        ) : null}
      </View>
      {footer}

      <Overlay
        visible={showRules}
        title={title}
        onRequestClose={() => setShowRules(false)}
        footer={<BigButton variant="primary" label={t.close} onPress={() => setShowRules(false)} />}
      >
        {rules.map((r, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={styles.ruleNum}>{i + 1}</Text>
            <Text lineBreakStrategyIOS="hangul-word" style={styles.ruleText}>
              {r}
            </Text>
          </View>
        ))}
      </Overlay>

      <Overlay
        visible={showWin}
        title={t.winTitle}
        decoration={showWin ? <Confetti /> : null}
        footer={
          <>
            {onNext ? <BigButton variant="primary" icon="play" label={t.nextLevel} onPress={onNext} /> : null}
            <BigButton icon="games" label={mt().allGames} onPress={onGames} />
          </>
        }
      >
        <StarRow stars={wonStars ?? 0} size={54} />
        {wonText ? (
          <Text lineBreakStrategyIOS="hangul-word" style={styles.body}>
            {wonText}
          </Text>
        ) : null}
      </Overlay>

      <Overlay
        visible={!!lost}
        title={lost?.title ?? ''}
        footer={
          <>
            <BigButton variant="primary" icon="restart" label={mt().tryAgain} onPress={onRestart} />
            <BigButton icon="games" label={mt().allGames} onPress={onGames} />
          </>
        }
      >
        <Text lineBreakStrategyIOS="hangul-word" style={styles.body}>
          {lost?.body}
        </Text>
      </Overlay>
    </View>
  );
}

const shadowText = {
  textShadowColor: 'rgba(0,0,0,0.55)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  hud: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  title: { color: colors.text, fontSize: font.normal, fontWeight: '900', ...shadowText },
  info: { color: '#FFE066', fontSize: font.small, fontWeight: '800', marginTop: 1, ...shadowText },
  rightButtons: { flexDirection: 'row', gap: 6 },
  content: { flex: 1 },
  body: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 28 },
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
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    backgroundColor: 'rgba(20,20,30,0.85)',
    borderRadius: 14,
    padding: 14,
  },
  toastText: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 26 },
});
