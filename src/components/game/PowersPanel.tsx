import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { formatHoursLeft } from '@/lib/time';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** I miei due fantapoteri nella partita: attivabili una volta, con il tempo che resta. */
export function PowersPanel({ game, now }: { game: Game; now: number }) {
  const router = useRouter();
  const mine = useGameStore((s) => s.powers[ME.id]);
  const activations = useGameStore((s) => s.activations);
  const activatePower = useGameStore((s) => s.activatePower);
  const showToast = useUiStore((s) => s.showToast);
  const live = game.status === 'live';

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
          const p = powerById(mine?.[slot]);
          if (!p) return null;
          const used = activations.find((a) => a.gameId === game.id && a.playerId === ME.id && a.slot === slot);
          const left = used ? new Date(used.until).getTime() - now : 0;
          const locked = p.premium && !game.premium;
          const state = locked
            ? 'Solo stanze Premium'
            : used
              ? left > 60_000 && p.hours > 0
                ? `Attivo, ancora ${formatHoursLeft(left)}`
                : 'Usato'
              : live
                ? 'Tocca per attivare'
                : 'Pronto';
          const canUse = live && !used && !locked;
          return (
            <PressableScale
              key={slot}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canUse }}
              accessibilityLabel={`${p.label}: ${p.description} ${state}`}
              disabled={!canUse}
              onPress={() => {
                haptics.bonus();
                if (activatePower(game.id, slot))
                  showToast({ text: `${p.emoji} ${p.label} attivato. ${p.description}` });
              }}
              style={[
                styles.tile,
                slot === 'main' && styles.main,
                used && left > 60_000 && styles.active,
                (locked || (used && left <= 60_000)) && styles.spent,
              ]}>
              <AppText variant="micro" color={colors.inkSoft}>
                {slot === 'main' ? 'PRINCIPALE' : 'SECONDARIO'}
              </AppText>
              <AppText style={styles.emoji}>{p.emoji}</AppText>
              <AppText variant="name">{p.label}</AppText>
              <AppText variant="caption" color={used && left > 60_000 ? colors.live : colors.inkSoft}>
                {state}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    gap: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  main: { borderColor: colors.cta },
  active: { borderColor: colors.live, backgroundColor: 'rgba(11, 130, 0, 0.06)' },
  spent: { opacity: 0.5 },
  emoji: { fontSize: 32, lineHeight: 40, marginVertical: space.xxs },
});
