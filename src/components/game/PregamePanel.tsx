import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { inviteCode, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type Game } from '@/types/game';
import { PressableScale } from '@/components/ui/PressableScale';

/** Dashboard del pre-partita: il mazzo che si sta formando, chi c'è, e (per chi l'ha creata) "Avvia". */
export function PregamePanel({ game, onOpenDeck }: { game: Game; onOpenDeck: () => void }) {
  const players = useGameStore((s) => s.players);
  const proposals = useGameStore((s) => s.proposals);
  const startGame = useGameStore((s) => s.startGame);
  const showToast = useUiStore((s) => s.showToast);

  const mine = proposals.filter((p) => p.gameId === game.id && p.authorId === ME.id).length;
  const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
  const people = players.filter((p) => game.playerIds.includes(p.id));

  return (
    <>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Apri il mazzo"
        onPress={onOpenDeck}
        style={styles.deckCard}>
        <View style={styles.flex}>
          <AppText variant="name">Il mazzo si decide adesso</AppText>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            {game.ruleIds.length} carte nel mazzo. Tu ne hai messe {mine} su {perPlayer}.
          </AppText>
        </View>
        <View style={styles.cta}>
          <AppText variant="caption">Apri il mazzo</AppText>
        </View>
      </PressableScale>

      <View style={styles.section}>
        <SectionHeader
          title="Chi c'è"
          caption={`${people.length} giocatori. Codice per entrare: ${inviteCode(game)}`}
        />
        <View style={styles.card}>
          <AvatarStack players={people} size={40} max={6} />
          <AppText variant="body" color={colors.inkSoft} style={styles.flex} numberOfLines={2}>
            {people.map((p) => (p.id === ME.id ? 'Tu' : p.name)).join(', ')}
          </AppText>
        </View>
        {game.ownerId === ME.id && (
          <Button
            label="Avvia la partita adesso"
            variant="secondary"
            onPress={() =>
              confirmAction(
                'Avviare la partita adesso?',
                'Il mazzo si chiude per tutti e non si potranno più cambiare le carte.',
                'Avvia',
                () => {
                  haptics.bonus();
                  startGame(game.id);
                  showToast({ text: 'Si parte! Il mazzo è chiuso.' });
                },
              )
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  // Secondario: il giallo è già sul tasto centrale della navbar, che fa la stessa cosa
  cta: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    height: 40,
    justifyContent: 'center',
  },
  regular: { fontWeight: '400' },
  flex: { flex: 1, gap: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
});
