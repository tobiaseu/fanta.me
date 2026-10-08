import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { CareerHeader } from '@/components/lobby/CareerHeader';
import { CreateRoomButton } from '@/components/lobby/CreateRoomButton';
import { EmptyLobby } from '@/components/lobby/EmptyLobby';
import { GameCard } from '@/components/lobby/GameCard';
import { AppText } from '@/components/ui/AppText';
import { ME } from '@/data/mock';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

const CTA_SPACE = 58 + space.lg * 2;

/**
 * LOBBY (Global App): nessuna bottom navbar.
 * Header carriera → lista verticale delle partite attive → CTA fissa "Crea Nuova Stanza".
 */
export function LobbyScreen({ forceEmpty = false }: { forceEmpty?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow(30_000);
  const { games, events, players } = useGameStore();

  const activeGames = useMemo(
    () => (forceEmpty ? [] : games.filter((g) => g.status !== 'ended')),
    [games, forceEmpty],
  );

  const openGame = (game: Game) => {
    haptics.tap();
    router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={activeGames}
        keyExtractor={(g) => g.id}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.md, paddingBottom: CTA_SPACE + insets.bottom },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <CareerHeader user={ME} />
            {activeGames.length > 0 && (
              <View style={styles.sectionTitle}>
                <AppText variant="title">Partite attive</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {activeGames.length} {activeGames.length === 1 ? 'stanza' : 'stanze'}
                </AppText>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={<EmptyLobby />}
        ListFooterComponent={
          activeGames.length > 0 ? (
            <View style={styles.footerArt}>
              <RubberHoseMascot size={92} color={colors.toonBlue} pose="wave" />
              <AppText variant="caption" color={colors.inkMuted} style={styles.footerText}>
                Ogni azione vale punti.{'\n'}Anche quelle di cui ti vergogni.
              </AppText>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const standings = computeStandings(item, events, players);
          const myIndex = standings.findIndex((r) => r.player.id === ME.id);
          return (
            <Animated.View entering={FadeInDown.delay(80 * index).springify().damping(18)}>
              <GameCard
                game={item}
                players={standings.map((r) => r.player)}
                myPoints={standings[myIndex]?.points ?? 0}
                myRank={myIndex + 1}
                now={now}
                onPress={() => openGame(item)}
              />
            </Animated.View>
          );
        }}
      />
      <CreateRoomButton onPress={() => router.push('/room/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: space.lg, marginBottom: space.md },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space.xs,
  },
  footerArt: { alignItems: 'center', gap: space.sm, paddingTop: space.xl },
  footerText: { textAlign: 'center' },
});
