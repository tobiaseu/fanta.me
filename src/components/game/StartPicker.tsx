import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

const HOUR = 3_600_000;
const STEP = 30 * 60_000;
const DAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/** Arrotonda alla mezz'ora successiva. */
const roundUp = (t: number) => Math.ceil(t / STEP) * STEP;

function at(daysAhead: number, hour: number, now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

/** Suggerimenti rapidi: un tocco imposta anche data e ora qui sopra. `at` null = si parte subito. */
export function startSuggestions(now = new Date()) {
  const t = now.getTime();
  return [
    { id: 'now', label: 'Subito', at: null },
    {
      id: 'tonight',
      label: now.getHours() < 20 ? 'Stasera 21:00' : 'Domani 21:00',
      at: at(now.getHours() < 20 ? 0 : 1, 21, now),
    },
    { id: '1h', label: 'Tra 1 ora', at: roundUp(t + HOUR) },
    { id: '3h', label: 'Tra 3 ore', at: roundUp(t + 3 * HOUR) },
    { id: '24h', label: 'Tra 24 ore', at: roundUp(t + 24 * HOUR) },
    { id: 'morning', label: 'Domani mattina', at: at(1, 10, now) },
  ] as const;
}

/** "sab 12 ott, 21:00", "Oggi, 21:00", "Domani, 10:00" */
export function formatStart(atMs: number | null, now = new Date()) {
  if (atMs === null) return 'Subito';
  const d = new Date(atMs);
  const dayDiff = Math.round((at(0, 0, d) - at(0, 0, now)) / (24 * HOUR));
  const day =
    dayDiff === 0 ? 'Oggi' : dayDiff === 1 ? 'Domani' : `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return `${day}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const hoursUntil = (atMs: number | null) => (atMs === null ? 0 : Math.max(0, (atMs - Date.now()) / HOUR));

/**
 * "Quando si parte?": selettore di data e ora, con i suggerimenti sotto.
 * Toccare un suggerimento imposta il selettore; il selettore è lo stesso che si rivede in pre-partita.
 */
export function StartPicker({ value, onChange }: { value: number | null; onChange: (at: number | null) => void }) {
  const suggestions = startSuggestions();
  const base = value ?? roundUp(Date.now());
  const min = roundUp(Date.now());
  const shift = (ms: number) => {
    haptics.tap();
    onChange(Math.max(min, base + ms));
  };
  const active = suggestions.find((s) => s.at === value)?.id;

  return (
    <View style={styles.wrap}>
      <View style={[styles.picker, value === null && styles.pickerOff]}>
        <Stepper
          icon="calendar"
          label={formatStart(base).split(', ')[0]}
          onPrev={() => shift(-24 * HOUR)}
          onNext={() => shift(24 * HOUR)}
          what="giorno"
        />
        <View style={styles.divider} />
        <Stepper
          icon="clock"
          label={formatStart(base).split(', ')[1]}
          onPrev={() => shift(-STEP)}
          onNext={() => shift(STEP)}
          what="mezz'ora"
        />
      </View>

      <View style={styles.row}>
        {suggestions.map((o) => {
          const on = o.id === active;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tap();
                onChange(o.at);
              }}
              style={[styles.chip, on && styles.chipOn]}>
              <AppText variant="caption" color={on ? colors.inkInverse : colors.ink}>
                {o.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        {value === null
          ? 'Si gioca subito con le 20 carte base. Le carte personali si propongono solo nel pre-partita.'
          : 'Fino ad allora la stanza è in pre-partita: tutti propongono carte, regole e poteri.'}
      </AppText>
    </View>
  );
}

function Stepper({
  icon,
  label,
  onPrev,
  onNext,
  what,
}: {
  icon: 'calendar' | 'clock';
  label: string;
  onPrev: () => void;
  onNext: () => void;
  what: string;
}) {
  return (
    <View style={styles.stepper}>
      <PressableScale accessibilityLabel={`Indietro di un ${what}`} hitSlop={8} onPress={onPrev} style={styles.arrow}>
        <Icon name="chevron-left" size={20} />
      </PressableScale>
      <View style={styles.value}>
        <Icon name={icon} size={18} color={colors.inkSoft} />
        <AppText variant="name">{label}</AppText>
      </View>
      <PressableScale accessibilityLabel={`Avanti di un ${what}`} hitSlop={8} onPress={onNext} style={styles.arrow}>
        <Icon name="chevron-right" size={20} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  picker: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: space.sm },
  pickerOff: { opacity: 0.45 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  stepper: { flexDirection: 'row', alignItems: 'center', height: 60 },
  arrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  value: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    paddingHorizontal: space.sm,
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  regular: { fontWeight: '400' },
});
