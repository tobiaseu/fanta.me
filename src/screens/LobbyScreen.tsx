import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyLobby } from '@/components/lobby/EmptyLobby';
import { FormatCarousel } from '@/components/lobby/FormatCarousel';
import { RoomCard } from '@/components/lobby/RoomCard';
import { LOBBY_ACTIONS_HEIGHT, LobbyActions } from '@/components/lobby/LobbyActions';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Wordmark } from '@/components/ui/Brand';
import { TopBar } from '@/components/ui/TopBar';
import { ME } from '@/data/mock';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

type Filter = 'all' | 'live';

/**
 * LOBBY alla Clubhouse: nessuna bottom navbar.
 * Saluto + carriera in una riga → "Le tue stanze" (card con le persone dentro) →
 * format per un nuovo evento → pillola flottante "Crea stanza" + "Entra con codice".
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

  const toVoteOf = (gameId: string) =>
    events.filter(
      (e) => e.gameId === gameId && e.status === 'pending' && !e.myVote && e.playerId !== ME.id && e.authorId !== ME.id,
    ).length;
  const toVoteTotal = myGames.reduce((sum, g) => sum + toVoteOf(g.id), 0);

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
        contentContainerStyle={[styles.content, { paddingBottom: LOBBY_ACTIONS_HEIGHT + space.xxl }]}
        ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.hello}>
              <AppText variant="serifTitle">Ciao {ME.name}</AppText>
              <AppText variant="body" color={colors.inkSoft}>
                🏆 {ME.career.trophies} trofei, {ME.career.gamesPlayed} partite,{' '}
                {ME.career.totalPoints.toLocaleString('it-IT')} punti in carriera
              </AppText>
            </View>

            <View style={styles.section}>
              <SectionHeader
                title="Le tue stanze"
                caption={toVoteTotal > 0 ? `${toVoteTotal} chiamate aspettano il tuo voto` : undefined}
              />
              {myGames.length > 0 && (
                <View style={styles.filters} accessibilityRole="tablist">
                  {(
                    [
                      ['all', 'Tutte'],
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
                      <AppText variant="caption" color={filter === id ? colors.inkInverse : colors.inkSoft}>
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
            <SectionHeader title="Nuovo evento" caption="Parti da un format già pronto." />
            <FormatCarousel
              onPick={(f) => router.push({ pathname: '/room/new', params: { mode: f.mode, format: f.name } })}
            />
          </View>
        }
        renderItem={({ item }) => (
          <RoomCard
            game={item}
            standings={computeStandings(item, events, players)}
            toVote={toVoteOf(item.id)}
            now={now}
            onPress={() => openGame(item)}
          />
        )}
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
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: layout.section, marginBottom: space.md },
  hello: { gap: space.xxs },
  section: { gap: space.sm },
  footer: { marginTop: space.xl },
  filters: { flexDirection: 'row', gap: space.xs },
  filter: {
    paddingHorizontal: space.md,
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  filterActive: { backgroundColor: colors.ink },
});
