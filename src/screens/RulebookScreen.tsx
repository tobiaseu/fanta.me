import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

const CHAPTERS = [
  {
    title: 'I. Le regole',
    items: [
      [
        '🃏',
        'Il mazzo',
        'Ogni carta è un’azione della vita vera con i suoi punti: bonus se è bella, malus se è una figuraccia.',
      ],
      [
        '🏆',
        'Cumulabili e trofei',
        'Quasi tutte le carte sono cumulabili: valgono ogni volta che succede. Le carte trofeo, con il bordo oro, si prendono una volta sola in tutta la partita: le vince il primo che ci arriva.',
      ],
      [
        '👥',
        'Le squadre',
        'Si gioca in squadre da 2 a 4. Conta prima di tutto la classifica a squadre, poi quella individuale.',
      ],
      [
        '📣',
        'Le chiamate',
        'Quando succede, chiunque chiama la carta su chi l’ha fatta. Diventa punto solo se la maggioranza conferma.',
      ],
      ['📅', 'Le giornate', 'La partita è divisa in giornate. Ogni giornata ha una carta che vale doppio.'],
      ['⚡️', 'I fantapoteri', 'Ognuno ne porta due e li usa una volta sola. Il momento giusto vale più del potere.'],
    ],
  },
  {
    title: 'II. I momenti del gioco',
    items: [
      ['⚙️', 'Preparazione', 'L’host crea la stanza: nome, tipo di partita, orario e regole avanzate.'],
      [
        '🧩',
        'Pre-partita',
        'Si invitano gli amici e ognuno mette le sue carte nel mazzo. Il mazzo cresce davanti a tutti.',
      ],
      ['🔥', 'In partita', 'Il mazzo si chiude. Si chiamano punti, si vota, si attivano i poteri.'],
      ['🏆', 'Risultati', 'Classifica finale, trofei e la gloria (o la vergogna) eterna.'],
    ],
  },
  {
    title: 'III. L’etica del Fanta',
    items: [
      [
        '🤝',
        'Si ride con, non di',
        'Le carte raccontano momenti, non attaccano persone. Niente carte su aspetto, corpo, origini o orientamento.',
      ],
      ['🙅', 'Il no è sacro', 'Nessuna carta vale una sfida pericolosa o qualcosa che qualcuno non vuole fare.'],
      ['📵', 'Foto con permesso', 'Prima di pubblicare una prova, chiedi a chi c’è dentro.'],
      ['🍷', 'Con la testa', 'Bere non è mai obbligatorio per fare punti, e chi beve non guida.'],
      ['👑', 'L’host è garante', 'L’host può annullare una chiamata che esagera. Ha giurato di farlo.'],
    ],
  },
];

/** Il "libro sacro" del gioco: regole generali, momenti, etica d'uso. */
export function RulebookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
      <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
        <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
      </PressableScale>
      <View style={styles.cover}>
        <AppText style={styles.book}>📖</AppText>
        <AppText variant="serifTitle" style={styles.center}>
          Il Libro del Fanta
        </AppText>
        <AppText variant="body" color={colors.inkSoft} style={styles.center}>
          Tre capitoli da leggere una volta. Valgono in ogni stanza.
        </AppText>
      </View>
      {CHAPTERS.map((c) => (
        <View key={c.title} style={styles.chapter}>
          <AppText variant="serifCard">{c.title}</AppText>
          <View style={styles.list}>
            {c.items.map(([emoji, title, body], i) => (
              <View key={title} style={[styles.row, i > 0 && styles.divider]}>
                <AppText style={styles.emoji}>{emoji}</AppText>
                <View style={styles.flex}>
                  <AppText variant="name">{title}</AppText>
                  <AppText variant="body" color={colors.inkSoft}>
                    {body}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.gutter, gap: layout.section, width: '100%', maxWidth: MAX_APP_WIDTH, alignSelf: 'center' },
  close: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: { alignItems: 'center', gap: space.xs },
  book: { fontSize: 56, lineHeight: 66 },
  center: { textAlign: 'center' },
  chapter: { gap: space.sm },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: space.sm, padding: layout.card },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  emoji: { fontSize: 24, lineHeight: 30 },
  flex: { flex: 1, gap: 2 },
});
