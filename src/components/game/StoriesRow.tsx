import { nameIn, useGameStore, votesNeeded } from '@/store/useGameStore';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

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
  /** Primo cerchio "+" per chiamare un punto, come la propria storia su Instagram. */
  onAdd?: () => void;
}

/**
 * Riga "storie": le chiamate del gruppo da votare (anello giallo) o già votate (badge ✓ / ✕).
 */
export function StoriesRow({ calls, players, onOpen, onAdd }: Props) {
  const games = useGameStore((s) => s.games);
  const need = (call: FeedEvent) => {
    const g = games.find((x) => x.id === call.gameId);
    return g ? votesNeeded(g) : 1;
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {onAdd && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Chiama un punto"
          onPress={onAdd}
          style={styles.item}>
          <View style={[styles.circle, styles.add]}>
            <Icon name="plus" size={28} />
          </View>
          <AppText variant="micro" style={styles.label} numberOfLines={1}>
            Chiama
          </AppText>
        </PressableScale>
      )}
      {calls.map((call) => {
        const player = players.find((p) => p.id === call.playerId);
        if (!player) return null;
        const voted = Boolean(call.myVote);
        return (
          <PressableScale
            key={call.id}
            accessibilityRole="button"
            accessibilityLabel={`Chiamata su ${nameIn(
              games.find((g) => g.id === call.gameId),
              player,
            )}${voted ? ', già votata' : ', da votare'}`}
            onPress={() => onOpen(call)}
            style={styles.item}>
            <View style={[styles.circle, styles.ring, voted && styles.ringVoted]}>
              {call.photo ? (
                <View style={styles.photoWrap}>
                  <Avatar player={player} size={SIZE - 14} sticker={false} />
                  <Image source={{ uri: call.photo }} style={styles.photo} />
                </View>
              ) : (
                <Avatar player={player} size={SIZE - 14} sticker={false} shape="circle" />
              )}
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
            <View style={styles.count} accessibilityLabel={`${call.votes.confirm} conferme su ${need(call)}`}>
              <AppText style={styles.countText}>
                {call.votes.confirm}/{need(call)}
              </AppText>
            </View>
            <AppText variant="micro" style={styles.label} numberOfLines={1}>
              {nameIn(
                games.find((g) => g.id === call.gameId),
                player,
              )}
            </AppText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  count: {
    position: 'absolute',
    top: SIZE - 14,
    alignSelf: 'center',
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ink,
    justifyContent: 'center',
  },
  countText: { color: '#fff', fontSize: 11, lineHeight: 13, fontWeight: '600' },
  photoWrap: { width: SIZE - 14, height: SIZE - 14, borderRadius: SIZE, overflow: 'hidden' },
  photo: { position: 'absolute', width: SIZE - 14, height: SIZE - 14 },
  mini: {
    position: 'absolute',
    left: 0,
    top: SIZE - 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.background,
  },
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
  add: { backgroundColor: colors.cta },
  ring: { borderWidth: 4, borderColor: colors.cta, backgroundColor: colors.surface },
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
