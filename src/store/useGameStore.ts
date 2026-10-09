import { create } from 'zustand';

import { FEED, FRIENDSHIPS, GAMES, ME, PLAYERS } from '@/data/mock';
import { RULES, ruleById } from '@/data/rules';
import type { FeedEvent, FriendStatus, Game, GameMode, Player, Vote } from '@/types/game';

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
  /** Voto su una chiamata: diventa ufficiale (o scartata) quando una parte raggiunge la maggioranza. */
  vote: (eventId: string, vote: Vote) => void;
  /** Annulla: rimette l'evento com'era (o lo toglie, se era appena nato) */
  restoreEvent: (previous: FeedEvent | undefined, eventId: string) => void;
  createGame: (input: { name: string; mode: GameMode; friendIds?: string[] }) => Game;
  /** Aggiunge gli invitati a una stanza (Fase 2: inviti in attesa di accettazione) */
  addPlayers: (gameId: string, playerIds: string[]) => void;

  /** Capitano di oggi per squadra (stile FantaSanremo): i suoi punti di oggi valgono doppio */
  captains: Record<string, string>;
  setCaptain: (teamId: string, playerId: string) => void;

  friendships: Record<string, FriendStatus>;
  setFriendship: (playerId: string, status: FriendStatus) => void;
}

export const useGameStore = create<GameState>((set) => ({
  games: GAMES,
  players: PLAYERS,
  events: FEED,
  friendships: FRIENDSHIPS,
  captains: { t1: 'u-ale', t2: 'u-giulia', t3: 'u-sara' },
  setCaptain: (teamId, playerId) => set((s) => ({ captains: { ...s.captains, [teamId]: playerId } })),

  assignPoints: ({ gameId, playerId, ruleId }) => {
    const rule = ruleById(ruleId);
    if (!rule) return undefined;
    const game = useGameStore.getState().games.find((g) => g.id === gameId);
    const double = game ? cardOfDay(game, Date.now())?.id === rule.id : false;
    const event: FeedEvent = {
      id: `e-${Date.now()}`,
      status: 'pending',
      myVote: 'confirm', // chi chiama il punto lo conferma già
      gameId,
      playerId,
      ruleId,
      points: double ? rule.points * 2 : rule.points,
      double,
      authorId: ME.id,
      createdAt: new Date().toISOString(),
      votes: { confirm: 1, reject: 0 },
    };
    set((s) => ({ events: [event, ...s.events] }));
    return event;
  },

  vote: (eventId, vote) =>
    set((s) => ({
      events: s.events.map((e) => {
        if (e.id !== eventId) return e;
        const game = s.games.find((g) => g.id === e.gameId);
        const votes = { ...e.votes };
        if (e.myVote) votes[e.myVote] -= 1; // cambio idea: tolgo il voto precedente
        votes[vote] += 1;
        const needed = game ? votesNeeded(game) : 1;
        const status = votes.confirm >= needed ? 'confirmed' : votes.reject >= needed ? 'rejected' : 'pending';
        return { ...e, myVote: vote, votes, status };
      }),
    })),

  restoreEvent: (previous, eventId) =>
    set((s) => ({
      events: previous
        ? s.events.map((e) => (e.id === eventId ? previous : e))
        : s.events.filter((e) => e.id !== eventId),
    })),

  addPlayers: (gameId, playerIds) =>
    set((s) => ({
      games: s.games.map((g) =>
        g.id === gameId
          ? { ...g, playerIds: [...g.playerIds, ...playerIds.filter((id) => !g.playerIds.includes(id))] }
          : g,
      ),
    })),

  setFriendship: (playerId, status) => set((s) => ({ friendships: { ...s.friendships, [playerId]: status } })),

  createGame: ({ name, mode, friendIds = [] }) => {
    const game: Game = {
      id: `g-${Date.now()}`,
      name,
      emoji: mode === 'sprint' ? '⚡️' : '🏃',
      setting: 'party',
      mode,
      status: 'live',
      startsAt: new Date().toISOString(),
      endsAt: mode === 'sprint' ? new Date(Date.now() + 48 * 3_600_000).toISOString() : undefined,
      week: mode === 'marathon' ? { current: 1, total: 4 } : undefined,
      playerIds: [ME.id, ...friendIds],
      ruleIds: RULES.map((r) => r.id),
      accent: '#0B8200',
    };
    set((s) => ({ games: [game, ...s.games] }));
    return game;
  },
}));

/* ---------- Selettori derivati ---------- */

const DAY_MS = 86_400_000;

/**
 * Giornate stile "serate del Festival": la partita è divisa in finestre di 24 ore
 * dall'inizio. Maratona: la giornata è la settimana.
 */
export function gameDay(game: Game, now: number) {
  if (game.mode === 'marathon' && game.week) {
    return {
      index: game.week.current,
      total: game.week.total,
      label: 'Settimana',
      start: now - 3 * DAY_MS,
      end: now + 4 * DAY_MS,
    };
  }
  const start = new Date(game.startsAt ?? now).getTime();
  const end = new Date(game.endsAt ?? start + 2 * DAY_MS).getTime();
  const total = Math.max(1, Math.ceil((end - start) / DAY_MS));
  const index = Math.min(total, Math.max(1, Math.floor((now - start) / DAY_MS) + 1));
  const dayStart = start + (index - 1) * DAY_MS;
  return { index, total, label: 'Giornata', start: dayStart, end: Math.min(end, dayStart + DAY_MS) };
}

/** Carta del giorno: un bonus del mazzo che oggi vale doppio, uguale per tutti. */
export function cardOfDay(game: Game, now: number) {
  const bonuses = RULES.filter((r) => game.ruleIds.includes(r.id) && r.points > 0);
  if (!bonuses.length) return undefined;
  const { index } = gameDay(game, now);
  return bonuses[(index * 7 + game.id.length) % bonuses.length];
}

/** Classifica della giornata: solo punti confermati dentro la finestra di oggi. */
export function computeDayStandings(game: Game, events: FeedEvent[], players: Player[], now: number) {
  const { start, end } = gameDay(game, now);
  return computeStandings(
    game,
    events.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= start && t < end;
    }),
    players,
  );
}

/** Maggioranza di chi può votare (tutti tranne il giocatore chiamato). */
export const votesNeeded = (game: Game) => Math.floor((game.playerIds.length - 1) / 2) + 1;

/** Codice invito di 6 lettere: quello scelto dal creatore o derivato dal nome. */
export const inviteCode = (game: Game) =>
  game.code ?? (game.name.toUpperCase().replace(/[^A-Z]/g, '') + 'XXXXXX').slice(0, 6);

export const useGame = (gameId: string | undefined) => useGameStore((s) => s.games.find((g) => g.id === gameId));

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

/**
 * Classifica a squadre: somma dei membri, più i punti di oggi del capitano
 * contati una seconda volta (il capitano vale doppio, come in FantaSanremo).
 */
export function computeTeamStandings(
  game: Game,
  events: FeedEvent[],
  players: Player[],
  captains: Record<string, string>,
  now: number,
) {
  const all = computeStandings(game, events, players);
  const today = computeDayStandings(game, events, players, now);
  return (game.teams ?? [])
    .map((team) => {
      const members = all.filter((r) => team.memberIds.includes(r.player.id));
      const captainId = captains[team.id];
      const captainBonus = Math.max(0, today.find((r) => r.player.id === captainId)?.points ?? 0);
      return {
        team,
        members,
        captain: players.find((p) => p.id === captainId),
        captainBonus,
        points: members.reduce((sum, m) => sum + m.points, 0) + captainBonus,
      };
    })
    .sort((a, b) => b.points - a.points);
}
