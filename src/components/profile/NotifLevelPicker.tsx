import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import type { NotifLevel } from '@/store/useSessionStore';
import { colors, radius, space } from '@/theme/tokens';

export const NOTIF_LEVELS: { id: NotifLevel; emoji: string; label: string; note: string }[] = [
  { id: 'all', emoji: '🔥', label: 'Tutto', note: 'Ogni chiamata, punto, potere e sorpasso' },
  { id: 'team', emoji: '👥', label: 'La mia squadra', note: 'Punti tuoi e dei compagni, voti da dare' },
  { id: 'digest', emoji: '🌙', label: 'Riassunto', note: 'Una notifica a fine giornata' },
];

/** Sempre attive, a qualsiasi livello: senza queste il gioco non funziona. */
export const ESSENTIALS = 'Sempre: un punto chiamato su di te, inizio, finale e risultati, inviti.';

/** Tre schede affiancate, una scelta: il livello di notifiche (default o di una stanza). */
export function NotifLevelPicker({
  value,
  onChange,
  inherited,
}: {
  value: NotifLevel;
  onChange: (l: NotifLevel) => void;
  /** Mostra "predefinito" sul livello ereditato dalle impostazioni */
  inherited?: NotifLevel;
}) {
  const current = NOTIF_LEVELS.find((l) => l.id === value)!;
  return (
    <View style={styles.wrap}>
      <View style={styles.row} accessibilityRole="radiogroup">
        {NOTIF_LEVELS.map((l) => {
          const on = l.id === value;
          return (
            <PressableScale
              key={l.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${l.label}: ${l.note}`}
              onPress={() => {
                haptics.tap();
                onChange(l.id);
              }}
              style={[styles.option, on && styles.optionOn]}>
              <AppText style={styles.emoji}>{l.emoji}</AppText>
              <AppText variant="caption" color={on ? colors.ink : colors.inkSoft} style={styles.center}>
                {l.label}
              </AppText>
              {inherited === l.id ? (
                <AppText variant="micro" color={colors.inkFaint}>
                  predefinito
                </AppText>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
      <AppText variant="body" color={colors.inkSoft}>
        {current.note}. {ESSENTIALS}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.xs },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.ink },
  emoji: { fontSize: 26, lineHeight: 32 },
  center: { textAlign: 'center' },
});
