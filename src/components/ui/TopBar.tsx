import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';

import { colors, radius, space } from '@/theme/tokens';

interface Props {
  /** Testo o nodo (es. wordmark) */
  title: ReactNode;
  /** Riga sotto il titolo (es. stato partita) */
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
}

/** Top bar bianca con angoli morbidi (component "Top bar" del Figma). */
export function TopBar({ title, subtitle, left, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.md }]}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>
        {typeof title === 'string' ? (
          <AppText variant={subtitle ? 'cardTitle' : 'headline'} numberOfLines={1} accessibilityRole="header">
            {title}
          </AppText>
        ) : (
          title
        )}
        {subtitle}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md + 4,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.bar,
    borderBottomRightRadius: radius.bar,
    zIndex: 5,
  },
  side: { width: 40, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', gap: space.xxs },
});
