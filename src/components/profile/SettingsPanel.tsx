import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { useSessionStore, type NotificationKind, type Visibility } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';

const VISIBILITY: { id: Visibility; label: string; note: string }[] = [
  { id: 'private', label: 'Solo tu', note: 'Nessuno vede trofei, scudi e carte' },
  { id: 'friends', label: 'Solo amici', note: 'La vedono i tuoi amici su Fanta.me' },
  { id: 'everyone', label: 'Tutti', note: 'Anche chi gioca con te senza essere amico' },
];

const NOTIFICATIONS: { id: NotificationKind; label: string; note: string }[] = [
  { id: 'calls', label: 'Chiamate da votare', note: 'Quando qualcuno chiama un punto' },
  { id: 'phases', label: 'Inizio e fine partita', note: 'Mazzo chiuso, nuova giornata, risultati' },
  { id: 'friends', label: "Richieste d'amicizia", note: 'Quando qualcuno ti aggiunge' },
];

/**
 * Impostazioni essenziali, le stesse nel profilo e nella schermata dedicata:
 * notifiche, privacy della bacheca, vibrazione, account (esci ed elimina).
 */
export function SettingsPanel() {
  const router = useRouter();
  const s = useSessionStore();
  const showToast = useUiStore((u) => u.showToast);

  const signOut = () => {
    s.signOut();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/welcome');
  };

  return (
    <View style={styles.wrap}>
      <Group title="Notifiche">
        {NOTIFICATIONS.map((n, i) => (
          <Row key={n.id} label={n.label} note={n.note} first={i === 0}>
            <Switch
              value={s.notifications[n.id]}
              onValueChange={() => s.toggleNotification(n.id)}
              trackColor={{ true: colors.live, false: colors.surfaceMuted }}
              accessibilityLabel={n.label}
            />
          </Row>
        ))}
      </Group>

      <Group title="Chi vede la tua bacheca">
        {VISIBILITY.map((o, i) => {
          const on = o.id === s.collectionVisibility;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tap();
                s.setCollectionVisibility(o.id);
              }}>
              <Row label={o.label} note={o.note} first={i === 0}>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.dot} />}</View>
              </Row>
            </Pressable>
          );
        })}
      </Group>

      <Group title="Gioco">
        <Row label="Vibrazione" note="Feedback al tocco su iPhone e Android" first>
          <Switch
            value={s.hapticsOn}
            onValueChange={s.setHaptics}
            trackColor={{ true: colors.live, false: colors.surfaceMuted }}
            accessibilityLabel="Vibrazione"
          />
        </Row>
      </Group>

      <Group title="Account">
        <View style={styles.account}>
          <Button label="Esci dall'account" variant="secondary" onPress={signOut} />
          <Button
            label="Elimina account"
            variant="tertiary"
            onPress={() =>
              confirmAction(
                'Eliminare l’account?',
                'Perdi stanze, carte e bacheca. Non si può annullare.',
                'Elimina',
                () => {
                  showToast({ text: 'Account eliminato (demo)' });
                  signOut();
                },
              )
            }
          />
        </View>
      </Group>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="headline">{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  label,
  note,
  first,
  children,
}: {
  label: string;
  note: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, !first && styles.divider]}>
      <View style={styles.flex}>
        <AppText variant="name">{label}</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {note}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  group: { gap: space.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.ink },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
  account: { padding: space.md, gap: space.xs },
});
