import { Redirect, useLocalSearchParams } from 'expo-router';

import { LobbyScreen } from '@/screens/LobbyScreen';
import { useSessionStore } from '@/store/useSessionStore';

/** Route `/` → Lobby, dopo login e prima stanza. `?demo=empty` mostra l'empty state illustrato. */
export default function LobbyRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { signedIn, onboarded } = useSessionStore();
  if (!signedIn) return <Redirect href="/welcome" />;
  if (!onboarded) return <Redirect href="/onboarding/hello" />;
  return <LobbyScreen forceEmpty={demo === 'empty'} />;
}
