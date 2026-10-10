import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard } from '@/components/cards/DeckCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { deckAuthor, nameIn, useGameStore } from '@/store/useGameStore';
import { space } from '@/theme/tokens';
import type { Game, Rule } from '@/types/game';

/**
 * Il mazzo aperto: le carte una accanto all'altra, si trascinano a destra e sinistra
 * e un tocco ingrandisce la carta. Sotto ognuna, chi l'ha messa.
 */
export function DeckExplorer({
  game,
  deck,
  open,
  onClose,
}: {
  game: Game;
  deck: Rule[];
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const proposals = useGameStore((s) => s.proposals);
  const players = useGameStore((s) => s.players);
  const [zoom, setZoom] = useState<Rule>();
  const cardW = Math.min(220, width * 0.56);
  const gap = space.md;
  const side = (Math.min(width, 520) - cardW) / 2;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Chiudi il mazzo" />
      <View style={[styles.stage, { paddingTop: insets.top + space.md }]} pointerEvents="box-none">
        <View style={styles.head}>
          <AppText variant="headline" color="#fff">
            {deck.length} carte nel mazzo
          </AppText>
          <PressableScale accessibilityLabel="Chiudi" hitSlop={12} onPress={onClose}>
            <Icon name="close" size={22} color="#fff" />
          </PressableScale>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardW + gap}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: side, gap, alignItems: 'center' }}>
          {deck.map((r, i) => {
            const authorId = deckAuthor(proposals, game.id, r.id);
            const author = players.find((p) => p.id === authorId);
            return (
              <Animated.View
                key={r.id}
                entering={ZoomIn.delay(Math.min(i, 6) * 50)
                  .springify()
                  .damping(15)}
                style={{ width: cardW, gap: space.sm }}>
                <DeckCard rule={r} style={{ width: cardW }} onPress={() => setZoom(r)} />
                <Animated.View entering={FadeIn.delay(200)} style={styles.by}>
                  {author ? (
                    <>
                      <Avatar player={author} size={22} sticker={false} />
                      <AppText variant="caption" color="#fff">
                        messa da {nameIn(game, author)}
                      </AppText>
                    </>
                  ) : (
                    <AppText variant="caption" color="rgba(255,255,255,0.7)">
                      Carta base della stanza
                    </AppText>
                  )}
                </Animated.View>
              </Animated.View>
            );
          })}
        </ScrollView>
        <AppText variant="micro" color="rgba(255,255,255,0.7)" style={styles.hint}>
          Trascina per sfogliare, tocca una carta per ingrandirla
        </AppText>
      </View>
      <CardSheet rule={zoom} onClose={() => setZoom(undefined)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,12,14,0.92)' },
  stage: { flex: 1, justifyContent: 'center', gap: space.lg },
  head: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  by: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  hint: { textAlign: 'center' },
});
