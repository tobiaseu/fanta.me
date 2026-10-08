import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';
import type { GameMode } from '@/types/game';

const MODES: { id: GameMode; title: string; body: string; emoji: string }[] = [
  { id: 'sprint', title: 'Sprint', body: 'Countdown a ore. Perfetto per un weekend o una vacanza.', emoji: '⚡️' },
  { id: 'marathon', title: 'Maratona', body: 'Divisa in settimane. Per ufficio, scuola, coinquilini.', emoji: '🏃' },
];

/** Crea Nuova Stanza (modale). In Fase 2: regole personalizzate + invito via link. */
export function CreateRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createGame = useGameStore((s) => s.createGame);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>('sprint');
  const ready = name.trim().length > 1;

  const submit = () => {
    if (!ready) return;
    haptics.bonus();
    const game = createGame({ name: name.trim(), mode });
    router.replace({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        <AppText variant="title">Nuova stanza</AppText>
        <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} />
        </PressableScale>
      </View>

      <View style={styles.art}>
        <RubberHoseMascot size={120} color={colors.toonPurple} pose="cheer" />
      </View>

      <AppText variant="micro" color={colors.inkMuted}>
        Nome della partita
      </AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Es. FantaCapodanno"
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <AppText variant="micro" color={colors.inkMuted}>
        Modalità
      </AppText>
      <View style={styles.modes}>
        {MODES.map((m) => {
          const selected = m.id === mode;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                haptics.tap();
                setMode(m.id);
              }}
              style={[styles.mode, selected && styles.modeSelected]}>
              <AppText variant="title">{m.emoji}</AppText>
              <AppText variant="headline">{m.title}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {m.body}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <PressableScale disabled={!ready} onPress={submit} style={[styles.cta, !ready && styles.ctaDisabled]}>
        <AppText variant="headline" color={ready ? colors.ctaInk : colors.inkMuted}>
          Crea e inizia a giocare
        </AppText>
      </PressableScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.lg,
    gap: space.sm,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { alignItems: 'center', paddingVertical: space.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 52,
    fontSize: 17,
    color: colors.ink,
    marginBottom: space.sm,
  },
  modes: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  mode: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xxs,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  modeSelected: { borderColor: colors.cta },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: colors.surfaceMuted },
});
