import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';

interface Props {
  visible: boolean;
  title: string;
  children?: ReactNode;
  /** Her zaman görünen alt kısım (kaydırmayla kaybolmaz): düğmeler için */
  footer?: ReactNode;
  /** Kutunun üstünde süzülen süs (ör. konfeti); dokunmaları engellemez */
  decoration?: ReactNode;
  onRequestClose?: () => void;
}

/** Ekranın ortasında açılan büyük bilgi kutusu. */
export function Overlay({ visible, title, children, footer, decoration, onRequestClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onRequestClose} accessible={false}>
        <Pressable style={styles.card} onPress={() => {}} accessible={false}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} bounces={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Pressable>
        {/* Modal'ın tek çocuğu olmalı (web'de yerleşim bozulmasın): süs arka planın içinde */}
        {decoration ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
            {decoration}
          </View>
        ) : null}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#14504C',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: { color: colors.text, fontSize: font.title, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  content: { gap: 14 },
  footer: { gap: 14, marginTop: 16 },
  clip: { overflow: 'hidden' },
});
