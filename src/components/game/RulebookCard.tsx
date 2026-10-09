import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, layout, radius, space } from '@/theme/tokens';

/** Ingresso al "libro sacro" del gioco: regole, momenti, etica. */
export function RulebookCard() {
  const router = useRouter();
  return (
    <PressableScale accessibilityRole="button" onPress={() => router.push('/rulebook')} style={styles.card}>
      <AppText style={styles.emoji}>📖</AppText>
      <View style={styles.flex}>
        <AppText variant="serifCard">Il Libro del Fanta</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          Regole, momenti del gioco e come si gioca bene
        </AppText>
      </View>
      <Icon name="chevron-right" size={20} color={colors.inkFaint} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  emoji: { fontSize: 30, lineHeight: 36 },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
});
