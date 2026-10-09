import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { useGame, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

type Plan = 'pass' | 'room';

const PLANS: Record<Plan, { title: string; price: string; when: string; perks: string[] }> = {
  pass: {
    title: 'Pass carte',
    price: '1,99 €',
    when: 'uso singolo',
    perks: ['+5 carte personali per te', 'Restano nella tua collezione', 'Valgono in tutte le stanze'],
  },
  room: {
    title: 'Stanza Premium',
    price: '4,99 €',
    when: 'per questa stanza',
    perks: ['10 carte personali per ogni giocatore', 'Poteri speciali Ladro 🦝 e Jolly 🃏', 'Paga uno, giocano tutti'],
  },
};

/** Popup Premium: uso singolo per sé, oppure stanza Premium per tutto il gruppo. Pagamento finto. */
export function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const game = useGame(gameId || undefined);
  const buyCardPass = useGameStore((s) => s.buyCardPass);
  const upgradeRoom = useGameStore((s) => s.upgradeRoom);
  const showToast = useUiStore((s) => s.showToast);
  const canRoom = !!game && !game.premium;
  const [plan, setPlan] = useState<Plan>(canRoom ? 'room' : 'pass');

  const buy = () => {
    haptics.bonus();
    if (plan === 'room' && game) {
      upgradeRoom(game.id);
      showToast({ text: `${game.name} ora è Premium 👑` });
    } else {
      buyCardPass();
      showToast({ text: 'Hai 5 carte personali in più' });
    }
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}>
      <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
        <Icon name="close" size={18} color={colors.inkInverse} strokeWidth={2} />
      </PressableScale>
      <AppText style={styles.crown}>👑</AppText>
      <AppText variant="serifTitle" color={colors.inkInverse} style={styles.center}>
        Più carte, più caos
      </AppText>
      <AppText variant="body" color="rgba(255,255,255,0.7)" style={styles.center}>
        Le prime 5 carte personali sono gratis. Sbloccane altre per te, o per tutta la stanza con i poteri speciali.
      </AppText>

      <View style={styles.plans}>
        {(Object.keys(PLANS) as Plan[]).map((id) => {
          const p = PLANS[id];
          const disabled = id === 'room' && !canRoom;
          const on = plan === id;
          return (
            <Pressable
              key={id}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, disabled }}
              onPress={() => {
                haptics.tap();
                setPlan(id);
              }}
              style={[styles.plan, on && styles.planOn, disabled && styles.planOff]}>
              <View style={styles.planHead}>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
                <View style={styles.flex}>
                  <AppText variant="name" color={colors.inkInverse}>
                    {p.title}
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.6)" style={styles.regular}>
                    {disabled
                      ? game?.premium
                        ? 'Questa stanza è già Premium'
                        : 'Apri una stanza per attivarla'
                      : p.when}
                  </AppText>
                </View>
                <AppText variant="headline" color={colors.cta}>
                  {p.price}
                </AppText>
              </View>
              {p.perks.map((perk) => (
                <View key={perk} style={styles.perk}>
                  <Icon name="check" size={14} color={colors.cta} strokeWidth={3} />
                  <AppText variant="caption" color={colors.inkInverse} style={styles.regular}>
                    {perk}
                  </AppText>
                </View>
              ))}
            </Pressable>
          );
        })}
      </View>

      <Button label={`Sblocca a ${PLANS[plan].price}`} onPress={buy} />
      <AppText variant="micro" color="rgba(255,255,255,0.5)" style={styles.center}>
        Demo: nessun pagamento reale. Nell'app vera passa da Apple e Google con RevenueCat.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#14161C' },
  content: {
    padding: layout.gutter,
    paddingTop: layout.section,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  close: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crown: { fontSize: 56, lineHeight: 66, textAlign: 'center' },
  center: { textAlign: 'center' },
  regular: { fontWeight: '400' },
  plans: { gap: space.sm, marginVertical: space.sm },
  plan: {
    borderRadius: radius.lg,
    padding: layout.card,
    gap: space.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planOn: { borderColor: colors.cta, backgroundColor: 'rgba(255,227,130,0.08)' },
  planOff: { opacity: 0.45 },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xxs },
  flex: { flex: 1, gap: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.cta },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cta },
  perk: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingLeft: 34 },
});
