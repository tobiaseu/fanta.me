import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius } from '@/theme/tokens';

/**
 * Un solo tag in tutta l'app: pillola bordata, testo micro.
 * `gold` per trofei e cose rare, `filled` per lo stato su fondo colorato.
 */
export function Tag({ label, gold, filled }: { label: string; gold?: boolean; filled?: boolean }) {
  return (
    <View style={[styles.tag, gold && styles.gold, filled && styles.filled]}>
      <AppText variant="micro" color={gold ? '#9A7200' : colors.inkSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gold: { borderColor: '#D4A017' },
  filled: { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'transparent' },
});
