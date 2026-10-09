import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { ruleById } from '@/data/rules';
import { timeAgo } from '@/lib/time';
import { colors, radius, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

interface Props {
  event: FeedEvent;
  player?: Player;
  author?: Player;
  now: number;
}

/** "Feed card" chiusa del Figma: avatar, nome, carta, punti. Sotto, chi l'ha chiamata e quando. */
export function FeedItem({ event, player, author, now }: Props) {
  const rule = ruleById(event.ruleId);
  const isBonus = event.points > 0;
  if (!player) return null;

  return (
    <View style={styles.card}>
      <Avatar player={player} size={40} sticker={false} />
      <View style={styles.body}>
        <AppText variant="name">{player.name}</AppText>
        <AppText variant="body" color={colors.inkMuted} numberOfLines={1}>
          {rule?.label ?? 'Azione'}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText variant="name" color={isBonus ? colors.bonus : colors.malus}>
          {isBonus ? `+${event.points}` : event.points}
        </AppText>
        <AppText variant="micro" color={colors.inkFaint} style={styles.meta}>
          {timeAgo(event.createdAt, now)} · {author?.name ?? '—'}
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
  },
  body: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  meta: { fontWeight: '500' },
});
