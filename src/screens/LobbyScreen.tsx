import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Wordmark } from '@/components/ui/Brand';
import { HeroCard, PosterCard, RowCard, RowGroup } from '@/components/ui/Cards';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { COMMUNITY_DECKS } from '@/data/community';
import { usePlayDeck } from '@/hooks/usePlayDeck';
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
  const playDeck = usePlayDeck();
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
            <Icon name="compass" size={24} />
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
        <View style={styles.hello}>
          <AppText variant="serifTitle" style={styles.helloText}>
            Ciao {ME.name}
          </AppText>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Entra in una stanza con un codice"
            hitSlop={8}
            onPress={() => router.push('/room/join')}
            style={styles.codeChip}>
            <Icon name="ticket" size={16} />
            <AppText variant="caption">Ho un codice</AppText>
          </PressableScale>
        </View>

        {last && resume ? (
          <HeroCard
            emoji={last.emoji}
            eyebrow={<StatusBadge status={last.status} />}
            title={last.name}
            body={resume.line}
            footer={<AvatarStack players={resume.people} size={32} max={6} />}
            onPress={() => openGame(last)}
            primary={{ label: 'Rientra', onPress: () => openGame(last) }}
          />
        ) : null}

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Crea una stanza: da zero o da un mazzo pronto"
          onPress={() => router.push('/room/start')}
          style={styles.create}>
          <View style={[styles.plus, !resume && styles.plusPrimary]}>
            <Icon name="plus" size={22} strokeWidth={2.4} />
          </View>
          <View style={styles.flex}>
            <AppText variant="headline">Crea una stanza</AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              Da zero o da una partita pronta
            </AppText>
          </View>
          <Icon name="chevron-right" size={20} color={colors.inkFaint} />
        </PressableScale>

        <View style={styles.list}>
          <SectionHeader
            title="Partite pronte"
            caption="Mazzi pubblicati da giocare subito"
            action={{ label: 'Esplora', onPress: () => router.push('/explore') }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hScroll}
            contentContainerStyle={styles.hRow}>
            {[...COMMUNITY_DECKS]
              .sort((a, b) => b.plays - a.plays)
              .slice(0, 8)
              .map((d) => (
                <PosterCard
                  key={d.id}
                  emoji={d.emoji}
                  title={d.name}
                  meta={`${d.occasion} · ${d.ruleIds.length} carte`}
                  badge={d.season ? 'Di stagione' : undefined}
                  onPress={() => playDeck(d)}
                />
              ))}
          </ScrollView>
        </View>

        {others.length > 0 && (
          <View style={styles.list}>
            <SectionHeader title="Le tue stanze" />
            <RowGroup>
              {others.map((g) => (
                <RowCard
                  key={g.id}
                  emoji={g.emoji}
                  title={g.name}
                  meta={<StatusBadge status={g.status} />}
                  accessibilityLabel={`Apri ${g.name}. ${infoOf(g).line}`}
                  onPress={() => openGame(g)}
                />
              ))}
            </RowGroup>
          </View>
        )}

        <RowGroup>
          {[
            <RowCard
              key="book"
              emoji="📖"
              title="Il Libro del Fanta"
              meta="Regole e come si gioca bene"
              onPress={() => router.push('/rulebook')}
            />,
          ]}
        </RowGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hello: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  helloText: { flex: 1 },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: space.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
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
  create: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPrimary: { backgroundColor: colors.cta, borderColor: colors.cta },
  regular: { fontWeight: '400' },
  hScroll: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  hRow: { gap: space.sm, paddingHorizontal: layout.gutter },
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
