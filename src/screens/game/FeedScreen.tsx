import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { CountdownHero } from '@/components/game/CountdownHero';
import { FeedItem } from '@/components/game/FeedItem';
import { AppText } from '@/components/ui/AppText';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';

/** Home Feed in-game: countdown in alto + cronaca live delle assegnazioni. */
export function FeedScreen() {
  const game = useCurrentGame();
  const now = useNow();
  const allEvents = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const events = useMemo(() => allEvents.filter((e) => e.gameId === game?.id), [allEvents, game?.id]);

  if (!game) return null;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={events}
      keyExtractor={(e) => e.id}
      ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <CountdownHero game={game} now={now} />
          <AppText variant="title">Cronaca live</AppText>
        </View>
      }
      ListEmptyComponent={
        <AppText variant="body" color={colors.inkMuted}>
          Ancora nessun punto. Tocca ⚡️ per assegnare il primo.
        </AppText>
      }
      renderItem={({ item }) => (
        <Animated.View entering={FadeInDown.springify().damping(18)} layout={LinearTransition.springify()}>
          <FeedItem
            event={item}
            now={now}
            player={players.find((p) => p.id === item.playerId)}
            author={players.find((p) => p.id === item.authorId)}
          />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: space.xxl,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: space.lg, marginBottom: space.md },
});
