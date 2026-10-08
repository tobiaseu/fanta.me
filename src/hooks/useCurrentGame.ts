import { useGlobalSearchParams } from 'expo-router';

import { useGame } from '@/store/useGameStore';

/** Partita corrente letta dal segmento dinamico `/game/[gameId]`. */
export function useCurrentGame() {
  const { gameId } = useGlobalSearchParams<{ gameId: string }>();
  return useGame(gameId);
}
