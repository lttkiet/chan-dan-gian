import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, RANK_CHARS, SUIT_CHARS, isRedCard } from '../models/card';

interface CardWidgetProps {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export function CardWidget({ card, faceDown = false, selected = false, highlighted = false, onPress, small = false }: CardWidgetProps) {
  const size = small ? styles.small : styles.normal;
  const red = isRedCard(card);

  if (faceDown) {
    return (
      <View style={[styles.card, size, styles.faceDown]}>
        <View style={styles.backPattern}>
          <View style={styles.backInner}>
            <View style={[styles.backDiamond, small && styles.backDiamondSmall]} />
            <Text style={[styles.backSymbol, small && styles.backSymbolSmall]}>牌</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        size,
        selected && styles.selected,
        highlighted && styles.highlighted,
        { borderColor: red ? '#c0392b' : '#2c3e50' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.topCorner, small && styles.topCornerSmall]}>
        <Text style={[styles.cornerRank, red && styles.redText, small && styles.cornerRankSmall]}>
          {RANK_CHARS[card.rank]}
        </Text>
        <Text style={[styles.cornerSuit, red && styles.redText, small && styles.cornerSuitSmall]}>
          {SUIT_CHARS[card.suit]}
        </Text>
      </View>
      <View style={styles.centerArea}>
        <Text style={[styles.centerRank, red && styles.redTextLarge, small && styles.centerRankSmall]}>
          {RANK_CHARS[card.rank]}
        </Text>
        <Text style={[styles.centerSuit, red && styles.redText, small && styles.centerSuitSmall]}>
          {SUIT_CHARS[card.suit]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 50,
    height: 72,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2c3e50',
    backgroundColor: '#fdf6e3',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    overflow: 'hidden',
  },
  normal: {
    width: 50,
    height: 72,
  },
  small: {
    width: 35,
    height: 50,
  },
  selected: {
    borderColor: '#f39c12',
    borderWidth: 3,
    transform: [{ translateY: -8 }],
    shadowColor: '#f39c12',
    shadowOpacity: 0.5,
  },
  highlighted: {
    borderColor: '#2ecc71',
    borderWidth: 2.5,
    shadowColor: '#2ecc71',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  faceDown: {
    backgroundColor: '#1a3a5c',
    borderColor: '#0d2137',
  },
  backPattern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: 3,
    margin: 2,
  },
  backInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1c40f',
    borderRadius: 3,
    padding: 4,
  },
  backDiamond: {
    width: 16,
    height: 16,
    backgroundColor: '#c0392b',
    transform: [{ rotate: '45deg' }],
    marginBottom: 2,
  },
  backDiamondSmall: {
    width: 10,
    height: 10,
  },
  backSymbol: {
    fontSize: 14,
    color: '#f1c40f',
    fontWeight: 'bold',
  },
  backSymbolSmall: {
    fontSize: 10,
  },
  topCorner: {
    position: 'absolute',
    top: 2,
    left: 3,
    alignItems: 'center',
  },
  topCornerSmall: {
    top: 1,
    left: 2,
  },
  cornerRank: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 13,
  },
  cornerRankSmall: {
    fontSize: 8,
    lineHeight: 10,
  },
  cornerSuit: {
    fontSize: 9,
    color: '#2c3e50',
    lineHeight: 11,
  },
  cornerSuitSmall: {
    fontSize: 6,
    lineHeight: 8,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRank: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 24,
  },
  centerRankSmall: {
    fontSize: 15,
    lineHeight: 17,
  },
  centerSuit: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 16,
  },
  centerSuitSmall: {
    fontSize: 10,
    lineHeight: 12,
  },
  redText: {
    color: '#c0392b',
  },
  redTextLarge: {
    color: '#c0392b',
  },
});
