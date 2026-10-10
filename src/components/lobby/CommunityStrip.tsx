import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { COMMUNITY_DECKS } from '@/data/community';
import { haptics } from '@/lib/haptics';
import { colors, layout, radius, space } from '@/theme/tokens';

/** In home: i mazzi più giocati della community, porta d'ingresso a Esplora. */
export function CommunityStrip() {
  const router = useRouter();
  const open = () => {
    haptics.tap();
    router.push('/explore');
  };
  return (
    <View style={styles.section}>
      <SectionHeader title="Dalla community" action={{ label: 'Esplora', onPress: open }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}>
        {[...COMMUNITY_DECKS]
          .sort((a, b) => b.plays - a.plays)
          .map((d) => (
            <PressableScale
              key={d.id}
              accessibilityRole="button"
              accessibilityLabel={`Mazzo ${d.name}, ${d.occasion}, ${d.plays} partite`}
              onPress={open}
              style={styles.deck}>
              <AppText style={styles.emoji}>{d.emoji}</AppText>
              <AppText variant="name" numberOfLines={1}>
                {d.name}
              </AppText>
              <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
                {d.occasion} · {d.ruleIds.length} carte
              </AppText>
            </PressableScale>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  scroll: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: layout.gutter },
  deck: { width: 140, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: 2 },
  emoji: { fontSize: 32, lineHeight: 40, marginBottom: space.xxs },
});
