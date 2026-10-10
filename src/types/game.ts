/** Modello di dominio di Fanta.me (condiviso tra UI, store e futuro backend). */

export type GameMode = 'sprint' | 'marathon';
/**
 * Fasi della stanza: setting (creazione) → pre-partita (`waiting`: si propongono carte)
 * → in partita (`live`) → conclusa con risultati (`ended`).
 */
export type GameStatus = 'live' | 'waiting' | 'ended';
export type GameSetting = 'vacation' | 'office' | 'school' | 'party';

export interface Player {
  id: string;
  name: string;
  handle: string;
  /** Colore dell'avatar sticker */
  color: string;
  /** Foto profilo (per ora immagini di prova) */
  photo?: string;
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
  /** Carta personale: creata da un giocatore con le sue regole */
  authorId?: string;
  /**
   * Carta trofeo: si prende una sola volta in tutta la partita e solo dal primo che ci arriva.
   * Le altre sono cumulabili: valgono ogni volta che succede.
   */
  trophy?: boolean;
}

/**
 * Proposta di carta nel pre-partita: entra nel mazzo quando la maggioranza
 * della stanza mette "mi piace" (chi propone conta già).
 */
export interface CardProposal {
  id: string;
  gameId: string;
  ruleId: string;
  authorId: string;
  likes: string[];
  status: 'open' | 'accepted';
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

export type PowerUpId = 'boost' | 'accumulator' | 'slowdown' | 'shield' | 'veto' | 'thief' | 'jolly';

/** Fantapotere: ogni giocatore ne porta in partita uno principale e uno secondario, usabili una volta. */
export interface PowerUp {
  id: PowerUpId;
  label: string;
  emoji: string;
  description: string;
  /** Durata dell'effetto in ore (0 = istantaneo) */
  hours: number;
  /** Solo nelle stanze Premium */
  premium?: boolean;
}

export interface PowerActivation {
  gameId: string;
  playerId: string;
  powerId: PowerUpId;
  slot: 'main' | 'secondary';
  at: string;
  until: string;
}

export interface GameSettings {
  /** Carte che ognuno mette nel mazzo nel pre-partita */
  cardsPerPlayer: number;
  /** Punti massimi per carta */
  pointsCap: number;
  /** Fantapoteri attivi in questa stanza */
  powers: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = { cardsPerPlayer: 4, pointsCap: 25, powers: true };

export interface Game {
  id: string;
  name: string;
  /** Codice invito (6 lettere) */
  code?: string;
  emoji: string;
  setting: GameSetting;
  mode: GameMode;
  status: GameStatus;
  /** Inizio della partita (ISO): da qui si contano le giornate */
  startsAt?: string;
  /** Sprint: fine del countdown (ISO) */
  endsAt?: string;
  /** Maratona: settimana corrente e totale */
  week?: { current: number; total: number };
  playerIds: string[];
  /** Squadre (fantasquadre) della lega, se previste */
  teams?: Team[];
  ruleIds: string[];
  /**
   * Nickname di stanza: come ognuno si fa chiamare qui (dipende dalla confidenza del gruppo).
   * L'account resta quello con la @, usato per amicizie e inviti.
   */
  nicknames?: Record<string, string>;
  /** Stanza Premium: più carte personali per tutti e fantapoteri speciali */
  premium?: boolean;
  /** Host: chi ha creato la stanza, promesso di gestirla bene e può avviarla */
  ownerId?: string;
  /** Impostazioni avanzate scelte dall'host */
  settings?: GameSettings;
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
  /** Chiamata sulla carta del giorno: punti già raddoppiati */
  double?: boolean;
  /** Il commento di chi ha chiamato il punto: la "recensione" del momento */
  review?: string;
  /** Foto scattata da chi chiama: sfondo della storia e del punto confermato */
  photo?: string;
}
