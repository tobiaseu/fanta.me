import { colors } from '@/theme/tokens';
import type { FeedEvent, Game, Player, User } from '@/types/game';

/** Dati finti per la Fase 1: sostituiti da Supabase nella Fase 2. */

export const ME: User = {
  id: 'u-me',
  name: 'Tobia',
  handle: '@tobia',
  color: colors.toonBlue,
  career: { trophies: 3, gamesPlayed: 11, wins: 3, totalPoints: 1240 },
};

export const PLAYERS: Player[] = [
  ME,
  { id: 'u-giulia', name: 'Giulia', color: colors.toonRed },
  { id: 'u-marco', name: 'Marco', color: colors.toonYellow },
  { id: 'u-sara', name: 'Sara', color: colors.toonPurple },
  { id: 'u-luca', name: 'Luca', color: colors.live },
  { id: 'u-anna', name: 'Anna', color: colors.cta },
];

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const GAMES: Game[] = [
  {
    id: 'sardegna-26',
    name: 'FantaSardegna',
    emoji: '🏖️',
    setting: 'vacation',
    mode: 'sprint',
    status: 'live',
    endsAt: hoursFromNow(38.4),
    playerIds: ['u-me', 'u-giulia', 'u-marco', 'u-sara', 'u-luca'],
    ruleIds: ['r-cook', 'r-dishes', 'r-burn', 'r-toast', 'r-new', 'r-phone', 'r-late', 'r-lost', 'r-swim', 'r-sunrise', 'r-nap', 'r-fall'],
    accent: colors.toonRed,
  },
  {
    id: 'ufficio-q4',
    name: 'FantaUfficio Q4',
    emoji: '💼',
    setting: 'office',
    mode: 'marathon',
    status: 'live',
    week: { current: 3, total: 8 },
    playerIds: ['u-me', 'u-anna', 'u-luca', 'u-marco'],
    ruleIds: ['r-cook', 'r-toast', 'r-phone', 'r-late', 'r-lost', 'r-new'],
    accent: colors.toonBlue,
  },
  {
    id: 'cena-classe',
    name: 'Cena di classe',
    emoji: '🎓',
    setting: 'school',
    mode: 'sprint',
    status: 'waiting',
    endsAt: hoursFromNow(72),
    playerIds: ['u-me', 'u-sara', 'u-giulia'],
    ruleIds: ['r-toast', 'r-phone', 'r-late', 'r-fall'],
    accent: colors.toonPurple,
  },
];

export const FEED: FeedEvent[] = [
  { id: 'e1', gameId: 'sardegna-26', playerId: 'u-giulia', ruleId: 'r-sunrise', points: 25, authorId: 'u-marco', createdAt: minutesAgo(6) },
  { id: 'e2', gameId: 'sardegna-26', playerId: 'u-marco', ruleId: 'r-burn', points: -10, authorId: 'u-sara', createdAt: minutesAgo(42) },
  { id: 'e3', gameId: 'sardegna-26', playerId: 'u-me', ruleId: 'r-cook', points: 10, authorId: 'u-giulia', createdAt: minutesAgo(95) },
  { id: 'e4', gameId: 'sardegna-26', playerId: 'u-luca', ruleId: 'r-lost', points: -15, authorId: 'u-me', createdAt: minutesAgo(180) },
  { id: 'e5', gameId: 'sardegna-26', playerId: 'u-sara', ruleId: 'r-new', points: 20, authorId: 'u-luca', createdAt: minutesAgo(260) },
  { id: 'e6', gameId: 'ufficio-q4', playerId: 'u-anna', ruleId: 'r-cook', points: 10, authorId: 'u-me', createdAt: minutesAgo(30) },
  { id: 'e7', gameId: 'ufficio-q4', playerId: 'u-luca', ruleId: 'r-late', points: -10, authorId: 'u-anna', createdAt: minutesAgo(400) },
];
