import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors } from '@/theme/tokens';
import type { Player } from '@/types/game';

interface Props {
  player: Pick<Player, 'name' | 'color'>;
  size?: number;
  /** Bordo bianco spesso stile sticker fustellato */
  sticker?: boolean;
  /** Squircle alla Clubhouse (predefinito) o cerchio (solo storie e anelli) */
  shape?: 'circle' | 'square';
}

export function Avatar({ player, size = 40, sticker = true, shape = 'square' }: Props) {
  const border = sticker ? Math.max(2, Math.round(size / 14)) : 0;
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : size * 0.38,
          backgroundColor: player.color,
          borderWidth: border,
        },
      ]}>
      <AppText
        variant="headline"
        color={colors.inkInverse}
        style={{ fontSize: size * 0.42, lineHeight: size * 0.5, fontWeight: '800', letterSpacing: 0 }}>
        {player.name.charAt(0).toUpperCase()}
      </AppText>
    </View>
  );
}

/** Pila di avatar sovrapposti per le card partita. */
export function AvatarStack({ players, size = 28, max = 4 }: { players: Player[]; size?: number; max?: number }) {
  const shown = players.slice(0, max);
  const extra = players.length - shown.length;
  return (
    <View style={styles.stack}>
      {shown.map((p, i) => (
        <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -size / 3, zIndex: max - i }}>
          <Avatar player={p} size={size} sticker />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.base,
            styles.extra,
            { width: size, height: size, borderRadius: size * 0.38, marginLeft: -size / 3 },
          ]}>
          <AppText variant="caption" color={colors.inkSoft}>
            +{extra}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.sticker,
  },
  stack: { flexDirection: 'row', alignItems: 'center' },
  extra: { backgroundColor: colors.surfaceMuted, borderWidth: 1 },
});
