import { useRouter } from 'expo-router';

import type { CommunityDeck } from '@/data/community';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';

/** Partita pronta da un mazzo: conferma, crea la stanza e porta agli inviti. Stesso gesto ovunque. */
export function usePlayDeck() {
  const router = useRouter();
  const createGame = useGameStore((s) => s.createGame);
  const showToast = useUiStore((s) => s.showToast);
  return (d: CommunityDeck) =>
    confirmAction(
      `${d.emoji} ${d.name}`,
      `${d.ruleIds.length} carte pronte, ${d.occasion.toLowerCase()}. Crei la stanza e inviti gli amici: le carte si possono ancora cambiare.`,
      'Crea la stanza',
      () => {
        haptics.press();
        const game = createGame({
          name: d.name,
          mode: 'sprint',
          startsInHours: 24,
          emoji: d.emoji,
          ruleIds: d.ruleIds,
        });
        showToast({ text: `Stanza creata con il mazzo ${d.name}` });
        router.push({ pathname: '/onboarding/invite', params: { gameId: game.id } });
      },
    );
}
