import { Image, StyleSheet, View } from 'react-native';

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
  /** Cronologia: foto grande, ora esatta, chi ha chiamato e i voti */
  detailed?: boolean;
}

const at = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  const hm = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${hm}`;
};

/** "Feed card" chiusa del Figma: avatar, nome, carta, punti. Sotto, chi l'ha chiamata e quando. */
export function FeedItem({ event, player, author, now, onOpenPlayer, detailed }: Props) {
  const rule = ruleById(event.ruleId);
  const game = useGame(event.gameId);
  const isBonus = event.points > 0;
  if (!player) return null;

  if (detailed) {
    const status =
      event.status === 'confirmed' ? 'Confermata' : event.status === 'rejected' ? 'Scartata' : 'In votazione';
    return (
      <View style={[styles.detail, event.status === 'rejected' && styles.rejected]}>
        {event.photo ? <Image source={{ uri: event.photo }} style={styles.photo} resizeMode="cover" /> : null}
        <View style={styles.detailBody}>
          <View style={styles.row}>
            <Avatar player={player} size={36} sticker={false} />
            <View style={styles.body}>
              <AppText variant="name" onPress={() => onOpenPlayer(player.id)}>
                {nameIn(game, player)}
              </AppText>
              <AppText variant="body" color={colors.inkMuted} numberOfLines={1}>
                {rule ? `${rule.emoji} ${rule.label}` : 'Azione'}
              </AppText>
            </View>
            <AppText variant="name" color={isBonus ? colors.bonus : colors.malus}>
              {isBonus ? `+${event.points}` : event.points}
              {event.double ? '  ×2' : ''}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            {at(event.createdAt)}. Chiamata da {author ? nameIn(game, author) : '—'}. {status}, {event.votes.confirm}{' '}
            {event.votes.confirm === 1 ? 'conferma' : 'conferme'}
            {event.votes.reject ? ` e ${event.votes.reject} no` : ''}.
          </AppText>
          {event.review ? (
            <AppText variant="caption" style={styles.regular}>
              “{event.review}”
            </AppText>
          ) : null}
        </View>
      </View>
    );
  }

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
      {event.photo ? <Image source={{ uri: event.photo }} style={styles.thumb} resizeMode="cover" /> : null}
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
  thumb: { width: 40, height: 52, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  detail: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  rejected: { opacity: 0.55 },
  photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surfaceMuted },
  detailBody: { padding: space.md, gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  regular: { fontWeight: '400' },
});
