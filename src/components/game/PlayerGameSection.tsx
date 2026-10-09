import { Fragment, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { DeckCard } from '@/components/cards/DeckCard';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { powerById, ruleById } from '@/data/rules';
import { useNow } from '@/hooks/useNow';
import { activeActivations, cardOfDay, useGameStore } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Game, Player, Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Ombreggiature "da collezione": Rara (oro, carta del giorno) e Furia (rosso, in corso adesso). */
const SHADE = {
  rara: { color: '#E8A400', glow: 'rgba(255, 196, 0, 0.55)', label: 'RARA' },
  furia: { color: '#E5352B', glow: 'rgba(255, 70, 40, 0.5)', label: 'FURIA' },
} as const;
type Shade = keyof typeof SHADE;

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString('it-IT', { weekday: 'short' });
  const hm = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${hm}`;
};

/**
 * La partita vista dal profilo di un giocatore: la sua formazione (carte messe nel mazzo
 * e fantapoteri, con l'ombreggiatura se sono in corso) e il diario dei suoi punti.
 */
export function PlayerGameSection({ game, player }: { game: Game; player: Player }) {
  const now = useNow(30_000);
  const proposals = useGameStore((s) => s.proposals);
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const powers = useGameStore((s) => s.powers[player.id]);
  const activations = useGameStore((s) => s.activations);

  const { cards, log, active } = useMemo(() => {
    const mine = proposals
      .filter((p) => p.gameId === game.id && p.authorId === player.id)
      .map((p) => ruleById(p.ruleId))
      .filter((r): r is Rule => !!r);
    const day = game.status === 'live' ? cardOfDay(game, now) : undefined;
    const pending = new Set(
      events
        .filter((e) => e.gameId === game.id && e.status === 'pending' && e.playerId === player.id)
        .map((e) => e.ruleId),
    );
    return {
      cards: mine.map((rule) => ({
        rule,
        shade: (pending.has(rule.id) ? 'furia' : day?.id === rule.id ? 'rara' : undefined) as Shade | undefined,
      })),
      log: events
        .filter((e) => e.gameId === game.id && e.playerId === player.id && e.status === 'confirmed')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      active: activeActivations(activations, game.id, now).filter((a) => a.playerId === player.id),
    };
  }, [proposals, events, activations, game, player.id, now]);

  let running = 0;
  return (
    <>
      <View style={styles.section}>
        <AppText variant="headline">Formazione · {game.name}</AppText>
        {cards.length ? (
          <View style={styles.grid}>
            {cards.map(({ rule, shade }) => (
              <View key={rule.id} style={styles.cell}>
                <View style={[styles.shadeWrap, shade && shadeStyle(shade)]}>
                  <DeckCard rule={rule} style={styles.fill} />
                </View>
                {shade && <ShadeTag shade={shade} />}
              </View>
            ))}
          </View>
        ) : (
          <AppText variant="body" color={colors.inkSoft}>
            Nessuna carta messa nel mazzo.
          </AppText>
        )}
        {game.settings?.powers !== false && powers && (
          <View style={styles.powers}>
            {(['main', 'secondary'] as const).map((slot) => {
              const power = powerById(powers[slot]);
              if (!power) return null;
              const on = active.find((a) => a.powerId === power.id);
              return (
                <View key={slot} style={[styles.power, on && shadeStyle('furia')]}>
                  <Text style={styles.powerEmoji}>{power.emoji}</Text>
                  <View style={styles.flex}>
                    <AppText variant="name">{power.label}</AppText>
                    <AppText variant="micro" color={on ? SHADE.furia.color : colors.inkSoft}>
                      {on
                        ? `IN CORSO fino alle ${new Date(on.until).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                        : slot === 'main'
                          ? 'Principale'
                          : 'Secondario'}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <AppText variant="headline">Diario della partita</AppText>
        {log.length === 0 ? (
          <AppText variant="body" color={colors.inkSoft}>
            Ancora nessun punto ufficiale.
          </AppText>
        ) : (
          <View style={styles.timeline}>
            <View style={styles.rail} />
            {log.map((e) => {
              running += e.points;
              const rule = ruleById(e.ruleId);
              const author = players.find((p) => p.id === e.authorId);
              return (
                <Fragment key={e.id}>
                  <View style={styles.when}>
                    <View style={styles.dot} />
                    <AppText variant="micro" color={colors.inkSoft}>
                      {timeLabel(e.createdAt)}
                    </AppText>
                  </View>
                  <View style={styles.entry}>
                    <View style={styles.entryHead}>
                      {rule && <RuleSticker rule={rule} size={48} />}
                      <View style={styles.flex}>
                        <AppText variant="serifCard" numberOfLines={1}>
                          {rule?.label ?? 'Carta'}
                        </AppText>
                        <AppText variant="micro" color={colors.inkSoft}>
                          Totale {running} punti
                        </AppText>
                      </View>
                      <AppText variant="number" color={e.points > 0 ? colors.bonus : colors.malus}>
                        {e.points > 0 ? `+${e.points}` : e.points}
                      </AppText>
                    </View>
                    {e.review && (
                      <View style={styles.review}>
                        {author && <Avatar player={author} size={22} sticker={false} />}
                        <AppText variant="caption" color={colors.inkSoft} style={styles.reviewText}>
                          “{e.review}” <AppText variant="caption">{author?.name}</AppText>
                        </AppText>
                      </View>
                    )}
                  </View>
                </Fragment>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}

const shadeStyle = (shade: Shade) => ({
  borderColor: SHADE[shade].color,
  ...(Platform.OS === 'web'
    ? ({ boxShadow: `0 0 14px 2px ${SHADE[shade].glow}` } as object)
    : { shadowColor: SHADE[shade].color, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }),
});

function ShadeTag({ shade }: { shade: Shade }) {
  return (
    <View style={[styles.tag, { backgroundColor: SHADE[shade].color }]}>
      <AppText variant="micro" color={colors.inkInverse} style={styles.tagText}>
        {SHADE[shade].label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  cell: { width: '30%', alignItems: 'center' },
  shadeWrap: { width: '100%', borderRadius: radius.sm + 3, borderWidth: 1, borderColor: 'transparent', padding: 1 },
  fill: { width: '100%' },
  tag: { marginTop: 4, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  tagText: { fontSize: 10, lineHeight: 13, fontWeight: '800', letterSpacing: 0.6 },
  powers: { flexDirection: 'row', gap: space.xs },
  power: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: space.sm,
  },
  powerEmoji: { fontSize: 26, lineHeight: 32, fontFamily: EMOJI_FONT },
  flex: { flex: 1, gap: 2 },
  timeline: { gap: space.xs, paddingLeft: space.md },
  rail: { position: 'absolute', left: 4, top: 8, bottom: 8, width: 2, backgroundColor: colors.surfaceMuted },
  when: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.md, marginTop: space.md },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.background,
  },
  entry: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.sm, gap: space.xs },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  review: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: space.xs,
  },
  reviewText: { flex: 1, fontWeight: '400', fontStyle: 'italic' },
});
