import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useSessionStore, type Visibility } from '@/store/useSessionStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

const OPTIONS: { id: Visibility; label: string; note: string }[] = [
  { id: 'private', label: 'Solo tu', note: 'Nessuno vede trofei, scudi e carte' },
  { id: 'friends', label: 'Solo amici', note: 'La vedono i tuoi amici su Fanta.me' },
  { id: 'everyone', label: 'Tutti', note: 'Anche chi gioca con te senza essere amico' },
];

/** Impostazioni: privacy della bacheca e uscita dall'account. */
export function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const visibility = useSessionStore((s) => s.collectionVisibility);
  const setVisibility = useSessionStore((s) => s.setCollectionVisibility);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xl },
      ]}>
      <View style={styles.head}>
        <AppText variant="title">Impostazioni</AppText>
        <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} />
        </PressableScale>
      </View>

      <View style={styles.section}>
        <AppText variant="headline">Chi vede la tua bacheca</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          Trofei, scudi e carte che hai creato. Parte privata, decidi tu quando mostrarla.
        </AppText>
        <View style={styles.card} accessibilityRole="radiogroup">
          {OPTIONS.map((o, i) => {
            const on = o.id === visibility;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tap();
                  setVisibility(o.id);
                }}
                style={[styles.row, i > 0 && styles.divider]}>
                <View style={styles.flex}>
                  <AppText variant="name">{o.label}</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    {o.note}
                  </AppText>
                </View>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.dot} />}</View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label="Esci dall'account"
        variant="secondary"
        onPress={() => {
          useSessionStore.getState().signOut();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/welcome');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: space.sm },
  regular: { fontWeight: '400' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  flex: { flex: 1, gap: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.ink },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
});
