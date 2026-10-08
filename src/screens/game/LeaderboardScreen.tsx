import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

const MEDALS = ['🥇', '🥈', '🥉'];

/** Classifica: podio + lista. Si ricalcola a ogni nuovo evento del feed. */
export function LeaderboardScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const standings = useMemo(
    () => (game ? computeStandings(game, events, players) : []),
    [game, events, players],
  );

  if (!game) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="title">Classifica</AppText>
      <View style={styles.list}>
        {standings.map((row, i) => {
          const isMe = row.player.id === ME.id;
          return (
            <View key={row.player.id} style={[styles.row, i > 0 && styles.rowDivider, isMe && styles.me]}>
              <AppText variant="headline" style={styles.rank}>
                {MEDALS[i] ?? `${i + 1}°`}
              </AppText>
              <Avatar player={row.player} size={40} />
              <AppText variant="headline" style={styles.flex}>
                {row.player.name}
                {isMe ? ' (tu)' : ''}
              </AppText>
              <AppText variant="number" style={styles.points} color={row.points < 0 ? colors.malus : colors.ink}>
                {row.points}
              </AppText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: space.xxl,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.xs,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: colors.hairline },
  me: { backgroundColor: colors.liveSoft },
  rank: { width: 32, textAlign: 'center' },
  flex: { flex: 1 },
  points: { fontSize: 22 },
});
