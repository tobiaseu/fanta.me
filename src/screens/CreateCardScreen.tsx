import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardTone } from '@/components/cards/DeckCard';
import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { haptics } from '@/lib/haptics';
import { customSlots, useGame, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const EMOJIS = [
  '🎤',
  '🧭',
  '🙊',
  '🍕',
  '🕺',
  '🛵',
  '🧳',
  '🌶️',
  '🍦',
  '🎯',
  '🏆',
  '💤',
  '🤳',
  '🍾',
  '🚿',
  '🐶',
  '🧊',
  '🎲',
  '🚨',
  '🫠',
  '🥵',
  '🤡',
  '👑',
  '💸',
];

/** Editor di una carta personale: emoji, nome, regola e punti, con anteprima dal vivo. */
export function CreateCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const game = useGame(gameId);
  const createCustomRule = useGameStore((s) => s.createCustomRule);
  const proposeCard = useGameStore((s) => s.proposeCard);
  const extraSlots = useGameStore((s) => s.extraSlots);
  const used = useGameStore((s) => s.customRules.filter((r) => r.authorId === ME.id).length);
  const showToast = useUiStore((s) => s.showToast);

  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<'bonus' | 'malus'>('bonus');
  const [amount, setAmount] = useState(10);
  const points = kind === 'bonus' ? amount : -amount;
  const ready = label.trim().length > 2 && description.trim().length > 5;
  const pregame = game?.status === 'waiting';
  const left = customSlots(extraSlots, game) - used;

  const preview: Rule = {
    id: 'preview',
    categoryId: 'chaos',
    label: label.trim() || 'La tua carta',
    description: description.trim() || 'Scrivi la regola: cosa bisogna fare per prendere i punti?',
    points,
    emoji,
    authorId: ME.id,
  };
  const tone = cardTone(preview);

  const save = () => {
    if (!ready) return;
    if (left <= 0) {
      router.replace({ pathname: '/premium', params: { gameId: gameId ?? '' } });
      return;
    }
    haptics.bonus();
    const rule = createCustomRule({
      categoryId: 'chaos',
      label: label.trim(),
      description: description.trim(),
      points,
      emoji,
    });
    if (pregame && game) proposeCard(game.id, rule.id);
    showToast({ text: pregame ? `${rule.label} creata e proposta` : `${rule.label} è nella tua collezione` });
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        <View>
          <AppText variant="serifHeading">Nuova carta</AppText>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            Ti restano {Math.max(0, left)} carte personali
          </AppText>
        </View>
        <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
        </PressableScale>
      </View>

      <View style={[styles.preview, { borderColor: tone.edge }]} accessibilityLabel="Anteprima della carta">
        <View style={[styles.gem, { backgroundColor: tone.gem }]}>
          <AppText variant="headline" color={colors.inkInverse}>
            {points > 0 ? `+${points}` : points}
          </AppText>
        </View>
        <View style={[styles.art, { backgroundColor: tone.fill }]}>
          <RuleSticker rule={preview} size={110} />
        </View>
        <AppText variant="serifCard" style={styles.center} numberOfLines={1}>
          {preview.label}
        </AppText>
        <AppText variant="caption" color={colors.inkSoft} style={[styles.center, styles.regular]} numberOfLines={2}>
          {preview.description}
        </AppText>
      </View>

      <AppText variant="caption" color={colors.inkSoft}>
        Emoji
      </AppText>
      <View style={styles.emojis}>
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            accessibilityRole="radio"
            accessibilityState={{ selected: e === emoji }}
            onPress={() => {
              haptics.tap();
              setEmoji(e);
            }}
            style={[styles.emoji, e === emoji && styles.emojiOn]}>
            <Text style={styles.emojiText}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <AppText variant="caption" color={colors.inkSoft}>
        Nome della carta
      </AppText>
      <TextInput
        value={label}
        onChangeText={setLabel}
        maxLength={22}
        placeholder="Es. La Popstar"
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        accessibilityLabel="Nome della carta"
      />
      <AppText variant="caption" color={colors.inkSoft}>
        La regola
      </AppText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        maxLength={90}
        multiline
        placeholder="Es. Prende il microfono al karaoke e non lo molla più."
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, styles.multiline]}
        accessibilityLabel="Regola della carta"
      />

      <AppText variant="caption" color={colors.inkSoft}>
        Punti
      </AppText>
      <View style={styles.pointsRow}>
        <View style={styles.segment}>
          {(['bonus', 'malus'] as const).map((k) => (
            <Pressable
              key={k}
              accessibilityRole="radio"
              accessibilityState={{ selected: kind === k }}
              onPress={() => {
                haptics.tap();
                setKind(k);
              }}
              style={[styles.segmentItem, kind === k && styles.segmentActive]}>
              <AppText
                variant="caption"
                color={kind === k ? (k === 'bonus' ? colors.bonus : colors.malus) : colors.inkSoft}>
                {k === 'bonus' ? 'Bonus' : 'Malus'}
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.stepper}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Meno punti"
            onPress={() => setAmount((a) => Math.max(5, a - 5))}
            style={styles.step}>
            <AppText variant="title">−</AppText>
          </PressableScale>
          <AppText variant="number" style={styles.amount}>
            {amount}
          </AppText>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Più punti"
            onPress={() => setAmount((a) => Math.min(50, a + 5))}
            style={styles.step}>
            <AppText variant="title">+</AppText>
          </PressableScale>
        </View>
      </View>

      <Button
        label={pregame ? 'Crea e proponi alla stanza' : 'Salva nella collezione'}
        disabled={!ready}
        onPress={save}
        style={styles.cta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: layout.gutter,
    paddingTop: layout.section,
    gap: space.sm,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regular: { fontWeight: '400' },
  preview: {
    alignSelf: 'center',
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 4,
    padding: space.sm,
    gap: space.xxs,
    marginVertical: space.sm,
  },
  gem: {
    position: 'absolute',
    top: -12,
    left: -12,
    zIndex: 2,
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { borderRadius: radius.md, alignItems: 'center', paddingVertical: space.xs },
  center: { textAlign: 'center' },
  emojis: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginBottom: space.xs },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiOn: { borderColor: colors.toonPurple },
  emojiText: { fontSize: 24, lineHeight: 30 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 52,
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: space.xs,
  },
  multiline: { height: 88, paddingTop: space.sm, fontWeight: '400', textAlignVertical: 'top' },
  pointsRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  segment: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surface },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
  },
  step: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  amount: { minWidth: 36, textAlign: 'center' },
  cta: { marginTop: space.md },
});
