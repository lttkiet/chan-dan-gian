import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CuocResult, cuocNameI18n } from '../engine/scoring';
import { AppStrings } from '../i18n/strings';

export interface GameResult {
  winner: string;
  isHumanWin: boolean;
  winType: string;
  cuocResult?: CuocResult;
}

interface WinModalProps {
  result: GameResult | null;
  visible: boolean;
  t: AppStrings;
  onPlayAgain: () => void;
  onBackToHome?: () => void;
}

export function WinModal({ result, visible, t, onPlayAgain, onBackToHome }: WinModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, result?.isHumanWin && styles.winText]}>
            {result?.isHumanWin ? t.winTitle : t.loseTitle}
          </Text>
          <Text style={styles.modalSubtitle}>
            {result?.winner} {t.winSubtitle}{result?.winType}
          </Text>
          {result?.cuocResult && (
            <View style={styles.cuocInfo}>
              <Text style={styles.cuocText}>
                {t.scoreLabel}{result.cuocResult.totalPoints} | {t.dichLabel}{result.cuocResult.totalDich}
                {result.cuocResult.gaCount > 0 ? ` | ${t.gaLabel}${result.cuocResult.gaCount}` : ''}
              </Text>
              <Text style={styles.cuocList}>
                {result.cuocResult.cuocs.map(c => cuocNameI18n(c, t)).join(', ')}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.modalButton} onPress={onPlayAgain}>
            <Text style={styles.modalButtonText}>{t.btnPlayAgain}</Text>
          </TouchableOpacity>
          {onBackToHome && (
            <TouchableOpacity style={[styles.modalButton, styles.modalHomeButton]} onPress={onBackToHome}>
              <Text style={styles.modalButtonText}>{t.btnBackToHome}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  winText: {
    color: '#f1c40f',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#95a5a6',
  },
  cuocInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  cuocText: {
    color: '#ecf0f1',
    fontSize: 14,
  },
  cuocList: {
    color: '#f39c12',
    fontSize: 12,
    marginTop: 4,
  },
  modalButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  modalHomeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#95a5a6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
