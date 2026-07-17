import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayerAction } from '../models/game_state';
import { AppStrings } from '../i18n/strings';

interface ActionPanelProps {
  actions: PlayerAction[];
  pendingDiscard: boolean;
  selectedCard: string | null;
  t: AppStrings;
  onDraw: () => void;
  onEat: () => void;
  onChiu: () => void;
  onDiscard: () => void;
  onPass: () => void;
  onDeclareU: () => void;
}

export function ActionPanel({ actions, pendingDiscard, selectedCard, t, onDraw, onEat, onChiu, onDiscard, onPass, onDeclareU }: ActionPanelProps) {
  return (
    <View style={styles.actions}>
      {actions.includes(PlayerAction.DeclareU) && (
        <TouchableOpacity style={[styles.actionButton, styles.declareUButton]} onPress={onDeclareU}>
          <Text style={styles.actionText}>{t.btnDeclareU}</Text>
        </TouchableOpacity>
      )}
      {!pendingDiscard && actions.includes(PlayerAction.Draw) && (
        <TouchableOpacity style={styles.actionButton} onPress={onDraw}>
          <Text style={styles.actionText}>{t.btnDraw}</Text>
        </TouchableOpacity>
      )}
      {!pendingDiscard && actions.includes(PlayerAction.Eat) && (
        <TouchableOpacity style={[styles.actionButton, styles.eatButton]} onPress={onEat}>
          <Text style={styles.actionText}>{t.btnEat}</Text>
        </TouchableOpacity>
      )}
      {!pendingDiscard && actions.includes(PlayerAction.Chiu) && (
        <TouchableOpacity style={[styles.actionButton, styles.chiuButton]} onPress={onChiu}>
          <Text style={styles.actionText}>{t.btnChiu}</Text>
        </TouchableOpacity>
      )}
      {pendingDiscard && selectedCard && (
        <TouchableOpacity style={[styles.actionButton, styles.discardButton]} onPress={onDiscard}>
          <Text style={styles.actionText}>{t.btnDiscard}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionButton} onPress={onPass}>
        <Text style={styles.actionText}>{t.btnPass}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  eatButton: {
    backgroundColor: '#27ae60',
  },
  chiuButton: {
    backgroundColor: '#8e44ad',
  },
  declareUButton: {
    backgroundColor: '#e74c3c',
  },
  discardButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
