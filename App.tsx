import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { GameConfig, DEFAULT_CONFIG } from './src/models/game_config';
import { I18nProvider } from './src/i18n';
import { loadGame, clearGame, SavedGame } from './src/utils/storage';

type Screen = 'home' | 'game' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    checkSavedGame();
  }, []);

  const checkSavedGame = async () => {
    const sg = await loadGame();
    setSavedGame(sg);
    setHasSaved(!!sg);
  };

  const handlePlay = () => {
    setSavedGame(null);
    setHasSaved(false);
    setScreen('game');
  };

  const handleContinue = () => {
    setScreen('game');
  };

  const handleBackToHome = async () => {
    await checkSavedGame();
    setScreen('home');
  };

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
                  savedGame={savedGame}
                  onOpenSettings={() => setScreen('settings')}
                  onBackToHome={handleBackToHome}
                />
                <StatusBar style="light" />
              </>
            );

          default:
            return (
              <>
                <HomeScreen
                  onPlay={handlePlay}
                  onContinue={handleContinue}
                  hasSavedGame={hasSaved}
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
