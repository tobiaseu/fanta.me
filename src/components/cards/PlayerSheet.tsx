import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { CardState } from '@/components/cards/CardSheet';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { ActionRow, CardGlow } from '@/components/ui/ActionRow';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

type Action = { label: string; onPress: () => void };

/**
 * Carta giocatore aperta: stessa grammatica della carta del mazzo.
 * Carta, riga di stato, azione principale (gialla), alternativa, link al profilo.
 */
export function PlayerSheet({
  player,
  name,
  handle,
  state,
  primary,
  secondary,
  onProfile,
  onClose,
}: {
  player?: Player;
  name: string;
  handle?: string;
  state?: CardState;
  primary?: Action;
  secondary?: Action;
  onProfile?: () => void;
  onClose: () => void;
}) {
  const run = (a: Action) => () => {
    a.onPress();
    onClose();
  };
  return (
    <Modal visible={!!player} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi" />
      {player && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.card}>
            <CardGlow id={`p-${player.id}`} cy={50} />
            <View style={styles.top}>
              <View style={styles.kind}>
                <AppText variant="micro" color={colors.inkSoft} style={styles.bold}>
                  Giocatore
                </AppText>
              </View>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Chiudi"
                hitSlop={12}
                onPress={onClose}
                style={styles.close}>
                <Icon name="close" size={16} />
              </PressableScale>
            </View>
            <View style={styles.art}>
              <Avatar player={player} size={120} sticker={false} />
            </View>
            <View>
              <AppText variant="headline" style={styles.title} numberOfLines={1}>
                {name}
              </AppText>
              {handle ? (
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  @{handle}
                </AppText>
              ) : null}
            </View>
            {state ? (
              <View style={styles.state}>
                {state.tone && state.tone !== 'neutral' ? (
                  <Icon
                    name={state.tone === 'locked' ? 'lock' : 'check'}
                    size={12}
                    color={state.tone === 'ok' ? colors.bonus : colors.inkSoft}
                  />
                ) : null}
                <AppText variant="micro" color={colors.inkSoft} style={styles.flexText}>
                  {state.text}
                </AppText>
              </View>
            ) : null}
            {primary || secondary ? (
              <ActionRow
                primary={primary && { label: primary.label, onPress: run(primary) }}
                secondary={secondary && { label: secondary.label, onPress: run(secondary) }}
              />
            ) : null}
            {onProfile && (
              <Button
                label="Vedi il profilo"
                variant={primary || secondary ? 'tertiary' : 'secondary'}
                onPress={run({ label: '', onPress: onProfile })}
                style={styles.link}
              />
            )}
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.md },
  card: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 63 / 88,
    backgroundColor: colors.surface,
    borderRadius: 28,
    overflow: 'hidden',
    padding: space.md,
    gap: space.xs,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kind: {
    height: 26,
    paddingHorizontal: space.sm,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  state: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flexText: { flexShrink: 1 },
  link: { height: 36 },
  bold: { fontWeight: '700' },
  regular: { fontWeight: '400' },
});
