import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Scrim } from '@/components/ui/Scrim';
import { ME } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { timeAgo } from '@/lib/time';
import { nameIn, useGameStore, votesNeeded } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

const WHITE = '#FFFFFF';
const WHITE_SOFT = 'rgba(255,255,255,0.78)';

/**
 * Una chiamata da votare, come una storia: la foto a tutto schermo, una sfumatura scura dal basso
 * e sopra, in bianco e allineati a sinistra, carta, punti e voti. Due scelte: confermi o decidi dopo.
 * Si esce con la X; "Segnala" avvisa l'host.
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
  const host = players.find((p) => p.id === game?.playerIds[0]);
  if (!event || !rule || !player) return null;

  const isBonus = event.points > 0;
  const needed = game ? votesNeeded(game) : 1;
  const voters = game ? game.playerIds.length - 1 : 1;
  const name = nameIn(game, player);

  const confirm = () => {
    const before = event;
    vote(event.id, 'confirm');
    haptics.bonus();
    const after = useGameStore.getState().events.find((e) => e.id === event.id);
    const missing = needed - (after?.votes.confirm ?? 0);
    showToast({
      text:
        after?.status === 'confirmed'
          ? `Punto ufficiale: ${isBonus ? '+' : ''}${event.points} a ${name}`
          : `Confermato. ${missing === 1 ? 'Manca 1 voto' : `Mancano ${missing} voti`}`,
      action: { label: 'Annulla', onPress: () => restoreEvent(before, event.id) },
    });
    close();
  };
  const report = () => {
    haptics.tap();
    showToast({ text: `Segnalata a ${host ? nameIn(game, host) : "l'host"}, che deciderà cosa fare` });
    close();
  };
  /** Non si vota su se stessi, e chi chiama ha già votato */
  const lock =
    event.playerId === ME.id
      ? 'Questa chiamata è su di te: decidono gli altri.'
      : event.authorId === ME.id
        ? "L'hai chiamata tu, il tuo voto è già dentro."
        : event.myVote === 'confirm'
          ? 'Hai già confermato. Aspettiamo gli altri.'
          : undefined;

  return (
    <View style={styles.screen}>
      {event.photo ? (
        <Animated.View entering={FadeIn.duration(300)} style={StyleSheet.absoluteFill}>
          <Image source={{ uri: event.photo }} style={styles.photo} resizeMode="cover" />
        </Animated.View>
      ) : (
        <View style={styles.noPhoto}>
          <RuleSticker rule={rule} size={220} />
        </View>
      )}
      <Scrim />

      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <PressableScale
          onPress={() => openPlayer(player.id)}
          accessibilityRole="button"
          accessibilityLabel={`Profilo di ${name}`}
          style={styles.who}>
          <Avatar player={player} size={36} sticker={false} />
          <View>
            <AppText variant="headline" color={WHITE}>
              {name}
            </AppText>
            <AppText variant="micro" color={WHITE_SOFT}>
              chiamata da {author ? nameIn(game, author) : '—'}, {timeAgo(event.createdAt)}
            </AppText>
          </View>
        </PressableScale>
        <PressableScale onPress={close} accessibilityLabel="Esci dalla storia" hitSlop={12} style={styles.close}>
          <Icon name="close" size={24} color={WHITE} />
        </PressableScale>
      </View>

      <Animated.View
        entering={FadeInDown.delay(120).duration(320)}
        style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <AppText style={[styles.points, { color: isBonus ? '#7CF29A' : '#FF8A80' }]}>
          {isBonus ? `+${event.points}` : event.points} punti
        </AppText>
        <AppText variant="serifTitle" color={WHITE}>
          {rule.emoji} {rule.label}
        </AppText>
        <AppText variant="body" color={WHITE_SOFT} style={styles.regular}>
          {rule.description}
        </AppText>

        <View
          style={styles.tally}
          accessibilityLabel={`${event.votes.confirm} conferme su ${voters}, ne servono ${needed}`}>
          <View style={styles.bar}>
            {Array.from({ length: voters }, (_, i) => (
              <View key={i} style={[styles.seg, i < event.votes.confirm && styles.segOn]} />
            ))}
          </View>
          <AppText variant="micro" color={WHITE_SOFT}>
            {event.votes.confirm} di {needed} conferme per renderla ufficiale
          </AppText>
        </View>

        {lock ? (
          <AppText variant="body" color={WHITE} style={styles.regular}>
            {lock}
          </AppText>
        ) : (
          <View style={styles.row}>
            <Button label="Confermo" onPress={confirm} style={styles.flex} />
            <Button
              label="Decido dopo"
              variant="secondary"
              onDark
              onPress={close}
              style={[styles.flex, styles.ghost]}
            />
          </View>
        )}
        <PressableScale accessibilityRole="button" onPress={report} hitSlop={8} style={styles.report}>
          <AppText variant="caption" color={WHITE_SOFT}>
            Segnala la chiamata all'host
          </AppText>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1C1C1E' },
  photo: { width: '100%', height: '100%' },
  noPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 220,
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.xs },
  close: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: space.sm,
    paddingHorizontal: space.lg,
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  points: { fontSize: 18, lineHeight: 22, fontWeight: '700' },
  regular: { fontWeight: '400' },
  tally: { gap: space.xxs, marginVertical: space.xs },
  bar: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  segOn: { backgroundColor: WHITE },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  ghost: { borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'transparent', borderRadius: radius.pill },
  report: { alignSelf: 'flex-start', paddingVertical: space.xs },
});
