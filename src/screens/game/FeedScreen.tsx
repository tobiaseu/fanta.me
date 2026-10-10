import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';

/** Cronologia completa: ogni punto con foto, ora, chi l'ha chiamato e i voti. Si apre da "Guarda tutti i punti". */
export function FeedScreen() {
  const router = useRouter();
  const game = useCurrentGame();
  const now = useNow(30_000);
  const allEvents = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const openPlayer = useOpenPlayer();

  const confirmed = useMemo(
    () =>
      allEvents
        .filter((e) => e.gameId === game?.id && e.status !== 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allEvents, game?.id],
  );

  if (!game) return null;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={confirmed}
      keyExtractor={(e) => e.id}
      ItemSeparatorComponent={() => <View style={{ height: space.xs }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <SectionHeader
            title="Tutti i punti"
            caption={`${confirmed.filter((e) => e.status === 'confirmed').length} confermati, dal più recente. Quelli scartati restano in grigio.`}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <RubberHoseMascot size={110} pose="shrug" color={colors.toonYellow} />
          <AppText variant="body" color={colors.inkSoft} style={styles.center}>
            Ancora nessun punto ufficiale.{'\n'}Qualcuno dovrà pur fare la prima figuraccia.
          </AppText>
        </View>
      }
      renderItem={({ item }) => (
        <Animated.View layout={LinearTransition.springify()}>
          <FeedItem
            event={item}
            now={now}
            player={players.find((p) => p.id === item.playerId)}
            author={players.find((p) => p.id === item.authorId)}
            onOpenPlayer={openPlayer}
            detailed
            onPress={() => router.push({ pathname: '/call/[eventId]', params: { eventId: item.id } })}
          />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { marginBottom: space.sm },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  center: { textAlign: 'center' },
});
