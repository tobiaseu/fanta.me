import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';

import { cardTone } from '@/components/cards/DeckCard';
import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Tag } from '@/components/ui/Tag';
import { COMMUNITY_CARDS, COMMUNITY_DECKS } from '@/data/community';
import { RULE_CATEGORIES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Player, Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Proporzione unica delle carte: la stessa in anteprima e ingrandita. */
export const CARD_RATIO = 0.78;

type SheetAction = { label: string; onPress: () => void; icon?: IconName };

/** Dove sta la carta e cosa si può fare: se non c'è un'azione, diventa il testo del bottone spento. */
export type CardState = { text: string; tone?: 'neutral' | 'ok' | 'locked' };

interface Props {
  rule?: Rule;
  author?: Player;
  state?: CardState;
  /** L'azione che fa avanzare il gioco (gialla) */
  primary?: SheetAction;
  /** Un'alternativa, come testo sotto il giallo */
  secondary?: SheetAction;
  onClose: () => void;
}

/** Rarità ricavata dalla carta: trofeo = leggendaria, punti alti = rara. */
export function rarityOf(rule: Rule) {
  if (rule.trophy) return 'Leggendaria';
  if (Math.abs(rule.points) >= 20) return 'Rara';
  return 'Comune';
}

/**
 * Carta ingrandita: stessa proporzione dell'anteprima e TUTTO dentro la carta.
 * Fronte: tipo e punti in alto a sinistra, X a destra, emoji, nome con la "i", tag, regola, azioni.
 * Retro (tocca la "i"): statistiche della carta.
 */
export function CardSheet({ rule, author, state, primary, secondary, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  // La carta più grande che sta nello schermo mantenendo la proporzione
  const cardW = Math.min(360, width - 32, (height - 64) * CARD_RATIO);
  const [back, setBack] = useState(false);
  const flip = useSharedValue(0);
  useEffect(() => {
    setBack(false);
    flip.value = 0;
  }, [rule?.id, flip]);
  const turn = () => {
    haptics.tap();
    flip.value = withTiming(back ? 0 : 180, { duration: 420 });
    setBack((b) => !b);
  };
  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }] }));
  const rear = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${flip.value + 180}deg` }] }));

  return (
    <Modal visible={!!rule} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi la carta" />
      {rule && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify().damping(16)} style={{ width: cardW, aspectRatio: CARD_RATIO }}>
            <Animated.View style={[styles.face, front]} pointerEvents={back ? 'none' : 'auto'}>
              <Front
                rule={rule}
                author={author}
                state={state}
                primary={primary}
                secondary={secondary}
                onClose={onClose}
                onInfo={turn}
              />
            </Animated.View>
            <Animated.View style={[styles.face, rear]} pointerEvents={back ? 'auto' : 'none'}>
              <Back rule={rule} author={author} onClose={onClose} onFlip={turn} />
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

function Corner({ rule, onClose }: { rule: Rule; onClose: () => void }) {
  const tone = cardTone(rule);
  const bonus = rule.points > 0;
  return (
    <View style={styles.corner}>
      <View style={[styles.gem, { borderColor: tone.gem }]}>
        <AppText variant="caption" color={tone.gem}>
          {bonus ? `Bonus +${rule.points}` : `Malus ${rule.points}`}
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
  );
}

function Front({
  rule,
  author,
  state,
  primary,
  secondary,
  onClose,
  onInfo,
}: Omit<Props, 'rule'> & { rule: Rule; onInfo: () => void }) {
  const cat = RULE_CATEGORIES.find((c) => c.id === rule.categoryId);
  const typeLabel =
    rule.authorId === 'community'
      ? 'Community'
      : rule.authorId
        ? `Carta di ${author?.name ?? 'un amico'}`
        : `${cat?.emoji ?? ''} ${cat?.label ?? ''}`.trim();
  const run = (a: SheetAction) => () => {
    a.onPress();
    onClose();
  };
  return (
    <View style={[styles.card, { borderColor: cardTone(rule).edge }]}>
      <Corner rule={rule} onClose={onClose} />
      <View style={styles.art}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {rule.emoji}
        </Text>
      </View>
      <View style={styles.titleRow}>
        <AppText variant="serifTitle" style={styles.title} numberOfLines={2}>
          {rule.label}
        </AppText>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Statistiche della carta"
          hitSlop={12}
          onPress={onInfo}
          style={styles.info}>
          <AppText variant="caption">i</AppText>
        </PressableScale>
      </View>
      <View style={styles.tags}>
        <Tag label={typeLabel} />
        <Tag label={rule.trophy ? '🏆 Speciale: solo il primo' : 'Cumulabile'} gold={rule.trophy} />
        <Tag label={rarityOf(rule)} />
      </View>
      <AppText variant="body" color={colors.inkSoft} numberOfLines={5} style={styles.desc}>
        {rule.description}
      </AppText>
      <View style={styles.actions}>
        {primary ? (
          <>
            {state?.text ? (
              <AppText variant="micro" color={colors.inkSoft} style={styles.centerText} numberOfLines={1}>
                {state.text}
              </AppText>
            ) : null}
            <Button label={primary.label} icon={primary.icon} onPress={run(primary)} style={styles.btn} />
          </>
        ) : secondary ? (
          <Button
            label={secondary.label}
            icon={secondary.icon}
            variant="secondary"
            onPress={run(secondary)}
            style={styles.btn}
          />
        ) : (
          // Niente da fare: il bottone resta, spento, e dice perché
          <View style={[styles.btn, styles.disabled]} accessibilityRole="text">
            {state?.tone === 'locked' && <Icon name="lock" size={14} color={colors.inkSoft} />}
            {state?.tone === 'ok' && <Icon name="check" size={14} color={colors.bonus} />}
            <AppText variant="caption" color={colors.inkSoft} numberOfLines={2} style={styles.centerText}>
              {state?.text ?? 'Solo da leggere'}
            </AppText>
          </View>
        )}
        {primary && secondary ? (
          <Button label={secondary.label} variant="tertiary" onPress={run(secondary)} style={styles.link} />
        ) : null}
      </View>
    </View>
  );
}

function Back({
  rule,
  author,
  onClose,
  onFlip,
}: {
  rule: Rule;
  author?: Player;
  onClose: () => void;
  onFlip: () => void;
}) {
  const events = useGameStore((s) => s.events);
  const games = useGameStore((s) => s.games);
  const community = COMMUNITY_CARDS.find((c) => c.rule.id === rule.id);
  const played =
    (community?.plays ?? 0) + events.filter((e) => e.ruleId === rule.id && e.status === 'confirmed').length;
  const decks =
    games.filter((g) => g.ruleIds.includes(rule.id)).length +
    COMMUNITY_DECKS.filter((d) => d.ruleIds.includes(rule.id)).length;
  const creator = community
    ? `@${community.author.handle}`
    : rule.authorId
      ? (author?.name ?? 'Un amico')
      : 'Fanta.me (carta base)';
  const rows: [string, string][] = [
    ['Giocata', `${played} ${played === 1 ? 'volta' : 'volte'}`],
    ['Creata da', creator],
    ['Nei mazzi', `${decks} ${decks === 1 ? 'mazzo' : 'mazzi'}`],
    ['Rarità', rarityOf(rule)],
    ['Valore', `${rule.points > 0 ? '+' : ''}${rule.points} punti${rule.trophy ? ', una volta sola' : ', ogni volta'}`],
  ];
  return (
    <View style={[styles.card, styles.cardBack]}>
      <Corner rule={rule} onClose={onClose} />
      <AppText variant="serifHeading" color={colors.inkInverse} numberOfLines={2}>
        {rule.emoji} {rule.label}
      </AppText>
      <View style={styles.stats}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.stat}>
            <AppText variant="caption" color="rgba(255,255,255,0.6)" style={styles.regular}>
              {k}
            </AppText>
            <AppText variant="name" color={colors.inkInverse} numberOfLines={1} style={styles.statValue}>
              {v}
            </AppText>
          </View>
        ))}
      </View>
      <Button label="Gira la carta" variant="secondary" onDark onPress={onFlip} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.md },
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.md,
    gap: space.xs,
  },
  cardBack: { backgroundColor: '#0E0E11', borderColor: '#0E0E11', gap: space.md },
  corner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gem: { height: 30, paddingHorizontal: space.sm, borderRadius: 15, borderWidth: 1, justifyContent: 'center' },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, lineHeight: 76, fontFamily: EMOJI_FONT },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  title: { flex: 1, fontSize: 24, lineHeight: 28 },
  info: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  desc: { fontSize: 14, lineHeight: 19 },
  actions: { gap: 2, marginTop: space.xxs },
  btn: { height: 46 },
  link: { height: 34 },
  disabled: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    paddingHorizontal: space.md,
  },
  centerText: { textAlign: 'center', flexShrink: 1 },
  regular: { fontWeight: '400' },
  stats: { flex: 1, gap: space.sm, justifyContent: 'center' },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingBottom: space.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  statValue: { flexShrink: 1, textAlign: 'right' },
});
