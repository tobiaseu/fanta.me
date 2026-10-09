import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById } from '@/data/rules';
import { useGameStore } from '@/store/useGameStore';
import { colors, layout, radius, space } from '@/theme/tokens';

/** Nel profilo: i due fantapoteri scelti, tocca per cambiarli. */
export function MyPowersRow() {
  const router = useRouter();
  const mine = useGameStore((s) => s.powers[ME.id]);
  return (
    <View style={styles.section}>
      <SectionHeader
        title="I tuoi fantapoteri"
        caption="Li porti in ogni partita."
        action={{ label: 'Cambia', onPress: () => router.push('/powers') }}
      />
      <View style={styles.row}>
        {(['main', 'secondary'] as const).map((slot) => {
          const p = powerById(mine?.[slot]);
          return p ? (
            <PressableScale
              key={slot}
              accessibilityRole="button"
              accessibilityLabel={`${slot === 'main' ? 'Principale' : 'Secondario'}: ${p.label}. Cambia`}
              onPress={() => router.push('/powers')}
              style={[styles.tile, slot === 'main' && styles.main]}>
              <AppText style={styles.emoji}>{p.emoji}</AppText>
              <View style={styles.flex}>
                <AppText variant="micro" color={colors.inkSoft}>
                  {slot === 'main' ? 'Principale' : 'Secondario'}
                </AppText>
                <AppText variant="name">{p.label}</AppText>
              </View>
            </PressableScale>
          ) : null;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  main: { borderColor: colors.cta },
  emoji: { fontSize: 28, lineHeight: 34 },
  flex: { flex: 1 },
});
