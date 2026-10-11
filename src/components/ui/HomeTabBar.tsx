import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, isDark, radius, shadow, space } from '@/theme/tokens';

const TABS: Record<string, { label: string; icon?: IconName }> = {
  index: { label: 'Lobby', icon: 'home' },
  world: { label: 'World', icon: 'globe' },
  me: { label: 'Profilo' },
};

export const HOME_TAB_SPACE = 64 + space.lg + space.md;

/**
 * Navbar fuori dalla partita: tre posti fissi, come le app di sistema.
 * Lobby (le mie partite), World (la community), Profilo (la mia vetrina pubblica).
 * Stessa pillola in vetro della navbar di partita, così il gesto resta uguale ovunque.
 */
export function HomeTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const requests = useGameStore((s) => Object.values(s.friendships).filter((f) => f === 'received').length);
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const tint = focused ? colors.ink : colors.inkSoft;
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.name === 'me' && requests ? `${tab.label}, ${requests} richieste` : tab.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptics.tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={[styles.tab, focused && styles.tabOn]}>
              {tab.icon ? (
                <Icon name={tab.icon} size={24} color={tint} strokeWidth={focused ? 1.9 : 1.5} />
              ) : (
                <View style={[styles.ring, focused && styles.ringOn]}>
                  <Avatar player={ME} size={22} sticker={false} />
                  {requests > 0 && <View style={styles.dot} />}
                </View>
              )}
              <AppText style={styles.label} color={tint} numberOfLines={1}>
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.sm,
    paddingTop: space.lg,
    experimental_backgroundImage: `linear-gradient(to top, ${colors.background} 30%, ${colors.background}00)`,
  },
  bar: {
    height: 64,
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    borderRadius: radius.xl + 4,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
    backgroundColor: isDark
      ? 'rgba(28,28,31,0.82)'
      : Platform.OS === 'web'
        ? 'rgba(255,255,255,0.72)'
        : 'rgba(255,255,255,0.94)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px)' } as object) : {}),
    ...shadow.floating,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, height: 52, borderRadius: radius.xl },
  tabOn: { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
  label: { fontSize: 11, lineHeight: 13, fontWeight: '600' },
  ring: { padding: 1, borderRadius: 13, borderWidth: 1.5, borderColor: 'transparent' },
  ringOn: { borderColor: colors.ink },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.malus,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
