import { Redirect, useLocalSearchParams } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';
import { View } from 'react-native';

import { GameHeader } from '@/components/game/GameHeader';
import { GameTabBar } from '@/components/game/GameTabBar';
import { QuickActionSheet } from '@/components/game/QuickActionSheet';
import { CurrentGameProvider } from '@/hooks/useCurrentGame';
import { useGame } from '@/store/useGameStore';
import { colors } from '@/theme/tokens';

/**
 * PARTITA: header con countdown sempre in alto + Tabs a 5 voci.
 * L'header è aperto sulla Dashboard e si riduce a striscia di stato sugli altri tab.
 * `action` è un tab "fantasma": la navbar lo intercetta e apre il Bottom Sheet.
 * `feed` (cronaca completa) è nascosto dalla navbar: ci si arriva da "Vedi tutto".
 */
export default function GameLayout() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGame(gameId);
  // Tab attivo letto dagli eventi di focus, non dal pathname: una modale sopra non lo cambia.
  const [activeTab, setActiveTab] = useState('index');
  if (!game) return <Redirect href="/" />;

  return (
    <CurrentGameProvider gameId={game.id}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <GameHeader game={game} expanded={activeTab === 'index'} />
        <Tabs
          tabBar={(props) => <GameTabBar {...props} />}
          screenListeners={({ route }) => ({ focus: () => setActiveTab(route.name) })}
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            sceneStyle: { backgroundColor: colors.background },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
          <Tabs.Screen name="rules" options={{ title: 'Regolamento' }} />
          <Tabs.Screen name="action" options={{ title: 'Aggiungi punti' }} />
          <Tabs.Screen name="leaderboard" options={{ title: 'Classifica' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
          <Tabs.Screen name="feed" options={{ title: 'Cronaca' }} />
        </Tabs>
        <QuickActionSheet game={game} />
      </View>
    </CurrentGameProvider>
  );
}
