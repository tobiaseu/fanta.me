import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { POWER_UPS, powerById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

const SLOTS = [
  { id: 'main', label: 'Principale' },
  { id: 'secondary', label: 'Secondario' },
] as const;

/** I tuoi fantapoteri: uno principale e uno secondario, che porti in ogni partita. */
export function PowersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mine = useGameStore((s) => s.powers[ME.id]);
  const setPower = useGameStore((s) => s.setPower);
  const showToast = useUiStore((s) => s.showToast);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.head}>
        <AppText variant="serifHeading">I tuoi fantapoteri</AppText>
        <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
        </PressableScale>
      </View>
      <AppText variant="body" color={colors.inkSoft}>
        Li porti in ogni stanza e li attivi dalla Dashboard, una volta a partita. Il principale è quello su cui punti.
      </AppText>

      <View style={styles.slots}>
        {SLOTS.map((slot) => {
          const p = powerById(mine?.[slot.id]);
          return (
            <View key={slot.id} style={[styles.slot, slot.id === 'main' && styles.slotMain]}>
              <AppText variant="micro" color={colors.inkSoft}>
                {slot.label}
              </AppText>
              <AppText style={styles.slotEmoji}>{p?.emoji}</AppText>
              <AppText variant="name">{p?.label}</AppText>
            </View>
          );
        })}
      </View>

      <View style={styles.list}>
        {POWER_UPS.map((p, i) => (
          <View key={p.id} style={[styles.row, i > 0 && styles.rowDivider]}>
            <AppText style={styles.emoji}>{p.emoji}</AppText>
            <View style={styles.flex}>
              <View style={styles.titleRow}>
                <AppText variant="name">{p.label}</AppText>
                {p.premium && (
                  <View style={styles.badge}>
                    <AppText variant="micro" color={colors.inkInverse}>
                      👑 Premium
                    </AppText>
                  </View>
                )}
              </View>
              <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                {p.description}
              </AppText>
              <View style={styles.actions}>
                {SLOTS.map((slot) => {
                  const on = mine?.[slot.id] === p.id;
                  return (
                    <PressableScale
                      key={slot.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${p.label} come ${slot.label.toLowerCase()}`}
                      onPress={() => {
                        if (on) return;
                        haptics.tap();
                        setPower(slot.id, p.id);
                        showToast({
                          text: `${p.emoji} ${p.label} è il tuo ${slot.label.toLowerCase()}${p.premium ? ' (solo stanze Premium)' : ''}`,
                        });
                      }}
                      style={[styles.chip, on && styles.chipOn]}>
                      {on && <Icon name="check" size={12} strokeWidth={3} />}
                      <AppText variant="micro">{slot.label}</AppText>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: layout.gutter,
    paddingTop: layout.section,
    gap: space.md,
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
  slots: { flexDirection: 'row', gap: space.sm },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotMain: { borderColor: colors.cta },
  slotEmoji: { fontSize: 40, lineHeight: 48 },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: space.sm, padding: layout.card },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  emoji: { fontSize: 30, lineHeight: 36 },
  flex: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  badge: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: 2 },
  regular: { fontWeight: '400' },
  actions: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
  },
  chipOn: { backgroundColor: colors.cta, borderColor: colors.cta },
});
