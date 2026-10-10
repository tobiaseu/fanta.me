import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActivePowers } from '@/components/game/ActivePowers';
import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { PointCard } from '@/components/game/PointCard';
import { PowersPanel } from '@/components/game/PowersPanel';
import { PregamePanel } from '@/components/game/PregamePanel';
import { ResultsPanel } from '@/components/game/ResultsPanel';
import { StoriesRow } from '@/components/game/StoriesRow';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { HeroCard } from '@/components/ui/Cards';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { teamColor } from '@/lib/teams';
import {
  cardOfDay,
  computeStandings,
  computeTeamStandings,
  gameDay,
  nameIn,
  standingsHidden,
  suddenDeathActive,
  useGameStore,
  votesNeeded,
} from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type Player } from '@/types/game';

/**
 * DASHBOARD della partita, sulle dinamiche di FantaSanremo:
 * chiamate da votare, carta del giorno che vale doppio, capitano della squadra,
 * podio e MVP della giornata, ultimi punti.
 */
export function DashboardScreen() {
  const game = useCurrentGame();
  const router = useRouter();
  const now = useNow(30_000);
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const captains = useGameStore((s) => s.captains);
  const setCaptain = useGameStore((s) => s.setCaptain);
  const openQuickAction = useUiStore((s) => s.openQuickAction);
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();
  const simulateCall = useGameStore((s) => s.simulateCall);
  const refreshTick = useUiStore((s) => s.refreshTick);
  const proposals = useGameStore((s) => s.proposals);

  const { calls, latest } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id);
    return {
      calls: mine.filter((e) => e.status === 'pending').sort((a, b) => Number(!!a.myVote) - Number(!!b.myVote)),
      latest: mine
        .filter((e) => e.status === 'confirmed')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    };
  }, [events, players, game, now]);

  if (!game) return null;
  const day = gameDay(game, now);
  const card = game.status === 'live' ? cardOfDay(game, now) : undefined;
  const myTeam = game.teams?.find((t) => t.memberIds.includes(ME.id));
  const members = myTeam
    ? (myTeam.memberIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[])
    : [];
  const captainId = myTeam ? captains[myTeam.id] : undefined;
  // Primi tre: squadre se ci sono, altrimenti giocatori
  const top = game.teams?.length
    ? computeTeamStandings(game, events, players, captains, now)
        .slice(0, 3)
        .map((t) => ({ id: t.team.id, name: t.team.name, points: t.points, color: teamColor(game, t.team.id) }))
    : computeStandings(game, events, players)
        .slice(0, 3)
        .map((r) => ({ id: r.player.id, name: nameIn(game, r.player), points: r.points, color: r.player.color }));
  const toVote = calls.filter((c) => !c.myVote && c.playerId !== ME.id && c.authorId !== ME.id).length;
  const goTo = (tab: 'live' | 'leaderboard' | 'rules') => {
    haptics.tap();
    router.navigate({ pathname: `/game/[gameId]/${tab}`, params: { gameId: game.id } });
  };

  const invite = () => router.push({ pathname: '/onboarding/invite', params: { gameId: game.id } });
  const hidden = standingsHidden(game, now);
  const sudden = suddenDeathActive(game, now);
  const refresh = () => {
    const e = simulateCall(game.id);
    const who = e && players.find((p) => p.id === e.authorId);
    showToast({ text: who ? `${who.name} ha appena chiamato un punto` : 'Tutto aggiornato' });
  };

  // La card primaria: sempre in cima, sempre un solo passaggio da fare, cambia con la fase
  const mineProposed = proposals.filter((p) => p.gameId === game.id && p.authorId === ME.id).length;
  const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
  const openDeck = () => router.push({ pathname: '/deck/[gameId]', params: { gameId: game.id } });
  const next: Parameters<typeof HeroCard>[0] =
    game.status === 'waiting'
      ? mineProposed < perPlayer
        ? {
            emoji: '🃏',
            eyebrow: 'Prima di iniziare',
            title: 'Metti le tue carte nel mazzo',
            body: `Ne hai messe ${mineProposed} su ${perPlayer}: scegli le tue prima del via.`,
            primary: { label: 'Apri il mazzo', onPress: openDeck },
            secondary: { label: 'Invita', onPress: invite },
          }
        : {
            emoji: '💌',
            eyebrow: 'Prima di iniziare',
            title: 'Le tue carte ci sono',
            body: 'Più amici, più punti da chiamare. Manda il codice a chi manca.',
            primary: { label: 'Invita amici', onPress: invite },
            secondary: { label: 'Il mazzo', onPress: openDeck },
          }
      : game.status === 'ended'
        ? {
            emoji: '🔁',
            eyebrow: 'Partita conclusa',
            title: 'Rivincita?',
            body: 'Stessa gente, stanza nuova. Il mazzo resta nella tua collezione.',
            primary: { label: 'Crea la rivincita', onPress: () => router.push('/room/start') },
            secondary: { label: 'Classifica', onPress: () => goTo('leaderboard') },
          }
        : toVote > 0
          ? {
              emoji: '👀',
              eyebrow: 'Tocca a te',
              title: `${toVote} ${toVote === 1 ? 'chiamata da votare' : 'chiamate da votare'}`,
              body: `Bastano ${votesNeeded(game)} sì e il punto è ufficiale.`,
              primary: { label: 'Vota nel Live', onPress: () => goTo('live') },
              secondary: { label: 'Chiama', onPress: () => openQuickAction() },
            }
          : {
              emoji: '📺',
              eyebrow: 'Sei in pari',
              title: 'Hai visto qualcosa?',
              body: 'Nessun voto in sospeso. Se succede qualcosa, chiamalo.',
              primary: { label: 'Chiama un punto', onPress: () => openQuickAction() },
              secondary: { label: 'Live', onPress: () => goTo('live') },
            };

  return (
    <PullToRefresh style={styles.screen} contentContainerStyle={styles.content} onRefresh={refresh} pulse={refreshTick}>
      <HeroCard {...next} />

      {game.status === 'waiting' && (
        <>
          <PregamePanel game={game} />
          <PowersPanel game={game} now={now} />
        </>
      )}

      {sudden !== 'off' && (
        <View style={styles.sudden}>
          <AppText style={styles.nextEmoji}>⚡</AppText>
          <View style={styles.flex}>
            <AppText variant="name">Sudden death</AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              Fino alla fine{' '}
              {sudden === 'both' ? 'tutti i punti valgono' : sudden === 'bonus' ? 'i bonus valgono' : 'i malus valgono'}{' '}
              doppio.
            </AppText>
          </View>
        </View>
      )}

      {game.status === 'ended' && <ResultsPanel game={game} />}

      {game.status !== 'waiting' && (
        <View style={styles.section}>
          <SectionHeader title={game.teams?.length ? 'Squadre in testa' : 'In testa'} />
          {hidden ? (
            <EmptyNote
              emoji="🤫"
              title="Classifica nascosta"
              body="Finale a sorpresa: si svela tutto con i risultati."
            />
          ) : (
            <View style={styles.podium}>
              {[top[1], top[0], top[2]].map((r, k) =>
                r ? (
                  <View key={r.id} style={styles.podiumCol}>
                    <View style={[styles.podiumDot, { backgroundColor: r.color }]} />
                    <AppText variant="name" numberOfLines={1} style={styles.center}>
                      {r.name}
                    </AppText>
                    <AppText variant="caption" color={colors.inkSoft}>
                      {r.points} pt
                    </AppText>
                    <View style={[styles.block, { height: k === 1 ? 72 : k === 0 ? 52 : 36 }]}>
                      <AppText variant="headline">{k === 1 ? 1 : k === 0 ? 2 : 3}</AppText>
                    </View>
                  </View>
                ) : null,
              )}
            </View>
          )}
          {!hidden && <Button label="Vedi la classifica" variant="tertiary" onPress={() => goTo('leaderboard')} />}
        </View>
      )}

      {game.status !== 'waiting' && (
        <View style={styles.section}>
          <SectionHeader title="Ultimi punti" action={{ label: 'Tutti nel Live', onPress: () => goTo('live') }} />
          {latest.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hScroll}
              contentContainerStyle={styles.hRow}>
              {latest.map((e) => {
                const p = players.find((x) => x.id === e.playerId);
                const a = players.find((x) => x.id === e.authorId);
                return (
                  <PointCard
                    key={e.id}
                    event={e}
                    player={p}
                    name={p ? nameIn(game, p) : ''}
                    author={a ? nameIn(game, a) : undefined}
                    now={now}
                    style={styles.pointCard}
                    onPress={() => router.push({ pathname: '/call/[eventId]', params: { eventId: e.id } })}
                  />
                );
              })}
            </ScrollView>
          ) : (
            <EmptyNote emoji="🫣" title="Ancora nessun punto" body="Qualcuno dovrà pur fare la prima figuraccia." />
          )}
        </View>
      )}

      {game.status === 'live' && (
        <View style={styles.section}>
          <SectionHeader title="Carte speciali attive" />
          {card && (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Carta del giorno: ${card.label}, oggi vale ${card.points * 2} punti. Chiamala.`}
              onPress={() => {
                haptics.press();
                openQuickAction(card.id);
              }}
              style={styles.dayCard}>
              <RuleSticker rule={card} size={72} />
              <View style={styles.flex}>
                <AppText variant="micro" color={colors.inkSoft}>
                  Carta del giorno
                </AppText>
                <AppText variant="serifCard" numberOfLines={2}>
                  {card.label}
                </AppText>
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  Fino a fine {day.label.toLowerCase()} vale +{card.points * 2} invece di +{card.points}
                </AppText>
              </View>
              <View style={styles.double}>
                <AppText variant="headline">×2</AppText>
              </View>
            </PressableScale>
          )}
          <PowersPanel game={game} now={now} />
        </View>
      )}
    </PullToRefresh>
  );
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingTop: layout.card,
    paddingHorizontal: space.sm,
    overflow: 'hidden',
  },
  podiumCol: { flex: 1, alignItems: 'center', gap: 2 },
  podiumDot: { width: 28, height: 28, borderRadius: 14, marginBottom: space.xxs },
  center: { textAlign: 'center' },
  block: {
    alignSelf: 'stretch',
    marginTop: space.xs,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: space.xs,
  },
  hScroll: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  hRow: { gap: space.sm, paddingHorizontal: layout.gutter },
  pointCard: { width: 220 },
  sudden: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: layout.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cta,
    backgroundColor: colors.ctaSoft,
  },
  next: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.xs },
  nextEmoji: { fontSize: 32, lineHeight: 40 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE,
    gap: layout.section + space.xs,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  section: { gap: space.sm },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400', marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: layout.card,
    paddingVertical: space.xs,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    paddingRight: layout.card,
    borderWidth: 1,
    borderColor: colors.cta,
  },
  double: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  members: { flexDirection: 'row', gap: space.sm },
  member: {
    flex: 1,
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memberActive: { borderColor: colors.cta, backgroundColor: colors.ctaSoft },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: colors.cta,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { flex: 1, alignItems: 'center', gap: space.xxs, paddingTop: space.md },
  stepFirst: { paddingTop: 0 },
  mvp: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 2,
    marginBottom: space.xxs,
  },
  list: { gap: space.xs },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  place: { width: 18 },
});
