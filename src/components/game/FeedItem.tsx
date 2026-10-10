import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Avatar } from '@/components/ui/Avatar';
import { ruleById } from '@/data/rules';
import { timeAgo } from '@/lib/time';
import { nameIn, useGame } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

interface Props {
  event: FeedEvent;
  player?: Player;
  author?: Player;
  now: number;
  onOpenPlayer: (playerId: string) => void;
}

/** "Feed card" chiusa del Figma: avatar, nome, carta, punti. Sotto, chi l'ha chiamata e quando. */
export function FeedItem({ event, player, author, now, onOpenPlayer }: Props) {
  const rule = ruleById(event.ruleId);
  const game = useGame(event.gameId);
  const isBonus = event.points > 0;
  if (!player) return null;

  return (
    <View style={styles.card}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Profilo di ${player.name}`}
        onPress={() => onOpenPlayer(player.id)}
        hitSlop={6}>
        <Avatar player={player} size={40} sticker={false} />
      </PressableScale>
      <View style={styles.body}>
        <AppText variant="name" onPress={() => onOpenPlayer(player.id)}>
          {nameIn(game, player)}
        </AppText>
        <AppText variant="body" color={colors.inkMuted} numberOfLines={1}>
          {rule ? `${rule.emoji} ${rule.label}` : 'Azione'}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText variant="name" color={isBonus ? colors.bonus : colors.malus}>
          {isBonus ? `+${event.points}` : event.points}
          {event.double ? (
            <AppText variant="micro" color={colors.bonus}>
              {' '}
              ×2
            </AppText>
          ) : null}
        </AppText>
        <AppText variant="micro" color={colors.inkFaint} style={styles.meta}>
          {author ? `da ${nameIn(game, author)}, ` : ''}
          {timeAgo(event.createdAt, now)}
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
