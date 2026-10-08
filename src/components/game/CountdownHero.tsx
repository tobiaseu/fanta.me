import { StyleSheet, View } from 'react-native';

import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { formatCountdown } from '@/lib/time';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Hero in cima al Feed: countdown (Sprint) o avanzamento settimane (Maratona). */
export function CountdownHero({ game, now }: { game: Game; now: number }) {
  const isSprint = game.mode === 'sprint';
  const week = game.week ?? { current: 1, total: 1 };

  return (
    <View style={[styles.card, { backgroundColor: game.accent }]}>
      <View style={styles.text}>
        <AppText variant="micro" color="rgba(255,255,255,0.85)">
          {isSprint ? 'Sprint · fine tra' : 'Maratona'}
        </AppText>
        <AppText variant="display" color={colors.inkInverse} style={styles.tabular}>
          {isSprint
            ? formatCountdown(new Date(game.endsAt ?? now).getTime() - now)
            : `Settimana ${week.current}/${week.total}`}
        </AppText>
        {!isSprint && (
          <View style={styles.weeks}>
            {Array.from({ length: week.total }, (_, i) => (
              <View key={i} style={[styles.weekDot, i < week.current && styles.weekDone]} />
            ))}
          </View>
        )}
      </View>
      <View style={styles.art}>
        <RubberHoseMascot size={96} color={colors.toonYellow} pose="cheer" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 128,
  },
  text: { flex: 1, gap: space.xs },
  tabular: { fontVariant: ['tabular-nums'] },
  weeks: { flexDirection: 'row', gap: 6, marginTop: space.xxs },
  weekDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  weekDone: { backgroundColor: colors.inkInverse },
  art: { marginRight: -space.md, marginBottom: -space.lg },
});
