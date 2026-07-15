import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from '../i18n';

interface HomeScreenProps {
  onPlay: () => void;
  onContinue?: () => void;
  hasSavedGame?: boolean;
  onSettings: () => void;
}

export default function HomeScreen({ onPlay, onContinue, hasSavedGame, onSettings }: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.appName}</Text>
        <Text style={styles.subtitle}>{t.appSubtitle}</Text>
      </View>

      <View style={styles.cardPreview}>
        <View style={styles.card}>
          <Text style={styles.cardChar}>九</Text>
          <Text style={styles.cardSuit}>萬</Text>
        </View>
        <View style={[styles.card, styles.cardOffset]}>
          <Text style={styles.cardChar}>支</Text>
          <Text style={styles.cardSuit}>支</Text>
        </View>
        <View style={[styles.card, styles.cardOffset2]}>
          <Text style={styles.cardChar}>三</Text>
          <Text style={styles.cardSuit}>索</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {hasSavedGame && onContinue && (
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>{t.continueGame}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Text style={styles.playButtonText}>{t.play}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={onSettings}>
          <Text style={styles.menuButtonText}>{t.settingsMenu}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>{t.footerPlayers}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f1c40f',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 20,
    color: '#e67e22',
    fontWeight: '300',
    letterSpacing: 8,
    marginTop: 4,
  },
  cardPreview: {
    flexDirection: 'row',
    marginBottom: 40,
    height: 90,
    alignItems: 'center',
  },
  card: {
    width: 55,
    height: 78,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f1c40f',
    backgroundColor: '#fdf6e3',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -6,
  },
  cardOffset: {
    transform: [{ rotate: '-5deg' }, { translateY: -10 }],
    zIndex: 1,
  },
  cardOffset2: {
    transform: [{ rotate: '5deg' }, { translateY: -5 }],
    zIndex: 2,
  },
  cardChar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  cardSuit: {
    fontSize: 16,
    color: '#2c3e50',
  },
  menu: {
    width: '70%',
    gap: 14,
  },
  continueButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  playButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  menuButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuButtonText: {
    color: '#ecf0f1',
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#7f8c8d',
    fontSize: 12,
  },
});
