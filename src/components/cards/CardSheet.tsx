import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CardArt, PLAY_RATIO, cardSubtitle, type CardRect } from '@/components/cards/PlayCard';
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
export const CARD_RATIO = PLAY_RATIO;

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
  /** Rettangolo della carta in griglia: la carta si apre da lì e ci torna */
  from?: CardRect;
  /** Aperta dal pulsante "i": parte già girata sul retro */
  startOnBack?: boolean;
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
export function CardSheet({ rule, author, state, primary, secondary, from, startOnBack, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  // La carta più grande che sta nello schermo mantenendo la proporzione
  const cardW = Math.min(360, width - 32, (height - 64) * CARD_RATIO);
  const cardH = cardW / CARD_RATIO;
  const [back, setBack] = useState(false);
  const flip = useSharedValue(0);
  // Apertura "dalla carta": parte dal rettangolo in griglia e arriva al centro, stessa proporzione
  const grow = useSharedValue(0);
  const origin = useSharedValue({ dx: 0, dy: 0, s: 0.6 });
  useEffect(() => {
    if (!rule) return;
    setBack(!!startOnBack);
    flip.value = startOnBack ? 180 : 0;
    origin.value = from
      ? {
          dx: from.x + from.width / 2 - width / 2,
          dy: from.y + from.height / 2 - height / 2,
          s: from.width / cardW,
        }
      : { dx: 0, dy: 40, s: 0.85 };
    grow.value = 0;
    grow.value = withSpring(1, { damping: 20, stiffness: 190, mass: 0.9 });
  }, [rule?.id, startOnBack]); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => {
    grow.value = withTiming(0, { duration: 240, easing: Easing.inOut(Easing.cubic) }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };
  const turn = () => {
    haptics.tap();
    flip.value = withTiming(back ? 0 : 180, { duration: 420 });
    setBack((b) => !b);
  };
  const moving = useAnimatedStyle(() => {
    const t = grow.value;
    const o = origin.value;
    return {
      transform: [{ translateX: o.dx * (1 - t) }, { translateY: o.dy * (1 - t) }, { scale: o.s + (1 - o.s) * t }],
    };
  });
  const dim = useAnimatedStyle(() => ({ opacity: Math.min(1, grow.value) }));
  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }] }));
  const rear = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${flip.value + 180}deg` }] }));

  return (
    <Modal visible={!!rule} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, dim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Chiudi la carta" />
      </Animated.View>
      {rule && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[{ width: cardW, height: cardH }, moving]}>
            <Animated.View style={[styles.face, front]} pointerEvents={back ? 'none' : 'auto'}>
              <Front
                rule={rule}
                author={author}
                state={state}
                primary={primary}
                secondary={secondary}
                onClose={close}
                onInfo={turn}
              />
            </Animated.View>
            <Animated.View style={[styles.face, rear]} pointerEvents={back ? 'auto' : 'none'}>
              <Back rule={rule} author={author} onClose={close} onFlip={turn} />
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

function Corner({ rule, onClose, label }: { rule: Rule; onClose: () => void; label?: string }) {
  const bonus = rule.points > 0;
  return (
    <View style={styles.corner}>
      <View style={styles.gem}>
        <AppText variant="caption" color={colors.ink} style={styles.bold}>
          {label ?? (bonus ? `Bonus +${rule.points}` : `Malus ${rule.points}`)}
        </AppText>
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Chiudi"
        hitSlop={12}
        onPress={onClose}
        style={styles.close}>
        <Icon name="close" size={16} color="#FFFFFF" />
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
  const run = (a: SheetAction) => () => {
    a.onPress();
    onClose();
  };
  return (
    <View style={styles.card}>
      <CardArt rule={rule} id={`s-${rule.id}`} />
      <Corner rule={rule} onClose={onClose} />
      <View style={styles.art}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {rule.emoji}
        </Text>
      </View>
      <View style={styles.tags}>
        <Tag label={rule.trophy ? '🏆 Unica: solo il primo' : 'Cumulabile'} onDark />
        <Tag label={rarityOf(rule)} onDark />
      </View>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant="headline" color="#FFFFFF" style={styles.title} numberOfLines={2}>
            {rule.label}
          </AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.82)" style={styles.regular}>
            {cardSubtitle(rule, author?.name)}
          </AppText>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Statistiche e altre azioni"
          hitSlop={12}
          onPress={onInfo}
          style={styles.info}>
          <AppText variant="caption" color="#FFFFFF" style={styles.bold}>
            i
          </AppText>
        </PressableScale>
      </View>
      <AppText variant="body" color="rgba(255,255,255,0.92)" numberOfLines={5} style={styles.desc}>
        {rule.description}
      </AppText>
      <View style={styles.actions}>
        {primary ? (
          <>
            {state?.text ? (
              <AppText variant="micro" color="rgba(255,255,255,0.85)" style={styles.centerText} numberOfLines={1}>
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
            onDark
            onPress={run(secondary)}
            style={styles.btn}
          />
        ) : (
          // Niente da fare: il bottone resta, spento, e dice perché
          <View style={[styles.btn, styles.disabled]} accessibilityRole="text">
            {state?.tone === 'locked' && <Icon name="lock" size={14} color="#FFFFFF" />}
            {state?.tone === 'ok' && <Icon name="check" size={14} color="#FFFFFF" />}
            <AppText variant="caption" color="#FFFFFF" numberOfLines={2} style={styles.centerText}>
              {state?.text ?? 'Solo da leggere'}
            </AppText>
          </View>
        )}
        {primary && secondary ? (
          <Button label={secondary.label} variant="tertiary" onDark onPress={run(secondary)} style={styles.link} />
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
  const saved = useGameStore((s) => s.savedRuleIds.includes(rule.id));
  const toggleSaved = useGameStore((s) => s.toggleSaved);
  const share = () => {
    const text = `${rule.emoji} ${rule.label}: ${rule.description} (Fanta.me)`;
    haptics.tap();
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
      if (nav.share) nav.share({ text }).catch(() => {});
      else navigator.clipboard?.writeText(text);
    }
  };
  return (
    <View style={[styles.card, styles.cardBack]}>
      <Corner rule={rule} onClose={onClose} label="Retro della carta" />
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
      <View style={styles.actions}>
        <Button
          label={saved ? 'Salvata nella collezione' : 'Salva nella collezione'}
          icon={saved ? 'check' : undefined}
          onPress={() => {
            haptics.tap();
            toggleSaved(rule.id);
          }}
          style={styles.btn}
        />
        <View style={styles.backRow}>
          <Button label="Condividi" variant="secondary" onDark onPress={share} style={[styles.btn, styles.flex]} />
          <Button label="Gira la carta" variant="secondary" onDark onPress={onFlip} style={[styles.btn, styles.flex]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.md },
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
  card: {
    flex: 1,
    backgroundColor: '#0E0E11',
    borderRadius: 28,
    overflow: 'hidden',
    padding: space.md,
    gap: space.xs,
  },
  cardBack: { gap: space.md },
  backRow: { flexDirection: 'row', gap: space.xs },
  flex: { flex: 1, gap: 2 },
  bold: { fontWeight: '700' },
  corner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gem: {
    height: 30,
    paddingHorizontal: space.sm,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 96, lineHeight: 112, fontFamily: EMOJI_FONT },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  info: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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
    backgroundColor: 'rgba(0,0,0,0.22)',
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
