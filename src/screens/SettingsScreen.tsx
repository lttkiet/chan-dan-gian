import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameConfig, DEFAULT_CONFIG, Region, ChiChiMode } from '../models/game_config';
import { useTranslation, Language } from '../i18n';

interface SettingsScreenProps {
  config: GameConfig;
  onSave: (config: GameConfig) => void;
  onBack: () => void;
}

export default function SettingsScreen({ config, onSave, onBack }: SettingsScreenProps) {
  const { t, language, setLanguage } = useTranslation();
  const [localConfig, setLocalConfig] = useState<GameConfig>({ ...config });

  const updateConfig = (partial: Partial<GameConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...partial }));
  };

  const REGION_LABELS: Record<Region, string> = {
    [Region.Northern]: t.regionNorth,
    [Region.Southern]: t.regionSouth,
    [Region.Central]: t.regionCentral,
  };

  const CHICHI_LABELS: Record<ChiChiMode, string> = {
    [ChiChiMode.Wild]: t.chiChiWild,
    [ChiChiMode.BonusOnly]: t.chiChiBonus,
    [ChiChiMode.Limited]: t.chiChiLimited,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.settingsTitle}</Text>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language / Ngôn ngữ</Text>
        <View style={styles.optionRow}>
          {(['vi', 'en'] as Language[]).map(lang => (
            <TouchableOpacity
              key={lang}
              style={[styles.optionButton, language === lang && styles.optionActive]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[styles.optionText, language === lang && styles.optionTextActive]}>
                {lang === 'vi' ? 'Tiếng Việt' : 'English'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Region */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sectionRegion}</Text>
        <View style={styles.optionRow}>
          {Object.values(Region).map(region => (
            <TouchableOpacity
              key={region}
              style={[styles.optionButton, localConfig.region === region && styles.optionActive]}
              onPress={() => updateConfig({ region })}
            >
              <Text style={[styles.optionText, localConfig.region === region && styles.optionTextActive]}>
                {REGION_LABELS[region]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chi Chi Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sectionChiChi}</Text>
        <View style={styles.optionRow}>
          {Object.values(ChiChiMode).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.optionButton, localConfig.chiChiMode === mode && styles.optionActive]}
              onPress={() => updateConfig({ chiChiMode: mode })}
            >
              <Text style={[styles.optionText, localConfig.chiChiMode === mode && styles.optionTextActive]}>
                {CHICHI_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ga */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sectionGa}</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, localConfig.gaEnabled && styles.optionActive]}
            onPress={() => updateConfig({ gaEnabled: true })}
          >
            <Text style={[styles.optionText, localConfig.gaEnabled && styles.optionTextActive]}>
              {t.gaOn}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, !localConfig.gaEnabled && styles.optionActive]}
            onPress={() => updateConfig({ gaEnabled: false })}
          >
            <Text style={[styles.optionText, !localConfig.gaEnabled && styles.optionTextActive]}>
              {t.gaOff}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Min Cuoc Points (Ù 4-11) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sectionU411}</Text>
        <Text style={styles.sectionHint}>{t.sectionU411Hint}</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, localConfig.minCuocPoints === 0 && styles.optionActive]}
            onPress={() => updateConfig({ minCuocPoints: 0 })}
          >
            <Text style={[styles.optionText, localConfig.minCuocPoints === 0 && styles.optionTextActive]}>
              {t.u411Off}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, localConfig.minCuocPoints === 4 && styles.optionActive]}
            onPress={() => updateConfig({ minCuocPoints: 4 })}
          >
            <Text style={[styles.optionText, localConfig.minCuocPoints === 4 && styles.optionTextActive]}>
              {t.u411On}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animation Speed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sectionSpeed}</Text>
        <View style={styles.optionRow}>
          {(['slow', 'normal', 'fast'] as const).map(speed => (
            <TouchableOpacity
              key={speed}
              style={[styles.optionButton, localConfig.animationSpeed === speed && styles.optionActive]}
              onPress={() => updateConfig({ animationSpeed: speed })}
            >
              <Text style={[styles.optionText, localConfig.animationSpeed === speed && styles.optionTextActive]}>
                {speed === 'slow' ? t.speedSlow : speed === 'normal' ? t.speedNormal : t.speedFast}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>{t.btnBack}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => onSave(localConfig)}>
          <Text style={styles.saveButtonText}>{t.btnSave}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ecf0f1',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34495e',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  optionActive: {
    borderColor: '#f1c40f',
    backgroundColor: 'rgba(241,196,15,0.2)',
  },
  optionText: {
    color: '#95a5a6',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#f1c40f',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34495e',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ecf0f1',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
