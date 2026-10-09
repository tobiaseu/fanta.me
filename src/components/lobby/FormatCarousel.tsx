import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { FORMATS, type GameFormat } from '@/data/formats';
import { haptics } from '@/lib/haptics';
import { colors, radius, shadow, space } from '@/theme/tokens';

const CARD_W = 212;

/** Carosello "Nuovo evento": un format = una scorciatoia per creare la stanza. */
export function FormatCarousel({ onPick }: { onPick: (f: GameFormat) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_W + space.md}
      decelerationRate="fast"
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {FORMATS.map((f) => (
        <PressableScale
          key={f.id}
          accessibilityRole="button"
          accessibilityLabel={`Nuovo evento Fanta ${f.name}`}
          onPress={() => {
            haptics.tap();
            onPick(f);
          }}
          style={[styles.card, { backgroundColor: f.tint }]}>
          <View style={styles.tag}>
            <AppText variant="caption" color={colors.inkSoft}>
              {f.tag}
            </AppText>
          </View>
          <View>
            <AppText style={styles.fanta}>FANTA</AppText>
            <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
              {f.name}
            </AppText>
          </View>
          <AppText variant="body" color={colors.inkSoft} numberOfLines={3}>
            {f.description}
          </AppText>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -space.md },
  row: { gap: space.md, paddingHorizontal: space.md, paddingVertical: space.xs },
  card: {
    width: CARD_W,
    minHeight: 250,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadow.card,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  fanta: { fontSize: 28, lineHeight: 30, fontWeight: '300', color: colors.ink },
  name: { fontSize: 28, lineHeight: 32, fontWeight: '800', color: colors.ink },
});
