import { create } from 'zustand';

import { FEED, GAMES, ME, PLAYERS } from '@/data/mock';
import { RULES, ruleById } from '@/data/rules';
import type { FeedEvent, Game, GameMode, Player, Vote } from '@/types/game';

/**
 * Store globale del gioco.
 * Fase 2: le azioni diventano chiamate Supabase e `events` si aggiorna
 * tramite un canale Realtime (`postgres_changes` sulla tabella `feed_events`).
 */
interface GameState {
  games: Game[];
  players: Player[];
  events: FeedEvent[];
  /** "Chiama" un punto: nasce in attesa del voto del gruppo */
  assignPoints: (input: { gameId: string; playerId: string; ruleId: string }) => FeedEvent | undefined;
  /** Voto su una chiamata. Nel mock il primo voto la rende ufficiale (o la scarta). */
  vote: (eventId: string, vote: Vote) => void;
  createGame: (input: { name: string; mode: GameMode }) => Game;
}

export const useGameStore = create<GameState>((set) => ({
  games: GAMES,
  players: PLAYERS,
  events: FEED,

  assignPoints: ({ gameId, playerId, ruleId }) => {
    const rule = ruleById(ruleId);
    if (!rule) return undefined;
    const event: FeedEvent = {
      id: `e-${Date.now()}`,
      status: 'pending',
      myVote: 'confirm', // chi chiama il punto lo conferma già
      gameId,
      playerId,
      ruleId,
      points: rule.points,
      authorId: ME.id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ events: [event, ...s.events] }));
    return event;
  },

  vote: (eventId, vote) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, myVote: vote, status: vote === 'confirm' ? 'confirmed' : 'rejected' } : e,
      ),
    })),

  createGame: ({ name, mode }) => {
    const game: Game = {
      id: `g-${Date.now()}`,
      name,
      emoji: mode === 'sprint' ? '⚡️' : '🏃',
      setting: 'party',
      mode,
      status: 'live',
      endsAt: mode === 'sprint' ? new Date(Date.now() + 48 * 3_600_000).toISOString() : undefined,
      week: mode === 'marathon' ? { current: 1, total: 4 } : undefined,
      playerIds: [ME.id],
      ruleIds: RULES.map((r) => r.id),
      accent: '#0B8200',
    };
    set((s) => ({ games: [game, ...s.games] }));
    return game;
  },
}));

/* ---------- Selettori derivati ---------- */

export const useGame = (gameId: string | undefined) =>
  useGameStore((s) => s.games.find((g) => g.id === gameId));

/** Classifica: contano solo i punti confermati. */
export function computeStandings(game: Game, events: FeedEvent[], players: Player[]) {
  const totals = new Map<string, number>(game.playerIds.map((id) => [id, 0]));
  for (const e of events) {
    if (e.gameId === game.id && e.status === 'confirmed') {
      totals.set(e.playerId, (totals.get(e.playerId) ?? 0) + e.points);
    }
  }
  return game.playerIds
    .map((id) => ({ player: players.find((p) => p.id === id)!, points: totals.get(id) ?? 0 }))
    .filter((r) => r.player)
    .sort((a, b) => b.points - a.points);
}
