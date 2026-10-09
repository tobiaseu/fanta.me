import { createContext, useContext, type ReactNode } from 'react';

import { useGame } from '@/store/useGameStore';

/**
 * Partita corrente, fornita dal layout `/game/[gameId]` ai suoi tab.
 * Non leggiamo i parametri globali: quando sopra la partita si apre una modale
 * (es. /call/…) il gameId globale sparisce e il layout farebbe redirect alla Lobby.
 */
const GameIdContext = createContext<string | undefined>(undefined);

export function CurrentGameProvider({ gameId, children }: { gameId: string; children: ReactNode }) {
  return <GameIdContext.Provider value={gameId}>{children}</GameIdContext.Provider>;
}

export function useCurrentGame() {
  return useGame(useContext(GameIdContext));
}
