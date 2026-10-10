import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Button } from './Button';

import { haptics } from '@/lib/haptics';
import { nameIn, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Menù rapido su un giocatore: una piccola scheda che salta fuori (stile Clash)
 * con al massimo tre azioni, una sola gialla.
 */
export function PlayerMenu() {
  const menu = useUiStore((s) => s.playerMenu);
  const close = useUiStore((s) => s.closePlayerMenu);
  const showToast = useUiStore((s) => s.showToast);
  const players = useGameStore((s) => s.players);
  const games = useGameStore((s) => s.games);
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
            <AppText variant="title">
              {nameIn(
                games.find((g) => g.id === menu.gameId),
                player,
              )}
            </AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              @{player.handle}
              {status === 'friends' ? ' · amici' : ''}
            </AppText>
          </View>
        </View>
        {menu.gameId && <Button label="Guarda formazione" variant="primary" onPress={() => go('formazione')} />}
        <Button label="Guarda profilo" variant={menu.gameId ? 'secondary' : 'primary'} onPress={() => go()} />
        {status === 'none' && (
          <Button
            label="Chiedi l'amicizia"
            variant="secondary"
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
    padding: space.md,
    gap: space.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  flex: { flex: 1 },
  regular: { fontWeight: '400' },
  note: { textAlign: 'center', fontWeight: '400' },
});
