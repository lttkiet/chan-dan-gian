export enum Region {
  Northern = 'northern',
  Southern = 'southern',
  Central = 'central',
}

export enum ChiChiMode {
  Wild = 'wild',           // Chi Chi can substitute for any card
  BonusOnly = 'bonus_only', // Chi Chi only counts for scoring
  Limited = 'limited',      // Chi Chi substitutes within suit only
}

export interface GameConfig {
  region: Region;
  chiChiMode: ChiChiMode;
  gaEnabled: boolean;
  minCuocPoints: number; // Ù 4-11 mode: 0 = off, 4 = min 4 points
  animationSpeed: 'slow' | 'normal' | 'fast';
}

export const DEFAULT_CONFIG: GameConfig = {
  region: Region.Northern,
  chiChiMode: ChiChiMode.BonusOnly,
  gaEnabled: true,
  minCuocPoints: 0,
  animationSpeed: 'normal',
};

export const REGION_NAMES: Record<Region, string> = {
  [Region.Northern]: 'Bắc',
  [Region.Southern]: 'Nam',
  [Region.Central]: 'Trung',
};

export const CHICHI_NAMES: Record<ChiChiMode, string> = {
  [ChiChiMode.Wild]: 'Tự do',
  [ChiChiMode.BonusOnly]: 'Chỉ tính điểm',
  [ChiChiMode.Limited]: 'Giới hạn',
};
