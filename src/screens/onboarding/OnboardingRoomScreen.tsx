import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { StepHeader } from '@/components/ui/StepHeader';
import { StartPicker, startOptions } from '@/components/game/StartPicker';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { GameMode } from '@/types/game';

const IDEAS = ['🏖️ Vacanza', '🏠 Coinquilini', '💼 Ufficio', '🎓 Classe', '🎉 Addio al celibato'];
const MODES: { id: GameMode; title: string; body: string; icon: 'clock' | 'calendar' }[] = [
  { id: 'sprint', title: 'Sprint', body: '48 ore, giornate da 24', icon: 'clock' },
  { id: 'marathon', title: 'Maratona', body: '4 settimane', icon: 'calendar' },
];

/** Onboarding 1/2: la prima stanza. Due scelte sole, nome e formato, già precompilate. */
export function OnboardingRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createGame = useGameStore((s) => s.createGame);
  const [name, setName] = useState('Weekend al mare');
  const [start, setStart] = useState({ id: 'tonight', hours: startOptions()[1].hours });
  const [mode, setMode] = useState<GameMode>('sprint');
  const ready = name.trim().length > 1;

  const submit = () => {
    if (!ready) return;
    haptics.bonus();
    const game = createGame({ name: name.trim(), mode, startsInHours: start.hours });
    router.replace({ pathname: '/onboarding/invite', params: { gameId: game.id } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
        keyboardShouldPersistTaps="handled">
        <StepHeader step={1} total={2} />
        <View style={styles.copy}>
          <AppText variant="serifTitle">Crea la tua prima stanza</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Una stanza è una partita con il tuo gruppo. Potrai cambiare tutto dopo.
          </AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="caption" color={colors.inkSoft}>
            Come si chiama?
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Es. Fantapasquetta"
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={submit}
            accessibilityLabel="Nome della stanza"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ideas}>
            {IDEAS.map((idea) => (
              <Pressable
                key={idea}
                accessibilityRole="button"
                onPress={() => {
                  haptics.tap();
                  setName(idea.slice(idea.indexOf(' ') + 1));
                }}
                style={styles.idea}>
                <AppText variant="caption">{idea}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <AppText variant="caption" color={colors.inkSoft}>
            Quanto dura?
          </AppText>
          <View style={styles.modes}>
            {MODES.map((m) => {
              const selected = m.id === mode;
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    haptics.tap();
                    setMode(m.id);
                  }}
                  style={[styles.mode, selected && styles.modeSelected]}>
                  <Icon name={m.icon} size={22} />
                  <AppText variant="name">{m.title}</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    {m.body}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <AppText variant="caption" color={colors.inkSoft}>
            Quando si parte?
          </AppText>
          <StartPicker value={start.id} onChange={(id, hours) => setStart({ id, hours })} />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button label="Continua" disabled={!ready} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingBottom: space.lg,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  copy: { gap: space.xs },
  field: { gap: space.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 56,
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
  },
  ideas: { gap: space.xs, paddingVertical: space.xxs },
  idea: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  modes: { flexDirection: 'row', gap: space.sm },
  mode: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    gap: space.xxs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeSelected: { borderColor: colors.ink },
  regular: { fontWeight: '400' },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.sm,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
});
