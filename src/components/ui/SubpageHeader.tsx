import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { Icon } from '@/components/icons/Icon';
import { colors, layout, radius, space } from '@/theme/tokens';

/**
 * Testata delle schede secondarie (mazzo, squadra): freccia indietro a sinistra, titolo al centro.
 * Stesso gesto ovunque: indietro torna alla pagina da cui si è aperta la scheda.
 */
export function SubpageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Indietro"
        hitSlop={12}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.side}>
        <Icon name="chevron-left" size={22} strokeWidth={2.2} />
      </PressableScale>
      <View style={styles.center}>
        <AppText variant="headline" numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.bar,
    borderBottomRightRadius: radius.bar,
    zIndex: 5,
  },
  side: { width: 40, height: 40, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
});
