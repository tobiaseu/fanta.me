import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { inviteCode, nameIn, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type Game } from '@/types/game';
import { PressableScale } from '@/components/ui/PressableScale';

/** Dashboard del pre-partita: il mazzo che si sta formando, chi c'è, e (per chi l'ha creata) "Avvia". */
export function PregamePanel({ game }: { game: Game }) {
  const players = useGameStore((s) => s.players);
  const startGame = useGameStore((s) => s.startGame);
  const showToast = useUiStore((s) => s.showToast);

  const people = players.filter((p) => game.playerIds.includes(p.id));

  return (
    <>
      <View style={styles.section}>
        <SectionHeader
          title="Chi c'è"
          caption={`${people.length} giocatori. Codice per entrare: ${inviteCode(game)}`}
        />
        <View style={styles.card}>
          <AvatarStack players={people} size={40} max={6} />
          <AppText variant="body" color={colors.inkSoft} style={styles.flex} numberOfLines={2}>
            {people.map((p) => (p.id === ME.id ? 'Tu' : nameIn(game, p))).join(', ')}
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
