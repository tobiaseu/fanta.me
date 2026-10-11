import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { PLAYER_CARD_EDGE, PLAYER_CARD_TINT } from '@/components/cards/PlayerCard';
import type { CardState } from '@/components/cards/CardSheet';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
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
          <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.stack}>
            <View style={styles.card}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Chiudi"
                hitSlop={12}
                onPress={onClose}
                style={styles.close}>
                <Icon name="close" size={16} />
              </PressableScale>
              <Avatar player={player} size={112} sticker={false} />
              <AppText variant="serifTitle" style={styles.centerText} numberOfLines={1}>
                {name}
              </AppText>
              {handle ? (
                <AppText variant="body" color={colors.inkSoft}>
                  @{handle}
                </AppText>
              ) : null}
            </View>
            {state ? (
              <View style={styles.state}>
                {state.tone && state.tone !== 'neutral' ? (
                  <Icon
                    name={state.tone === 'locked' ? 'lock' : 'check'}
                    size={14}
                    color={state.tone === 'ok' ? colors.bonusBright : 'rgba(255,255,255,0.75)'}
                  />
                ) : null}
                <AppText variant="caption" color="rgba(255,255,255,0.85)" style={styles.centerText}>
                  {state.text}
                </AppText>
              </View>
            ) : null}
            {primary && <Button label={primary.label} onPress={run(primary)} />}
            {secondary && <Button label={secondary.label} variant="secondary" onDark onPress={run(secondary)} />}
            {onProfile && (
              <Button
                label="Vedi il profilo"
                variant="tertiary"
                onDark
                onPress={run({ label: '', onPress: onProfile })}
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
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  stack: { width: '100%', maxWidth: 320, gap: space.sm },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    backgroundColor: PLAYER_CARD_TINT,
    borderColor: PLAYER_CARD_EDGE,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    padding: space.md,
  },
  close: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: space.sm },
  centerText: { textAlign: 'center' },
});
