import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { formatHoursLeft } from '@/lib/time';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';
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
          const activeNow = !!used && left > 60_000;
          return (
            <View key={slot} style={[styles.card, (locked || (used && !activeNow)) && styles.spent]}>
              <PowerArt id={`pw-${slot}`} active={activeNow} />
              <View style={styles.tagRow}>
                <View style={[styles.tag, slot === 'main' && styles.tagMain]}>
                  <AppText variant="micro" color={slot === 'main' ? '#0B0B0D' : '#FFFFFF'} style={styles.bold}>
                    {slot === 'main' ? 'Principale' : 'Secondario'}
                  </AppText>
                </View>
              </View>
              <View style={styles.art}>
                <AppText style={styles.emoji}>{p.emoji}</AppText>
              </View>
              <AppText variant="headline" color="#FFFFFF" style={styles.title} numberOfLines={1}>
                {p.label}
              </AppText>
              <AppText variant="micro" color="rgba(255,255,255,0.75)" numberOfLines={2} style={styles.regular}>
                {p.description}
              </AppText>
              {canUse ? (
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Attiva ${p.label}`}
                  onPress={() => {
                    haptics.bonus();
                    if (activatePower(game.id, slot))
                      showToast({ text: `${p.emoji} ${p.label} attivato. ${p.description}` });
                  }}
                  style={[styles.cta, slot === 'main' ? styles.ctaOn : styles.ctaAlt]}>
                  <AppText variant="micro" color="#0B0B0D" style={styles.bold}>
                    Attiva
                  </AppText>
                </PressableScale>
              ) : (
                <View style={styles.cta}>
                  <AppText
                    variant="micro"
                    color={activeNow ? '#7CE38B' : 'rgba(255,255,255,0.8)'}
                    style={styles.bold}
                    numberOfLines={1}>
                    {state}
                  </AppText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Fondo dei fantapoteri: notte con il bagliore giallo Fanta.me, verde quando il potere è attivo. */
function PowerArt({ id, active }: { id: string; active?: boolean }) {
  const glow = active ? '#34C759' : colors.cta;
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`pg-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#1E1E24" />
          <Stop offset="1" stopColor="#0B0B0D" />
        </LinearGradient>
        <RadialGradient id={`ph-${id}`} cx="50" cy="52" r="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={glow} stopOpacity={0.45} />
          <Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="140" fill={`url(#pg-${id})`} />
      <Circle cx="50" cy="52" r="40" fill={`url(#ph-${id})`} />
      <Circle cx="50" cy="52" r="28" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.4" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  card: { flex: 1, aspectRatio: 63 / 88, borderRadius: radius.lg, overflow: 'hidden', padding: space.sm, gap: 2 },
  spent: { opacity: 0.5 },
  tagRow: { flexDirection: 'row' },
  tag: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
  },
  tagMain: { backgroundColor: colors.cta },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52, lineHeight: 62 },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  cta: {
    marginTop: space.xs,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: space.xs,
  },
  ctaOn: { backgroundColor: colors.cta },
  ctaAlt: { backgroundColor: '#FFFFFF' },
  bold: { fontWeight: '700' },
  regular: { fontWeight: '400', fontSize: 11, lineHeight: 14 },
});
