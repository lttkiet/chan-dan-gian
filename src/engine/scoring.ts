import { Card, Rank, Suit, isRedCard, isRedScoreCard, isChiChi } from '../models/card';
import { Hand } from '../models/hand';
import { WinType } from './win_checker';
import { analyzeHand } from './meld_analyzer';

// Cước types with their point values
export enum CuocType {
  Xuong = 'xuong',               // Ù Xuông: basic win, no special
  UThong = 'u_thong',            // Ù Thông: win 2 consecutive games
  Chi = 'chi',                   // Chì: win on your turn
  ThienU = 'thien_u',            // Thiên Ù: win at deal
  DiaU = 'dia_u',                // Địa Ù: win on first Nọc draw
  Tom = 'tom',                   // Tôm: Tam Vạn + Tam Sách + Thất Văn
  Leo = 'leo',                   // Lèo: Cửu Vạn + Bát Sách + Chi Chi
  BachThu = 'bach_thu',          // Bạch Thủ: win with exactly 6 Chăn
  BachThuChi = 'bach_thu_chi',   // Bạch Thủ Chi: Bạch Thủ waiting on Chi Chi
  ThienKhai = 'thien_khai',      // Thiên Khai: 4 identical cards at deal
  Chiu = 'chiu',                 // Chíu: 4 identical via chiu
  AnBon = 'an_bon',              // Ăn Bòn: meld 2 Chăn from same rank
  BachDinh = 'bach_dinh',        // Bạch Định: all black cards
  DoRed = 'do_red',             // 8 Đỏ: 8 red cards
  KinhTuChi = 'kinh_tu_chi',    // Kính Tứ Chi: 4 Chi Chi cards
  ThapThanh = 'thap_thanh',     // Thập Thành: 10 Chăn
}

// Cước definition: points and dich
export interface CuocDef {
  readonly type: CuocType;
  readonly name: string;
  readonly nameVi: string;
  readonly points: number;
  readonly dich: number;
  readonly description: string;
}

// Complete Cước table
export const CUOC_TABLE: Record<CuocType, CuocDef> = {
  [CuocType.Xuong]: {
    type: CuocType.Xuong,
    name: 'Xuông',
    nameVi: 'Ù Xuông',
    points: 0,
    dich: 1,
    description: 'Basic Ù with no special combinations',
  },
  [CuocType.UThong]: {
    type: CuocType.UThong,
    name: 'Thông',
    nameVi: 'Ù Thông',
    points: 3,
    dich: 1,
    description: 'Win 2 consecutive games',
  },
  [CuocType.Chi]: {
    type: CuocType.Chi,
    name: 'Chì',
    nameVi: 'Chì',
    points: 3,
    dich: 1,
    description: 'Win on your turn',
  },
  [CuocType.ThienU]: {
    type: CuocType.ThienU,
    name: 'Thiên Ù',
    nameVi: 'Thiên Ù',
    points: 3,
    dich: 1,
    description: 'Win immediately after dealing',
  },
  [CuocType.DiaU]: {
    type: CuocType.DiaU,
    name: 'Địa Ù',
    nameVi: 'Địa Ù',
    points: 2,
    dich: 1,
    description: 'Win on first Nọc draw',
  },
  [CuocType.Tom]: {
    type: CuocType.Tom,
    name: 'Tôm',
    nameVi: 'Tôm',
    points: 4,
    dich: 1,
    description: 'Has Tam Vạn + Tam Sách + Thất Văn',
  },
  [CuocType.Leo]: {
    type: CuocType.Leo,
    name: 'Lèo',
    nameVi: 'Lèo',
    points: 5,
    dich: 2,
    description: 'Has Cửu Vạn + Bát Sách + Chi Chi',
  },
  [CuocType.BachThu]: {
    type: CuocType.BachThu,
    name: 'Bạch Thủ',
    nameVi: 'Bạch Thủ',
    points: 4,
    dich: 1,
    description: 'Win with exactly 6 Chăn',
  },
  [CuocType.BachThuChi]: {
    type: CuocType.BachThuChi,
    name: 'Bạch Thủ Chi',
    nameVi: 'Bạch Thủ Chi',
    points: 4,
    dich: 3,
    description: 'Bạch Thủ waiting on Chi Chi',
  },
  [CuocType.ThienKhai]: {
    type: CuocType.ThienKhai,
    name: 'Thiên Khai',
    nameVi: 'Thiên Khai',
    points: 5,
    dich: 2,
    description: '4 identical cards at deal',
  },
  [CuocType.Chiu]: {
    type: CuocType.Chiu,
    name: 'Chíu',
    nameVi: 'Chíu',
    points: 5,
    dich: 2,
    description: '4 identical via chiu action',
  },
  [CuocType.AnBon]: {
    type: CuocType.AnBon,
    name: 'Ăn Bòn',
    nameVi: 'Ăn Bòn',
    points: 5,
    dich: 2,
    description: 'Meld 2 Chăn from same rank',
  },
  [CuocType.BachDinh]: {
    type: CuocType.BachDinh,
    name: 'Bạch Định',
    nameVi: 'Bạch Định',
    points: 7,
    dich: 4,
    description: 'All cards are black',
  },
  [CuocType.DoRed]: {
    type: CuocType.DoRed,
    name: '8 Đỏ',
    nameVi: 'Tám Đỏ',
    points: 8,
    dich: 5,
    description: '8 red cards in hand',
  },
  [CuocType.KinhTuChi]: {
    type: CuocType.KinhTuChi,
    name: 'Kính Tứ Chi',
    nameVi: 'Kính Tứ Chi',
    points: 12,
    dich: 9,
    description: '4 Chi Chi cards',
  },
  [CuocType.ThapThanh]: {
    type: CuocType.ThapThanh,
    name: 'Thập Thành',
    nameVi: 'Thập Thành',
    points: 12,
    dich: 9,
    description: '10 Chăn (all melds are Chăn)',
  },
};

export interface CuocResult {
  readonly cuocs: CuocType[];
  readonly totalPoints: number;
  readonly totalDich: number;
  readonly gaCount: number;  // Gà bonus count
}

// Calculate all applicable Cước for a winning hand
export function calculateCuoc(
  hand: Hand,
  drawnCard: Card,
  winType: WinType,
  options: {
    isYourTurn?: boolean;
    consecutiveWins?: number;
    isFirstDraw?: boolean;
    hasChiu?: boolean;
    chiuCards?: Card[];
  } = {}
): CuocResult {
  const allCards = [...hand.cards, drawnCard];
  const analysis = analyzeHand({ cards: allCards });
  const cuocs: CuocType[] = [];

  // Xuông - always possible
  cuocs.push(CuocType.Xuong);

  // Thiên Ù
  if (winType === WinType.ThienU) {
    cuocs.push(CuocType.ThienU);
  }

  // Địa Ù
  if (options.isFirstDraw) {
    cuocs.push(CuocType.DiaU);
  }

  // Chì
  if (options.isYourTurn) {
    cuocs.push(CuocType.Chi);
  }

  // Ù Thông
  if (options.consecutiveWins && options.consecutiveWins >= 2) {
    cuocs.push(CuocType.UThong);
  }

  // Bạch Thủ
  if (winType === WinType.BachThu) {
    if (drawnCard.rank === Rank.Chi) {
      cuocs.push(CuocType.BachThuChi);
    } else {
      cuocs.push(CuocType.BachThu);
    }
  }

  // Tôm
  if (hasTom(allCards)) {
    cuocs.push(CuocType.Tom);
  }

  // Lèo
  if (hasLeo(allCards)) {
    cuocs.push(CuocType.Leo);
  }

  // Thiên Khai (4 identical at deal)
  if (options.chiuCards && options.chiuCards.length > 0) {
    for (const chiuCard of options.chiuCards) {
      const count = allCards.filter(c => c.rank === chiuCard.rank && c.suit === chiuCard.suit).length;
      if (count === 4) {
        cuocs.push(CuocType.ThienKhai);
        break;
      }
    }
  }

  // Chíu
  if (options.hasChiu) {
    cuocs.push(CuocType.Chiu);
  }

  // Bạch Định (all black)
  if (allCards.every(c => !isRedCard(c))) {
    cuocs.push(CuocType.BachDinh);
  }

  // 8 Đỏ
  const redCount = allCards.filter(c => isRedCard(c)).length;
  if (redCount >= 8) {
    cuocs.push(CuocType.DoRed);
  }

  // Kính Tứ Chi (4 Chi Chi)
  const chiCount = allCards.filter(c => c.rank === Rank.Chi).length;
  if (chiCount === 4) {
    cuocs.push(CuocType.KinhTuChi);
  }

  // Thập Thành (10 Chăn)
  if (analysis.chanCount >= 10) {
    cuocs.push(CuocType.ThapThanh);
  }

  // Calculate total points
  // For Thập Thành: sum of all point values
  // Otherwise: highest point + sum of dich of remaining
  let totalPoints = 0;
  let totalDich = 0;
  let gaCount = 0;

  if (cuocs.includes(CuocType.ThapThanh)) {
    // Thập Thành: sum all point values
    for (const cuoc of cuocs) {
      totalPoints += CUOC_TABLE[cuoc].points;
      totalDich += CUOC_TABLE[cuoc].dich;
    }
  } else if (cuocs.includes(CuocType.Xuong) && cuocs.length === 1) {
    // Ù Xuông: total dich + 2
    totalPoints = 0;
    totalDich = 1 + 2; // Xuông dich + 2
  } else if (cuocs.every(c =>
    CUOC_TABLE[c].points <= 3 && (
      c === CuocType.Xuong ||
      c === CuocType.UThong ||
      c === CuocType.Chi ||
      c === CuocType.ThienU
    )
  )) {
    // Only Xuông, Thông, Chì, or Thiên Ù: total dich + 2
    totalPoints = 0;
    totalDich = cuocs.reduce((sum, c) => sum + CUOC_TABLE[c].dich, 0) + 2;
  } else {
    // General case: highest point + sum of dich of remaining
    const sortedCuocs = [...cuocs].sort(
      (a, b) => CUOC_TABLE[b].points - CUOC_TABLE[a].points
    );
    totalPoints = CUOC_TABLE[sortedCuocs[0]].points;
    totalDich = sortedCuocs.slice(1).reduce(
      (sum, c) => sum + CUOC_TABLE[c].dich, 0
    );
  }

  // Gà bonus
  if (cuocs.includes(CuocType.BachDinh)) gaCount++;
  if (cuocs.includes(CuocType.DoRed)) gaCount++;
  if (cuocs.includes(CuocType.KinhTuChi)) gaCount++;
  if (cuocs.includes(CuocType.ThapThanh)) gaCount++;
  if (cuocs.includes(CuocType.BachThu) && cuocs.includes(CuocType.Chi)) gaCount++;

  return { cuocs, totalPoints, totalDich, gaCount };
}

export function hasTom(allCards: Card[]): boolean {
  return allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Van) &&
    allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Sach) &&
    allCards.some(c => c.rank === Rank.That && c.suit === Suit.Van2);
}

export function hasLeo(allCards: Card[]): boolean {
  return allCards.some(c => c.rank === Rank.Cuu && c.suit === Suit.Van) &&
    allCards.some(c => c.rank === Rank.Bat && c.suit === Suit.Sach) &&
    allCards.some(c => c.rank === Rank.Chi);
}
