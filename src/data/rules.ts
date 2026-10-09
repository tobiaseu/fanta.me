import type { PowerUp, Rule, RuleCategory } from '@/types/game';

/**
 * Motore regole: dizionario di Bonus/Malus diviso per categorie.
 * Ogni regola è una "carta trofeo" (nome breve + descrizione + sticker).
 * In Fase 2 arriverà da Supabase (tabella `rules`), personalizzabile per stanza.
 */
export const RULE_CATEGORIES: RuleCategory[] = [
  { id: 'social', label: 'Vita sociale', emoji: '🥂' },
  { id: 'food', label: 'Cibo & cucina', emoji: '🍝' },
  { id: 'chaos', label: 'Caos & figuracce', emoji: '🙈' },
  { id: 'sport', label: 'Sport & avventura', emoji: '🏄' },
];

export const RULES: Rule[] = [
  {
    id: 'r-smurratona',
    categoryId: 'chaos',
    label: 'La Smurratona',
    description: 'Ha esagerato e ha salutato la cena in diretta. Il corpo ha ceduto, la leggenda no.',
    points: 15,
    emoji: '🤮',
  },
  {
    id: 'r-cook',
    categoryId: 'food',
    label: 'Lo Chef',
    description: 'Cucina per tutti, anche per chi non ha aiutato.',
    points: 10,
    emoji: '👨‍🍳',
  },
  {
    id: 'r-dishes',
    categoryId: 'food',
    label: 'Il Santo',
    description: 'Lava i piatti senza che nessuno glielo chieda.',
    points: 15,
    emoji: '🧽',
  },
  {
    id: 'r-burn',
    categoryId: 'food',
    label: 'Il Carbonaro',
    description: 'Brucia la cena. Allarme antincendio incluso.',
    points: -10,
    emoji: '🔥',
  },
  {
    id: 'r-toast',
    categoryId: 'social',
    label: 'Il Brindisi',
    description: 'Fa un brindisi epico che qualcuno filma.',
    points: 5,
    emoji: '🥂',
  },
  {
    id: 'r-new',
    categoryId: 'social',
    label: "L'Ambasciatore",
    description: 'Fa amicizia con uno sconosciuto e lo porta al tavolo.',
    points: 20,
    emoji: '🤝',
  },
  {
    id: 'r-phone',
    categoryId: 'social',
    label: 'Lo Zombie',
    description: 'Sta al telefono a cena mentre gli altri parlano.',
    points: -5,
    emoji: '🧟',
  },
  {
    id: 'r-late',
    categoryId: 'chaos',
    label: 'Il Ritardatario',
    description: 'Arriva quando gli altri hanno già finito.',
    points: -10,
    emoji: '🐌',
  },
  {
    id: 'r-lost',
    categoryId: 'chaos',
    label: 'Lo Smemorato',
    description: 'Perde le chiavi. Di nuovo.',
    points: -15,
    emoji: '🔑',
  },
  {
    id: 'r-fall',
    categoryId: 'chaos',
    label: 'Il Tuffo',
    description: 'Cade in pubblico, ma con stile.',
    points: 8,
    emoji: '🤸',
  },
  {
    id: 'r-swim',
    categoryId: 'sport',
    label: 'Il Pioniere',
    description: 'Primo bagno della giornata, acqua gelida compresa.',
    points: 10,
    emoji: '🏊',
  },
  {
    id: 'r-sunrise',
    categoryId: 'sport',
    label: "L'Alba",
    description: "Si sveglia per vedere l'alba. Volontariamente.",
    points: 25,
    emoji: '🌅',
  },
  {
    id: 'r-nap',
    categoryId: 'sport',
    label: 'Il Bradipo',
    description: 'Pisolino sul lettino alle 11 del mattino.',
    points: -3,
    emoji: '😴',
  },
  {
    id: 'r-dj',
    categoryId: 'social',
    label: 'Il DJ',
    description: 'Prende il controllo della musica e la serata decolla.',
    points: 5,
    emoji: '🎧',
  },
  {
    id: 'r-round',
    categoryId: 'social',
    label: 'Offre il giro',
    description: 'Paga da bere a tutto il tavolo senza che nessuno lo chieda.',
    points: 15,
    emoji: '🍻',
  },
  {
    id: 'r-photo',
    categoryId: 'social',
    label: 'Il Paparazzo',
    description: 'Scatta la foto di gruppo che finirà nel profilo di tutti.',
    points: 5,
    emoji: '📸',
  },
  {
    id: 'r-spill',
    categoryId: 'food',
    label: 'Il Rovesciatore',
    description: 'Rovescia il bicchiere sulla tovaglia, o peggio su qualcuno.',
    points: -5,
    emoji: '🍷',
  },
  {
    id: 'r-encore',
    categoryId: 'food',
    label: 'Il Bis',
    description: 'Fa il bis del bis, e chiede se c’è il dolce.',
    points: 5,
    emoji: '🍝',
  },
  {
    id: 'r-peak',
    categoryId: 'sport',
    label: 'La Vetta',
    description: 'Arriva in cima alla camminata per primo, senza lamentarsi.',
    points: 20,
    emoji: '⛰️',
  },
  {
    id: 'r-sunburn',
    categoryId: 'sport',
    label: 'Il Gambero',
    description: 'Si scotta al sole nonostante tutti gli abbiano offerto la crema.',
    points: -10,
    emoji: '🦞',
  },
];

/**
 * Carte personali dei giocatori (max 5 a testa, di più con Premium).
 * Fase 2: tabella `custom_cards` su Supabase. Qui lo store le aggiunge a questo registro,
 * così `ruleById` le trova ovunque (Feed, voto, profilo).
 */
export const CUSTOM_RULES: Rule[] = [
  {
    id: 'c-navigatore',
    categoryId: 'chaos',
    label: 'Il Navigatore',
    description: 'Trova la strada giusta senza aprire Google Maps.',
    points: 10,
    emoji: '🧭',
    authorId: 'u-me',
  },
  {
    id: 'c-spoiler',
    categoryId: 'social',
    label: 'Lo Spoiler',
    description: 'Rivela il finale della serie a chi non l’ha ancora vista.',
    points: -10,
    emoji: '🙊',
    authorId: 'u-me',
  },
  {
    id: 'c-karaoke',
    categoryId: 'social',
    label: 'La Popstar',
    description: 'Prende il microfono al karaoke e non lo molla più.',
    points: 15,
    emoji: '🎤',
    authorId: 'u-ale',
  },
  {
    id: 'c-prof',
    categoryId: 'chaos',
    label: 'Il Prof',
    description: 'Chiama un compagno con il cognome, come all’appello.',
    points: -5,
    emoji: '🧑‍🏫',
    authorId: 'u-giulia',
  },
];

/** Carte personali gratis per ogni giocatore. */
export const FREE_CUSTOM_SLOTS = 5;

export const POWER_UPS: PowerUp[] = [
  {
    id: 'boost',
    label: 'Turbo',
    emoji: '🚀',
    description: 'Per 3 ore i tuoi bonus valgono doppio.',
    hours: 3,
  },
  {
    id: 'accumulator',
    label: 'Salvadanaio',
    emoji: '🐷',
    description: 'Per 6 ore i tuoi punti si accumulano e a fine effetto valgono +50%.',
    hours: 6,
  },
  {
    id: 'slowdown',
    label: 'Moviola',
    emoji: '🐢',
    description: 'Per 2 ore i bonus degli altri valgono la metà.',
    hours: 2,
  },
  {
    id: 'shield',
    label: 'Scudo',
    emoji: '🛡️',
    description: 'Il prossimo malus che ti chiamano non vale.',
    hours: 0,
  },
  {
    id: 'veto',
    label: 'Veto',
    emoji: '✋',
    description: 'Annulla una chiamata contro di te prima che diventi ufficiale.',
    hours: 0,
  },
  {
    id: 'thief',
    label: 'Ladro',
    emoji: '🦝',
    description: 'Ruba il prossimo bonus del primo in classifica.',
    hours: 0,
    premium: true,
  },
  {
    id: 'jolly',
    label: 'Jolly',
    emoji: '🃏',
    description: 'Per un’ora ogni carta che ti chiamano diventa un bonus.',
    hours: 1,
    premium: true,
  },
];

export const powerById = (id?: string) => POWER_UPS.find((p) => p.id === id);

export const ruleById = (id: string) => RULES.find((r) => r.id === id) ?? CUSTOM_RULES.find((r) => r.id === id);
