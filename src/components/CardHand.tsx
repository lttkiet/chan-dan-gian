import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../models/card';
import { CardWidget } from './CardWidget';

interface CardHandProps {
  cards: Card[];
  selectedCardId?: string | null;
  onCardPress?: (card: Card) => void;
  faceDown?: boolean;
  small?: boolean;
}

export function CardHand({ cards, selectedCardId, onCardPress, faceDown = false, small = false }: CardHandProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {cards.map((card) => (
        <CardWidget
          key={card.id}
          card={card}
          faceDown={faceDown}
          selected={selectedCardId === card.id}
          onPress={() => onCardPress?.(card)}
          small={small}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
