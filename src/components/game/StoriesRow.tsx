import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

const SIZE = 76;

interface Props {
  calls: FeedEvent[];
  players: Player[];
  onOpen: (event: FeedEvent) => void;
}

/**
 * Riga "storie": le chiamate del gruppo da votare (anello giallo) o già votate (badge ✓ / ✕).
 */
export function StoriesRow({ calls, players, onOpen }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {calls.map((call) => {
        const player = players.find((p) => p.id === call.playerId);
        if (!player) return null;
        const voted = Boolean(call.myVote);
        return (
          <PressableScale
            key={call.id}
            accessibilityRole="button"
            accessibilityLabel={`Chiamata su ${player.name}${voted ? ', già votata' : ', da votare'}`}
            onPress={() => onOpen(call)}
            style={styles.item}>
            <View style={[styles.circle, styles.ring, voted && styles.ringVoted]}>
              <Avatar player={player} size={SIZE - 14} sticker={false} shape="circle" />
            </View>
            {voted && (
              <View style={styles.badge}>
                <Icon
                  name={call.myVote === 'confirm' ? 'check' : 'close'}
                  size={16}
                  color={call.myVote === 'confirm' ? colors.bonusBright : colors.malus}
                  strokeWidth={3}
                />
              </View>
            )}
            <AppText variant="micro" style={styles.label} numberOfLines={1}>
              {player.name}
            </AppText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -space.md, flexGrow: 0 },
  row: { gap: space.md, paddingHorizontal: space.md, paddingVertical: space.xs },
  item: { width: SIZE, alignItems: 'center', gap: space.xs },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: { backgroundColor: colors.surface },
  ring: { borderWidth: 2, borderColor: colors.cta, backgroundColor: colors.surface },
  ringVoted: { borderColor: colors.placeholder },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
