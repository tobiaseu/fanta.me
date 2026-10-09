import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { CareerHeader } from '@/components/lobby/CareerHeader';
import { EmptyLobby } from '@/components/lobby/EmptyLobby';
import { FormatCarousel } from '@/components/lobby/FormatCarousel';
import { LeagueCard } from '@/components/lobby/LeagueCard';
import { LOBBY_ACTIONS_HEIGHT, LobbyActions } from '@/components/lobby/LobbyActions';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Wordmark } from '@/components/ui/Brand';
import { TopBar } from '@/components/ui/TopBar';
import { ME } from '@/data/mock';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

type Filter = 'all' | 'live';

/**
 * LOBBY (Global App): nessuna bottom navbar.
 * Top bar → carriera → "Nuovo evento" (format) → "Le tue leghe" con filtro →
 * pannello fisso con "Crea nuova stanza" ed "Entra con codice".
 */
export function LobbyScreen({ forceEmpty = false }: { forceEmpty?: boolean }) {
  const router = useRouter();
  const now = useNow(30_000);
  const { games, events, players, friendships } = useGameStore();
  const openPlayer = useOpenPlayer();
  const requests = Object.values(friendships).filter((f) => f === 'received').length;
  const [filter, setFilter] = useState<Filter>('all');

  const myGames = useMemo(() => (forceEmpty ? [] : games), [games, forceEmpty]);
  const shown = useMemo(
    () => (filter === 'live' ? myGames.filter((g) => g.status === 'live') : myGames),
    [myGames, filter],
  );

  const openGame = (game: Game) => {
    haptics.tap();
    router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  return (
    <View style={styles.screen}>
      <TopBar
        title={<Wordmark />}
        left={
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={requests ? `Il tuo profilo, ${requests} richieste di amicizia` : 'Il tuo profilo'}
            onPress={() => openPlayer(ME.id)}
            hitSlop={8}>
            <Avatar player={ME} size={32} sticker={false} />
            {requests > 0 && <View style={styles.dot} />}
          </PressableScale>
        }
      />
      <FlatList
        data={shown}
        keyExtractor={(g) => g.id}
        contentContainerStyle={[styles.content, { paddingBottom: LOBBY_ACTIONS_HEIGHT + space.xl }]}
        ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <CareerHeader user={ME} />

            <View style={styles.section}>
              <AppText variant="title">Le tue leghe</AppText>
              {myGames.length > 0 && (
                <View style={styles.filters} accessibilityRole="tablist">
                  {(
                    [
                      ['all', 'Tutte le leghe'],
                      ['live', 'In partita'],
                    ] as const
                  ).map(([id, label]) => (
                    <Pressable
                      key={id}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: filter === id }}
                      onPress={() => {
                        haptics.tap();
                        setFilter(id);
                      }}
                      style={[styles.filter, filter === id && styles.filterActive]}>
                      <AppText variant="headline" color={filter === id ? colors.ink : colors.inkFaint}>
                        {label}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyLobby />}
        ListFooterComponent={
          <View style={[styles.section, styles.footer]}>
            <AppText variant="title">Nuovo evento</AppText>
            <FormatCarousel
              onPick={(f) => router.push({ pathname: '/room/new', params: { mode: f.mode, format: f.name } })}
            />
          </View>
        }
        renderItem={({ item }) => {
          const standings = computeStandings(item, events, players);
          const mine = standings.find((r) => r.player.id === ME.id);
          const myRank = mine ? standings.indexOf(mine) + 1 : 0;
          const toVote = events.filter(
            (e) =>
              e.gameId === item.id &&
              e.status === 'pending' &&
              !e.myVote &&
              e.playerId !== ME.id &&
              e.authorId !== ME.id,
          ).length;
          return (
            <LeagueCard
              game={item}
              playerCount={item.playerIds.length}
              myRank={myRank}
              gapToFirst={mine && standings[0] ? standings[0].points - mine.points : 0}
              toVote={toVote}
              now={now}
              onPress={() => openGame(item)}
            />
          );
        }}
      />
      <LobbyActions onCreate={() => router.push('/room/new')} onJoin={() => router.push('/room/join')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.malus,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  footer: { marginTop: space.xl },
  content: {
    paddingHorizontal: space.md,
    paddingTop: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: space.lg, marginBottom: space.md },
  section: { gap: space.sm },
  filters: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: 16, padding: 4 },
  filter: { flex: 1, alignItems: 'center', paddingVertical: space.xs + 2, borderRadius: 12 },
  filterActive: { backgroundColor: colors.surface },
});
