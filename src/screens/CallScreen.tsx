import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp, ZoomIn, ZoomOut } from 'react-native-reanimated';
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
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { timeAgo } from '@/lib/time';
import { nameIn, useGameStore, votesNeeded } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { FeedEvent } from '@/types/game';

const WHITE = '#FFFFFF';
const WHITE_SOFT = 'rgba(255,255,255,0.78)';
/** Le 5 reazioni di base di ogni giocatore; le altre si sbloccano giocando e vincendo */
export const BASE_REACTIONS = ['😂', '🔥', '😱', '👏', '💀'];
const LOCKED_REACTIONS = 3;

/**
 * Storia a tutto schermo: la foto (o lo sticker della carta), la sfumatura scura dal basso
 * e il testo bianco a sinistra. Tocco a destra = storia successiva, a sinistra = precedente.
 * Da votare: "Decido dopo" o "Confermo". Già confermata: si reagisce con un'emoji.
 */
export function CallScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = useGameStore((s) => s.events);
  const event = events.find((e) => e.id === eventId);
  const players = useGameStore((s) => s.players);
  const vote = useGameStore((s) => s.vote);
  const react = useGameStore((s) => s.react);
  const restoreEvent = useGameStore((s) => s.restoreEvent);
  const game = useGameStore((s) => s.games.find((g) => g.id === event?.gameId));
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();
  const [picker, setPicker] = useState(false);
  const [burst, setBurst] = useState<{ emoji: string; key: number }>();

  const close = () =>
    router.canGoBack()
      ? router.back()
      : router.replace(event ? { pathname: '/game/[gameId]', params: { gameId: event.gameId } } : '/');
  const rule = event && ruleById(event.ruleId);
  const player = players.find((p) => p.id === event?.playerId);
  const author = players.find((p) => p.id === event?.authorId);
  const host = players.find((p) => p.id === game?.playerIds[0]);
  if (!event || !rule || !player) return null;

  const confirmed = event.status === 'confirmed';
  // Le chiamate da votare scorrono come storie; un punto già deciso si apre da solo, senza proseguire
  const siblings: FeedEvent[] =
    event.status === 'pending' ? events.filter((e) => e.gameId === event.gameId && e.status === 'pending') : [event];
  const index = siblings.findIndex((e) => e.id === event.id);
  const go = (delta: number) => {
    const next = siblings[index + delta];
    if (!next) return close();
    haptics.tap();
    setPicker(false);
    router.setParams({ eventId: next.id });
  };

  const isBonus = event.points > 0;
  const needed = game ? votesNeeded(game) : 1;
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
    go(1);
  };
  const report = () =>
    confirmAction(
      'Segnalare la chiamata?',
      `${host ? nameIn(game, host) : "L'host"} riceve una notifica e può decidere cosa fare.`,
      'Segnala',
      () => {
        haptics.tap();
        showToast({ text: `Segnalata a ${host ? nameIn(game, host) : "l'host"}` });
      },
    );
  const pick = (emoji: string) => {
    haptics.press();
    react(event.id, emoji);
    setBurst({ emoji, key: Date.now() });
    setPicker(false);
  };
  /** Non si vota su se stessi, e chi chiama ha già votato */
  const lock = confirmed
    ? undefined
    : event.playerId === ME.id
      ? 'Questa chiamata è su di te: decidono gli altri.'
      : event.authorId === ME.id
        ? "L'hai chiamata tu, il tuo voto è già dentro."
        : event.myVote === 'confirm'
          ? 'Hai già confermato. Aspettiamo gli altri.'
          : undefined;
  const reactions = Object.entries(event.reactions ?? {}).filter(([, n]) => n > 0);

  return (
    <View style={styles.screen}>
      {event.photo ? (
        <Animated.View key={event.id} entering={FadeIn.duration(250)} style={StyleSheet.absoluteFill}>
          <Image source={{ uri: event.photo }} style={styles.photo} resizeMode="cover" />
        </Animated.View>
      ) : (
        <View style={styles.noPhoto}>
          <RuleSticker rule={rule} size={220} />
        </View>
      )}
      <Scrim />

      {/* Zone di tocco come Instagram: sinistra indietro, destra avanti */}
      <View style={styles.tapZones}>
        <Pressable style={styles.tapLeft} onPress={() => go(-1)} accessibilityLabel="Storia precedente" />
        <Pressable style={styles.tapRight} onPress={() => go(1)} accessibilityLabel="Storia successiva" />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + space.xs }]} pointerEvents="box-none">
        <View style={styles.progress}>
          {siblings.map((e, i) => (
            <View key={e.id} style={[styles.progressSeg, i <= index && styles.progressOn]} />
          ))}
        </View>
        <View style={styles.topRow} pointerEvents="box-none">
          <PressableScale
            onPress={() => openPlayer(player.id)}
            accessibilityRole="button"
            accessibilityLabel={`Profilo di ${name}`}
            style={styles.who}>
            <Avatar player={player} size={36} sticker={false} />
            <View style={styles.flex}>
              <AppText variant="headline" color={WHITE}>
                {name}
              </AppText>
              <View style={styles.byRow}>
                <AppText variant="micro" color={WHITE_SOFT}>
                  chiamata da {author ? nameIn(game, author) : '—'}, {timeAgo(event.createdAt)}
                </AppText>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="Segnala la chiamata all'host"
                  hitSlop={10}
                  onPress={report}
                  style={styles.flag}>
                  <AppText style={styles.flagText}>!</AppText>
                </PressableScale>
              </View>
            </View>
          </PressableScale>
          <PressableScale onPress={close} accessibilityLabel="Esci dalla storia" hitSlop={12} style={styles.close}>
            <Icon name="close" size={24} color={WHITE} />
          </PressableScale>
        </View>
      </View>

      <Animated.View
        key={`b-${event.id}`}
        entering={FadeInDown.duration(280)}
        pointerEvents="box-none"
        style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <AppText style={[styles.points, { color: isBonus ? '#7CF29A' : '#FF8A80' }]}>
          {isBonus ? `+${event.points}` : event.points} punti{confirmed ? ', confermati' : ''}
        </AppText>
        <AppText variant="serifTitle" color={WHITE}>
          {rule.emoji} {rule.label}
        </AppText>
        <AppText variant="body" color={WHITE_SOFT} style={styles.regular}>
          {rule.description}
        </AppText>

        {!confirmed && (
          <View style={styles.tally} accessibilityLabel={`${event.votes.confirm} conferme su ${needed}`}>
            <View style={styles.bar}>
              {Array.from({ length: needed }, (_, i) => (
                <View key={i} style={[styles.seg, i < event.votes.confirm && styles.segOn]} />
              ))}
            </View>
            <AppText variant="micro" color={WHITE_SOFT}>
              {event.votes.confirm} di {needed} conferme per renderla ufficiale
            </AppText>
          </View>
        )}

        {confirmed && picker && (
          <View style={styles.picker}>
            {BASE_REACTIONS.map((emoji, i) => (
              <Animated.View
                key={emoji}
                entering={ZoomIn.delay(i * 45)
                  .springify()
                  .damping(9)
                  .stiffness(220)}
                exiting={ZoomOut.duration(120)}>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Reagisci con ${emoji}`}
                  pressedScale={0.85}
                  onPress={() => pick(emoji)}
                  style={[styles.bubble, event.myReaction === emoji && styles.bubbleOn]}>
                  <AppText style={styles.bubbleEmoji}>{emoji}</AppText>
                </PressableScale>
              </Animated.View>
            ))}
            {Array.from({ length: LOCKED_REACTIONS }, (_, i) => (
              <Animated.View
                key={`l${i}`}
                entering={ZoomIn.delay((5 + i) * 45)
                  .springify()
                  .damping(9)}>
                <View style={[styles.bubble, styles.bubbleLocked]} accessibilityLabel="Reazione da sbloccare giocando">
                  <Icon name="lock" size={16} color={WHITE_SOFT} />
                </View>
              </Animated.View>
            ))}
          </View>
        )}
        {confirmed ? (
          <View style={styles.reactRow}>
            {reactions.map(([emoji, n]) => (
              <View key={emoji} style={[styles.reactChip, event.myReaction === emoji && styles.reactChipOn]}>
                <AppText style={styles.reactEmoji}>{emoji}</AppText>
                <AppText variant="caption" color={WHITE}>
                  {n}
                </AppText>
              </View>
            ))}
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Reagisci con un'emoji"
              onPress={() => {
                haptics.tap();
                setPicker((v) => !v);
              }}
              style={styles.reactAdd}>
              <AppText style={styles.reactEmoji}>{picker ? '✕' : '☺︎'}</AppText>
            </PressableScale>
          </View>
        ) : lock ? (
          <AppText variant="body" color={WHITE} style={styles.regular}>
            {lock}
          </AppText>
        ) : (
          <View style={styles.row}>
            <Button
              label="Decido dopo"
              variant="secondary"
              onDark
              onPress={() => go(1)}
              style={[styles.flex, styles.ghost]}
            />
            <Button label="Confermo" onPress={confirm} style={styles.flex} />
          </View>
        )}
      </Animated.View>

      {burst && (
        <Animated.View
          key={burst.key}
          entering={ZoomIn.springify().damping(7)}
          exiting={FadeOutUp.duration(500)}
          style={styles.burst}
          pointerEvents="none"
          onLayout={() => setTimeout(() => setBurst(undefined), 600)}>
          <AppText style={styles.burstEmoji}>{burst.emoji}</AppText>
        </Animated.View>
      )}
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
  tapZones: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  tapLeft: { flex: 3 },
  tapRight: { flex: 7 },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: space.md,
    gap: space.sm,
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  progress: { flexDirection: 'row', gap: 3 },
  progressSeg: { flex: 1, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  progressOn: { backgroundColor: WHITE },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.xs },
  byRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: { color: WHITE, fontSize: 10, lineHeight: 12, fontWeight: '700' },
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
  points: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
  regular: { fontWeight: '400' },
  tally: { gap: space.xxs, marginVertical: space.xs },
  bar: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  segOn: { backgroundColor: WHITE },
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  flex: { flex: 1 },
  ghost: { borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'transparent', borderRadius: radius.pill },
  reactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs },
  reactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  reactChipOn: { borderColor: WHITE, backgroundColor: 'rgba(255,255,255,0.15)' },
  reactAdd: {
    width: 44,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactEmoji: { fontSize: 18, lineHeight: 22, color: WHITE },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    padding: space.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(28,28,30,0.85)',
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleOn: { backgroundColor: 'rgba(255,255,255,0.3)' },
  bubbleLocked: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  bubbleEmoji: { fontSize: 26, lineHeight: 32 },
  burst: { position: 'absolute', top: '35%', alignSelf: 'center' },
  burstEmoji: { fontSize: 96, lineHeight: 110 },
});
