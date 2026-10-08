import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { ruleById } from '@/data/rules';
import { timeAgo } from '@/lib/time';
import { colors, radius, shadow, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

interface Props {
  event: FeedEvent;
  player?: Player;
  author?: Player;
  now: number;
}

/** Riga del Feed live: cronaca sportiva di un'assegnazione punti. */
export function FeedItem({ event, player, author, now }: Props) {
  const rule = ruleById(event.ruleId);
  const isBonus = event.points > 0;
  if (!player) return null;

  return (
    <View style={styles.card}>
      <Avatar player={player} size={44} />
      <View style={styles.body}>
        <AppText variant="body">
          <AppText variant="headline">{player.name}</AppText> · {rule?.label ?? 'Azione'}
        </AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          {timeAgo(event.createdAt, now)} · segnalato da {author?.name ?? '—'}
        </AppText>
      </View>
      <View style={[styles.points, { backgroundColor: isBonus ? colors.bonusSoft : colors.malusSoft }]}>
        <AppText variant="headline" color={isBonus ? colors.bonus : colors.malus}>
          {isBonus ? `+${event.points}` : event.points}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.card,
  },
  body: { flex: 1, gap: 2 },
  points: { paddingHorizontal: space.sm, paddingVertical: space.xxs + 2, borderRadius: radius.pill },
});
