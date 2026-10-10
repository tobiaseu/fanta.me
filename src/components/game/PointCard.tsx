import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { timeAgo } from '@/lib/time';
import { colors, radius, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

/**
 * Card di un punto, uguale ovunque: in alto l'immagine (la foto del momento, oppure l'emoji
 * della carta su fondo tenue), sotto sempre le stesse informazioni: chi, quale carta, quando, quanti punti.
 */
export function PointCard({
  event,
  player,
  name,
  author,
  now,
  onPress,
  style,
}: {
  event: FeedEvent;
  player?: Player;
  name: string;
  author?: string;
  now: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const rule = ruleById(event.ruleId);
  const bonus = event.points > 0;
  const reactions = Object.entries(event.reactions ?? {}).filter(([, n]) => n > 0);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${rule?.label ?? 'Punto'}, ${event.points} punti`}
      onPress={onPress}
      pressedScale={0.97}
      style={[styles.card, event.status === 'rejected' && styles.rejected, style]}>
      <View style={[styles.media, { backgroundColor: bonus ? colors.liveSoft : 'rgba(255, 59, 48, 0.12)' }]}>
        <AppText style={styles.emoji}>{rule?.emoji ?? '✨'}</AppText>
        {event.photo ? <Image source={{ uri: event.photo }} style={styles.photo} /> : null}
        <View style={styles.points}>
          <AppText variant="headline" color={bonus ? colors.bonus : colors.malus}>
            {bonus ? '+' : ''}
            {event.points}
          </AppText>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.who}>
          {player && <Avatar player={player} size={22} sticker={false} />}
          <AppText variant="name" numberOfLines={1} style={styles.flex}>
            {name}
          </AppText>
        </View>
        <AppText variant="serifCard" numberOfLines={1}>
          {rule?.label ?? 'Punto'}
        </AppText>
        <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
          {author ? `da ${author}, ` : ''}
          {timeAgo(event.createdAt, now)}
          {event.status === 'rejected' ? ' · respinto' : event.status === 'pending' ? ' · da votare' : ''}
          {reactions.length ? `  ${reactions.map(([e, n]) => `${e}${n}`).join(' ')}` : ''}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  rejected: { opacity: 0.5 },
  media: { aspectRatio: 16 / 10, alignItems: 'center', justifyContent: 'center' },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  emoji: { fontSize: 56, lineHeight: 66 },
  points: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    paddingHorizontal: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  body: { padding: space.sm, gap: 2 },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
});
