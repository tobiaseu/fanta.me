import { colors } from '@/theme/tokens';
import type {
  CardProposal,
  FeedEvent,
  FriendStatus,
  Game,
  Player,
  PowerActivation,
  PowerUpId,
  User,
} from '@/types/game';

/** Dati finti per la Fase 1: sostituiti da Supabase nella Fase 2. */

/** Foto di prova, verticali come quelle del telefono */
const testPhoto = (seed: string) => `https://picsum.photos/seed/fanta-${seed}/900/1600`;

export const ME: User = {
  id: 'u-me',
  name: 'Tobia',
  handle: 'tobia.fanta',
  color: colors.toonBlue,
  photo: 'https://i.pravatar.cc/240?img=12',
  career: { trophies: 3, gamesPlayed: 11, wins: 3, totalPoints: 1240 },
};

export const PLAYERS: Player[] = [
  ME,
  {
    id: 'u-ale',
    name: 'Ale',
    handle: 'aleilie99',
    color: colors.toonRed,
    photo: 'https://i.pravatar.cc/240?img=15',
    career: { trophies: 5, gamesPlayed: 14, wins: 5, totalPoints: 1630 },
  },
  {
    id: 'u-giulia',
    name: 'Giulia',
    handle: 'giuly.g',
    color: colors.toonPurple,
    photo: 'https://i.pravatar.cc/240?img=47',
    career: { trophies: 2, gamesPlayed: 9, wins: 2, totalPoints: 980 },
  },
  {
    id: 'u-marco',
    name: 'Marco',
    handle: 'marcopolo',
    color: colors.toonYellow,
    photo: 'https://i.pravatar.cc/240?img=53',
    career: { trophies: 0, gamesPlayed: 6, wins: 0, totalPoints: 310 },
  },
  {
    id: 'u-sara',
    name: 'Sara',
    handle: 'sarettah',
    color: colors.toonGreen,
    photo: 'https://i.pravatar.cc/240?img=44',
    career: { trophies: 1, gamesPlayed: 7, wins: 1, totalPoints: 655 },
  },
  {
    id: 'u-luca',
    name: 'Luca',
    handle: 'lucky.luca',
    color: '#FF9F1C',
    photo: 'https://i.pravatar.cc/240?img=59',
    career: { trophies: 3, gamesPlayed: 12, wins: 3, totalPoints: 1105 },
  },
  // Non è in nessuna tua lega: ti ha chiesto l'amicizia
  {
    id: 'u-bea',
    name: 'Bea',
    handle: 'bea.in.viaggio',
    color: '#4FB3BF',
    photo: 'https://i.pravatar.cc/240?img=32',
    career: { trophies: 1, gamesPlayed: 4, wins: 1, totalPoints: 420 },
  },
];

/** Amicizie viste da Tobia. */
export const FRIENDSHIPS: Record<string, FriendStatus> = {
  'u-ale': 'friends',
  'u-giulia': 'friends',
  'u-sara': 'friends',
  'u-luca': 'sent',
  'u-bea': 'received',
};

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const GAMES: Game[] = [
  {
    id: 'fantapasquetta',
    name: 'Fantapasquetta',
    code: 'R4TB9Z',
    emoji: '🧺',
    setting: 'vacation',
    mode: 'sprint',
    status: 'live',
    startsAt: hoursFromNow(-30.2),
    endsAt: hoursFromNow(17.6),
    playerIds: ['u-me', 'u-ale', 'u-giulia', 'u-marco', 'u-sara', 'u-luca'],
    teams: [
      { id: 't1', name: 'FC Sculo', memberIds: ['u-me', 'u-ale'] },
      { id: 't2', name: 'Avantisavoia', memberIds: ['u-giulia', 'u-marco'] },
      { id: 't3', name: 'Lepori Industris', memberIds: ['u-sara', 'u-luca'] },
    ],
    nicknames: { 'u-sara': 'La Sirena', 'u-ale': 'Il Conte', 'u-marco': 'Marchino', 'u-me': 'Toby' },
    ruleIds: [
      'r-smurratona',
      'r-cook',
      'r-dishes',
      'r-burn',
      'r-toast',
      'r-new',
      'r-phone',
      'r-late',
      'r-lost',
      'r-swim',
      'r-sunrise',
      'r-nap',
      'r-fall',
    ],
    accent: colors.live,
  },
  {
    id: 'ufficio-q4',
    name: 'FantaUfficio Q4',
    emoji: '💼',
    setting: 'office',
    mode: 'marathon',
    status: 'live',
    week: { current: 3, total: 8 },
    playerIds: ['u-me', 'u-luca', 'u-marco', 'u-sara'],
    ruleIds: ['r-cook', 'r-toast', 'r-phone', 'r-late', 'r-lost', 'r-new'],
    accent: colors.live,
  },
  {
    id: 'cena-classe',
    name: 'Cena di classe',
    emoji: '🎓',
    setting: 'school',
    mode: 'sprint',
    status: 'waiting',
    ownerId: 'u-me',
    code: 'K7QX2M',
    startsAt: hoursFromNow(72),
    endsAt: hoursFromNow(48 + 72),
    playerIds: ['u-me', 'u-sara', 'u-giulia', 'u-ale'],
    ruleIds: [
      'r-toast',
      'r-phone',
      'r-late',
      'r-fall',
      'r-smurratona',
      'r-photo',
      'r-spill',
      'r-dj',
      'c-karaoke',
      'c-prof',
    ],
    accent: colors.cta,
  },
  {
    id: 'sardegna-25',
    name: 'FantaSardegna 2025',
    emoji: '🏖️',
    setting: 'vacation',
    mode: 'sprint',
    status: 'ended',
    playerIds: ['u-me', 'u-giulia', 'u-marco', 'u-sara', 'u-luca', 'u-ale'],
    ruleIds: ['r-swim', 'r-sunrise', 'r-nap'],
    accent: colors.inkFaint,
  },
];

export const FEED: FeedEvent[] = [
  // Chiamate da votare (storie)
  {
    id: 'p1',
    photo: testPhoto('p1'),
    status: 'pending',
    gameId: 'fantapasquetta',
    playerId: 'u-ale',
    ruleId: 'r-smurratona',
    points: 15,
    authorId: 'u-luca',
    createdAt: minutesAgo(3),
    votes: { confirm: 2, reject: 0 },
  },
  {
    id: 'p2',
    photo: testPhoto('p2'),
    status: 'pending',
    gameId: 'fantapasquetta',
    playerId: 'u-marco',
    ruleId: 'r-burn',
    points: -10,
    authorId: 'u-sara',
    createdAt: minutesAgo(12),
    votes: { confirm: 1, reject: 0 },
  },
  {
    id: 'p3',
    photo: testPhoto('p3'),
    status: 'pending',
    myVote: 'confirm',
    gameId: 'fantapasquetta',
    playerId: 'u-giulia',
    ruleId: 'r-cook',
    points: 10,
    authorId: 'u-ale',
    createdAt: minutesAgo(20),
    votes: { confirm: 2, reject: 1 },
  },
  {
    id: 'p4',
    photo: testPhoto('p4'),
    status: 'pending',
    myVote: 'reject',
    gameId: 'fantapasquetta',
    playerId: 'u-luca',
    ruleId: 'r-nap',
    points: -3,
    authorId: 'u-marco',
    createdAt: minutesAgo(26),
    votes: { confirm: 1, reject: 2 },
  },
  {
    id: 'p5',
    photo: testPhoto('p5'),
    status: 'pending',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-fall',
    points: -5,
    authorId: 'u-giulia',
    createdAt: minutesAgo(6),
    votes: { confirm: 1, reject: 0 },
  },
  // Punteggi ufficiali
  {
    id: 'e1',
    photo: testPhoto('e1'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-ale',
    ruleId: 'r-new',
    points: 20,
    authorId: 'u-giulia',
    createdAt: minutesAgo(40),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e2',
    photo: testPhoto('e2'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-marco',
    ruleId: 'r-lost',
    points: -15,
    authorId: 'u-sara',
    createdAt: minutesAgo(75),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e3',
    photo: testPhoto('e3'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-me',
    ruleId: 'r-cook',
    points: 10,
    authorId: 'u-giulia',
    createdAt: minutesAgo(95),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e4',
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-swim',
    points: 10,
    authorId: 'u-me',
    createdAt: minutesAgo(180),
    votes: { confirm: 3, reject: 0 },
    review: 'Acqua a 14 gradi, è entrata urlando ma è entrata. Rispetto.',
  },
  {
    id: 'e5',
    photo: testPhoto('e5'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-giulia',
    ruleId: 'r-dishes',
    points: 15,
    authorId: 'u-luca',
    createdAt: minutesAgo(260),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e6',
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-luca',
    ruleId: 'r-late',
    points: -10,
    authorId: 'u-ale',
    createdAt: minutesAgo(300),
    votes: { confirm: 3, reject: 0 },
  },
  // Il diario di Sara nella Fantapasquetta
  {
    id: 'e10',
    photo: testPhoto('e10'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-sunrise',
    points: 25,
    authorId: 'u-luca',
    createdAt: minutesAgo(60 * 26),
    votes: { confirm: 4, reject: 0 },
    review: "Sveglia alle 5:40 per vedere l'alba dal pontile. Unica sopravvissuta.",
  },
  {
    id: 'e11',
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-burn',
    points: -10,
    authorId: 'u-marco',
    createdAt: minutesAgo(60 * 21),
    votes: { confirm: 3, reject: 1 },
    review: 'Salsicce carbonizzate "per sicurezza". Il cane ha rifiutato.',
  },
  {
    id: 'e12',
    photo: testPhoto('e12'),
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-dishes',
    points: 15,
    authorId: 'u-giulia',
    createdAt: minutesAgo(60 * 9),
    votes: { confirm: 4, reject: 0 },
    review: 'Ha lavato i piatti di tutti senza che nessuno lo chiedesse. Sospetto.',
  },
  {
    id: 'e13',
    status: 'confirmed',
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    ruleId: 'r-nap',
    points: -3,
    authorId: 'u-ale',
    createdAt: minutesAgo(60 * 5),
    votes: { confirm: 3, reject: 0 },
    review: "Pennichella sull'amaca durante la partita a carte. Russava.",
  },
  {
    id: 'e7',
    photo: testPhoto('e7'),
    status: 'confirmed',
    gameId: 'ufficio-q4',
    playerId: 'u-luca',
    ruleId: 'r-cook',
    points: 10,
    authorId: 'u-me',
    createdAt: minutesAgo(30),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e8',
    status: 'confirmed',
    gameId: 'ufficio-q4',
    playerId: 'u-marco',
    ruleId: 'r-late',
    points: -10,
    authorId: 'u-luca',
    createdAt: minutesAgo(400),
    votes: { confirm: 3, reject: 0 },
  },
  {
    id: 'e9',
    status: 'confirmed',
    gameId: 'sardegna-25',
    playerId: 'u-me',
    ruleId: 'r-sunrise',
    points: 25,
    authorId: 'u-sara',
    createdAt: minutesAgo(60 * 24 * 90),
    votes: { confirm: 3, reject: 0 },
  },
];

const toProposals = (gameId: string, pairs: readonly (readonly [string, string])[], from = 0): CardProposal[] =>
  pairs.map(([ruleId, authorId], i) => ({
    id: `pr${from + i + 1}`,
    gameId,
    ruleId,
    authorId,
    likes: [authorId],
    status: 'accepted' as const,
  }));

/** Chi ha messo quale carta nel mazzo della Fantapasquetta: la "formazione" di ognuno. */
const PASQUETTA_PAIRS = [
  ['r-smurratona', 'u-ale'],
  ['r-cook', 'u-me'],
  ['r-dishes', 'u-giulia'],
  ['r-burn', 'u-marco'],
  ['r-toast', 'u-ale'],
  ['r-new', 'u-giulia'],
  ['r-phone', 'u-marco'],
  ['r-late', 'u-luca'],
  ['r-lost', 'u-luca'],
  ['r-swim', 'u-sara'],
  ['r-sunrise', 'u-sara'],
  ['r-nap', 'u-sara'],
  ['r-fall', 'u-sara'],
] as const;

/** Proposte di carte nel pre-partita della Cena di classe. */
const CENA_PROPOSALS: CardProposal[] = (
  [
    ['r-toast', 'u-ale'],
    ['r-phone', 'u-giulia'],
    ['r-late', 'u-sara'],
    ['r-fall', 'u-ale'],
    ['r-smurratona', 'u-ale'],
    ['r-photo', 'u-giulia'],
    ['r-spill', 'u-sara'],
    ['r-dj', 'u-sara'],
    ['c-karaoke', 'u-ale'],
    ['c-prof', 'u-giulia'],
  ] as const
).map(([ruleId, authorId], i) => ({
  id: `pr${i + 1}`,
  gameId: 'cena-classe',
  ruleId,
  authorId,
  likes: [authorId],
  status: 'accepted' as const,
}));

export const PROPOSALS: CardProposal[] = [...CENA_PROPOSALS, ...toProposals('fantapasquetta', PASQUETTA_PAIRS, 100)];

/** Fantapoteri già attivati: Sara è in Turbo nella Fantapasquetta. */
export const ACTIVATIONS: PowerActivation[] = [
  {
    gameId: 'fantapasquetta',
    playerId: 'u-sara',
    powerId: 'boost',
    slot: 'main',
    at: minutesAgo(40),
    until: hoursFromNow(1.4),
  },
];

/** Fantapoteri scelti da ciascuno (principale + secondario). */
export const POWERS: Record<string, { main: PowerUpId; secondary: PowerUpId }> = {
  'u-me': { main: 'boost', secondary: 'shield' },
  'u-ale': { main: 'slowdown', secondary: 'veto' },
  'u-giulia': { main: 'accumulator', secondary: 'shield' },
  'u-marco': { main: 'veto', secondary: 'boost' },
  'u-sara': { main: 'boost', secondary: 'veto' },
  'u-luca': { main: 'slowdown', secondary: 'accumulator' },
};

/** Bacheca dei giocatori: trofei vinti e scudi (lo stemma di ogni stanza giocata). */
export const COLLECTIONS: Record<
  string,
  {
    trophies: { emoji: string; label: string; game: string }[];
    shields: { emoji: string; label: string; note: string }[];
  }
> = {
  'u-me': {
    trophies: [
      { emoji: '🏆', label: 'Campione', game: 'FantaSardegna 2025' },
      { emoji: '😇', label: 'Re dei bonus', game: 'FantaSardegna 2025' },
      { emoji: '📣', label: 'Il Cronista', game: 'FantaNatale 2024' },
    ],
    shields: [
      { emoji: '🏖️', label: 'FantaSardegna 2025', note: '1° su 6' },
      { emoji: '🎄', label: 'FantaNatale 2024', note: '3° su 5' },
      { emoji: '🧺', label: 'Fantapasquetta', note: 'in corso' },
    ],
  },
  'u-sara': {
    trophies: [{ emoji: '🌅', label: "Regina dell'alba", game: 'FantaCampeggio 2024' }],
    shields: [
      { emoji: '⛺', label: 'FantaCampeggio 2024', note: '1° su 8' },
      { emoji: '🏖️', label: 'FantaSardegna 2025', note: '4° su 6' },
    ],
  },
};

/** Chi vede la bacheca degli altri (la mia si imposta nelle Impostazioni). */
export const COLLECTION_VISIBILITY: Record<string, 'private' | 'friends' | 'everyone'> = {
  'u-sara': 'friends',
  'u-ale': 'everyone',
};
