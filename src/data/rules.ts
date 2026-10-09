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
  { id: 'r-cook', categoryId: 'food', label: 'Lo Chef', description: 'Cucina per tutti, anche per chi non ha aiutato.', points: 10, emoji: '👨‍🍳' },
  { id: 'r-dishes', categoryId: 'food', label: 'Il Santo', description: 'Lava i piatti senza che nessuno glielo chieda.', points: 15, emoji: '🧽' },
  { id: 'r-burn', categoryId: 'food', label: 'Il Carbonaro', description: 'Brucia la cena. Allarme antincendio incluso.', points: -10, emoji: '🔥' },
  { id: 'r-toast', categoryId: 'social', label: 'Il Brindisi', description: 'Fa un brindisi epico che qualcuno filma.', points: 5, emoji: '🥂' },
  { id: 'r-new', categoryId: 'social', label: "L'Ambasciatore", description: 'Fa amicizia con uno sconosciuto e lo porta al tavolo.', points: 20, emoji: '🤝' },
  { id: 'r-phone', categoryId: 'social', label: 'Lo Zombie', description: 'Sta al telefono a cena mentre gli altri parlano.', points: -5, emoji: '🧟' },
  { id: 'r-late', categoryId: 'chaos', label: 'Il Ritardatario', description: 'Arriva quando gli altri hanno già finito.', points: -10, emoji: '🐌' },
  { id: 'r-lost', categoryId: 'chaos', label: 'Lo Smemorato', description: 'Perde le chiavi. Di nuovo.', points: -15, emoji: '🔑' },
  { id: 'r-fall', categoryId: 'chaos', label: 'Il Tuffo', description: 'Cade in pubblico, ma con stile.', points: 8, emoji: '🤸' },
  { id: 'r-swim', categoryId: 'sport', label: 'Il Pioniere', description: 'Primo bagno della giornata, acqua gelida compresa.', points: 10, emoji: '🏊' },
  { id: 'r-sunrise', categoryId: 'sport', label: "L'Alba", description: "Si sveglia per vedere l'alba. Volontariamente.", points: 25, emoji: '🌅' },
  { id: 'r-nap', categoryId: 'sport', label: 'Il Bradipo', description: 'Pisolino sul lettino alle 11 del mattino.', points: -3, emoji: '😴' },
];

export const POWER_UPS: PowerUp[] = [
  {
    id: 'veto',
    label: 'Veto',
    description: "Annulla un'assegnazione contro di te prima che diventi ufficiale.",
    unlock: 'ad',
  },
  {
    id: 'multiplier',
    label: 'Moltiplicatore ×2',
    description: 'Raddoppia il prossimo bonus che ricevi.',
    unlock: 'ad',
  },
];

export const ruleById = (id: string) => RULES.find((r) => r.id === id);
