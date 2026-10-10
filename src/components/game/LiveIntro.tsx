import { useRouter } from 'expo-router';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
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
          <Animated.Text entering={ZoomIn.springify().damping(8)} style={styles.emoji}>
            🎬
          </Animated.Text>
          <AppText variant="serifTitle" style={styles.center}>
            Si gioca!
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={[styles.center, styles.regular]}>
            {game.name} è partita. Da adesso tutto succede in Live, il tasto al centro: le chiamate da votare, i punti e
            il + per chiamarne uno.
          </AppText>
          <Button label="Vai al Live" onPress={() => go(true)} />
          <Button label="Dopo" variant="tertiary" onPress={() => go(false)} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  card: {
    width: '100%',
    maxWidth: MAX_APP_WIDTH - space.xl,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: space.lg,
    gap: space.sm,
  },
  emoji: { fontSize: 64, lineHeight: 76, textAlign: 'center' },
  center: { textAlign: 'center' },
  regular: { fontWeight: '400' },
});
