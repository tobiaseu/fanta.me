import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, layout, radius, space } from '@/theme/tokens';

/** Segnaposto per le sezioni vuote: dice cosa comparirà qui, senza sembrare un errore. */
export function EmptyNote({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <View style={styles.box}>
      <AppText style={styles.emoji}>{emoji}</AppText>
      <View style={styles.text}>
        <AppText variant="name">{title}</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: layout.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  emoji: { fontSize: 28, lineHeight: 34 },
  text: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
});
