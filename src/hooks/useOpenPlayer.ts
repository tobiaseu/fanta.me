import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { haptics } from '@/lib/haptics';

/** Apre il profilo di un giocatore da qualunque punto dell'app. */
export function useOpenPlayer() {
  const router = useRouter();
  return useCallback(
    (playerId: string) => {
      haptics.tap();
      router.push({ pathname: '/player/[playerId]', params: { playerId } });
    },
    [router],
  );
}
