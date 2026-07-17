import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../models/game_state';
import { GameConfig } from '../models/game_config';

const STORAGE_KEY = 'chan_saved_game';
const SCHEMA_VERSION = 1;

export interface SavedGame {
  gameState: GameState;
  config: GameConfig;
  savedAt: number;
  version?: number;
}

export async function saveGame(state: GameState, config: GameConfig): Promise<void> {
  try {
    const data: SavedGame = {
      gameState: state,
      config,
      savedAt: Date.now(),
      version: SCHEMA_VERSION,
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
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (!data.gameState || typeof data.gameState !== 'object') return null;
    if (!data.config || typeof data.config !== 'object') return null;
    if (!data.gameState.turn || data.gameState.turn.phase !== 'playing') return null;
    if (!Array.isArray(data.gameState.players)) return null;

    // Normalize version: older saves may not have it; treat missing as 0
    const version = typeof data.version === 'number' ? data.version : 0;

    // Version check: if schema is newer than what we can read, discard
    if (version > SCHEMA_VERSION) {
      return null;
    }

    // Normalize consecutivePasses: older saves lack this field, and passTurn()
    // increments it unconditionally, which would produce NaN
    if (data.gameState.turn && typeof data.gameState.turn.consecutivePasses !== 'number') {
      data.gameState.turn.consecutivePasses = 0;
    }

    return { ...data, version } as SavedGame;
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
