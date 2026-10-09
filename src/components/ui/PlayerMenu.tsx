import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { PressableScale } from './PressableScale';

import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Menù rapido su un giocatore, in stile Clash of Clans: una piccola scheda
 * che salta fuori con tre bottoni "a mattoncino" (bordo spesso sotto).
 */
export function PlayerMenu() {
  const menu = useUiStore((s) => s.playerMenu);
  const close = useUiStore((s) => s.closePlayerMenu);
  const showToast = useUiStore((s) => s.showToast);
  const players = useGameStore((s) => s.players);
  const friendships = useGameStore((s) => s.friendships);
  const setFriendship = useGameStore((s) => s.setFriendship);
  const router = useRouter();

  const player = players.find((p) => p.id === menu?.playerId);
  if (!menu || !player) return null;
  const status = friendships[player.id] ?? 'none';

  const go = (focus?: 'formazione') => {
    haptics.tap();
    close();
    router.push({
      pathname: '/player/[playerId]',
      params: { playerId: player.id, ...(menu.gameId ? { gameId: menu.gameId } : {}), ...(focus ? { focus } : {}) },
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} style={styles.overlay}>
      <Pressable accessibilityLabel="Chiudi" style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View entering={ZoomIn.springify().damping(13)} style={styles.card} accessibilityViewIsModal>
        <View style={styles.head}>
          <Avatar player={player} size={56} sticker={false} />
          <View style={styles.flex}>
            <AppText variant="title">{player.name}</AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              @{player.handle}
              {status === 'friends' ? ' · amici' : ''}
            </AppText>
          </View>
        </View>
        {menu.gameId && <Brick label="Guarda formazione" tone="cta" onPress={() => go('formazione')} />}
        <Brick label="Guarda profilo" tone="plain" onPress={() => go()} />
        {status === 'none' && (
          <Brick
            label="Chiedi l'amicizia"
            tone="green"
            onPress={() => {
              haptics.bonus();
              setFriendship(player.id, 'sent');
              showToast({
                text: `Richiesta inviata a ${player.name}`,
                action: { label: 'Annulla', onPress: () => setFriendship(player.id, 'none') },
              });
              close();
            }}
          />
        )}
        {status === 'sent' && (
          <AppText variant="caption" color={colors.inkSoft} style={styles.note}>
            Richiesta d'amicizia in attesa
          </AppText>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const TONES = {
  cta: { bg: colors.cta, edge: '#D9B54A', ink: colors.ink },
  plain: { bg: colors.surface, edge: '#C7C7CC', ink: colors.ink },
  green: { bg: '#5BD13F', edge: '#3E9B2A', ink: colors.inkInverse },
} as const;

/** Bottone "a mattoncino": bordo più scuro sotto, si schiaccia quando lo premi. */
function Brick({ label, tone, onPress }: { label: string; tone: keyof typeof TONES; onPress: () => void }) {
  const t = TONES[tone];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      pressedScale={0.96}
      style={[styles.brick, { backgroundColor: t.bg, borderColor: t.edge }]}>
      <AppText variant="headline" color={t.ink}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
    zIndex: 50,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: space.md,
    gap: space.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  flex: { flex: 1 },
  regular: { fontWeight: '400' },
  brick: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { textAlign: 'center', fontWeight: '400' },
});
