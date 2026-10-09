/** Modello di dominio di Fanta.me (condiviso tra UI, store e futuro backend). */

export type GameMode = 'sprint' | 'marathon';
export type GameStatus = 'live' | 'waiting' | 'ended';
export type GameSetting = 'vacation' | 'office' | 'school' | 'party';

export interface Player {
  id: string;
  name: string;
  handle: string;
  /** Colore dell'avatar sticker */
  color: string;
  /** Carriera pubblica (mostrata nel profilo giocatore) */
  career?: Career;
}

export interface Career {
  trophies: number;
  gamesPlayed: number;
  wins: number;
  totalPoints: number;
}

export interface User extends Player {
  career: Career;
}

/**
 * Amicizia vista da me: nessuna, richiesta inviata da me, richiesta ricevuta, amici.
 * Gli amici si invitano con un tocco quando si crea una stanza.
 */
export type FriendStatus = 'none' | 'sent' | 'received' | 'friends';

export type RuleKind = 'bonus' | 'malus';

export interface RuleCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface Rule {
  id: string;
  categoryId: string;
  /** Nome breve della "carta trofeo" */
  label: string;
  description: string;
  points: number; // positivo = bonus, negativo = malus
  /** Emoji della carta: su iPhone/Mac è la emoji 3D di Apple */
  emoji: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

export type PowerUpId = 'veto' | 'multiplier';

export interface PowerUp {
  id: PowerUpId;
  label: string;
  description: string;
  /** Si sblocca guardando una Rewarded Ad (Fase 3, RevenueCat/AdMob) */
  unlock: 'ad' | 'free';
}

export interface Game {
  id: string;
  name: string;
  emoji: string;
  setting: GameSetting;
  mode: GameMode;
  status: GameStatus;
  /** Sprint: fine del countdown (ISO) */
  endsAt?: string;
  /** Maratona: settimana corrente e totale */
  week?: { current: number; total: number };
  playerIds: string[];
  /** Squadre (fantasquadre) della lega, se previste */
  teams?: Team[];
  ruleIds: string[];
  /** Colore principale della mascotte della stanza */
  accent: string;
}

/**
 * Ogni assegnazione è una "chiamata": diventa ufficiale quando il gruppo la conferma.
 * `pending` = da votare (cerchio giallo nelle storie del Feed).
 */
export type EventStatus = 'pending' | 'confirmed' | 'rejected';
export type Vote = 'confirm' | 'reject';

export interface FeedEvent {
  id: string;
  status: EventStatus;
  /** Il mio voto, se già espresso */
  myVote?: Vote;
  gameId: string;
  playerId: string;
  ruleId: string;
  points: number;
  authorId: string;
  createdAt: string;
  /** Voti raccolti finora (chi chiama conta già come conferma) */
  votes: { confirm: number; reject: number };
}
