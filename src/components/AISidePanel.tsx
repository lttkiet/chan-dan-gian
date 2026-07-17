import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../models/game_state';
import { handSize } from '../models/hand';

interface AISidePanelProps {
  players: Player[];
  playerIds: number[];
  currentPlayerId: number;
  cardCountLabel: string;
  meldCountLabel: string;
}

export function AISidePanel({ players, playerIds, currentPlayerId, cardCountLabel, meldCountLabel }: AISidePanelProps) {
  return (
    <View style={styles.sideAI}>
      {playerIds.map(i => (
        <View key={i} style={[
          styles.aiPlayer,
          currentPlayerId === i && styles.aiPlayerActive,
        ]}>
          <Text style={styles.aiName}>{players[i].name}</Text>
          <View style={styles.cardBacks}>
            {Array.from({ length: Math.min(handSize(players[i].hand), 10) }).map((_, idx) => (
              <View key={idx} style={styles.miniCardBack}>
                <View style={styles.miniCardBackInner} />
              </View>
            ))}
          </View>
          <Text style={styles.cardCount}>{handSize(players[i].hand)} {cardCountLabel}</Text>
          {players[i].melds.length > 0 && (
            <Text style={styles.meldCount}>{players[i].melds.length} {meldCountLabel}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sideAI: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  aiPlayer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 90,
  },
  aiPlayerActive: {
    borderColor: '#f1c40f',
    borderWidth: 1,
  },
  aiName: {
    color: '#ecf0f1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBacks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 1,
    marginBottom: 2,
  },
  miniCardBack: {
    width: 12,
    height: 17,
    borderRadius: 2,
    backgroundColor: '#1e3a5f',
    borderWidth: 1,
    borderColor: '#f1c40f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardBackInner: {
    width: 5,
    height: 5,
    backgroundColor: '#c0392b',
    transform: [{ rotate: '45deg' }],
  },
  cardCount: {
    color: '#95a5a6',
    fontSize: 9,
  },
  meldCount: {
    color: '#27ae60',
    fontSize: 9,
  },
});
