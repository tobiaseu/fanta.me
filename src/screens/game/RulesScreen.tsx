import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { POWER_UPS, RULE_CATEGORIES, RULES } from '@/data/rules';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

/** Regolamento: dizionario Bonus/Malus per categoria + Superpoteri. */
export function RulesScreen() {
  const game = useCurrentGame();
  if (!game) return null;
  const rules = RULES.filter((r) => game.ruleIds.includes(r.id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="title">Superpoteri</AppText>
      <View style={styles.powers}>
        {POWER_UPS.map((p) => (
          <View key={p.id} style={styles.power}>
            <View style={styles.powerHead}>
              <AppText variant="headline">{p.id === 'veto' ? '🛡️' : '🚀'}</AppText>
              <Icon name="lock" size={16} color={colors.inkMuted} />
            </View>
            <AppText variant="headline">{p.label}</AppText>
            <AppText variant="caption" color={colors.inkMuted}>
              {p.description}
            </AppText>
            <View style={styles.unlock}>
              <Icon name="play" size={12} color="#8A4B00" />
              <AppText variant="caption" color="#8A4B00">
                Sblocca con un video
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <AppText variant="title">Regolamento</AppText>
      {RULE_CATEGORIES.map((cat) => {
        const items = rules.filter((r) => r.categoryId === cat.id);
        if (items.length === 0) return null;
        return (
          <View key={cat.id} style={styles.section}>
            <AppText variant="micro" color={colors.inkMuted}>
              {cat.emoji} {cat.label}
            </AppText>
            {items.map((r, i) => (
              <View key={r.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                <AppText variant="body" style={styles.flex}>
                  {r.label}
                </AppText>
                <AppText variant="headline" color={r.points > 0 ? colors.bonus : colors.malus}>
                  {r.points > 0 ? `+${r.points}` : r.points}
                </AppText>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: space.xxl,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  powers: { flexDirection: 'row', gap: space.sm },
  power: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xxs,
    ...shadow.card,
  },
  powerHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xxs },
  unlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: space.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.ctaSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 3,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xs,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: colors.hairline },
  flex: { flex: 1 },
});
