import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { PressableScale } from './PressableScale';

import { Icon } from '@/components/icons/Icon';
import { AbstractArt, type ArtMood } from './AbstractArt';
import { colors, layout, radius, space } from '@/theme/tokens';

/**
 * HeroCard: la card primaria, larga quanto lo schermo, una per schermata, sempre in cima.
 * Invita a UN passaggio: emoji, occhiello, titolo, una riga, bottone giallo + uno secondario.
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
  mood = 'neutral',
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
  tone?: 'surface' | 'proposal' | 'dark';
  /** Card scura: colore della grafica astratta in base al tipo di azione */
  mood?: ArtMood;
}) {
  const dark = tone === 'dark';
  const content = (
    <>
      {dark && <AbstractArt mood={mood} />}
      <View style={styles.heroTop}>
        <View style={[styles.heroArt, dark && styles.heroArtDark]}>
          <AppText style={styles.heroEmoji}>{emoji}</AppText>
        </View>
        <View style={styles.flex}>
          {typeof eyebrow === 'string' ? (
            <AppText variant="micro" color={dark ? 'rgba(255,255,255,0.6)' : colors.inkSoft}>
              {eyebrow}
            </AppText>
          ) : (
            eyebrow
          )}
          <AppText variant="title" numberOfLines={2} color={dark ? '#FFFFFF' : undefined}>
            {title}
          </AppText>
          {body ? (
            <AppText variant="body" color={dark ? 'rgba(255,255,255,0.7)' : colors.inkSoft} numberOfLines={2}>
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
              onDark={dark}
              onPress={secondary.onPress}
              style={primary ? undefined : styles.flex}
            />
          )}
        </View>
      )}
    </>
  );
  const style = [styles.hero, tone === 'proposal' && styles.proposal, dark && styles.dark];
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
  surface: { backgroundColor: colors.surface },
  proposal: { backgroundColor: colors.proposal },
  dark: { backgroundColor: '#0E0E11', overflow: 'hidden' },
  heroArtDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
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
