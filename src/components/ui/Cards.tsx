import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { PressableScale } from './PressableScale';

import { Icon } from '@/components/icons/Icon';
import { colors, layout, radius, space } from '@/theme/tokens';

/**
 * Tre livelli di card, gli stessi in tutta l'app.
 *
 * PRIMARIA (HeroCard): larga quanto lo schermo, una per schermata, sempre in cima.
 *   Invita a UN passaggio: emoji, occhiello, titolo, una riga, bottone giallo + uno secondario.
 * SECONDARIA (PosterCard): a scheda verticale in fila orizzontale, come le locandine di Netflix.
 *   Solo emoji, titolo e una riga di meta. Tono "proposta" quando non è una cosa attiva.
 * TERZIARIA (RowCard): riga di elenco con freccia, raggruppata in una lista.
 *
 * Regola delle informazioni: massimo 3 righe di testo per card (occhiello, titolo, riga).
 */

type Action = { label: string; onPress: () => void };

export function HeroCard({
  emoji,
  eyebrow,
  title,
  body,
  primary,
  secondary,
  footer,
  onPress,
  tone = 'surface',
}: {
  emoji: string;
  eyebrow?: ReactNode;
  title: string;
  body?: string;
  primary?: Action;
  secondary?: Action;
  /** Es. avatar dei giocatori, tra il testo e i bottoni */
  footer?: ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'proposal';
}) {
  const content = (
    <>
      <View style={styles.heroTop}>
        <View style={styles.heroArt}>
          <AppText style={styles.heroEmoji}>{emoji}</AppText>
        </View>
        <View style={styles.flex}>
          {typeof eyebrow === 'string' ? (
            <AppText variant="micro" color={colors.inkSoft}>
              {eyebrow}
            </AppText>
          ) : (
            eyebrow
          )}
          <AppText variant="title" numberOfLines={2}>
            {title}
          </AppText>
          {body ? (
            <AppText variant="body" color={colors.inkSoft} numberOfLines={2}>
              {body}
            </AppText>
          ) : null}
        </View>
      </View>
      {footer}
      {(primary || secondary) && (
        <View style={styles.heroActions}>
          {primary && <Button label={primary.label} onPress={primary.onPress} style={styles.flex} />}
          {secondary && (
            <Button
              label={secondary.label}
              variant="secondary"
              onPress={secondary.onPress}
              style={primary ? undefined : styles.flex}
            />
          )}
        </View>
      )}
    </>
  );
  const style = [styles.hero, tone === 'proposal' && styles.proposal];
  return onPress ? (
    <PressableScale accessibilityRole="button" onPress={onPress} pressedScale={0.98} style={style}>
      {content}
    </PressableScale>
  ) : (
    <View style={style}>{content}</View>
  );
}

export function PosterCard({
  emoji,
  title,
  meta,
  badge,
  onPress,
  tone = 'proposal',
  accessibilityLabel,
}: {
  emoji: string;
  title: string;
  meta?: string;
  /** Una sola etichetta in alto (es. "Ufficiale", "Novità") */
  badge?: string;
  onPress: () => void;
  tone?: 'surface' | 'proposal';
  accessibilityLabel?: string;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}${meta ? `, ${meta}` : ''}`}
      onPress={onPress}
      style={styles.poster}>
      <View style={[styles.posterArt, tone === 'proposal' ? styles.proposal : styles.surface]}>
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="micro">{badge}</AppText>
          </View>
        ) : null}
        <AppText style={styles.posterEmoji}>{emoji}</AppText>
      </View>
      <View style={styles.posterText}>
        <AppText variant="name" numberOfLines={1}>
          {title}
        </AppText>
        {meta ? (
          <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
            {meta}
          </AppText>
        ) : null}
      </View>
    </PressableScale>
  );
}

export function RowCard({
  emoji,
  leading,
  title,
  meta,
  onPress,
  accessibilityLabel,
  style,
}: {
  emoji?: string;
  leading?: ReactNode;
  title: string;
  meta?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      pressedScale={0.99}
      style={[styles.row, style]}>
      {leading ?? (emoji ? <AppText style={styles.rowEmoji}>{emoji}</AppText> : null)}
      <View style={styles.flexGap}>
        <AppText variant="name" numberOfLines={1}>
          {title}
        </AppText>
        {typeof meta === 'string' ? (
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular} numberOfLines={1}>
            {meta}
          </AppText>
        ) : (
          meta
        )}
      </View>
      <Icon name="chevron-right" size={20} color={colors.inkFaint} />
    </PressableScale>
  );
}

/** Contenitore delle RowCard: stessa superficie, separatori sottili. */
export function RowGroup({ children }: { children: ReactNode[] }) {
  return (
    <View style={styles.group}>
      {children.map((c, i) => (
        <View key={i} style={i > 0 ? styles.divider : undefined}>
          {c}
        </View>
      ))}
    </View>
  );
}

export const POSTER_WIDTH = 136;

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  flexGap: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  surface: { backgroundColor: colors.surface },
  proposal: { backgroundColor: colors.proposal },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.lg,
  },
  heroTop: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  heroArt: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 38, lineHeight: 46 },
  heroActions: { flexDirection: 'row', gap: space.sm },
  poster: { width: POSTER_WIDTH, gap: space.xs },
  posterArt: {
    height: 176,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterEmoji: { fontSize: 56, lineHeight: 66 },
  posterText: { gap: 2, paddingHorizontal: space.xxs },
  badge: {
    position: 'absolute',
    top: space.xs,
    left: space.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: layout.card,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
  },
  rowEmoji: { fontSize: 26, lineHeight: 32, width: 32, textAlign: 'center' },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
});
