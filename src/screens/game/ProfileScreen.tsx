import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

/** Profilo in-game: il tuo andamento in questa partita. */
export function ProfileScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const mine = useMemo(
    () => events.filter((e) => e.gameId === game?.id && e.playerId === ME.id),
    [events, game?.id],
  );
  if (!game) return null;

  const bonus = mine.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0);
  const malus = mine.filter((e) => e.points < 0).reduce((s, e) => s + e.points, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <RubberHoseMascot size={120} color={ME.color} pose="cheer" />
        <AppText variant="title">{ME.name}</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          {ME.handle} · in {game.name}
        </AppText>
      </View>
      <View style={styles.stats}>
        <Stat label="Bonus" value={`+${bonus}`} color={colors.bonus} />
        <Stat label="Malus" value={`${malus}`} color={colors.malus} />
        <Stat label="Totale" value={`${bonus + malus}`} color={colors.ink} />
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.inkMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: space.xxl,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  hero: { alignItems: 'center', gap: space.xs, paddingTop: space.md },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    gap: 2,
    ...shadow.card,
  },
});
