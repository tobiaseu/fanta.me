import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

export const LOBBY_ACTIONS_HEIGHT = 60 + space.md * 2;

/**
 * Pannello fisso in basso con le due CTA del Figma:
 * "Crea stanza" (CTA 1, gialla, a destra sotto il pollice) ed "Entra con codice" (CTA 2).
 * Sempre raggiungibile col pollice, anche a lista lunga.
 */
export function LobbyActions({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.inner}>
        <Button label="Entra con codice" variant="secondary" onPress={onJoin} style={styles.flex} />
        <Button label="Crea stanza" onPress={onCreate} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.bar,
    borderTopRightRadius: radius.bar,
    paddingTop: space.md,
    paddingHorizontal: space.md,
    ...shadow.floating,
  },
  flex: { flex: 1 },
  inner: { flexDirection: 'row', gap: space.sm, width: '100%', maxWidth: MAX_APP_WIDTH, alignSelf: 'center' },
});
