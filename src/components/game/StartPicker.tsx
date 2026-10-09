import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

const HOUR = 3_600_000;

function at(daysAhead: number, hour: number, now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Momenti di partenza proposti: subito, stasera, domani, sabato. Restituisce le ore di pre-partita. */
export function startOptions(now = new Date()) {
  const tonight = now.getHours() < 20 ? at(0, 21, now) : at(1, 21, now);
  const saturday = at((6 - now.getDay() + 7) % 7 || 7, 12, now);
  return [
    { id: 'now', label: 'Subito', hours: 0 },
    {
      id: 'tonight',
      label: now.getHours() < 20 ? 'Stasera, 21:00' : 'Domani, 21:00',
      hours: (tonight.getTime() - now.getTime()) / HOUR,
    },
    { id: 'tomorrow', label: 'Domani, 10:00', hours: (at(1, 10, now).getTime() - now.getTime()) / HOUR },
    { id: 'saturday', label: 'Sabato, 12:00', hours: (saturday.getTime() - now.getTime()) / HOUR },
  ];
}

/** "Quando si parte?": se non è subito, la stanza resta in pre-partita e si propongono le carte. */
export function StartPicker({ value, onChange }: { value: string; onChange: (id: string, hours: number) => void }) {
  const options = startOptions();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tap();
                onChange(o.id, o.hours);
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
        {value === 'now'
          ? 'Si gioca subito con le 20 carte base. Le carte personali si propongono solo nel pre-partita.'
          : 'Fino ad allora la stanza è in pre-partita: tutti propongono carte, regole e poteri.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    paddingHorizontal: space.sm,
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.ink },
  regular: { fontWeight: '400' },
});
