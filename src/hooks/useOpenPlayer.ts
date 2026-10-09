import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { haptics } from '@/lib/haptics';
import { useUiStore } from '@/store/useUiStore';

/**
 * Tocco su un giocatore da qualunque punto dell'app: apre il piccolo menù
 * stile Clash (formazione, profilo, amicizia). Su di me va dritto al profilo.
 */
export function useOpenPlayer() {
  const router = useRouter();
  const gameId = useCurrentGame()?.id;
  const openPlayerMenu = useUiStore((s) => s.openPlayerMenu);
  return useCallback(
    (playerId: string) => {
      haptics.tap();
      if (playerId === ME.id) {
        router.push({ pathname: '/player/[playerId]', params: { playerId } });
        return;
      }
      openPlayerMenu(playerId, gameId);
    },
    [router, gameId, openPlayerMenu],
  );
}
