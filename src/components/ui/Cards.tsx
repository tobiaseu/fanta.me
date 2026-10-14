import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { PressableScale } from './PressableScale';

import { Icon } from '@/components/icons/Icon';
import { colors, layout, radius, space } from '@/theme/tokens';

/**
 * HeroCard: la card primaria, larga quanto lo schermo, una per schermata, sempre in cima.
 * Sempre chiara (il nero è riservato ai fantapoteri). Invita a UN passaggio: emoji, occhiello, titolo, una riga, bottone arancio + uno secondario.
 * Gli oggetti del gioco hanno le loro card: carta (PlayCard), stanza (RoomCard), potere (PowerCard), mazzo (DeckStack).
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
            <AppText variant="micro" color={colors.inkSoft} style={styles.bold}>
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

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  flexGap: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  bold: { fontWeight: '600' },
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
});
