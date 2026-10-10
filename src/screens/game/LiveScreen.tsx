import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { ActivePowers } from '@/components/game/ActivePowers';
import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { LockedState } from '@/components/game/LockedState';
import { StoriesRow } from '@/components/game/StoriesRow';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

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

  const { calls, feed } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id);
    return {
      calls: mine.filter((e) => e.status === 'pending').sort((a, b) => Number(!!a.myVote) - Number(!!b.myVote)),
      feed: mine.filter((e) => e.status !== 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }, [events, game?.id]);

  if (!game) return null;
  if (game.status === 'waiting')
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <LockedState
          game={game}
          title="Qui si gioca"
          points={[
            'Le chiamate da votare, come storie con la foto',
            'Il feed di tutti i punti, con le reazioni',
            'Il + per chiamare un punto quando succede qualcosa',
          ]}
        />
      </ScrollView>
    );

  const live = game.status === 'live';
  const toVote = calls.filter((c) => !c.myVote && c.playerId !== ME.id && c.authorId !== ME.id).length;
  const open = (id: string) => router.push({ pathname: '/call/[eventId]', params: { eventId: id } });

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {live && (
          <View style={styles.section}>
            <SectionHeader
              title={toVote > 0 ? 'Da votare' : 'Chiamate'}
              caption={
                toVote > 0
                  ? `${toVote} ${toVote === 1 ? 'chiamata aspetta' : 'chiamate aspettano'} il tuo voto`
                  : calls.length
                    ? 'Hai votato tutto. Aspettiamo gli altri.'
                    : 'Nessuna chiamata aperta. Usa il + quando succede qualcosa.'
              }
            />
            {calls.length > 0 && (
              <StoriesRow
                calls={calls}
                players={players}
                onOpen={(call) => {
                  haptics.tap();
                  open(call.id);
                }}
              />
            )}
          </View>
        )}
        {live && (
          <View style={styles.section}>
            <SectionHeader title="Fantapoteri in gioco" />
            <ActivePowers game={game} now={now} />
          </View>
        )}
        <View style={styles.section}>
          <SectionHeader
            title={live ? 'Tutti i punti' : 'Com’è andata'}
            caption={`${feed.filter((e) => e.status === 'confirmed').length} confermati, dal più recente. Tocca un punto per aprirlo e reagire.`}
          />
          {feed.length ? (
            <View style={styles.list}>
              {feed.map((e) => (
                <Animated.View key={e.id} layout={LinearTransition.springify()}>
                  <FeedItem
                    event={e}
                    now={now}
                    detailed
                    player={players.find((p) => p.id === e.playerId)}
                    author={players.find((p) => p.id === e.authorId)}
                    onOpenPlayer={openPlayer}
                    onPress={() => open(e.id)}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <AppText variant="body" color={colors.inkSoft}>
              Ancora nessun punto. Qualcuno dovrà pur fare la prima figuraccia.
            </AppText>
          )}
        </View>
      </ScrollView>
      {live && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Chiama un punto"
          onPress={() => {
            haptics.press();
            openQuickAction();
          }}
          pressedScale={0.9}
          style={styles.fab}>
          <Icon name="plus" size={22} />
          <AppText variant="headline">Chiama un punto</AppText>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE + 72,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  section: { gap: space.sm },
  list: { gap: space.sm },
  fab: {
    position: 'absolute',
    right: layout.gutter,
    bottom: TAB_BAR_SPACE - space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 52,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.cta,
    ...shadow.floating,
  },
});
