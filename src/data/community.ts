import { CUSTOM_RULES } from '@/data/rules';
import type { Rule } from '@/types/game';

/**
 * Community: carte e mazzi pubblicati dagli utenti, da sfogliare, salvare e usare.
 * Fase 2: tabelle `published_cards` e `decks` su Supabase, con moderazione prima della pubblicazione.
 */
export interface CommunityCard {
  rule: Rule;
  /** Chi l'ha pubblicata (nome visibile, la @ per il profilo) */
  author: { name: string; handle: string; color: string };
  likes: number;
  /** In quante stanze è stata giocata */
  plays: number;
  tags: string[];
}

export interface CommunityDeck {
  id: string;
  name: string;
  emoji: string;
  /** Per quale occasione */
  occasion: string;
  author: { name: string; handle: string; color: string };
  ruleIds: string[];
  plays: number;
  likes: number;
  /** Mazzo ufficiale Fanta.me (finisce tra i "Suggeriti") */
  official?: boolean;
  /** Mazzo di stagione: compare tra "Di stagione" */
  season?: boolean;
}

const card = (r: Omit<Rule, 'authorId'> & { authorId?: string }): Rule => ({
  ...r,
  authorId: r.authorId ?? 'community',
});

const AUTHORS = {
  ele: { name: 'Ele', handle: 'ele.sposa', color: '#F2994A' },
  team: { name: 'Atletica Lume', handle: 'atleticalume', color: '#2F7BEA' },
  gio: { name: 'Gio', handle: 'giovanna_b', color: '#8B6CF6' },
  fanta: { name: 'Fanta.me', handle: 'fanta.me', color: '#111111' },
  pietro: { name: 'Pietro', handle: 'pietrone', color: '#0B8200' },
};

export const COMMUNITY_CARDS: CommunityCard[] = [
  {
    rule: card({
      id: 'p-bouquet',
      categoryId: 'social',
      label: 'Il Bouquet',
      description: 'Prende il bouquet al volo. Anche se non voleva.',
      points: 30,
      emoji: '💐',
      trophy: true,
    }),
    author: AUTHORS.ele,
    likes: 412,
    plays: 128,
    tags: ['Matrimonio'],
  },
  {
    rule: card({
      id: 'p-pb',
      categoryId: 'sport',
      label: 'Il Personal Best',
      description: 'Migliora il suo record in gara. Applausi dalla tribuna.',
      points: 25,
      emoji: '⏱️',
    }),
    author: AUTHORS.team,
    likes: 233,
    plays: 61,
    tags: ['Sport'],
  },
  {
    rule: card({
      id: 'p-sveglia',
      categoryId: 'chaos',
      label: 'La Sveglia Persa',
      description: 'Perde il treno, il volo o il pullman della gita.',
      points: -15,
      emoji: '🛌',
    }),
    author: AUTHORS.gio,
    likes: 389,
    plays: 204,
    tags: ['Gita', 'Vacanza'],
  },
  {
    rule: card({
      id: 'p-karaoke',
      categoryId: 'social',
      label: 'Il Karaoke',
      description: 'Prende il microfono senza che nessuno glielo chieda.',
      points: 10,
      emoji: '🎤',
    }),
    author: AUTHORS.pietro,
    likes: 156,
    plays: 97,
    tags: ['Serata'],
  },
  {
    rule: card({
      id: 'p-zio',
      categoryId: 'social',
      label: 'Lo Zio al Tavolo',
      description: 'Fa un discorso non richiesto durante il pranzo.',
      points: -5,
      emoji: '🎙️',
    }),
    author: AUTHORS.ele,
    likes: 301,
    plays: 88,
    tags: ['Matrimonio'],
  },
  {
    rule: card({
      id: 'p-falo',
      categoryId: 'sport',
      label: 'Il Falò',
      description: 'Accende il fuoco in spiaggia al primo colpo.',
      points: 15,
      emoji: '🔥',
    }),
    author: AUTHORS.fanta,
    likes: 520,
    plays: 340,
    tags: ['Vacanza'],
  },
];

// Registro: così ruleById trova anche le carte della community
CUSTOM_RULES.push(...COMMUNITY_CARDS.map((c) => c.rule));

export const COMMUNITY_DECKS: CommunityDeck[] = [
  {
    id: 'd-estate',
    name: 'Estate 2027',
    emoji: '🏖️',
    occasion: 'Vacanza',
    author: AUTHORS.fanta,
    official: true,
    ruleIds: ['p-falo', 'p-sveglia', 'r-swim', 'r-sunrise', 'r-burn', 'r-nap', 'r-toast', 'r-cook'],
    plays: 1840,
    likes: 960,
  },
  {
    id: 'd-wedding',
    name: 'Fanta Matrimonio',
    emoji: '💍',
    occasion: 'Matrimonio',
    author: AUTHORS.ele,
    ruleIds: ['p-bouquet', 'p-zio', 'r-toast', 'r-smurratona', 'p-karaoke', 'r-fall'],
    plays: 212,
    likes: 431,
  },
  {
    id: 'd-atletica',
    name: 'Trasferta di squadra',
    emoji: '🏃',
    occasion: 'Sport',
    author: AUTHORS.team,
    ruleIds: ['p-pb', 'p-sveglia', 'r-late', 'r-lost', 'r-nap', 'r-dishes'],
    plays: 74,
    likes: 120,
  },
  {
    id: 'd-serata',
    name: 'Serata lunga',
    emoji: '🍻',
    occasion: 'Serata',
    author: AUTHORS.pietro,
    ruleIds: ['p-karaoke', 'r-smurratona', 'r-toast', 'r-phone', 'r-new'],
    plays: 390,
    likes: 215,
  },
];

// Altri mazzi ufficiali e di stagione, solo con carte base: compaiono in "Crea una stanza"
COMMUNITY_DECKS.push(
  {
    id: 'd-classico',
    name: 'Il Classico',
    emoji: '🃏',
    occasion: 'Per iniziare',
    author: AUTHORS.fanta,
    official: true,
    ruleIds: ['r-smurratona', 'r-cook', 'r-dishes', 'r-toast', 'r-late', 'r-phone', 'r-fall', 'r-new'],
    plays: 5200,
    likes: 1300,
  },
  {
    id: 'd-gita',
    name: 'Gita fuori porta',
    emoji: '🚌',
    occasion: 'Gita',
    author: AUTHORS.fanta,
    official: true,
    ruleIds: ['p-sveglia', 'r-lost', 'r-photo', 'r-peak', 'r-nap', 'r-late'],
    plays: 980,
    likes: 410,
  },
  {
    id: 'd-halloween',
    name: 'Notte di Halloween',
    emoji: '🎃',
    occasion: 'Festa',
    author: AUTHORS.fanta,
    season: true,
    ruleIds: ['r-smurratona', 'r-dj', 'r-encore', 'r-spill', 'r-photo', 'r-round'],
    plays: 640,
    likes: 300,
  },
  {
    id: 'd-natale',
    name: 'Natale in famiglia',
    emoji: '🎄',
    occasion: 'Feste',
    author: AUTHORS.fanta,
    season: true,
    ruleIds: ['p-zio', 'r-cook', 'r-dishes', 'r-toast', 'r-nap', 'r-phone'],
    plays: 2100,
    likes: 880,
  },
  {
    id: 'd-capodanno',
    name: 'Capodanno',
    emoji: '🥂',
    occasion: 'Feste',
    author: AUTHORS.fanta,
    season: true,
    ruleIds: ['r-toast', 'r-smurratona', 'r-sunrise', 'r-dj', 'p-karaoke', 'r-new'],
    plays: 1500,
    likes: 700,
  },
);

export const OCCASIONS = ['Tutte', 'Vacanza', 'Serata', 'Matrimonio', 'Sport', 'Gita'] as const;
