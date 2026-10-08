import type { PowerUp, Rule, RuleCategory } from '@/types/game';

/**
 * Motore regole: dizionario di Bonus/Malus diviso per categorie.
 * In Fase 2 arriverà da Supabase (tabella `rules`), personalizzabile per stanza.
 */
export const RULE_CATEGORIES: RuleCategory[] = [
  { id: 'social', label: 'Vita sociale', emoji: '🥂' },
  { id: 'food', label: 'Cibo & cucina', emoji: '🍝' },
  { id: 'chaos', label: 'Caos & figuracce', emoji: '🙈' },
  { id: 'sport', label: 'Sport & avventura', emoji: '🏄' },
];

export const RULES: Rule[] = [
  { id: 'r-cook', categoryId: 'food', label: 'Cucina per tutti', points: 10 },
  { id: 'r-dishes', categoryId: 'food', label: 'Lava i piatti senza che glielo chiedano', points: 15 },
  { id: 'r-burn', categoryId: 'food', label: 'Brucia la cena', points: -10 },
  { id: 'r-toast', categoryId: 'social', label: 'Fa un brindisi epico', points: 5 },
  { id: 'r-new', categoryId: 'social', label: 'Fa amicizia con uno sconosciuto', points: 20 },
  { id: 'r-phone', categoryId: 'social', label: 'Sta al telefono a cena', points: -5 },
  { id: 'r-late', categoryId: 'chaos', label: 'Arriva in ritardo', points: -10 },
  { id: 'r-lost', categoryId: 'chaos', label: 'Perde le chiavi', points: -15 },
  { id: 'r-fall', categoryId: 'chaos', label: 'Cade in pubblico (con stile)', points: 8 },
  { id: 'r-swim', categoryId: 'sport', label: 'Primo bagno della giornata', points: 10 },
  { id: 'r-sunrise', categoryId: 'sport', label: "Si sveglia per l'alba", points: 25 },
  { id: 'r-nap', categoryId: 'sport', label: 'Pisolino sul lettino', points: -3 },
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
