import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, cardNameI18n } from '../models/card';
import { HandAnalysis } from '../engine/meld_analyzer';
import { AppStrings } from '../i18n/strings';
import { CardPile } from './CardPile';

interface GameStatusBarProps {
  message: string;
  isMyTurn: boolean;
  currentPlayerName: string;
  topDiscardCard: Card | null;
  drawPileCount: number;
  discardPile: Card[];
  analysis: HandAnalysis;
  onDrawPress: () => void;
  t: AppStrings;
}

export function GameStatusBar({ message, isMyTurn, currentPlayerName, topDiscardCard, drawPileCount, discardPile, analysis, onDrawPress, t }: GameStatusBarProps) {
  return (
    <View style={styles.centerArea}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{message}</Text>
        <Text style={styles.turnText}>
          {isMyTurn ? t.yourTurn : `${t.turnOf}${currentPlayerName}`}
        </Text>
      </View>

      <CardPile
        discardPile={discardPile}
        drawPileCount={drawPileCount}
        onDrawPress={onDrawPress}
      />

      {topDiscardCard && (
        <Text style={styles.discardInfo}>
          {t.discardInfo}{cardNameI18n(topDiscardCard, t)}
        </Text>
      )}

      <View style={styles.meldInfo}>
        <Text style={styles.meldText}>{t.chanLabel}{analysis.chanCount}</Text>
        <Text style={styles.meldText}>{t.caLabel}{analysis.cas.length}</Text>
        <Text style={styles.meldText}>{t.baDauLabel}{analysis.baDaus.length}</Text>
        <Text style={styles.meldText}>{t.queLabel}{analysis.quanLes.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerArea: {
    flex: 2,
    alignItems: 'center',
    gap: 4,
  },
  statusBar: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    color: '#f1c40f',
    fontSize: 13,
    textAlign: 'center',
  },
  turnText: {
    color: '#ecf0f1',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  meldInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  meldText: {
    color: '#ecf0f1',
    fontSize: 10,
  },
  discardInfo: {
    color: '#95a5a6',
    fontSize: 10,
    textAlign: 'center',
  },
});
