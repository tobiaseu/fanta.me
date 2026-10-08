import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { GameTabBar } from '@/components/game/GameTabBar';
import { GameTopBar } from '@/components/game/GameTopBar';
import { QuickActionSheet } from '@/components/game/QuickActionSheet';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { colors } from '@/theme/tokens';

/**
 * DASHBOARD IN-GAME: Tabs a 5 voci con Top Bar condivisa.
 * Ordine dei tab = ordine delle icone nella navbar.
 * `action` è un tab "fantasma": la navbar lo intercetta e apre il Bottom Sheet.
 */
export default function GameLayout() {
  const game = useCurrentGame();
  if (!game) return <Redirect href="/" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GameTopBar game={game} />
      <Tabs
        tabBar={(props) => <GameTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          sceneStyle: { backgroundColor: colors.background },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Feed' }} />
        <Tabs.Screen name="rules" options={{ title: 'Regolamento' }} />
        <Tabs.Screen name="action" options={{ title: 'Azione veloce' }} />
        <Tabs.Screen name="leaderboard" options={{ title: 'Classifica' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
      </Tabs>
      <QuickActionSheet game={game} />
    </View>
  );
}
