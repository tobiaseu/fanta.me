import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { HomeTabBar } from '@/components/ui/HomeTabBar';
import { useSessionStore } from '@/store/useSessionStore';
import { colors } from '@/theme/tokens';

/**
 * FUORI PARTITA: tre pagine fisse come le app di sistema.
 *   /       → Lobby: le mie partite e cosa fare adesso
 *   /world  → World: la community (partite pubbliche, mazzi, carte, tendenze)
 *   /me     → Profilo pubblico: badge, carte, statistiche (visibilità nelle Impostazioni)
 * Le Impostazioni stanno in alto a sinistra in tutte e tre.
 */
export default function HomeLayout() {
  const { signedIn, onboarded } = useSessionStore();
  if (!signedIn) return <Redirect href="/welcome" />;
  if (!onboarded) return <Redirect href="/onboarding/hello" />;
  return (
    <Tabs
      tabBar={(props) => <HomeTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.background } }}>
      <Tabs.Screen name="index" options={{ title: 'Lobby' }} />
      <Tabs.Screen name="world" options={{ title: 'World' }} />
      <Tabs.Screen name="me" options={{ title: 'Profilo' }} />
    </Tabs>
  );
}
