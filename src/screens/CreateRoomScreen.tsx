import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { RubberHoseMascot } from '@/components/illustrations/RubberHoseMascot';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { GameMode } from '@/types/game';

const MODES: { id: GameMode; title: string; body: string; icon: 'clock' | 'calendar' }[] = [
  { id: 'sprint', title: 'Sprint', body: 'Countdown a ore. Perfetto per un weekend o una vacanza.', icon: 'clock' },
  { id: 'marathon', title: 'Maratona', body: 'Divisa in settimane. Per ufficio, scuola, coinquilini.', icon: 'calendar' },
];

/** Crea nuova stanza (modale). Arriva precompilata se si parte da un format della Lobby. */
export function CreateRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: GameMode; format?: string; invite?: string }>();
  const createGame = useGameStore((s) => s.createGame);
  const players = useGameStore((s) => s.players);
  const friendships = useGameStore((s) => s.friendships);
  const friends = useMemo(() => players.filter((p) => friendships[p.id] === 'friends'), [players, friendships]);
  const [invited, setInvited] = useState<string[]>(params.invite ? [params.invite] : []);
  const toggle = (id: string) => {
    haptics.tap();
    setInvited((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };
  const [name, setName] = useState(params.format ? `Fanta${params.format.charAt(0)}${params.format.slice(1).toLowerCase()}` : '');
  const [mode, setMode] = useState<GameMode>(params.mode ?? 'sprint');
  const ready = name.trim().length > 1;

  const submit = () => {
    if (!ready) return;
    haptics.bonus();
    const game = createGame({ name: name.trim(), mode, friendIds: invited });
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
          <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
        </PressableScale>
      </View>

      <View style={styles.art}>
        <RubberHoseMascot size={130} color={colors.toonBlue} pose="cheer" />
      </View>

      <AppText variant="caption" color={colors.inkSoft}>
        Nome della lega
      </AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Es. Fantapasquetta"
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={submit}
        accessibilityLabel="Nome della lega"
      />

      <AppText variant="caption" color={colors.inkSoft}>
        Modalità
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
              <Icon name={m.icon} size={24} />
              <AppText variant="headline">{m.title}</AppText>
              <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                {m.body}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {friends.length > 0 && (
        <>
          <AppText variant="caption" color={colors.inkSoft}>
            Invita amici
          </AppText>
          <View style={styles.friends}>
            {friends.map((f) => {
              const selected = invited.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`Invita ${f.name}`}
                  onPress={() => toggle(f.id)}
                  style={styles.friend}>
                  <View style={[styles.ring, selected && styles.ringActive]}>
                    <Avatar player={f} size={48} sticker={false} />
                    {selected && (
                      <View style={styles.check}>
                        <Icon name="check" size={12} color={colors.ink} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <AppText variant="micro" color={selected ? colors.ink : colors.inkSoft}>
                    {f.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Button
        label={invited.length ? `Crea e invita ${invited.length === 1 ? '1 amico' : `${invited.length} amici`}` : 'Crea e inizia a giocare'}
        disabled={!ready}
        onPress={submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingTop: space.lg,
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
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    height: 60,
    fontSize: 17,
    fontWeight: '600',
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
  },
  modeSelected: { borderColor: colors.cta },
  regular: { fontWeight: '400' },
  friends: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.md },
  friend: { alignItems: 'center', gap: space.xxs },
  ring: { padding: 3, borderRadius: 30, borderWidth: 3, borderColor: 'transparent' },
  ringActive: { borderColor: colors.cta },
  check: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
