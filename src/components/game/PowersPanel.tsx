import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { PowerCard } from '@/components/powers/PowerCard';
import { PowerSheet } from '@/components/powers/PowerSheet';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { formatHoursLeft } from '@/lib/time';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { space } from '@/theme/tokens';
import type { Game } from '@/types/game';

type Slot = 'main' | 'secondary';

/** I miei due fantapoteri nella partita: attivabili una volta, con il tempo che resta. */
export function PowersPanel({ game, now }: { game: Game; now: number }) {
  const router = useRouter();
  const mine = useGameStore((s) => s.powers[ME.id]);
  const activations = useGameStore((s) => s.activations);
  const activatePower = useGameStore((s) => s.activatePower);
  const showToast = useUiStore((s) => s.showToast);
  const live = game.status === 'live';
  const [open, setOpen] = useState<{ slot: Slot; from?: CardRect }>();

  const info = (slot: Slot) => {
    const p = powerById(mine?.[slot]);
    if (!p) return undefined;
    const used = activations.find((a) => a.gameId === game.id && a.playerId === ME.id && a.slot === slot);
    const left = used ? new Date(used.until).getTime() - now : 0;
    const locked = !!p.premium && !game.premium;
    const activeNow = !!used && left > 60_000;
    const state = locked
      ? 'Solo stanze Premium'
      : used
        ? left > 60_000 && p.hours > 0
          ? `Attivo, ancora ${formatHoursLeft(left)}`
          : 'Usato'
        : live
          ? 'Pronto'
          : 'Da attivare in partita';
    return { p, locked, used, activeNow, state, canUse: live && !used && !locked };
  };
  const activate = (slot: Slot) => {
    const i = info(slot);
    if (!i) return;
    haptics.bonus();
    if (activatePower(game.id, slot)) showToast({ text: `${i.p.emoji} ${i.p.label} attivato. ${i.p.description}` });
  };
  const openInfo = open && info(open.slot);

  return (
    <View style={styles.section}>
      <SectionHeader
        title="I tuoi fantapoteri"
        caption={
          live ? 'Uno per slot, una volta a partita. Scegli bene il momento.' : 'Li attivi quando parte la partita.'
        }
        action={{ label: 'Cambia', onPress: () => router.push('/powers') }}
      />
      <View style={styles.row}>
        {(['main', 'secondary'] as const).map((slot) => {
          const i = info(slot);
          if (!i) return null;
          return (
            <PowerCard
              key={slot}
              power={i.p}
              role={slot}
              active={i.activeNow}
              spent={i.locked || (!!i.used && !i.activeNow)}
              state={i.state}
              cta={
                i.canUse
                  ? { label: 'Attiva', tone: slot === 'main' ? 'primary' : 'plain', onPress: () => activate(slot) }
                  : undefined
              }
              onOpen={(from) => setOpen({ slot, from })}
            />
          );
        })}
      </View>
      <PowerSheet
        power={openInfo?.p}
        role={open?.slot}
        from={open?.from}
        note={openInfo && !openInfo.canUse ? openInfo.state : undefined}
        primary={openInfo?.canUse && open ? { label: 'Attiva', onPress: () => activate(open.slot) } : undefined}
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
