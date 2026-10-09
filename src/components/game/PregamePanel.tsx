import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DeckCard } from '@/components/cards/DeckCard';
import { AppText } from '@/components/ui/AppText';
import { AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { inviteCode, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { Game, Rule } from '@/types/game';

/** Dashboard del pre-partita: il mazzo che si sta formando, chi c'è, e (per chi l'ha creata) "Avvia". */
export function PregamePanel({ game, onOpenDeck }: { game: Game; onOpenDeck: () => void }) {
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const proposals = useGameStore((s) => s.proposals);
  const startGame = useGameStore((s) => s.startGame);
  const showToast = useUiStore((s) => s.showToast);

  const open = proposals.filter((p) => p.gameId === game.id && p.status === 'open');
  const toLike = open.filter((p) => !p.likes.includes(ME.id)).length;
  const preview = open
    .map((p) => ruleById(p.ruleId))
    .filter((r): r is Rule => !!r)
    .slice(0, 4);
  const people = players.filter((p) => game.playerIds.includes(p.id));

  return (
    <>
      <View style={styles.section}>
        <SectionHeader
          title="Il mazzo si decide adesso"
          caption={
            toLike > 0
              ? `${toLike} ${toLike === 1 ? 'proposta aspetta' : 'proposte aspettano'} il tuo voto. ${game.ruleIds.length} carte già nel mazzo.`
              : `${game.ruleIds.length} carte nel mazzo. Proponi le tue prima che si parta.`
          }
        />
        {preview.length > 0 && (
          <View style={styles.grid}>
            {preview.map((r) => (
              <DeckCard key={r.id} rule={r} onPress={onOpenDeck} />
            ))}
          </View>
        )}
        <View style={styles.actions}>
          <Button label="Apri il mazzo" variant="dark" onPress={onOpenDeck} style={styles.flex} />
          <Button
            label="Crea carta"
            variant="secondary"
            onPress={() => router.push({ pathname: '/card/new', params: { gameId: game.id } })}
            style={styles.flex}
          />
        </View>
      </View>

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
            onPress={() => {
              haptics.bonus();
              startGame(game.id);
              showToast({ text: 'Si parte! Il mazzo è chiuso.' });
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  grid: { flexDirection: 'row', columnGap: '3.33%' },
  actions: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
});
