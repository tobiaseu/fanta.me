import { StyleSheet, Text, View } from 'react-native';

import { AppText } from './AppText';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

/** Wordmark FANTAME® : "FANTA" leggero + "ME" medium. */
export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size, letterSpacing: 0.5, color: colors.ink }} accessibilityRole="header">
      <Text style={{ fontWeight: '300' }}>FANTA</Text>
      <Text style={{ fontWeight: '500' }}>ME</Text>
      <Text style={{ fontSize: size * 0.55, fontWeight: '600' }}>®</Text>
    </Text>
  );
}

/** Moneta "fantapunti": l'UNICA icona dei punti in tutta l'app (classifica, squadre, live, profilo). */
export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Ellipse cx={7.5} cy={12.5} rx={5.5} ry={5.5} fill="#F28C28" />
      <Circle cx={12.5} cy={7.5} r={5.5} fill="#FFB547" stroke="#F28C28" strokeWidth={1.5} />
      <Path d="M12.5 5v5" stroke="#F28C28" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Freccia di tendenza in classifica. */
export function TrendArrow({ up, size = 14 }: { up: boolean; size?: number }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 14 8">
      <Path d={up ? 'M7 0 14 8H0Z' : 'M7 8 0 0h14Z'} fill={up ? colors.bonusBright : colors.malus} />
    </Svg>
  );
}

/**
 * Punteggio: sempre moneta + numero, ovunque ci sia un punteggio.
 * `signed` per le variazioni (+15 verde, −5 rosso), senza per i totali.
 */
export function Score({ value, signed, size = 'md' }: { value: number; signed?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const icon = size === 'lg' ? 22 : size === 'sm' ? 13 : 16;
  const color = signed ? (value > 0 ? colors.bonus : value < 0 ? colors.malus : colors.inkSoft) : colors.ink;
  return (
    <View style={scoreStyles.row} accessibilityLabel={`${signed && value > 0 ? '+' : ''}${value} punti`}>
      <CoinIcon size={icon} />
      <AppText
        variant={size === 'lg' ? 'number' : size === 'sm' ? 'caption' : 'headline'}
        color={color}
        style={size === 'sm' ? scoreStyles.bold : undefined}>
        {signed && value > 0 ? `+${value}` : value}
      </AppText>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bold: { fontWeight: '700' },
});
