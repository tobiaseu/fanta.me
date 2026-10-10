import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors } from '@/theme/tokens';

/** "i" accanto a un concetto di gioco: apre il Libro del Fanta. Area di tocco 44 pt. */
export function InfoDot({ topic }: { topic: string }) {
  const router = useRouter();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Come funziona: ${topic}`}
      hitSlop={12}
      onPress={() => router.push('/rulebook')}
      style={styles.dot}>
      <AppText style={styles.i}>i</AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  i: { fontSize: 12, lineHeight: 14, fontWeight: '600', color: colors.inkSoft },
});
