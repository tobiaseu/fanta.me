import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RulebookCard } from '@/components/game/RulebookCard';
import { CommunityStrip } from '@/components/lobby/CommunityStrip';
import { QuickRoom } from '@/components/lobby/QuickRoom';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Wordmark } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TopBar } from '@/components/ui/TopBar';
import { ME } from '@/data/mock';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { computeStandings, gameDay, useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

/**
 * HOME: solo il saluto e una card grande per rientrare nell'ultima stanza.
 * Sotto, le altre stanze con la stessa card (CTA secondario) e il Libro del Fanta. Crea / Entra con codice restano flottanti.
 */
export function LobbyScreen({ forceEmpty = false }: { forceEmpty?: boolean }) {
  const router = useRouter();
  const now = useNow(30_000);
  const { games, events, players, friendships } = useGameStore();
  const lastGameId = useSessionStore((s) => s.lastGameId);
  const openPlayer = useOpenPlayer();
  const requests = Object.values(friendships).filter((f) => f === 'received').length;

  const myGames = useMemo(() => (forceEmpty ? [] : games), [games, forceEmpty]);
  const last = myGames.find((g) => g.id === lastGameId) ?? myGames.find((g) => g.status !== 'ended');
  const others = myGames.filter((g) => g.id !== last?.id);

  const openGame = (game: Game) => {
    haptics.tap();
    router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  const infoOf = (last: Game) => {
    const standings = computeStandings(last, events, players);
    const rank = standings.findIndex((r) => r.player.id === ME.id) + 1;
    const toVote = events.filter(
      (e) =>
        e.gameId === last.id && e.status === 'pending' && !e.myVote && e.playerId !== ME.id && e.authorId !== ME.id,
    ).length;
    const day = gameDay(last, now);
    const line =
      last.status === 'waiting'
        ? 'Il mazzo si sta formando: metti le tue carte'
        : last.status === 'ended'
          ? 'Partita conclusa: guarda i risultati'
          : toVote > 0
            ? `${toVote} ${toVote === 1 ? 'chiamata aspetta' : 'chiamate aspettano'} il tuo voto`
            : `${day.label} ${day.index} di ${day.total}, sei ${rank}°`;
    return { line, people: players.filter((p) => last.playerIds.includes(p.id)) };
  };
  const resume = last && infoOf(last);

  return (
    <View style={styles.screen}>
      <TopBar
        title={<Wordmark />}
        right={
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Esplora mazzi e carte della community"
            hitSlop={8}
            onPress={() => router.push('/explore')}>
            <Icon name="grid" size={22} />
          </PressableScale>
        }
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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: space.xxl * 2 }]}>
        <AppText variant="serifTitle">Ciao {ME.name}</AppText>

        {last && resume ? <RoomCard game={last} info={resume} primary onPress={() => openGame(last)} /> : null}

        <QuickRoom primary={!resume} />

        <CommunityStrip />

        {others.length > 0 && (
          <View style={styles.list}>
            <AppText variant="headline">Le altre stanze</AppText>
            {others.map((g) => (
              <RoomCard key={g.id} game={g} info={infoOf(g)} onPress={() => openGame(g)} />
            ))}
          </View>
        )}

        <RulebookCard />
      </ScrollView>
    </View>
  );
}

/**
 * Card stanza, uguale per tutte: quella da riprendere ha il CTA giallo,
 * le altre un bottone secondario trasparente (un solo giallo per schermata).
 */
function RoomCard({
  game,
  info,
  primary,
  onPress,
}: {
  game: Game;
  info: { line: string; people: Player[] };
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${primary ? 'Rientra in' : 'Apri'} ${game.name}. ${info.line}`}
      onPress={onPress}
      pressedScale={0.98}
      style={styles.resume}>
      {primary && (
        <AppText variant="micro" color={colors.inkSoft}>
          Rientra in partita
        </AppText>
      )}
      <AppText variant="title" numberOfLines={2}>
        {game.emoji} {game.name}
      </AppText>
      <StatusBadge status={game.status} />
      <AppText variant="body" color={colors.inkSoft}>
        {info.line}
      </AppText>
      <View style={styles.resumeFoot}>
        <AvatarStack players={info.people} size={32} max={5} />
        {primary ? (
          <View style={styles.go}>
            <Icon name="chevron-right" size={22} />
          </View>
        ) : (
          <View style={styles.open}>
            <AppText variant="caption">Apri</AppText>
          </View>
        )}
      </View>
    </PressableScale>
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
    borderWidth: 1,
    borderColor: colors.surface,
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section + space.xs,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  resume: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.xs,
  },
  resumeFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  go: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: {
    height: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  list: { gap: space.sm },
  rows: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: layout.card,
    paddingVertical: space.sm + 2,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  emoji: { fontSize: 20, lineHeight: 26 },
  flex: { flex: 1 },
});
