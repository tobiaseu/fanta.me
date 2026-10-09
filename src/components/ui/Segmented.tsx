import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

/** Toggle orizzontale: si sceglie una vista invece di scorrere tutto. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              haptics.tap();
              onChange(o.id);
            }}
            style={[styles.item, on && styles.on]}>
            <AppText variant="caption" color={on ? colors.ink : colors.inkSoft} numberOfLines={1}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, padding: 3 },
  item: { flex: 1, alignItems: 'center', paddingVertical: space.xs, borderRadius: radius.pill },
  on: { backgroundColor: colors.surface },
});
