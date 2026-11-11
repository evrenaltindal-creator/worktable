import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { c } from '../i18n';
import { colors, font } from '../theme';
import { BigButton, RoundIconButton } from './Buttons';
import { Confetti, StarRow } from './Effects';
import { RulesList } from './Home';
import { Overlay } from './Overlay';

interface Props {
  title: string;
  /** Başlığın altındaki küçük bilgi (ör. "Seviye 3 · 1:20") */
  info: string;
  rules: string[];
  onHome: () => void;
  onRestart: () => void;
  /** Kazanınca yıldız (1-3); null = oyun sürüyor */
  wonStars: number | null;
  wonLines?: string[];
  reward?: boolean;
  onNext?: () => void;
  lost: { title: string; body: string } | null;
  toast?: { text: string; id: number } | null;
  children: ReactNode;
  footer?: ReactNode;
}

/** Tüm Huzur oyunlarının oyun ekranı çerçevesi: üst çubuk, kurallar, onaylı yeniden başlatma, kazan/kaybet. */
export function GameFrame(props: Props) {
  const { title, info, rules, onHome, onRestart, wonStars, wonLines = [], reward, onNext, lost, toast, children, footer } = props;
  const insets = useSafeAreaInsets();
  const [showRules, setShowRules] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [hiddenToast, setHiddenToast] = useState(0);
  const won = wonStars !== null;

  useEffect(() => {
    if (!won) return;
    const id = setTimeout(() => setShowWin(true), 900);
    return () => {
      clearTimeout(id);
      setShowWin(false);
    };
  }, [won]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setHiddenToast(toast.id), 2700);
    return () => clearTimeout(id);
  }, [toast]);
  const visibleToast = toast && toast.id !== hiddenToast ? toast : null;

  const restart = () => {
    setConfirm(false);
    onRestart();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="home" label={c.home} onPress={onHome} />
        <View style={styles.hud}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.info} numberOfLines={1}>
            {info}
          </Text>
        </View>
        <View style={styles.right}>
          <RoundIconButton icon="help" label={c.howToPlay} onPress={() => setShowRules(true)} />
          <RoundIconButton icon="restart" label={c.restart} onPress={() => (won || lost ? restart() : setConfirm(true))} />
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
        title={c.howToPlay}
        onRequestClose={() => setShowRules(false)}
        footer={<BigButton variant="primary" label={c.close} onPress={() => setShowRules(false)} />}
      >
        <RulesList rules={rules} />
      </Overlay>

      <Overlay
        visible={confirm}
        title={c.restartTitle}
        onRequestClose={() => setConfirm(false)}
        footer={
          <>
            <BigButton variant="primary" icon="restart" label={c.restartYes} onPress={restart} />
            <BigButton label={c.cancel} onPress={() => setConfirm(false)} />
          </>
        }
      >
        <Text style={styles.body}>{c.restartBody}</Text>
      </Overlay>

      <Overlay
        visible={showWin}
        title={c.winTitle}
        decoration={showWin ? <Confetti /> : null}
        footer={
          <>
            {onNext ? <BigButton variant="primary" icon="play" label={c.next} onPress={onNext} /> : null}
            <BigButton icon="home" label={c.home} onPress={onHome} />
          </>
        }
      >
        <StarRow stars={wonStars ?? 0} size={54} />
        {wonLines.map((l, i) => (
          <Text key={i} lineBreakStrategyIOS="hangul-word" style={i === 0 ? styles.body : styles.bodySoft}>
            {l}
          </Text>
        ))}
        {reward ? <Text style={styles.reward}>{c.reward}</Text> : null}
      </Overlay>

      <Overlay
        visible={!!lost}
        title={lost?.title ?? ''}
        footer={
          <>
            <BigButton variant="primary" icon="restart" label={c.tryAgain} onPress={restart} />
            <BigButton icon="home" label={c.home} onPress={onHome} />
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

const shadowText = { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 };

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  hud: { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.28)' },
  title: { color: colors.text, fontSize: font.normal, fontWeight: '900', ...shadowText },
  info: { color: '#FFE066', fontSize: font.small, fontWeight: '800', fontVariant: ['tabular-nums'], ...shadowText },
  right: { flexDirection: 'row', gap: 6 },
  content: { flex: 1 },
  body: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 28 },
  bodySoft: { color: colors.textSoft, fontSize: font.small, textAlign: 'center' },
  reward: {
    alignSelf: 'center',
    color: '#3A2A08',
    backgroundColor: colors.accent,
    fontSize: font.small,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 12, backgroundColor: 'rgba(20,20,30,0.85)', borderRadius: 14, padding: 14 },
  toastText: { color: colors.text, fontSize: font.normal, textAlign: 'center', lineHeight: 26 },
});
