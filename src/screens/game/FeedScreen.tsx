import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { CountdownStrip } from '@/components/game/CountdownStrip';
import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { StoriesRow } from '@/components/game/StoriesRow';
import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';

/**
 * Home Feed in-game: storie (aggiungi punti + chiamate da votare),
 * countdown e "Ultimi punteggi" ufficiali.
 */
export function FeedScreen() {
  const game = useCurrentGame();
  const router = useRouter();
  const now = useNow();
  const allEvents = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const openQuickAction = useUiStore((s) => s.openQuickAction);

  const { calls, confirmed } = useMemo(() => {
    const mine = allEvents.filter((e) => e.gameId === game?.id);
    return {
      // prima le chiamate ancora da votare
      calls: mine.filter((e) => e.status === 'pending').sort((a, b) => Number(!!a.myVote) - Number(!!b.myVote)),
      confirmed: mine.filter((e) => e.status === 'confirmed'),
    };
  }, [allEvents, game?.id]);

  if (!game) return null;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={confirmed}
      keyExtractor={(e) => e.id}
      ItemSeparatorComponent={() => <View style={{ height: space.xs + 2 }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <StoriesRow
            calls={calls}
            players={players}
            onAdd={() => {
              haptics.press();
              openQuickAction();
            }}
            onOpen={(call) => {
              haptics.tap();
              router.push({ pathname: '/call/[eventId]', params: { eventId: call.id } });
            }}
          />
          {game.status !== 'ended' && <CountdownStrip game={game} now={now} />}
          <AppText variant="title">Ultimi punteggi</AppText>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <RubberHoseMascot size={110} pose="shrug" color={colors.toonYellow} />
          <AppText variant="body" color={colors.inkMuted} style={styles.center}>
            Ancora nessun punto ufficiale.{'\n'}Qualcuno dovrà pur fare la prima figuraccia.
          </AppText>
        </View>
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
    paddingBottom: TAB_BAR_SPACE,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: space.lg, marginBottom: space.md },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  center: { textAlign: 'center' },
});
