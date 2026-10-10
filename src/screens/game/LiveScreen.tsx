import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { ActivePowers } from '@/components/game/ActivePowers';
import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { StoriesRow } from '@/components/game/StoriesRow';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { PointCard } from '@/components/game/PointCard';
import { Countdown } from '@/components/game/Countdown';
import { Button } from '@/components/ui/Button';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { Scrim } from '@/components/ui/Scrim';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ruleById } from '@/data/rules';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { nameIn, teamSize, useGameStore, votesNeeded } from '@/store/useGameStore';
import { timeAgo } from '@/lib/time';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type FeedEvent, type Player } from '@/types/game';

/**
 * LIVE: il centro del gioco. Prima dell'inizio è bloccato e spiega cosa ci sarà;
 * in partita ci sono le chiamate da votare, i fantapoteri attivi e il feed continuo dei punti,
 * con il "+" per chiamarne uno; a partita finita resta come archivio.
 */
export function LiveScreen() {
  const game = useCurrentGame();
  const router = useRouter();
  const now = useNow(30_000);
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const openQuickAction = useUiStore((s) => s.openQuickAction);
  const openPlayer = useOpenPlayer();
  const proposals = useGameStore((s) => s.proposals);
  const simulateCall = useGameStore((s) => s.simulateCall);
  const refreshTick = useUiStore((s) => s.refreshTick);
  const [view, setView] = useState<'list' | 'photo'>('list');

  const { calls, feed } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id);
    return {
      calls: mine.filter((e) => e.status === 'pending').sort((a, b) => Number(!!a.myVote) - Number(!!b.myVote)),
      feed: mine.filter((e) => e.status !== 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }, [events, game?.id]);

  if (!game) return null;
  if (game.status === 'waiting') {
    const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
    const myCards = proposals.filter((p) => p.gameId === game.id && p.authorId === ME.id).length;
    const myTeam = game.teams?.find((t) => t.memberIds.includes(ME.id));
    const todo =
      myCards < perPlayer
        ? {
            title: `Ti mancano ${perPlayer - myCards} carte`,
            body: 'Mettile nel mazzo prima che si parta.',
            cta: 'Scegli le carte',
          }
        : myTeam && myTeam.memberIds.length < teamSize(game)
          ? {
              title: 'La tua squadra non è completa',
              body: `Prendi ${teamSize(game) - myTeam.memberIds.length} giocatori liberi.`,
              cta: 'Fai la squadra',
            }
          : undefined;
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.waiting}>
          <AppText variant="serifHeading" style={styles.center}>
            Si parte tra poco
          </AppText>
          <Countdown target={new Date(game.startsAt ?? Date.now()).getTime()} label="Il Live si apre tra" />
          <AppText variant="body" color={colors.inkSoft} style={[styles.center, styles.regular]}>
            Qui arriveranno le chiamate da votare, i fantapoteri in gioco e tutti i punti.
          </AppText>
        </View>
        {todo ? (
          <View style={styles.todo}>
            <AppText variant="name">{todo.title}</AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              {todo.body}
            </AppText>
            <Button
              label={todo.cta}
              onPress={() => router.navigate({ pathname: '/game/[gameId]/rules', params: { gameId: game.id } })}
            />
          </View>
        ) : (
          <EmptyNote emoji="✅" title="Sei pronto" body="Carte e squadra sono a posto. Ora si aspetta il via." />
        )}
      </ScrollView>
    );
  }

  const live = game.status === 'live';
  const toVote = calls.filter((c) => !c.myVote && c.playerId !== ME.id && c.authorId !== ME.id).length;
  const open = (id: string) => router.push({ pathname: '/call/[eventId]', params: { eventId: id } });

  return (
    <View style={styles.flex}>
      <PullToRefresh
        style={styles.screen}
        contentContainerStyle={styles.content}
        onRefresh={() => simulateCall(game.id)}
        pulse={refreshTick}>
        {live && (
          <View style={styles.section}>
            <SectionHeader
              title={toVote > 0 ? 'Da votare' : 'Chiamate'}
              caption={
                toVote > 0
                  ? `${toVote} ${toVote === 1 ? 'chiamata aspetta' : 'chiamate aspettano'} il tuo voto`
                  : calls.length
                    ? 'Hai votato tutto. Aspettiamo gli altri.'
                    : undefined
              }
            />
            <StoriesRow
              calls={calls}
              players={players}
              onAdd={() => {
                haptics.press();
                openQuickAction();
              }}
              onOpen={(call) => {
                haptics.tap();
                open(call.id);
              }}
            />
            {calls.length === 0 && (
              <EmptyNote
                emoji="📭"
                title="Niente da votare al momento"
                body="Quando qualcuno chiama un punto compare qui come storia. Tocca il + per chiamarne uno."
              />
            )}
          </View>
        )}
        {live && (
          <View style={styles.section}>
            <SectionHeader title="Fantapoteri in gioco" info="fantapoteri" />
            <ActivePowers game={game} now={now} />
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.headRow}>
            <View style={styles.flex}>
              <SectionHeader
                title={live ? 'Tutti i punti' : 'Com’è andata'}
                caption={`${feed.filter((e) => e.status === 'confirmed').length} confermati, dal più recente.`}
              />
            </View>
            <View style={styles.toggle} accessibilityRole="tablist">
              {(['list', 'photo'] as const).map((v) => (
                <PressableScale
                  key={v}
                  accessibilityRole="tab"
                  accessibilityLabel={v === 'list' ? 'Vista a lista' : 'Vista con le foto'}
                  accessibilityState={{ selected: view === v }}
                  onPress={() => {
                    haptics.tap();
                    setView(v);
                  }}
                  style={[styles.toggleBtn, view === v && styles.toggleOn]}>
                  <Icon
                    name={v === 'list' ? 'list' : 'camera'}
                    size={18}
                    color={view === v ? colors.ink : colors.inkSoft}
                  />
                </PressableScale>
              ))}
            </View>
          </View>
          {feed.length ? (
            <View style={view === 'list' ? styles.slimList : styles.list}>
              {feed.map((e) => {
                const player = players.find((p) => p.id === e.playerId);
                return (
                  <Animated.View key={e.id} layout={LinearTransition.springify()}>
                    {view === 'list' ? (
                      <SlimRow
                        event={e}
                        name={player ? nameIn(game, player) : ''}
                        ago={timeAgo(e.createdAt, now)}
                        need={votesNeeded(game)}
                        onPress={() => open(e.id)}
                      />
                    ) : (
                      <PointCard
                        event={e}
                        player={player}
                        name={player ? nameIn(game, player) : ''}
                        author={(() => {
                          const a = players.find((p) => p.id === e.authorId);
                          return a ? nameIn(game, a) : undefined;
                        })()}
                        now={now}
                        onPress={() => open(e.id)}
                      />
                    )}
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <EmptyNote emoji="🫣" title="Ancora nessun punto" body="Qualcuno dovrà pur fare la prima figuraccia." />
          )}
        </View>
      </PullToRefresh>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE + space.md,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  section: { gap: space.sm },
  waiting: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    gap: space.md,
    alignItems: 'center',
  },
  center: { textAlign: 'center' },
  regular: { fontWeight: '400' },
  todo: { gap: space.xs, padding: layout.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  list: { gap: space.sm },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, padding: 2 },
  toggleBtn: { width: 36, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'flex-end',
  },
  tileFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  tileEmoji: { position: 'absolute', top: space.md, alignSelf: 'center', fontSize: 56, lineHeight: 64 },
  tileText: { padding: space.sm, gap: 2 },
  rejected: { opacity: 0.5 },
  slimList: { gap: space.xs },
  slim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  slimText: { flex: 1, gap: 2 },
});

/** Vista a lista: card orizzontale snella, solo testo. Chi, quale carta, quanti punti. */
function SlimRow({
  event,
  name,
  ago,
  need,
  onPress,
}: {
  event: FeedEvent;
  name: string;
  ago: string;
  need: number;
  onPress: () => void;
}) {
  const rule = ruleById(event.ruleId);
  const pending = event.status === 'pending';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${rule?.label ?? 'Punto'}, ${event.points} punti`}
      onPress={onPress}
      pressedScale={0.98}
      style={[styles.slim, event.status === 'rejected' && styles.rejected]}>
      <View style={styles.slimText}>
        <AppText variant="name" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" color={colors.inkSoft} numberOfLines={1}>
          {rule?.label ?? 'Punto'} · {ago}
          {pending ? ` · ${event.votes.confirm}/${need} voti` : event.status === 'rejected' ? ' · respinto' : ''}
        </AppText>
      </View>
      <AppText variant="headline" color={event.points > 0 ? colors.bonus : colors.malus}>
        {event.points > 0 ? '+' : ''}
        {event.points}
      </AppText>
    </PressableScale>
  );
}
