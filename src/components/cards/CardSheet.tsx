import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { cardTone } from '@/components/cards/DeckCard';
import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Tag } from '@/components/ui/Tag';
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

type SheetAction = { label: string; onPress: () => void; icon?: IconName };

/** Dove sta la carta e cosa si può fare: una riga sola, sempre nello stesso punto. */
export type CardState = { text: string; tone?: 'neutral' | 'ok' | 'locked' };

interface Props {
  rule?: Rule;
  author?: Player;
  state?: CardState;
  /** L'azione che fa avanzare il gioco (gialla). Se non c'è, la riga di stato dice perché. */
  primary?: SheetAction;
  /** Un'alternativa, bordata. Mai due gialli. */
  secondary?: SheetAction;
  onClose: () => void;
}

/**
 * Carta ingrandita al tocco: stessa proporzione della carta piccola (0,78),
 * X in alto a destra e chiusura anche toccando fuori.
 * Sotto: l'azione della schermata e "Salva nelle mie carte" per le partite future.
 */
export function CardSheet({ rule, author, state, primary, secondary, onClose }: Props) {
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
                hitSlop={12}
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
                <Tag
                  label={
                    rule.authorId === 'community'
                      ? 'Community'
                      : rule.authorId
                        ? `Carta di ${author?.name ?? 'un amico'}`
                        : `${cat?.emoji} ${cat?.label}`
                  }
                />
                <Tag label={rule.trophy ? '🏆 Solo il primo' : 'Cumulabile'} gold={rule.trophy} />
              </View>
            </View>

            {/* Sotto la carta, sempre in quest'ordine: stato, azione principale, alternativa */}
            {state ? (
              <View style={styles.state} accessibilityRole="text">
                {state.tone && state.tone !== 'neutral' ? (
                  <Icon
                    name={state.tone === 'locked' ? 'lock' : 'check'}
                    size={14}
                    color={state.tone === 'ok' ? colors.bonusBright : 'rgba(255,255,255,0.75)'}
                  />
                ) : null}
                <AppText variant="caption" color="rgba(255,255,255,0.85)" style={styles.stateText}>
                  {state.text}
                </AppText>
              </View>
            ) : null}
            {primary && (
              <Button
                label={primary.label}
                icon={primary.icon}
                onPress={() => {
                  primary.onPress();
                  onClose();
                }}
              />
            )}
            {secondary && (
              <Button
                label={secondary.label}
                icon={secondary.icon}
                variant="secondary"
                onDark
                onPress={() => {
                  secondary.onPress();
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
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  stack: { width: '100%', maxWidth: 320, gap: space.sm },
  state: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: space.sm },
  stateText: { textAlign: 'center', flexShrink: 1 },
  flex: { flex: 1 },
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
