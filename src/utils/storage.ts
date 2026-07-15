import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../models/game_state';
import { GameConfig } from '../models/game_config';

const STORAGE_KEY = 'chan_saved_game';

export interface SavedGame {
  gameState: GameState;
  config: GameConfig;
  savedAt: number;
}

export async function saveGame(state: GameState, config: GameConfig): Promise<void> {
  try {
    const data: SavedGame = {
      gameState: state,
      config,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail — persistence is best-effort
  }
}

export async function loadGame(): Promise<SavedGame | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedGame;
    if (!data.gameState || !data.config) return null;
    if (data.gameState.turn.phase !== 'playing') return null;
    return data;
  } catch {
    return null;
  }
}

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

export async function hasSavedGame(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!data.gameState && data.gameState.turn.phase === 'playing';
  } catch {
    return false;
  }
}
