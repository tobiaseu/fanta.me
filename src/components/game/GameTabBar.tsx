import { useGameStore } from '@/store/useGameStore';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { haptics } from '@/lib/haptics';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

const TABS: Record<string, { label: string; icon?: IconName }> = {
  index: { label: 'Dashboard', icon: 'home' },
  rules: { label: 'Mazzo', icon: 'grid' },
  live: { label: 'Live' },
  leaderboard: { label: 'Classifica', icon: 'people' },
  profile: { label: 'Profilo' },
};

export const TAB_BAR_SPACE = 72 + space.lg + space.md;

/**
 * "Navbar 2" del Figma: pillola flottante in vetro sopra un gradiente.
 * Il tasto centrale giallo cambia con la fase: apri il mazzo, aggiungi punti, rivincita.
 */
export function GameTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const game = useCurrentGame();
  // Il centro è un posto fisso, "Live": bloccato prima dell'inizio, il cuore del gioco in partita, l'archivio dopo
  const events = useGameStore((st) => st.events);
  const toVote = game
    ? events.filter(
        (e) =>
          e.gameId === game.id && e.status === 'pending' && !e.myVote && e.playerId !== ME.id && e.authorId !== ME.id,
      ).length
    : 0;
  const locked = game?.status === 'waiting';

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const current = state.routes[state.index]?.name;
          // la cronaca completa appartiene alla Dashboard
          const focused = state.index === index || (route.name === 'live' && current === 'feed');
          // inattivi in #6E6E6E: contrasto 4,9:1 sul vetro chiaro (WCAG AA)
          const tint = focused ? colors.ink : colors.inkSoft;

          if (route.name === 'live') {
            return (
              <PressableScale
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={
                  locked ? 'Live, si apre quando parte la partita' : toVote ? `Live, ${toVote} da votare` : 'Live'
                }
                onPress={() => {
                  haptics.press();
                  navigation.navigate(route.name, route.params);
                }}
                pressedScale={0.88}
                style={styles.tab}>
                <View style={[styles.play, locked && styles.playLocked, focused && styles.playFocused]}>
                  <Icon name={locked ? 'lock' : 'play'} size={locked ? 20 : 22} color={colors.ink} />
                  {toVote > 0 && !locked && <View style={styles.dot} />}
                </View>
                <AppText style={styles.label} color={colors.ink} numberOfLines={1}>
                  Live
                </AppText>
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
                if (state.index !== index && !event.defaultPrevented) {
                  haptics.tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.tab}>
              {tab.icon ? (
                <Icon name={tab.icon} size={26} color={tint} strokeWidth={focused ? 1.9 : 1.5} />
              ) : (
                <View style={[styles.avatarRing, focused && styles.avatarRingActive]}>
                  <Avatar player={ME} size={24} sticker={false} />
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
  playLocked: { backgroundColor: colors.surfaceMuted },
  playFocused: { borderWidth: 2, borderColor: colors.ink },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.malus,
    borderWidth: 2,
    borderColor: '#fff',
  },
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.sm,
    paddingTop: space.lg,
    experimental_backgroundImage: `linear-gradient(to top, ${colors.background} 30%, rgba(242,242,247,0))`,
  },
  bar: {
    height: 72,
    width: '100%',
    maxWidth: MAX_APP_WIDTH - space.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: space.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.94)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px)' } as object) : {}),
    ...shadow.floating,
  },
  tab: { alignItems: 'center', justifyContent: 'center', gap: 3, width: 64, height: 56 },
  label: { fontSize: 11.5, lineHeight: 14, fontWeight: '600' },
  avatarRing: { padding: 1, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  avatarRingActive: { borderColor: colors.ink },
  play: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
