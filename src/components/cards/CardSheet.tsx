import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { cardTone } from '@/components/cards/DeckCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { RULE_CATEGORIES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Player, Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

interface Props {
  rule?: Rule;
  author?: Player;
  /** Riga di stato sotto la carta (es. "Nel mazzo", "2 su 3 mi piace") */
  status?: string;
  action?: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'tertiary'; disabled?: boolean };
  onClose: () => void;
}

/**
 * Carta ingrandita al tocco: stessa proporzione della carta piccola (0,78),
 * X in alto a destra e chiusura anche toccando fuori.
 * Sotto: l'azione della schermata e "Salva nelle mie carte" per le partite future.
 */
export function CardSheet({ rule, author, status, action, onClose }: Props) {
  const saved = useGameStore((s) => (rule ? s.savedRuleIds.includes(rule.id) : false));
  const toggleSaved = useGameStore((s) => s.toggleSaved);
  const showToast = useUiStore((s) => s.showToast);
  const tone = rule ? cardTone(rule) : undefined;
  const cat = rule && RULE_CATEGORIES.find((c) => c.id === rule.categoryId);

  return (
    <Modal visible={!!rule} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi la carta" />
      {rule && tone && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.stack}>
            <View style={[styles.card, { borderColor: tone.edge }]}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Chiudi"
                hitSlop={10}
                onPress={onClose}
                style={styles.close}>
                <Icon name="close" size={16} />
              </PressableScale>
              <View style={[styles.gem, { borderColor: tone.gem }]}>
                <AppText variant="headline" color={tone.gem}>
                  {rule.points > 0 ? `+${rule.points}` : rule.points}
                </AppText>
              </View>

              {/* Illustrazione in un riquadro tenue, poi nome, regola e tag in fondo */}
              <View
                style={[styles.art, { backgroundColor: rule.points > 0 ? colors.liveSoft : 'rgba(255, 59, 48, 0.1)' }]}>
                <Text style={styles.emoji} allowFontScaling={false}>
                  {rule.emoji}
                </Text>
              </View>
              <View style={styles.text}>
                <AppText variant="serifTitle" style={styles.title} numberOfLines={2}>
                  {rule.label}
                </AppText>
                <AppText variant="body" color={colors.inkSoft} style={styles.regular} numberOfLines={3}>
                  {rule.description}
                </AppText>
              </View>
              <View style={styles.tags}>
                <Tag label={rule.authorId ? `Carta di ${author?.name ?? 'un amico'}` : `${cat?.emoji} ${cat?.label}`} />
                <Tag label={rule.trophy ? '🏆 Solo il primo' : 'Cumulabile'} gold={rule.trophy} />
              </View>
            </View>

            {status ? (
              <View style={styles.status}>
                <AppText variant="caption" color={colors.inkInverse} style={styles.centerText}>
                  {status}
                </AppText>
              </View>
            ) : null}
            {action && (
              <Button
                label={action.label}
                variant={action.variant ?? 'primary'}
                disabled={action.disabled}
                onDark
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
              />
            )}
            <PressableScale
              accessibilityRole="button"
              accessibilityState={{ selected: saved }}
              onPress={() => {
                haptics.tap();
                const now = toggleSaved(rule.id);
                showToast({ text: now ? `${rule.label} salvata nelle tue carte` : 'Tolta dalle tue carte' });
              }}
              style={styles.save}>
              <Icon name={saved ? 'check' : 'plus'} size={16} color={colors.inkInverse} />
              <AppText variant="caption" color={colors.inkInverse}>
                {saved ? 'Salvata nelle tue carte' : 'Salva nelle mie carte'}
              </AppText>
            </PressableScale>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

function Tag({ label, gold }: { label: string; gold?: boolean }) {
  return (
    <View style={[styles.tag, gold && styles.tagGold]}>
      <AppText variant="micro" color={gold ? '#9A7200' : colors.inkSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { flex: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: space.xs },
  regular: { fontWeight: '400' },
  status: {
    alignSelf: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagGold: { borderColor: '#D4A017' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  stack: { width: '100%', maxWidth: 320, gap: space.sm },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.sm,
    paddingTop: space.xxl + space.xs,
    gap: space.sm,
  },
  close: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  gem: {
    position: 'absolute',
    top: space.sm,
    left: space.sm,
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: space.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 76, lineHeight: 90, fontFamily: EMOJI_FONT },
  text: { gap: 4, alignSelf: 'stretch', paddingHorizontal: space.xxs },
  title: { fontSize: 24, lineHeight: 28 },
  centerText: { textAlign: 'center' },
  save: {
    height: 40,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
