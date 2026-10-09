import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { POWER_UPS, RULE_CATEGORIES, RULES } from '@/data/rules';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useGameStore } from '@/store/useGameStore';
import { haptics } from '@/lib/haptics';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

type Filter = 'all' | 'bonus' | 'malus';

/** Etichette sotto la carta: categoria + bonus/malus (le due pillole grigie del Figma). */
function Pills({ rule, big }: { rule: Rule; big?: boolean }) {
  const cat = RULE_CATEGORIES.find((c) => c.id === rule.categoryId);
  return (
    <View style={styles.pills}>
      <View style={[styles.pill, big && styles.pillBig]}>
        <AppText variant="micro" color={colors.inkSoft} numberOfLines={1}>
          {cat?.emoji} {cat?.label}
        </AppText>
      </View>
      <View style={[styles.pill, big && styles.pillBig]}>
        <AppText variant="micro" color={rule.points > 0 ? colors.bonus : colors.malus}>
          {rule.points > 0 ? 'Bonus' : 'Malus'}
        </AppText>
      </View>
    </View>
  );
}

function TrophyCard({ rule, featured, note }: { rule: Rule; featured?: boolean; note?: string }) {
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <AppText variant={featured ? 'serifTitle' : 'serifCard'} color={featured ? colors.inkSoft : colors.ink} numberOfLines={1}>
        {rule.label}
      </AppText>
      {note && (
        <AppText variant="headline" color={colors.inkSoft} style={styles.subtitle}>
          {note}
        </AppText>
      )}
      <View style={styles.art}>
        <RuleSticker rule={rule} size={featured ? 190 : 120} />
      </View>
      <AppText
        style={[featured ? styles.pointsBig : styles.points, { color: rule.points > 0 ? colors.bonusBright : colors.malus }]}>
        {rule.points > 0 ? `+${rule.points}` : rule.points}
      </AppText>
      {featured && (
        <AppText variant="body" color={colors.inkSoft} style={styles.center}>
          {rule.description}
        </AppText>
      )}
      <Pills rule={rule} big={featured} />
    </View>
  );
}

/** Regolamento: carta in evidenza, mazzo di carte trofeo e Superpoteri. */
export function RulesScreen() {
  const game = useCurrentGame();
  const [filter, setFilter] = useState<Filter>('all');
  const events = useGameStore((s) => s.events);
  if (!game) return null;

  const rules = RULES.filter((r) => game.ruleIds.includes(r.id));
  // In evidenza la carta più confermata in questa lega (all'inizio, la prima del mazzo)
  const counts = new Map<string, number>();
  for (const e of events) if (e.gameId === game.id && e.status === 'confirmed') counts.set(e.ruleId, (counts.get(e.ruleId) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const featured = rules.find((r) => r.id === top?.[0]) ?? rules[0];
  const featuredNote = top ? (top[1] === 1 ? 'La più confermata finora' : `Confermata ${top[1]} volte`) : 'Prima carta del mazzo';
  const deck = rules.filter(
    (r) => r.id !== featured?.id && (filter === 'all' || (filter === 'bonus' ? r.points > 0 : r.points < 0)),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {featured && <TrophyCard rule={featured} featured note={featuredNote} />}

      <View style={styles.headerRow}>
        <AppText variant="title">Il mazzo</AppText>
        <AppText variant="caption" color={colors.inkFaint}>
          {rules.length} carte
        </AppText>
      </View>
      <View style={styles.segment} accessibilityRole="tablist">
        {(
          [
            ['all', 'Tutte'],
            ['bonus', 'Bonus'],
            ['malus', 'Malus'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === id }}
            onPress={() => {
              haptics.tap();
              setFilter(id);
            }}
            style={[styles.segmentItem, filter === id && styles.segmentActive]}>
            <AppText variant="headline" color={filter === id ? colors.ink : colors.inkFaint}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.grid}>
        {deck.map((r) => (
          <View key={r.id} style={styles.cell}>
            <TrophyCard rule={r} />
          </View>
        ))}
      </View>

      <AppText variant="title">Superpoteri</AppText>
      <View style={styles.powers}>
        {POWER_UPS.map((p) => (
          <View key={p.id} style={styles.power}>
            <View style={styles.powerHead}>
              <AppText style={styles.powerEmoji}>{p.id === 'veto' ? '🛡️' : '🚀'}</AppText>
              <Icon name="lock" size={18} color={colors.inkFaint} />
            </View>
            <AppText variant="headline">{p.label}</AppText>
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              {p.description}
            </AppText>
            <View style={styles.unlock}>
              <Icon name="play" size={12} color={colors.ink} />
              <AppText variant="micro">Sblocca con un video</AppText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: TAB_BAR_SPACE,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 2,
  },
  featured: {
    marginHorizontal: space.lg,
    marginVertical: space.md,
    padding: space.lg,
    borderRadius: radius.xl + 4,
    backgroundColor: '#F7F7FA',
    borderWidth: 1,
    borderColor: colors.hairline,
    gap: space.xxs,
  },
  subtitle: { fontWeight: '400' },
  art: { alignItems: 'center', paddingVertical: space.xs, minHeight: 100, justifyContent: 'center' },
  points: { fontSize: 20, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  pointsBig: { fontSize: 28, lineHeight: 32, fontWeight: '700', textAlign: 'center' },
  center: { textAlign: 'center', fontWeight: '400', marginBottom: space.xs },
  pills: { flexDirection: 'row', gap: 4, marginTop: space.xs },
  pill: {
    flex: 1,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pillBig: { height: 44 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space.xs },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md + 4, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs + 2, borderRadius: radius.md },
  segmentActive: { backgroundColor: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { width: '47%', flexGrow: 1 },
  powers: { flexDirection: 'row', gap: space.sm },
  power: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.xxs },
  powerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  powerEmoji: { fontSize: 24, lineHeight: 30 },
  regular: { fontWeight: '400' },
  unlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: space.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
  },
});
