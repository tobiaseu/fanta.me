import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

const NAVY = '#1E2836';
const NAVY_SOFT = '#2D3949';

interface Props {
  player?: Player;
  points: number;
  games: number;
  role: string;
  onClose: () => void;
}

/** Gemma del livello (badge tra le statistiche). */
function Gem() {
  return (
    <Svg width={44} height={40} viewBox="0 0 44 40">
      <Defs>
        <LinearGradient id="gem" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFF6D6" />
          <Stop offset="1" stopColor="#E5B93B" />
        </LinearGradient>
      </Defs>
      <Path d="M8 2h28l7 12-21 24L1 14z" fill="url(#gem)" />
      <Path d="M1 14h42" stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} />
    </Svg>
  );
}

/**
 * Scheda giocatore (ispirazione "Pinna"): card scura sopra la classifica
 * con avatar, ruolo, partite, fantapunti e fantapoteri sbloccati.
 */
export function PlayerCard({ player, points, games, role, onClose }: Props) {
  return (
    <Modal visible={Boolean(player)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi scheda" />
      {player && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.card}>
            <PressableScale onPress={onClose} style={styles.close} accessibilityLabel="Chiudi">
              <Icon name="close" size={20} color={colors.inkInverse} strokeWidth={2} />
            </PressableScale>
            <Avatar player={player} size={128} sticker={false} />
            <View style={styles.names}>
              <AppText variant="title" color={colors.inkInverse}>
                {player.name}
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.5)">
                {role}
              </AppText>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <AppText variant="number" color={colors.inkInverse}>
                  {games}
                </AppText>
                <AppText variant="caption" color="rgba(255,255,255,0.7)">
                  {games === 1 ? 'partita' : 'partite'}
                </AppText>
              </View>
              <Gem />
              <View style={styles.stat}>
                <AppText variant="number" color={colors.inkInverse}>
                  {points}
                </AppText>
                <AppText variant="caption" color="rgba(255,255,255,0.7)">
                  fantapunti
                </AppText>
              </View>
            </View>
            <AppText variant="headline" color={colors.inkInverse}>
              Fantapoteri
            </AppText>
            <View style={styles.powers}>
              {['😁', '🤮', '👻'].map((e) => (
                <AppText key={e} style={styles.power}>
                  {e}
                </AppText>
              ))}
            </View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 14, 20, 0.55)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: NAVY,
    borderRadius: radius.lg,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.md,
  },
  close: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0E141C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: { alignItems: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stat: {
    minWidth: 96,
    alignItems: 'center',
    backgroundColor: NAVY_SOFT,
    borderRadius: radius.md + 4,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
  },
  powers: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch' },
  power: { fontSize: 36, lineHeight: 44 },
});
