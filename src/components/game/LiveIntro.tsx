import { useRouter } from 'expo-router';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { ActionRow, CardGlow } from '@/components/ui/ActionRow';
import { haptics } from '@/lib/haptics';
import { useSessionStore } from '@/store/useSessionStore';
import { colors, MAX_APP_WIDTH, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Il momento "Si gioca!", una volta sola per partita: spiega che da adesso tutto succede in Live. */
export function LiveIntro({ game }: { game: Game }) {
  const router = useRouter();
  const seen = useSessionStore((s) => (s.liveIntroSeen ?? []).includes(game.id));
  const mark = useSessionStore((s) => s.markLiveIntro);
  const visible = game.status === 'live' && !seen;
  const go = (toLive: boolean) => {
    haptics.bonus();
    mark(game.id);
    if (toLive) router.navigate({ pathname: '/game/[gameId]/live', params: { gameId: game.id } });
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => go(false)}>
      <Animated.View entering={FadeIn.duration(250)} style={styles.backdrop}>
        <View style={styles.card}>
          <CardGlow id="live-intro" cy={48} />
          <View style={styles.art}>
            <Animated.Text entering={ZoomIn.springify().damping(8)} style={styles.emoji}>
              🎬
            </Animated.Text>
          </View>
          <AppText variant="serifTitle" style={styles.center}>
            Si gioca!
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={[styles.center, styles.regular]}>
            {game.name} è partita. Da adesso tutto succede in Live, il tasto al centro: le chiamate da votare, i punti e
            il + per chiamarne uno.
          </AppText>
          <ActionRow
            secondary={{ label: 'Dopo', onPress: () => go(false) }}
            primary={{ label: 'Vai al Live', onPress: () => go(true) }}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,12,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  card: {
    width: '100%',
    maxWidth: Math.min(340, MAX_APP_WIDTH - space.xl),
    aspectRatio: 63 / 88,
    backgroundColor: colors.surface,
    borderRadius: 28,
    overflow: 'hidden',
    padding: space.lg,
    gap: space.sm,
  },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 96, lineHeight: 112, textAlign: 'center' },
  center: { textAlign: 'center' },
  regular: { fontWeight: '400' },
});
