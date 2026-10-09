import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { StoriesRow } from '@/components/game/StoriesRow';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { teamColor } from '@/lib/teams';
import { cardOfDay, computeDayStandings, gameDay, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

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

  const { calls, latest, today } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id);
    return {
      calls: mine.filter((e) => e.status === 'pending').sort((a, b) => Number(!!a.myVote) - Number(!!b.myVote)),
      latest: mine.filter((e) => e.status === 'confirmed').slice(0, 3),
      today: game ? computeDayStandings(game, events, players, now).filter((r) => r.points !== 0) : [],
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
  const toVote = calls.filter((c) => !c.myVote && c.playerId !== ME.id && c.authorId !== ME.id).length;
  const goTo = (tab: 'feed' | 'leaderboard') => {
    haptics.tap();
    router.navigate({ pathname: `/game/[gameId]/${tab}`, params: { gameId: game.id } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <SectionHeader
          title={toVote > 0 ? 'Da votare' : 'Chiamate'}
          caption={
            toVote > 0
              ? `${toVote} ${toVote === 1 ? 'chiamata aspetta' : 'chiamate aspettano'} il tuo voto`
              : 'Hai votato tutto. Tocca + per chiamare un punto.'
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
            router.push({ pathname: '/call/[eventId]', params: { eventId: call.id } });
          }}
        />
      </View>

      {card && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Carta del giorno: ${card.label}, oggi vale ${card.points * 2} punti. Chiamala.`}
          onPress={() => {
            haptics.press();
            openQuickAction();
          }}
          style={styles.dayCard}>
          <RuleSticker rule={card} size={84} />
          <View style={styles.flex}>
            <AppText variant="micro" color={colors.inkSoft}>
              CARTA DEL GIORNO
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

      {myTeam && game.status !== 'ended' && (
        <View style={styles.section}>
          <SectionHeader title="Il tuo capitano" caption="I suoi punti di oggi contano doppio per la squadra." />
          <View style={styles.card}>
            <View style={styles.teamRow}>
              <View style={[styles.teamDot, { backgroundColor: teamColor(game, myTeam.id) }]} />
              <AppText variant="name">{myTeam.name}</AppText>
            </View>
            <View style={styles.members} accessibilityRole="radiogroup">
              {members.map((p) => {
                const isCaptain = p.id === captainId;
                return (
                  <PressableScale
                    key={p.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isCaptain }}
                    accessibilityLabel={`Capitano: ${p.name}`}
                    onPress={() => {
                      if (isCaptain) return;
                      haptics.press();
                      setCaptain(myTeam.id, p.id);
                      showToast({ text: `${p.id === ME.id ? 'Sei tu' : p.name} il capitano di oggi` });
                    }}
                    style={[styles.member, isCaptain && styles.memberActive]}>
                    <View>
                      <Avatar player={p} size={48} sticker={false} />
                      {isCaptain && (
                        <View style={styles.badge}>
                          <AppText variant="micro">C</AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption" color={isCaptain ? colors.ink : colors.inkSoft}>
                      {p.id === ME.id ? 'Tu' : p.name}
                    </AppText>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader
          title={`${day.label} ${day.index}`}
          caption={today.length ? 'Il podio di oggi. Domani si riparte da zero.' : 'Ancora nessun punto oggi.'}
          action={{ label: 'Classifica', onPress: () => goTo('leaderboard') }}
        />
        {today.length > 0 && (
          <View style={[styles.card, styles.podium]}>
            {[today[1], today[0], today[2]].map((r, i) =>
              r ? (
                <PressableScale
                  key={r.player.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${i === 1 ? 'MVP di oggi' : `${i === 0 ? 2 : 3}° di oggi`}: ${r.player.name}, ${r.points} punti`}
                  onPress={() => openPlayer(r.player.id)}
                  style={[styles.step, i === 1 && styles.stepFirst]}>
                  {i === 1 && (
                    <View style={styles.mvp}>
                      <AppText variant="micro" color={colors.inkInverse}>
                        MVP
                      </AppText>
                    </View>
                  )}
                  <Avatar player={r.player} size={i === 1 ? 64 : 48} sticker={false} />
                  <AppText variant="name" numberOfLines={1}>
                    {r.player.id === ME.id ? 'Tu' : r.player.name}
                  </AppText>
                  <AppText variant="caption" color={r.points > 0 ? colors.bonus : colors.malus}>
                    {r.points > 0 ? `+${r.points}` : r.points}
                  </AppText>
                </PressableScale>
              ) : (
                <View key={i} style={styles.step} />
              ),
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Ultimi punti" action={{ label: 'Vedi tutto', onPress: () => goTo('feed') }} />
        {latest.length ? (
          <View style={styles.list}>
            {latest.map((e) => (
              <FeedItem
                key={e.id}
                event={e}
                now={now}
                player={players.find((p) => p.id === e.playerId)}
                author={players.find((p) => p.id === e.authorId)}
                onOpenPlayer={openPlayer}
              />
            ))}
          </View>
        ) : (
          <AppText variant="body" color={colors.inkSoft}>
            Ancora nessun punto ufficiale. Qualcuno dovrà pur fare la prima figuraccia.
          </AppText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.md },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    paddingRight: layout.card,
    borderWidth: 2,
    borderColor: colors.cta,
    ...shadow.card,
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
    borderWidth: 2,
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
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs },
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
});
