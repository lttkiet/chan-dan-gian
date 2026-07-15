import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../models/card';
import { CardWidget } from './CardWidget';
import { useTranslation } from '../i18n';

interface CardPileProps {
  discardPile: Card[];
  drawPileCount: number;
  onDrawPress?: () => void;
}

export function CardPile({ discardPile, drawPileCount, onDrawPress }: CardPileProps) {
  const { t } = useTranslation();
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <View style={styles.container}>
      {/* Draw pile */}
      <TouchableOpacity
        style={[styles.pile, drawPileCount === 0 && styles.emptyPile]}
        onPress={onDrawPress}
        disabled={drawPileCount === 0}
      >
        {drawPileCount > 0 ? (
          <>
            <CardWidget card={{ rank: 2, suit: 'van' as any, id: 'back' }} faceDown small />
            <Text style={styles.countText}>{drawPileCount}</Text>
          </>
        ) : (
          <Text style={styles.emptyText}>{t.pileEmpty}</Text>
        )}
      </TouchableOpacity>

      {/* Discard pile */}
      <View style={styles.pile}>
        {topDiscard ? (
          <CardWidget card={topDiscard} small />
        ) : (
          <View style={[styles.pile, styles.emptyDiscard]}>
            <Text style={styles.emptyText}>{t.pileDiscard}</Text>
          </View>
        )}
        {discardPile.length > 0 && (
          <Text style={styles.countText}>{discardPile.length}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  pile: {
    alignItems: 'center',
    gap: 4,
  },
  emptyPile: {
    opacity: 0.5,
  },
  emptyDiscard: {
    width: 35,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 10,
    color: '#95a5a6',
  },
});
