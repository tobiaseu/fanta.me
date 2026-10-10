import { Redirect, useLocalSearchParams } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { View } from 'react-native';

import { LiveIntro } from '@/components/game/LiveIntro';
import { GameHeader } from '@/components/game/GameHeader';
import { GameTabBar } from '@/components/game/GameTabBar';
import { QuickActionSheet } from '@/components/game/QuickActionSheet';
import { CurrentGameProvider } from '@/hooks/useCurrentGame';
import { useGame } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { colors } from '@/theme/tokens';

/**
 * PARTITA: header con countdown sempre in alto + Tabs a 5 voci.
 * L'header è una riga di stato che si apre con un tocco.
 * `action` è un tab "fantasma": la navbar lo intercetta e apre il Bottom Sheet.
 * `feed` (cronaca completa) è nascosto dalla navbar: ci si arriva da "Vedi tutto".
 */
export default function GameLayout() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGame(gameId);
  const setLastGame = useSessionStore((s) => s.setLastGame);
  useEffect(() => {
    if (gameId) setLastGame(gameId);
  }, [gameId, setLastGame]);
  if (!game) return <Redirect href="/" />;

  return (
    <CurrentGameProvider gameId={game.id}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <GameHeader game={game} />
        <Tabs
          tabBar={(props) => <GameTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            sceneStyle: { backgroundColor: colors.background },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
          <Tabs.Screen name="rules" options={{ title: 'Mazzo' }} />
          <Tabs.Screen name="live" options={{ title: 'Live' }} />
          <Tabs.Screen name="leaderboard" options={{ title: 'Classifica' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
          <Tabs.Screen name="feed" options={{ title: 'Cronaca' }} />
        </Tabs>
        <QuickActionSheet game={game} />
        <LiveIntro game={game} />
      </View>
    </CurrentGameProvider>
  );
}
