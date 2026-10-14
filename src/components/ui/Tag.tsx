import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius } from '@/theme/tokens';

/**
 * Un solo tag in tutta l'app: pillola bordata, testo micro.
 * `gold` per trofei e cose rare, `filled` per lo stato su fondo colorato.
 */
export function Tag({
  label,
  gold,
  filled,
  onDark,
}: {
  label: string;
  gold?: boolean;
  filled?: boolean;
  /** Su fondo colorato: vetro chiaro e testo bianco */
  onDark?: boolean;
}) {
  return (
    <View style={[styles.tag, gold && styles.gold, filled && styles.filled, onDark && styles.onDark]}>
      <AppText variant="micro" color={onDark ? '#FFFFFF' : gold ? '#9A7200' : colors.inkSoft} style={styles.bold}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Tag e pill restano in grassetto: micro di base è regular */
  bold: { fontWeight: '600' },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gold: { borderColor: '#D4A017' },
  onDark: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'transparent' },
  filled: { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'transparent' },
});
