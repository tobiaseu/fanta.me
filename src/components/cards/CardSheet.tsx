import { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  CardArt,
  PLAY_RATIO,
  PointsTag,
  TIER_LABEL,
  TierTag,
  cardPaint,
  cardSignature,
  cardSubtitle,
  tierOf,
  type CardRect,
} from '@/components/cards/PlayCard';
import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { space } from '@/theme/tokens';
import type { Player, Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Proporzione unica delle carte: la stessa in anteprima e aperta. */
export const CARD_RATIO = PLAY_RATIO;

export type SheetAction = { label: string; onPress: () => void; icon?: IconName };

/** Dove sta la carta e cosa si può fare: se non c'è un'azione, diventa il testo del bottone spento. */
export type CardState = { text: string; tone?: 'neutral' | 'ok' | 'locked' };

interface Props {
  rule?: Rule;
  author?: Player;
  state?: CardState;
  /** L'azione che fa avanzare il gioco: gialla, sempre a destra */
  primary?: SheetAction;
  /** Un'alternativa: bordata, sempre a sinistra. Se manca, a sinistra c'è "Salva la carta". */
  secondary?: SheetAction;
  /** Rettangolo della carta in griglia: la carta si apre da lì e ci torna */
  from?: CardRect;
  onClose: () => void;
}

/** Rarità, per chi la importava da qui. */
export const rarityOf = (rule: Rule) => TIER_LABEL[tierOf(rule)];

/**
 * Carta aperta: stessa proporzione e stesso disegno della carta in griglia, solo più grande.
 * Dentro: Bonus/Malus, X, immagine, tag, titolo e sottotitolo, regola, azioni, firma di chi l'ha creata.
 * Azioni: secondaria a sinistra, primaria gialla a destra.
 */
export function CardSheet({ rule, author, state, primary, secondary, from, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  // La carta più grande che sta nello schermo mantenendo la proporzione
  const cardW = Math.min(360, width - 32, (height - 64) * CARD_RATIO);
  const cardH = cardW / CARD_RATIO;
  // Apertura "dalla carta": parte dal rettangolo in griglia e arriva al centro
  const grow = useSharedValue(0);
  const origin = useSharedValue({ dx: 0, dy: 0, s: 0.6 });
  useEffect(() => {
    if (!rule) return;
    origin.value = from
      ? { dx: from.x + from.width / 2 - width / 2, dy: from.y + from.height / 2 - height / 2, s: from.width / cardW }
      : { dx: 0, dy: 40, s: 0.85 };
    grow.value = 0;
    grow.value = withSpring(1, { damping: 20, stiffness: 190, mass: 0.9 });
  }, [rule?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => {
    grow.value = withTiming(0, { duration: 240, easing: Easing.inOut(Easing.cubic) }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };
  const moving = useAnimatedStyle(() => {
    const t = grow.value;
    const o = origin.value;
    return {
      transform: [{ translateX: o.dx * (1 - t) }, { translateY: o.dy * (1 - t) }, { scale: o.s + (1 - o.s) * t }],
    };
  });
  const dim = useAnimatedStyle(() => ({ opacity: Math.min(1, grow.value) }));

  return (
    <Modal visible={!!rule} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, dim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Chiudi la carta" />
      </Animated.View>
      {rule && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[{ width: cardW, height: cardH }, moving]}>
            <Face rule={rule} author={author} state={state} primary={primary} secondary={secondary} onClose={close} />
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

function Face({ rule, author, state, primary, secondary, onClose }: Omit<Props, 'rule'> & { rule: Rule }) {
  const p = cardPaint(rule);
  const dark = tierOf(rule) !== 'normal';
  const saved = useGameStore((s) => s.savedRuleIds.includes(rule.id));
  const toggleSaved = useGameStore((s) => s.toggleSaved);
  const showToast = useUiStore((s) => s.showToast);
  const save: SheetAction = {
    label: saved ? 'Salvata' : 'Salva la carta',
    icon: saved ? 'check' : undefined,
    onPress: () => {
      haptics.tap();
      toggleSaved(rule.id);
      showToast({ text: saved ? `${rule.label} tolta dalle salvate` : `${rule.label} salvata nella collezione` });
    },
  };
  const run = (a: SheetAction, keepOpen?: boolean) => () => {
    a.onPress();
    if (!keepOpen) onClose();
  };
  // Sinistra: alternativa (o Salva). Destra: primaria gialla (o l'unica alternativa, o il motivo).
  const left = primary ? (secondary ?? save) : save;
  const leftKeepsOpen = left === save;
  const right = primary ?? secondary;

  return (
    <View style={[styles.card, !dark && styles.cardLight]}>
      <CardArt rule={rule} id={`s-${rule.id}`} />
      <View style={styles.corner}>
        <PointsTag points={rule.points} large />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Chiudi"
          hitSlop={12}
          onPress={onClose}
          style={[styles.close, { backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)' }]}>
          <Icon name="close" size={16} color={p.ink} />
        </PressableScale>
      </View>
      <View style={styles.art}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {rule.emoji}
        </Text>
      </View>
      <TierTag rule={rule} onDark={dark} />
      <View>
        <AppText variant="headline" color={p.ink} style={styles.title} numberOfLines={2}>
          {rule.label}
        </AppText>
        <AppText variant="caption" color={p.soft} style={styles.regular} numberOfLines={1}>
          {cardSubtitle(rule, author?.name)}
        </AppText>
      </View>
      <AppText variant="body" color={p.ink} numberOfLines={4} style={styles.desc}>
        {rule.description}
      </AppText>
      {state?.text ? (
        <View style={styles.stateRow}>
          {state.tone === 'locked' && <Icon name="lock" size={12} color={p.soft} />}
          {state.tone === 'ok' && <Icon name="check" size={12} color={p.soft} />}
          <AppText variant="micro" color={p.soft} numberOfLines={1} style={styles.stateText}>
            {state.text}
          </AppText>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={left.label}
          icon={left.icon}
          variant="secondary"
          onDark={dark}
          onPress={run(left, leftKeepsOpen)}
          style={[styles.btn, styles.flex]}
        />
        {right ? (
          <Button
            label={right.label}
            variant={primary ? 'primary' : 'secondary'}
            onDark={dark}
            onPress={run(right)}
            style={[styles.btn, styles.flex]}
          />
        ) : null}
      </View>
      <View style={[styles.signature, { borderTopColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)' }]}>
        <AppText variant="micro" color={p.soft} numberOfLines={1} style={styles.regular}>
          {cardSignature(rule, author?.name)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.md },
  card: { flex: 1, borderRadius: 28, overflow: 'hidden', padding: space.md, gap: space.xs },
  cardLight: { backgroundColor: '#FFFFFF' },
  corner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  art: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 96, lineHeight: 112, fontFamily: EMOJI_FONT },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 19 },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stateText: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: space.xs, marginTop: space.xxs },
  btn: { height: 46, paddingHorizontal: space.xs },
  flex: { flex: 1 },
  signature: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.xs, marginTop: 2 },
  regular: { fontWeight: '400' },
});
