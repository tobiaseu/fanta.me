import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { PowerCard } from '@/components/powers/PowerCard';
import { PowerSheet } from '@/components/powers/PowerSheet';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById } from '@/data/rules';
import { useGameStore } from '@/store/useGameStore';
import { space } from '@/theme/tokens';

type Slot = 'main' | 'secondary';

/** Nel profilo: i due fantapoteri scelti, come carte-potere (cornice oro, argento, ghiaccio o olografica). Tocca per leggerli, "Cambia" per sceglierli. */
export function MyPowersRow() {
  const router = useRouter();
  const mine = useGameStore((s) => s.powers[ME.id]);
  const [open, setOpen] = useState<{ slot: Slot; from?: CardRect }>();
  const openPower = powerById(open ? mine?.[open.slot] : undefined);
  return (
    <View style={styles.section}>
      <SectionHeader
        title="I tuoi fantapoteri"
        caption="Li porti in ogni partita."
        action={{ label: 'Cambia', onPress: () => router.push('/powers') }}
      />
      <View style={styles.row}>
        {(['main', 'secondary'] as const).map((slot) => {
          const p = powerById(mine?.[slot]);
          return p ? (
            <PowerCard
              key={slot}
              power={p}
              role={slot}
              state={p.hours > 0 ? `${p.hours} ${p.hours === 1 ? 'ora' : 'ore'}` : 'Immediato'}
              onOpen={(from) => setOpen({ slot, from })}
            />
          ) : null;
        })}
      </View>
      <PowerSheet
        power={openPower}
        role={open?.slot}
        from={open?.from}
        secondary={{ label: 'Cambia potere', onPress: () => router.push('/powers') }}
        onClose={() => setOpen(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.xs },
});
