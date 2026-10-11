import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import {
  CardArt,
  PLAY_RATIO,
  PointsTag,
  TIER_LABEL,
  TierTag,
  cardPaint,
  signGlow,
  tierOf,
  type CardRect,
} from '@/components/cards/PlayCard';
import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ObjectModal, SheetClose } from '@/components/ui/ObjectModal';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, space } from '@/theme/tokens';
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
  return (
    <ObjectModal
      visible={!!rule}
      resetKey={rule?.id}
      from={from}
      width={cardW}
      height={cardH}
      closeLabel="Chiudi la carta"
      onClose={onClose}>
      {(close) =>
        rule ? (
          <View style={[styles.shell, signGlow(rule.points, 'lg')]}>
            <Face rule={rule} author={author} state={state} primary={primary} secondary={secondary} onClose={close} />
          </View>
        ) : null
      }
    </ObjectModal>
  );
}

function Face({ rule, author, state, primary, secondary, onClose }: Omit<Props, 'rule'> & { rule: Rule }) {
  const p = cardPaint(rule);
  const dark = p.inverse;
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
        <View style={styles.tagsRow}>
          <PointsTag points={rule.points} large />
          <TierTag rule={rule} onDark={dark} large />
        </View>
        <SheetClose onPress={onClose} ink={p.ink} onDark={dark} />
      </View>
      <View style={styles.art}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {rule.emoji}
        </Text>
      </View>
      <View style={styles.titleBlock}>
        <AppText variant="headline" color={p.ink} style={styles.title} numberOfLines={2}>
          {rule.label}
        </AppText>
        <View style={styles.creator}>
          {author ? (
            <Avatar player={author} size={20} sticker={false} />
          ) : (
            <View style={[styles.mark, { backgroundColor: rule.epic ? '#B48CFF' : colors.cta }]}>
              <AppText variant="micro" color={colors.ink} style={styles.markText}>
                {rule.epic ? '★' : 'f'}
              </AppText>
            </View>
          )}
          <AppText variant="caption" color={p.soft} style={styles.flexText} numberOfLines={1}>
            {creatorName(rule, author?.name)}
          </AppText>
        </View>
      </View>
      <AppText variant="body" color={p.ink} numberOfLines={4} style={styles.desc}>
        {rule.description}
      </AppText>
      {state?.text && !primary && !secondary ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, borderRadius: 28 },
  card: { flex: 1, borderRadius: 28, overflow: 'hidden', padding: space.md, gap: space.xs },
  cardLight: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  corner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 96, lineHeight: 112, fontFamily: EMOJI_FONT },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 19 },
  titleBlock: { gap: 4 },
  tagsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  creator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mark: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  markText: { fontWeight: '800' },
  flexText: { flexShrink: 1, fontWeight: '500' },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stateText: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: space.xs, marginTop: space.xxs },
  btn: { height: 46, paddingHorizontal: space.xs },
  flex: { flex: 1 },
  signature: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.xs, marginTop: 2 },
  regular: { fontWeight: '400' },
});

/** Solo il nome di chi l'ha creata (o vinta): niente ripetizioni. */
function creatorName(rule: Rule, name?: string) {
  if (rule.epic) return rule.prize ?? 'Carta vinta';
  if (rule.authorId === 'community') return 'Community';
  if (rule.authorId) return name ?? 'Un amico';
  return 'Fanta.me';
}
