import { GameConfig } from '../models/game_config';

const SPEED_DELAYS: Record<GameConfig['animationSpeed'], number> = {
  slow: 1400,
  normal: 800,
  fast: 400,
};

export function getAiDelay(config: GameConfig): number {
  return SPEED_DELAYS[config.animationSpeed];
}
