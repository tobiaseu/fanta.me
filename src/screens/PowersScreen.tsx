import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import type { CardRect } from '@/components/cards/PlayCard';
import { PowerCard, PowerGrid } from '@/components/powers/PowerCard';
import { PowerSheet } from '@/components/powers/PowerSheet';
import { ME } from '@/data/mock';
import { POWER_UPS } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';

const SLOTS = [
  { id: 'main', label: 'Principale' },
  { id: 'secondary', label: 'Secondario' },
] as const;

type Slot = 'main' | 'secondary';

/**
 * I tuoi fantapoteri: tutti i poteri come carte-potere (cornice oro, argento, ghiaccio o olografica). Quelli scelti portano il loro ruolo.
 * Tocca un potere: si apre, e da lì lo scegli come principale (giallo, a destra) o secondario (a sinistra).
 */
export function PowersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mine = useGameStore((s) => s.powers[ME.id]);
  const setPower = useGameStore((s) => s.setPower);
  const showToast = useUiStore((s) => s.showToast);
  const [open, setOpen] = useState<{ id: string; from?: CardRect }>();
  const openPower = POWER_UPS.find((p) => p.id === open?.id);
  const roleOf = (id: string): Slot | undefined =>
    mine?.main === id ? 'main' : mine?.secondary === id ? 'secondary' : undefined;

  const choose = (slot: Slot) => {
    if (!openPower) return;
    haptics.tap();
    setPower(slot, openPower.id);
    showToast({
      text: `${openPower.emoji} ${openPower.label} è il tuo ${slot === 'main' ? 'principale' : 'secondario'}${openPower.premium ? ' (solo stanze Premium)' : ''}`,
    });
  };

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
        Ne porti due in ogni partita e li attivi dalla Dashboard, una volta a partita. Il principale è quello su cui
        punti. Tocca un potere per leggerlo e sceglierlo.
      </AppText>

      <PowerGrid>
        {POWER_UPS.map((p) => (
          <PowerCard
            key={p.id}
            power={p}
            role={roleOf(p.id)}
            state={p.premium ? 'Premium' : p.hours > 0 ? `${p.hours} ${p.hours === 1 ? 'ora' : 'ore'}` : 'Immediato'}
            onOpen={(from) => setOpen({ id: p.id, from })}
          />
        ))}
      </PowerGrid>

      <PowerSheet
        power={openPower}
        role={openPower ? roleOf(openPower.id) : undefined}
        from={open?.from}
        primary={{ label: 'Principale', onPress: () => choose('main') }}
        secondary={{ label: 'Secondario', onPress: () => choose('secondary') }}
        onClose={() => setOpen(undefined)}
      />
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
});
