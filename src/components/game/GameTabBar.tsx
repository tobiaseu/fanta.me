import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Feed', icon: 'feed' },
  rules: { label: 'Regole', icon: 'rules' },
  action: { label: 'Azione', icon: 'bolt' },
  leaderboard: { label: 'Classifica', icon: 'trophy' },
  profile: { label: 'Profilo', icon: 'user' },
};

/**
 * Bottom Navbar a 5 icone. Il tab centrale non naviga: apre il Bottom Sheet
 * "Azione Veloce", così assegnare punti è sempre a un tocco da qualsiasi tab.
 */
export function GameTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const openQuickAction = useUiStore((s) => s.openQuickAction);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;

          if (route.name === 'action') {
            return (
              <PressableScale
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel="Azione veloce: assegna punti"
                onPress={() => {
                  haptics.press();
                  openQuickAction();
                }}
                pressedScale={0.9}
                style={styles.actionButton}>
                <Icon name="bolt" size={26} color={colors.ctaInk} />
              </PressableScale>
            );
          }

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptics.tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.tab}>
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <Icon name={tab.icon} size={22} color={focused ? colors.liveInk : colors.inkMuted} />
              </View>
              <AppText variant="caption" color={focused ? colors.ink : colors.inkMuted} style={styles.label}>
                {tab.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.xs,
    ...shadow.card,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: space.xs,
  },
  tab: { alignItems: 'center', gap: 2, minWidth: 60 },
  iconPill: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: colors.liveSoft },
  label: { fontSize: 11 },
  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -26,
    backgroundColor: colors.cta,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
});
