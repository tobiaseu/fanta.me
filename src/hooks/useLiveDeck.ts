import { useEffect } from 'react';

import { ME } from '@/data/mock';
import { RULES } from '@/data/rules';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import type { Game } from '@/types/game';

/**
 * Demo del mazzo "in diretta": nel pre-partita, ogni tanto un amico aggiunge una carta.
 * Fase 2: arriva da Supabase Realtime sulla tabella delle proposte.
 */
export function useLiveDeck(game: Game | undefined, every = 25_000) {
  const proposeCard = useGameStore((s) => s.proposeCard);
  const showToast = useUiStore((s) => s.showToast);
  useEffect(() => {
    if (!game || game.status !== 'waiting') return;
    const id = setInterval(() => {
      const state = useGameStore.getState();
      const current = state.games.find((g) => g.id === game.id);
      if (!current) return;
      const others = current.playerIds.filter((p) => p !== ME.id);
      const free = RULES.filter((r) => !current.ruleIds.includes(r.id));
      if (!others.length || !free.length) return;
      const who = others[Math.floor(Math.random() * others.length)];
      const rule = free[Math.floor(Math.random() * free.length)];
      proposeCard(game.id, rule.id, who);
      const name = state.players.find((p) => p.id === who)?.name ?? 'Qualcuno';
      showToast({ text: `${name} ha messo ${rule.emoji} ${rule.label} nel mazzo` });
    }, every);
    return () => clearInterval(id);
  }, [game?.id, game?.status, every, proposeCard, showToast]);
}
