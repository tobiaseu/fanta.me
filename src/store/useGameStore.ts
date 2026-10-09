import { create } from 'zustand';

import { FEED, FRIENDSHIPS, GAMES, ME, PLAYERS, POWERS, PROPOSALS } from '@/data/mock';
import { CUSTOM_RULES, FREE_CUSTOM_SLOTS, POWER_UPS, RULES, ruleById } from '@/data/rules';
import type {
  CardProposal,
  FeedEvent,
  FriendStatus,
  Game,
  GameMode,
  Player,
  PowerActivation,
  PowerUpId,
  Rule,
  Vote,
} from '@/types/game';

const HOUR_MS = 3_600_000;

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
  /** `startsInHours` 0 = si gioca subito; altrimenti la stanza resta in pre-partita fino all'inizio */
  createGame: (input: { name: string; mode: GameMode; friendIds?: string[]; startsInHours?: number }) => Game;
  /** Chi ha creato la stanza la fa partire prima del previsto */
  startGame: (gameId: string) => void;

  /* ---- Carte personali e proposte (pre-partita) ---- */
  customRules: Rule[];
  createCustomRule: (input: Omit<Rule, 'id' | 'authorId'>) => Rule;
  proposals: CardProposal[];
  proposeCard: (gameId: string, ruleId: string) => void;
  toggleLike: (proposalId: string) => void;

  /* ---- Premium (mock: Fase 3 con RevenueCat) ---- */
  /** Carte personali in più comprate con il pass a uso singolo */
  extraSlots: number;
  buyCardPass: () => void;
  upgradeRoom: (gameId: string) => void;

  /* ---- Fantapoteri ---- */
  powers: Record<string, { main: PowerUpId; secondary: PowerUpId }>;
  setPower: (slot: 'main' | 'secondary', powerId: PowerUpId) => void;
  activations: PowerActivation[];
  activatePower: (gameId: string, slot: 'main' | 'secondary') => PowerActivation | undefined;
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
    let points = double ? rule.points * 2 : rule.points;
    // Fantapoteri attivi: Turbo raddoppia i miei bonus, Moviola dimezza i bonus degli altri
    const active = activeActivations(useGameStore.getState().activations, gameId, Date.now());
    if (points > 0) {
      if (active.some((a) => a.powerId === 'boost' && a.playerId === playerId)) points *= 2;
      if (active.some((a) => a.powerId === 'slowdown' && a.playerId !== playerId)) points = Math.round(points / 2);
    }
    const event: FeedEvent = {
      id: `e-${Date.now()}`,
      status: 'pending',
      myVote: 'confirm', // chi chiama il punto lo conferma già
      gameId,
      playerId,
      ruleId,
      points,
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

  createGame: ({ name, mode, friendIds = [], startsInHours = 0 }) => {
    const start = Date.now() + startsInHours * HOUR_MS;
    const game: Game = {
      id: `g-${Date.now()}`,
      name,
      emoji: mode === 'sprint' ? '⚡️' : '🏃',
      setting: 'party',
      mode,
      status: startsInHours > 0 ? 'waiting' : 'live',
      ownerId: ME.id,
      startsAt: new Date(start).toISOString(),
      endsAt: mode === 'sprint' ? new Date(start + 48 * HOUR_MS).toISOString() : undefined,
      week: mode === 'marathon' ? { current: 1, total: 4 } : undefined,
      playerIds: [ME.id, ...friendIds],
      ruleIds: RULES.map((r) => r.id), // le 20 carte base; le personali si propongono nel pre-partita
      accent: '#0B8200',
    };
    set((s) => ({ games: [game, ...s.games] }));
    return game;
  },

  startGame: (gameId) =>
    set((s) => ({
      games: s.games.map((g) =>
        g.id === gameId
          ? {
              ...g,
              status: 'live',
              startsAt: new Date().toISOString(),
              endsAt: g.mode === 'sprint' ? new Date(Date.now() + 48 * HOUR_MS).toISOString() : g.endsAt,
            }
          : g,
      ),
    })),

  customRules: CUSTOM_RULES.slice(),
  createCustomRule: (input) => {
    const rule: Rule = { ...input, id: `c-${Date.now()}`, authorId: ME.id };
    CUSTOM_RULES.push(rule); // registro per ruleById (vedi data/rules)
    set((s) => ({ customRules: [...s.customRules, rule] }));
    return rule;
  },

  proposals: PROPOSALS,
  proposeCard: (gameId, ruleId) =>
    set((s) => {
      if (s.proposals.some((p) => p.gameId === gameId && p.ruleId === ruleId)) return s;
      const proposal: CardProposal = {
        id: `pr-${Date.now()}`,
        gameId,
        ruleId,
        authorId: ME.id,
        likes: [ME.id],
        status: 'open',
      };
      return settleProposal(s, proposal, [proposal, ...s.proposals]);
    }),
  toggleLike: (proposalId) =>
    set((s) => {
      const current = s.proposals.find((p) => p.id === proposalId);
      if (!current || current.status === 'accepted') return s;
      const likes = current.likes.includes(ME.id)
        ? current.likes.filter((id) => id !== ME.id)
        : [...current.likes, ME.id];
      const next = { ...current, likes };
      return settleProposal(
        s,
        next,
        s.proposals.map((p) => (p.id === proposalId ? next : p)),
      );
    }),

  extraSlots: 0,
  buyCardPass: () => set((s) => ({ extraSlots: s.extraSlots + 5 })),
  upgradeRoom: (gameId) => set((s) => ({ games: s.games.map((g) => (g.id === gameId ? { ...g, premium: true } : g)) })),

  powers: POWERS,
  setPower: (slot, powerId) =>
    set((s) => {
      const mine = s.powers[ME.id] ?? { main: 'boost', secondary: 'shield' };
      const other = slot === 'main' ? 'secondary' : 'main';
      // lo stesso potere non può occupare due slot: si scambiano
      const next = { ...mine, [slot]: powerId, ...(mine[other] === powerId ? { [other]: mine[slot] } : {}) };
      return { powers: { ...s.powers, [ME.id]: next } };
    }),
  activations: [],
  activatePower: (gameId, slot) => {
    const s = useGameStore.getState();
    if (s.activations.some((a) => a.gameId === gameId && a.playerId === ME.id && a.slot === slot)) return undefined;
    const power = POWER_UPS.find((p) => p.id === s.powers[ME.id]?.[slot]);
    if (!power) return undefined;
    const now = Date.now();
    const activation: PowerActivation = {
      gameId,
      playerId: ME.id,
      powerId: power.id,
      slot,
      at: new Date(now).toISOString(),
      until: new Date(now + Math.max(power.hours, 0.01) * HOUR_MS).toISOString(),
    };
    set({ activations: [...s.activations, activation] });
    return activation;
  },
}));

/** Una proposta entra nel mazzo quando la maggioranza della stanza la vuole. */
function settleProposal(s: GameState, proposal: CardProposal, proposals: CardProposal[]) {
  const game = s.games.find((g) => g.id === proposal.gameId);
  if (!game || proposal.likes.length < proposalsNeeded(game)) return { proposals };
  return {
    proposals: proposals.map((p) => (p.id === proposal.id ? { ...p, status: 'accepted' as const } : p)),
    games: s.games.map((g) =>
      g.id === game.id && !g.ruleIds.includes(proposal.ruleId) ? { ...g, ruleIds: [...g.ruleIds, proposal.ruleId] } : g,
    ),
  };
}

export const proposalsNeeded = (game: Game) => Math.floor(game.playerIds.length / 2) + 1;

/** Carte personali disponibili: 5 gratis, +5 con il pass, +5 nelle stanze Premium. */
export const customSlots = (extraSlots: number, game?: Game) =>
  FREE_CUSTOM_SLOTS + extraSlots + (game?.premium ? 5 : 0);

export const activeActivations = (activations: PowerActivation[], gameId: string, now: number) =>
  activations.filter((a) => a.gameId === gameId && new Date(a.until).getTime() > now);

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
  const bonuses = game.ruleIds.map(ruleById).filter((r): r is Rule => !!r && r.points > 0);
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
