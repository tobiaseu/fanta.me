import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { CardGlow } from '@/components/ui/ActionRow';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

/** Fondo delle carte giocatore: azzurro tenue, per distinguerle a colpo d'occhio dalle carte del mazzo. */
export const PLAYER_CARD_TINT = colors.surface;
export const PLAYER_CARD_EDGE = colors.ink;

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
  onLongPress,
  style,
}: {
  player: Player;
  name: string;
  points?: number;
  checked?: boolean;
  dimmed?: boolean;
  note?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}${points !== undefined ? `, ${points} punti` : ''}${note ? `, ${note}` : ''}`}
      onPress={onPress}
      onLongPress={onLongPress}
      pressedScale={0.94}
      style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <View style={styles.card}>
        <CardGlow id={`pc-${player.id}`} cy={56} />
        <Avatar player={player} size={46} sticker={false} />
        <AppText variant="micro" numberOfLines={1} style={styles.name}>
          {name}
        </AppText>
        {points !== undefined && (
          <View style={styles.gem}>
            <AppText variant="micro" color={colors.inkInverse} style={styles.gemText}>
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
    aspectRatio: 63 / 88,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingHorizontal: 4,
  },
  name: { fontSize: 13, lineHeight: 16, fontWeight: '700', textAlign: 'center' },
  gem: {
    position: 'absolute',
    top: 3,
    left: 3,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.ink,
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
