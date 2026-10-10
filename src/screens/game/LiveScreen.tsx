import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { ActivePowers } from '@/components/game/ActivePowers';
import { FeedItem } from '@/components/game/FeedItem';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { LockedState } from '@/components/game/LockedState';
import { StoriesRow } from '@/components/game/StoriesRow';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { Scrim } from '@/components/ui/Scrim';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ruleById } from '@/data/rules';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useNow } from '@/hooks/useNow';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { FeedEvent, Player } from '@/types/game';

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
  const [view, setView] = useState<'list' | 'grid'>('list');

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
            <SectionHeader title="Fantapoteri in gioco" />
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
              {(['list', 'grid'] as const).map((v) => (
                <PressableScale
                  key={v}
                  accessibilityRole="tab"
                  accessibilityLabel={v === 'list' ? 'Vista a lista' : 'Vista a griglia'}
                  accessibilityState={{ selected: view === v }}
                  onPress={() => {
                    haptics.tap();
                    setView(v);
                  }}
                  style={[styles.toggleBtn, view === v && styles.toggleOn]}>
                  <Icon name={v} size={18} color={view === v ? colors.ink : colors.inkSoft} />
                </PressableScale>
              ))}
            </View>
          </View>
          {feed.length && view === 'grid' ? (
            <View style={styles.grid}>
              {feed.map((e) => (
                <Tile
                  key={e.id}
                  event={e}
                  player={players.find((p) => p.id === e.playerId)}
                  onPress={() => open(e.id)}
                />
              ))}
            </View>
          ) : feed.length ? (
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
            <EmptyNote emoji="🫣" title="Ancora nessun punto" body="Qualcuno dovrà pur fare la prima figuraccia." />
          )}
        </View>
      </ScrollView>
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
  list: { gap: space.sm },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, padding: 2 },
  toggleBtn: { width: 36, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    width: '48%',
    flexGrow: 1,
    aspectRatio: 3 / 4,
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
});

/** Riquadro della vista a griglia: la foto del momento (o l'emoji della carta), chi e quanti punti. */
function Tile({ event, player, onPress }: { event: FeedEvent; player?: Player; onPress: () => void }) {
  const rule = ruleById(event.ruleId);
  const photo = Boolean(event.photo);
  const ink = photo ? '#fff' : colors.ink;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${rule?.label ?? 'Punto'}, ${player?.name ?? ''}, ${event.points} punti`}
      onPress={onPress}
      style={[styles.tile, event.status === 'rejected' && styles.rejected]}>
      {photo ? (
        <>
          <Image source={{ uri: event.photo }} style={styles.tileFill} />
          <Scrim height="60%" strength={0.75} />
        </>
      ) : (
        <AppText style={styles.tileEmoji}>{rule?.emoji ?? '✨'}</AppText>
      )}
      <View style={styles.tileText}>
        <AppText variant="name" color={ink} numberOfLines={2}>
          {rule?.label ?? 'Punto'}
        </AppText>
        <AppText variant="micro" color={photo ? 'rgba(255,255,255,0.85)' : colors.inkSoft} numberOfLines={1}>
          {player?.name} · {event.points > 0 ? '+' : ''}
          {event.points} pt{event.status === 'rejected' ? ' · respinto' : ''}
        </AppText>
      </View>
    </PressableScale>
  );
}
