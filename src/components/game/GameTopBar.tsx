import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Top Bar in-game: ritorno alla Lobby, nome partita e badge di stato. */
export function GameTopBar({ game }: { game: Game }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Torna alla lobby"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.back}>
        <Icon name="chevron-left" size={22} />
      </PressableScale>
      <View style={styles.title}>
        <AppText variant="headline" numberOfLines={1}>
          {game.emoji} {game.name}
        </AppText>
        <StatusBadge status={game.status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    backgroundColor: colors.background,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, gap: space.xxs },
});
