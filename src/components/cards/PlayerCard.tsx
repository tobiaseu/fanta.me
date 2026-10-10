import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

/** Fondo delle carte giocatore: azzurro tenue, per distinguerle a colpo d'occhio dalle carte del mazzo. */
export const PLAYER_CARD_TINT = '#EAF2FF';
export const PLAYER_CARD_EDGE = '#2F7BEA';

/**
 * Carta giocatore: stessa forma delle carte del mazzo, ma azzurra.
 * Con queste si forma la squadra nel pre-partita; in partita mostrano i punti.
 */
export function PlayerCard({
  player,
  name,
  points,
  checked,
  dimmed,
  note,
  onPress,
  style,
}: {
  player: Player;
  name: string;
  points?: number;
  checked?: boolean;
  dimmed?: boolean;
  note?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}${points !== undefined ? `, ${points} punti` : ''}${note ? `, ${note}` : ''}`}
      onPress={onPress}
      pressedScale={0.94}
      style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <View style={styles.card}>
        <Avatar player={player} size={46} sticker={false} />
        <AppText variant="serifCard" numberOfLines={1} style={styles.name}>
          {name}
        </AppText>
        {points !== undefined && (
          <View style={styles.gem}>
            <AppText variant="micro" color={PLAYER_CARD_EDGE} style={styles.gemText}>
              {points} pt
            </AppText>
          </View>
        )}
        {checked && (
          <View style={styles.check}>
            <Icon name="check" size={11} strokeWidth={3.2} />
          </View>
        )}
      </View>
      {note ? (
        <AppText variant="micro" color={colors.inkSoft} style={styles.note} numberOfLines={1}>
          {note}
        </AppText>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '30%', alignItems: 'center', gap: space.xxs },
  dimmed: { opacity: 0.38 },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: PLAYER_CARD_EDGE,
    backgroundColor: PLAYER_CARD_TINT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingHorizontal: 4,
  },
  name: { fontSize: 13, lineHeight: 15, textAlign: 'center' },
  gem: {
    position: 'absolute',
    top: 3,
    left: 3,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PLAYER_CARD_EDGE,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  gemText: { fontSize: 11, lineHeight: 13, fontWeight: '700' },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { fontSize: 10, lineHeight: 12, fontWeight: '500', marginTop: -2 },
});
