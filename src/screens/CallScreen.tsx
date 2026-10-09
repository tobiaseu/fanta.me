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
import { useGameStore } from '@/store/useGameStore';
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

  const close = () =>
    router.canGoBack()
      ? router.back()
      : router.replace(event ? { pathname: '/game/[gameId]', params: { gameId: event.gameId } } : '/');
  const rule = event && ruleById(event.ruleId);
  const player = players.find((p) => p.id === event?.playerId);
  const author = players.find((p) => p.id === event?.authorId);
  if (!event || !rule || !player) return null;

  const isBonus = event.points > 0;
  const cast = (v: Vote) => {
    vote(event.id, v);
    if (v === 'confirm') haptics.bonus();
    else haptics.malus();
    close();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Avatar player={player} size={40} sticker={false} />
        <View style={styles.flex}>
          <AppText variant="name">{player.name}</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            chiamato da <AppText variant="body" color={colors.inkMuted} style={styles.bold}>{author?.name ?? '—'}</AppText>
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
        {event.myVote && (
          <AppText variant="caption" color={colors.inkFaint}>
            Hai già votato: {event.myVote === 'confirm' ? 'confermata' : 'rifiutata'}. Puoi cambiare idea.
          </AppText>
        )}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <View style={styles.row}>
          <Button label="Rifiuta" variant="reject" onPress={() => cast('reject')} style={styles.flex} />
          <Button label="Conferma" variant="confirm" onPress={() => cast('confirm')} style={styles.flex} />
        </View>
        <Button label="Ignora" variant="secondary" onPress={close} />
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
});
