import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StartPicker, startOptions } from '@/components/game/StartPicker';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { StepHeader } from '@/components/ui/StepHeader';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type GameMode, type GameSettings } from '@/types/game';

const MODES: { id: GameMode; title: string; body: string; icon: 'clock' | 'calendar' }[] = [
  { id: 'sprint', title: 'Sprint', body: '48 ore, giornate da 24. Per un weekend o una vacanza.', icon: 'clock' },
  { id: 'marathon', title: 'Maratona', body: '4 settimane. Per ufficio, scuola, coinquilini.', icon: 'calendar' },
];
const TOTAL = 5; // 4 passi qui + inviti

/** Prima stanza, un passo alla volta: nome → tipo di partita → quando → avanzate (con la promessa dell'host). */
export function OnboardingRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createGame = useGameStore((s) => s.createGame);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>('sprint');
  const [start, setStart] = useState({ id: 'tonight', hours: startOptions()[1].hours });
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [pledge, setPledge] = useState(false);

  const canNext = step === 1 ? name.trim().length > 1 : step === 4 ? pledge : true;
  const next = () => {
    if (!canNext) return;
    haptics.tap();
    if (step < 4) return setStep(step + 1);
    haptics.bonus();
    const game = createGame({ name: name.trim(), mode, startsInHours: start.hours, settings });
    router.replace({ pathname: '/onboarding/invite', params: { gameId: game.id } });
  };

  const title = ['Come si chiama la stanza?', 'Che partita è?', 'Quando si parte?', 'Avanzate'][step - 1];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          {step > 1 && (
            <PressableScale accessibilityLabel="Indietro" hitSlop={12} onPress={() => setStep(step - 1)}>
              <Icon name="chevron-left" size={22} strokeWidth={2.2} />
            </PressableScale>
          )}
          <View style={styles.flex}>
            <StepHeader step={step} total={TOTAL} />
          </View>
        </View>
        <Animated.View key={step} entering={FadeInRight.duration(260)} style={styles.body}>
          <AppText variant="serifTitle">{title}</AppText>

          {step === 1 && (
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Es. Weekend al mare"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={next}
              accessibilityLabel="Nome della stanza"
            />
          )}

          {step === 2 &&
            MODES.map((m) => {
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
                  style={[styles.option, selected && styles.optionOn]}>
                  <Icon name={m.icon} size={26} />
                  <View style={styles.flex}>
                    <AppText variant="name">{m.title}</AppText>
                    <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                      {m.body}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}

          {step === 3 && <StartPicker value={start.id} onChange={(id, hours) => setStart({ id, hours })} />}

          {step === 4 && (
            <>
              <AppText variant="body" color={colors.inkSoft}>
                Da host decidi le regole del gioco. Puoi lasciare tutto com'è.
              </AppText>
              <Setting label="Carte a testa nel mazzo" hint="Quante carte ognuno porta nel pre-partita">
                <Chips
                  values={[3, 4, 5, 6]}
                  value={settings.cardsPerPlayer}
                  onChange={(v) => setSettings({ ...settings, cardsPerPlayer: v })}
                />
              </Setting>
              <Setting label="Punti massimi per carta" hint="Più alto, più si ribalta la classifica">
                <Chips
                  values={[10, 25, 50]}
                  value={settings.pointsCap}
                  onChange={(v) => setSettings({ ...settings, pointsCap: v })}
                />
              </Setting>
              <View style={[styles.card, styles.switchRow]}>
                <View style={styles.flex}>
                  <AppText variant="name">Fantapoteri</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    Turbo, Scudo, Moviola e gli altri, una volta a testa
                  </AppText>
                </View>
                <Switch
                  value={settings.powers}
                  onValueChange={(v) => setSettings({ ...settings, powers: v })}
                  trackColor={{ true: colors.live, false: colors.surfaceMuted }}
                  accessibilityLabel="Fantapoteri"
                />
              </View>

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: pledge }}
                onPress={() => {
                  haptics.tap();
                  setPledge(!pledge);
                }}
                style={[styles.pledge, pledge && styles.pledgeOn]}>
                <View style={[styles.box, pledge && styles.boxOn]}>
                  {pledge && <Icon name="check" size={14} strokeWidth={3} />}
                </View>
                <View style={styles.flex}>
                  <AppText variant="name">Giuro solennemente di essere un buon host 🤝</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    Si gioca per ridere insieme, mai per umiliare qualcuno. Niente sfide pericolose, niente foto senza
                    permesso, e chi beve non guida.
                  </AppText>
                </View>
              </Pressable>
              <PressableScale accessibilityRole="link" onPress={() => router.push('/rulebook')} style={styles.link}>
                <AppText variant="caption" color={colors.live}>
                  Leggi il Libro del Fanta
                </AppText>
              </PressableScale>
            </>
          )}
        </Animated.View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button label={step === 4 ? 'Crea la stanza' : 'Continua'} disabled={!canNext} onPress={next} />
      </View>
    </View>
  );
}

function Setting({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <AppText variant="name">{label}</AppText>
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        {hint}
      </AppText>
      {children}
    </View>
  );
}

function Chips({ values, value, onChange }: { values: number[]; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.chips}>
      {values.map((v) => (
        <Pressable
          key={v}
          accessibilityRole="radio"
          accessibilityState={{ selected: v === value }}
          onPress={() => {
            haptics.tap();
            onChange(v);
          }}
          style={[styles.chip, v === value && styles.chipOn]}>
          <AppText variant="caption" color={v === value ? colors.inkInverse : colors.ink}>
            {v}
          </AppText>
        </Pressable>
      ))}
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
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  body: { gap: space.md },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 60,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionOn: { borderColor: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chips: { flexDirection: 'row', gap: space.xs, marginTop: space.sm },
  chip: {
    minWidth: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  chipOn: { backgroundColor: colors.ink },
  pledge: {
    flexDirection: 'row',
    gap: space.sm,
    padding: layout.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
  },
  pledgeOn: { borderStyle: 'solid', borderColor: colors.cta, backgroundColor: colors.ctaSoft },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.cta, borderColor: colors.cta },
  link: { alignSelf: 'center', paddingVertical: space.xs },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.sm,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
});
