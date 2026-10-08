/** Modello di dominio di Fanta.me (condiviso tra UI, store e futuro backend). */

export type GameMode = 'sprint' | 'marathon';
export type GameStatus = 'live' | 'waiting' | 'ended';
export type GameSetting = 'vacation' | 'office' | 'school' | 'party';

export interface Player {
  id: string;
  name: string;
  /** Colore dell'avatar sticker */
  color: string;
}

export interface Career {
  trophies: number;
  gamesPlayed: number;
  wins: number;
  totalPoints: number;
}

export interface User extends Player {
  handle: string;
  career: Career;
}

export type RuleKind = 'bonus' | 'malus';

export interface RuleCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface Rule {
  id: string;
  categoryId: string;
  label: string;
  points: number; // positivo = bonus, negativo = malus
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
  ruleIds: string[];
  /** Colore principale della mascotte della stanza */
  accent: string;
}

export interface FeedEvent {
  id: string;
  gameId: string;
  playerId: string;
  ruleId: string;
  points: number;
  authorId: string;
  createdAt: string;
}
