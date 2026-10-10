import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, layout, radius, space } from '@/theme/tokens';

const OCCASIONS = [
  { id: 'serata', label: 'Serata', emoji: '🍻', hours: 8, hint: 'Stasera, fino a notte' },
  { id: 'weekend', label: 'Weekend', emoji: '🏕️', hours: 48, hint: 'Due giorni' },
  { id: 'vacanza', label: 'Vacanza', emoji: '🏖️', hours: 168, hint: 'Una settimana' },
  { id: 'evento', label: 'Evento', emoji: '🎉', hours: 12, hint: 'Festa, matrimonio, gita' },
] as const;

/**
 * Stanza al volo, direttamente in home: nome + occasione e si parte.
 * Tutte le opzioni (squadre, avanzate, orario) restano in "Più opzioni".
 */
export function QuickRoom({ primary }: { primary?: boolean }) {
  const router = useRouter();
  const createGame = useGameStore((s) => s.createGame);
  const [name, setName] = useState('');
  const [occ, setOcc] = useState<(typeof OCCASIONS)[number]>(OCCASIONS[0]);

  const create = () => {
    haptics.press();
    const game = createGame({
      name: name.trim() || `${occ.label} con gli amici`,
      mode: 'sprint',
      startsInHours: 1,
      hours: occ.hours,
      emoji: occ.emoji,
    });
    router.push({ pathname: '/onboarding/invite', params: { gameId: game.id } });
  };

  return (
    <View style={styles.card}>
      <AppText variant="name">Nuova stanza</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={`Es. ${occ.label} al lago`}
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        accessibilityLabel="Nome della stanza"
        returnKeyType="done"
        onSubmitEditing={create}
      />
      <View style={styles.occasions} accessibilityRole="radiogroup">
        {OCCASIONS.map((o) => {
          const on = o.id === occ.id;
          return (
            <PressableScale
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${o.label}: ${o.hint}`}
              onPress={() => {
                haptics.tap();
                setOcc(o);
              }}
              style={[styles.occ, on && styles.occOn]}>
              <AppText style={styles.emoji}>{o.emoji}</AppText>
              <AppText variant="micro" color={on ? colors.ink : colors.inkSoft}>
                {o.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        {occ.hint}. Si parte tra un'ora: intanto inviti gli amici e scegliete le carte.
      </AppText>
      <Button label="Crea e invita" variant={primary ? 'primary' : 'secondary'} onPress={create} />
      <View style={styles.links}>
        <Button label="Più opzioni" variant="tertiary" onPress={() => router.push('/room/new')} />
        <Button label="Ho un codice" variant="tertiary" onPress={() => router.push('/room/join')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.sm },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: colors.ink,
  },
  occasions: { flexDirection: 'row', gap: space.xs },
  occ: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  occOn: { borderColor: colors.ink, backgroundColor: colors.background },
  emoji: { fontSize: 22, lineHeight: 28 },
  regular: { fontWeight: '400' },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
});
