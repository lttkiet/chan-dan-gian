import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Rank, Suit, RANK_CHARS, SUIT_CHARS, isRedCard, cardName } from '../models/card';

interface CardWidgetProps {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

const SUIT_COLORS: Record<Suit, string> = {
  [Suit.Van]: '#1a1a2e',
  [Suit.Van2]: '#16213e',
  [Suit.Sach]: '#0f3460',
};

export function CardWidget({ card, faceDown = false, selected = false, onPress, small = false }: CardWidgetProps) {
  const size = small ? styles.small : styles.normal;
  const red = isRedCard(card);

  if (faceDown) {
    return (
      <View style={[styles.card, size, styles.faceDown]}>
        <Text style={[styles.faceDownText, small && styles.smallText]}>🀫</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        size,
        selected && styles.selected,
        { borderColor: red ? '#e74c3c' : '#2c3e50' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.rankChar, red && styles.redText, small && styles.smallRank]}>
        {RANK_CHARS[card.rank]}
      </Text>
      <Text style={[styles.suitChar, red && styles.redText, small && styles.smallSuit]}>
        {SUIT_CHARS[card.suit]}
      </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
  },
  faceDown: {
    backgroundColor: '#2c3e50',
    borderColor: '#1a252f',
  },
  faceDownText: {
    fontSize: 24,
    color: '#ecf0f1',
  },
  rankChar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  suitChar: {
    fontSize: 16,
    color: '#2c3e50',
  },
  redText: {
    color: '#e74c3c',
  },
  smallText: {
    fontSize: 16,
  },
  smallRank: {
    fontSize: 14,
  },
  smallSuit: {
    fontSize: 12,
  },
});
