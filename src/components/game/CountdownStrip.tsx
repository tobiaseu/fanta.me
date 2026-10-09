import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

const pad = (n: number) => String(n).padStart(2, '0');

/** Countdown del Figma: quattro tessere (giorni/ore/min/sec) su fondo verde. Maratona → settimane. */
export function CountdownStrip({ game, now }: { game: Game; now: number }) {
  if (game.mode === 'marathon') {
    const week = game.week ?? { current: 1, total: 1 };
    return (
      <View style={styles.strip}>
        <View style={[styles.tile, styles.wide]}>
          <AppText variant="number">
            {pad(week.current)}
            <AppText variant="headline" color={colors.inkSoft}>
              {' '}
              / {pad(week.total)}
            </AppText>
          </AppText>
          <AppText variant="caption" color={colors.inkSoft}>
            settimane
          </AppText>
        </View>
        <View style={styles.weeks}>
          {Array.from({ length: week.total }, (_, i) => (
            <View key={i} style={[styles.week, i < week.current && styles.weekDone]} />
          ))}
        </View>
      </View>
    );
  }

  const total = Math.max(0, Math.floor((new Date(game.endsAt ?? now).getTime() - now) / 1000));
  const parts = [
    { value: Math.floor(total / 86_400), label: 'giorni' },
    { value: Math.floor((total % 86_400) / 3600), label: 'ore' },
    { value: Math.floor((total % 3600) / 60), label: 'min' },
    { value: total % 60, label: 'sec' },
  ];

  return (
    <View style={styles.strip} accessibilityLabel={`Fine sprint tra ${parts.map((p) => `${p.value} ${p.label}`).join(', ')}`}>
      {parts.map((p) => (
        <View key={p.label} style={styles.tile}>
          <AppText variant="number" color={colors.inkSoft}>
            {pad(p.value)}
          </AppText>
          <AppText variant="caption" color={colors.inkSoft}>
            {p.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.liveSoft,
    alignItems: 'center',
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.xs,
    borderRadius: radius.md + 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  wide: { flex: 0, paddingHorizontal: space.lg },
  weeks: { flex: 1, flexDirection: 'row', gap: 4, paddingHorizontal: space.xs },
  week: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)' },
  weekDone: { backgroundColor: colors.live },
});
