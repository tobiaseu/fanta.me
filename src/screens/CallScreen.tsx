import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { ME } from '@/data/mock';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { useGameStore, votesNeeded } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';
import type { Vote } from '@/types/game';

/**
 * "Conferma punto" del Figma: una chiamata del gruppo da votare.
 * Sticker + nome serif della carta + descrizione + punti, poi Rifiuta / Conferma / Ignora.
 */
export function CallScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const event = useGameStore((s) => s.events.find((e) => e.id === eventId));
  const players = useGameStore((s) => s.players);
  const vote = useGameStore((s) => s.vote);
  const restoreEvent = useGameStore((s) => s.restoreEvent);
  const game = useGameStore((s) => s.games.find((g) => g.id === event?.gameId));
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();

  const close = () =>
    router.canGoBack()
      ? router.back()
      : router.replace(event ? { pathname: '/game/[gameId]', params: { gameId: event.gameId } } : '/');
  const rule = event && ruleById(event.ruleId);
  const player = players.find((p) => p.id === event?.playerId);
  const author = players.find((p) => p.id === event?.authorId);
  if (!event || !rule || !player) return null;

  const isBonus = event.points > 0;
  const needed = game ? votesNeeded(game) : 1;
  const voters = game ? game.playerIds.length - 1 : 1;
  const cast = (v: Vote) => {
    const before = event;
    vote(event.id, v);
    if (v === 'confirm') haptics.bonus();
    else haptics.malus();
    const after = useGameStore.getState().events.find((e) => e.id === event.id);
    const text =
      after?.status === 'confirmed'
        ? `Punto ufficiale: ${isBonus ? '+' : ''}${event.points} a ${player.name}`
        : after?.status === 'rejected'
          ? 'Chiamata scartata dal gruppo'
          : `Voto registrato. ${needed - (after?.votes[v] ?? 0) === 1 ? 'Manca 1 voto' : `Mancano ${needed - (after?.votes[v] ?? 0)} voti`}`;
    showToast({ text, action: { label: 'Annulla', onPress: () => restoreEvent(before, event.id) } });
    close();
  };
  /** Non si vota su se stessi, e chi chiama ha già votato */
  const lock =
    event.playerId === ME.id
      ? 'Questa chiamata è su di te: decidono gli altri.'
      : event.authorId === ME.id
        ? "L'hai chiamata tu, il tuo voto è già dentro."
        : undefined;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.head}>
        <PressableScale
          onPress={() => openPlayer(player.id)}
          accessibilityRole="button"
          accessibilityLabel={`Profilo di ${player.name}`}>
          <Avatar player={player} size={40} sticker={false} />
        </PressableScale>
        <View style={styles.flex}>
          <AppText variant="name" onPress={() => openPlayer(player.id)}>
            {player.name}
          </AppText>
          <AppText variant="body" color={colors.inkMuted}>
            chiamato da{' '}
            <AppText variant="body" color={colors.inkMuted} style={styles.bold}>
              {author?.name ?? '—'}
            </AppText>
          </AppText>
        </View>
        <PressableScale onPress={close} accessibilityLabel="Chiudi" hitSlop={12} style={styles.close}>
          <Icon name="close" size={24} strokeWidth={1.8} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <RuleSticker rule={rule} size={260} />
        </Animated.View>
        <AppText variant="serifTitle" style={styles.center}>
          {rule.label}
        </AppText>
        <AppText variant="body" style={[styles.center, styles.description]}>
          {rule.description}
        </AppText>
        <AppText style={[styles.points, { color: isBonus ? colors.bonusBright : colors.malus }]}>
          {isBonus ? `+${event.points}` : event.points} pt
        </AppText>
        <View
          style={styles.tally}
          accessibilityLabel={`${event.votes.confirm} conferme e ${event.votes.reject} rifiuti su ${voters} votanti`}>
          <View style={styles.bar}>
            <View style={[styles.barFill, { flex: event.votes.confirm, backgroundColor: colors.bonusBright }]} />
            <View
              style={[
                styles.barFill,
                {
                  flex: Math.max(0, voters - event.votes.confirm - event.votes.reject),
                  backgroundColor: colors.placeholder,
                },
              ]}
            />
            <View style={[styles.barFill, { flex: event.votes.reject, backgroundColor: colors.malus }]} />
          </View>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            {event.votes.confirm} sì, {event.votes.reject} no. Ne servono {needed} su {voters} per decidere.
          </AppText>
        </View>
        {event.myVote && !lock && (
          <AppText variant="caption" color={colors.inkFaint}>
            Hai già votato: {event.myVote === 'confirm' ? 'confermata' : 'rifiutata'}. Puoi cambiare idea.
          </AppText>
        )}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        {lock ? (
          <AppText variant="body" color={colors.inkSoft} style={[styles.center, styles.regular]}>
            {lock}
          </AppText>
        ) : (
          <View style={styles.row}>
            <Button label="Rifiuta" variant="reject" onPress={() => cast('reject')} style={styles.flex} />
            <Button label="Conferma" variant="confirm" onPress={() => cast('confirm')} style={styles.flex} />
          </View>
        )}
        <PressableScale accessibilityRole="button" onPress={close} hitSlop={8} style={styles.later}>
          <AppText variant="headline" color={colors.inkSoft}>
            {lock ? 'Chiudi' : 'Decido dopo'}
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: {
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  center: { textAlign: 'center' },
  description: { fontWeight: '400', lineHeight: 21 },
  points: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  actions: {
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  row: { flexDirection: 'row', gap: space.md },
  later: { alignSelf: 'center', paddingVertical: space.xs },
  regular: { fontWeight: '400' },
  tally: { alignSelf: 'stretch', gap: space.xs, alignItems: 'center' },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', alignSelf: 'stretch', gap: 2 },
  barFill: { height: 8 },
});
