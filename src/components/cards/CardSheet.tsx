import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { cardTone } from '@/components/cards/DeckCard';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { RULE_CATEGORIES } from '@/data/rules';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Player, Rule } from '@/types/game';

interface Props {
  rule?: Rule;
  author?: Player;
  /** Riga di stato sotto la carta (es. "Nel mazzo", "2 su 3 mi piace") */
  status?: string;
  action?: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'dark' };
  onClose: () => void;
}

/** Carta ingrandita al tocco, come l'anteprima delle carte in Clash Royale. */
export function CardSheet({ rule, author, status, action, onClose }: Props) {
  const tone = rule ? cardTone(rule) : undefined;
  const cat = rule && RULE_CATEGORIES.find((c) => c.id === rule.categoryId);
  return (
    <Modal visible={!!rule} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi" />
      {rule && tone && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify().damping(16)} style={[styles.card, { borderColor: tone.edge }]}>
            <View style={styles.top}>
              <View style={[styles.gem, { backgroundColor: tone.gem }]}>
                <AppText variant="headline" color={colors.inkInverse}>
                  {rule.points > 0 ? `+${rule.points}` : rule.points}
                </AppText>
              </View>
              <AppText variant="micro" color={colors.inkSoft}>
                {rule.authorId
                  ? `CARTA DI ${author?.name.toUpperCase() ?? 'UN AMICO'}`
                  : `${cat?.emoji} ${cat?.label.toUpperCase()}`}
              </AppText>
            </View>
            <View style={[styles.art, { backgroundColor: tone.fill }]}>
              <RuleSticker rule={rule} size={150} />
            </View>
            <AppText variant="serifTitle" style={styles.centerText}>
              {rule.label}
            </AppText>
            <AppText variant="body" color={colors.inkSoft} style={styles.centerText}>
              {rule.description}
            </AppText>
            {status ? (
              <AppText variant="caption" color={colors.inkSoft} style={styles.centerText}>
                {status}
              </AppText>
            ) : null}
            {action && (
              <Button
                label={action.label}
                variant={action.variant}
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
              />
            )}
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: {
    width: '100%',
    maxWidth: MAX_APP_WIDTH - space.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 4,
    padding: space.md,
    gap: space.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gem: {
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingVertical: space.md },
  centerText: { textAlign: 'center' },
});
