import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { MoreLink } from '@/components/ui/MoreLink';
import { PressableScale } from '@/components/ui/PressableScale';
import { Segmented } from '@/components/ui/Segmented';
import { COLLECTIONS } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { openDeckPage } from '@/lib/links';
import { useGameStore } from '@/store/useGameStore';
import type { Visibility } from '@/store/useSessionStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Player, Rule } from '@/types/game';

type Tab = 'trophies' | 'shields' | 'cards';

const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: 'Solo tu',
  friends: 'Solo amici',
  everyone: 'Tutti',
};

/**
 * Bacheca del giocatore: trofei, scudi (lo stemma di ogni stanza giocata) e carte create.
 * Sulla mia mostra chi la vede e porta alle Impostazioni; su quella degli altri rispetta la loro privacy.
 */
export function CollectionSection({
  player,
  isMe,
  visibility,
  canSee,
}: {
  player: Player;
  isMe: boolean;
  visibility: Visibility;
  canSee: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('trophies');
  const customRules = useGameStore((s) => s.customRules);
  const data = COLLECTIONS[player.id] ?? { trophies: [], shields: [] };
  const savedIds = useGameStore((s) => s.savedRuleIds);
  const cards = [
    ...customRules.filter((r) => r.authorId === player.id),
    ...(isMe ? savedIds.map(ruleById).filter((r): r is Rule => !!r && r.authorId !== player.id) : []),
  ];

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <AppText variant="headline">Bacheca</AppText>
        {isMe && (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Visibile a: ${VISIBILITY_LABEL[visibility]}. Cambia nelle impostazioni`}
            onPress={() => router.push('/settings')}
            hitSlop={8}
            style={styles.visibility}>
            <Icon name={visibility === 'private' ? 'lock' : 'people'} size={14} color={colors.inkSoft} />
            <AppText variant="micro" color={colors.inkSoft}>
              {VISIBILITY_LABEL[visibility]}
            </AppText>
          </PressableScale>
        )}
      </View>

      {!canSee ? (
        <View style={styles.locked}>
          <Icon name="lock" size={20} color={colors.inkSoft} />
          <AppText variant="body" color={colors.inkSoft}>
            {player.name} tiene la bacheca privata.
          </AppText>
        </View>
      ) : (
        <>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { id: 'trophies', label: `Trofei ${data.trophies.length}` },
              { id: 'shields', label: `Scudi ${data.shields.length}` },
              { id: 'cards', label: `Carte ${cards.length}` },
            ]}
          />
          {tab === 'cards' ? (
            cards.length ? (
              <View style={styles.cardsBox}>
                <AppText variant="body" color={colors.inkSoft}>
                  {cards.length} {cards.length === 1 ? 'carta' : 'carte'} nella collezione
                </AppText>
                <MoreLink
                  label="Guarda il mazzo"
                  onPress={() =>
                    openDeckPage({
                      title: isMe ? 'Le tue carte' : `Le carte di ${player.name}`,
                      ids: cards.map((r) => r.id),
                    })
                  }
                />
              </View>
            ) : (
              <Empty text="Nessuna carta creata, per ora." />
            )
          ) : (tab === 'trophies' ? data.trophies : data.shields).length ? (
            <View style={styles.list}>
              {(tab === 'trophies'
                ? data.trophies.map((t) => ({ emoji: t.emoji, label: t.label, note: t.game }))
                : data.shields
              ).map((item, i) => (
                <View key={`${item.label}-${i}`} style={[styles.row, i > 0 && styles.divider]}>
                  <View style={[styles.badge, tab === 'shields' && styles.shield]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="name">{item.label}</AppText>
                    <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                      {item.note}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Empty text={tab === 'trophies' ? 'Ancora nessun trofeo.' : 'Ancora nessuno scudo.'} />
          )}
        </>
      )}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <AppText variant="body" color={colors.inkSoft} style={styles.empty}>
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  visibility: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
  },
  cardsBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.xxs },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ctaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    borderRadius: 12,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: colors.surfaceMuted,
  },
  emoji: { fontSize: 22, lineHeight: 28 },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  empty: { paddingVertical: space.sm },
});
