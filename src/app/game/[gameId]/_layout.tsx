import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { GameTabBar } from '@/components/game/GameTabBar';
import { QuickActionSheet } from '@/components/game/QuickActionSheet';
import { Icon } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TopBar } from '@/components/ui/TopBar';
import { CurrentGameProvider } from '@/hooks/useCurrentGame';
import { useGame } from '@/store/useGameStore';
import { colors } from '@/theme/tokens';

/**
 * DASHBOARD IN-GAME: Tabs a 5 voci con Top Bar condivisa (nome lega + stato).
 * Ordine dei tab = ordine delle icone nella navbar.
 * `action` è un tab "fantasma": la navbar lo intercetta e apre il Bottom Sheet.
 */
export default function GameLayout() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGame(gameId);
  const router = useRouter();
  if (!game) return <Redirect href="/" />;

  return (
    <CurrentGameProvider gameId={game.id}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBar
          title={game.name}
          subtitle={<StatusBadge status={game.status} />}
          left={
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Torna alle tue leghe"
              hitSlop={12}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
              <Icon name="chevron-left" size={24} strokeWidth={2} />
            </PressableScale>
          }
          right={<Icon name="bell" size={24} />}
        />
        <Tabs
          tabBar={(props) => <GameTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            sceneStyle: { backgroundColor: colors.background },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Feed' }} />
          <Tabs.Screen name="rules" options={{ title: 'Regolamento' }} />
          <Tabs.Screen name="action" options={{ title: 'Aggiungi punti' }} />
          <Tabs.Screen name="leaderboard" options={{ title: 'Classifica' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
        </Tabs>
        <QuickActionSheet game={game} />
      </View>
    </CurrentGameProvider>
  );
}
