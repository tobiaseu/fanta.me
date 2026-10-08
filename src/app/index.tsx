import { useLocalSearchParams } from 'expo-router';

import { LobbyScreen } from '@/screens/LobbyScreen';

/** Route `/` → Lobby. `?demo=empty` mostra l'empty state illustrato. */
export default function LobbyRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  return <LobbyScreen forceEmpty={demo === 'empty'} />;
}
