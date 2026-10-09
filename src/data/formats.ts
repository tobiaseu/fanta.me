import type { GameMode } from '@/types/game';

/** Format di partita proposti nella Lobby ("Nuovo evento"). */
export interface GameFormat {
  id: string;
  tag: string;
  name: string;
  description: string;
  mode: GameMode;
  tint: string;
}

export const FORMATS: GameFormat[] = [
  {
    id: 'me',
    tag: 'personalizza',
    name: 'ME',
    description: 'Le tue regole, i tuoi amici, la tua durata. Il campionato su misura per il tuo gruppo.',
    mode: 'marathon',
    tint: '#FFFFFF',
  },
  {
    id: 'serata',
    tag: 'breve',
    name: 'SERATA',
    description: 'Una sera, zero pietà. Chi torna a casa con più punti offre il primo giro.',
    mode: 'sprint',
    tint: '#E4E4F7',
  },
  {
    id: 'vacanza',
    tag: 'sprint',
    name: 'VACANZA',
    description: 'Dal check-in al check-out ogni figuraccia diventa leggenda. E punteggio.',
    mode: 'sprint',
    tint: '#E1F0DC',
  },
  {
    id: 'ufficio',
    tag: 'maratona',
    name: 'UFFICIO',
    description: 'Settimana dopo settimana: chi porta i cornetti, chi ruba la pinzatrice.',
    mode: 'marathon',
    tint: '#FFF6D6',
  },
];
