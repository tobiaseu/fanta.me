import { StyleSheet, View } from 'react-native';

import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { colors, space } from '@/theme/tokens';

/** Empty state illustrato: nessuna partita attiva. */
export function EmptyLobby() {
  return (
    <View style={styles.wrap}>
      <RubberHoseMascot size={170} color={colors.toonYellow} pose="shrug" />
      <AppText variant="title" style={styles.center}>
        Nessuna partita in corso
      </AppText>
      <AppText variant="body" color={colors.inkMuted} style={[styles.center, styles.body]}>
        Le vacanze, l'ufficio, la cena di classe: tutto può diventare un campionato. Crea una stanza e invita i tuoi
        amici.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.md, paddingVertical: space.xl, paddingHorizontal: space.lg },
  center: { textAlign: 'center' },
  body: { maxWidth: 300 },
});
