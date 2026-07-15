import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { GameConfig, DEFAULT_CONFIG } from './src/models/game_config';
import { I18nProvider } from './src/i18n';

type Screen = 'home' | 'game' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  return (
    <I18nProvider>
      {(() => {
        switch (screen) {
          case 'settings':
            return (
              <>
                <SettingsScreen
                  config={config}
                  onSave={(newConfig) => {
                    setConfig(newConfig);
                    setScreen('home');
                  }}
                  onBack={() => setScreen('home')}
                />
                <StatusBar style="light" />
              </>
            );

          case 'game':
            return (
              <>
                <GameScreen
                  config={config}
                  onOpenSettings={() => setScreen('settings')}
                  onBackToHome={() => setScreen('home')}
                />
                <StatusBar style="light" />
              </>
            );

          default:
            return (
              <>
                <HomeScreen
                  onPlay={() => setScreen('game')}
                  onSettings={() => setScreen('settings')}
                />
                <StatusBar style="light" />
              </>
            );
        }
      })()}
    </I18nProvider>
  );
}
