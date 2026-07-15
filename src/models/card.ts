export enum Suit {
  Van = 'van',     // 萬 Vạn
  Van2 = 'van2',   // 文 Văn
  Sach = 'sach',   // 索 Sách
}

export enum Rank {
  Nhi = 2,    // 二 Nhị
  Tam = 3,    // 三 Tam
  Tu = 4,     // 四 Tứ
  Ngu = 5,    // 五 Ngũ
  Luc = 6,    // 六 Lục
  That = 7,   // 七 Thất
  Bat = 8,    // 八 Bát
  Cuu = 9,    // 九 Cửu
  Chi = 10,   // 支 Chi Chi
}

export interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly id: string;
}

// Card name in Vietnamese
const RANK_NAMES: Record<Rank, string> = {
  [Rank.Nhi]: 'Nhị',
  [Rank.Tam]: 'Tam',
  [Rank.Tu]: 'Tứ',
  [Rank.Ngu]: 'Ngũ',
  [Rank.Luc]: 'Lục',
  [Rank.That]: 'Thất',
  [Rank.Bat]: 'Bát',
  [Rank.Cuu]: 'Cửu',
  [Rank.Chi]: 'Chi',
};

const SUIT_NAMES: Record<Suit, string> = {
  [Suit.Van]: 'Vạn',
  [Suit.Van2]: 'Văn',
  [Suit.Sach]: 'Sách',
};

// Chinese characters for card display
export const RANK_CHARS: Record<Rank, string> = {
  [Rank.Nhi]: '二',
  [Rank.Tam]: '三',
  [Rank.Tu]: '四',
  [Rank.Ngu]: '五',
  [Rank.Luc]: '六',
  [Rank.That]: '七',
  [Rank.Bat]: '八',
  [Rank.Cuu]: '九',
  [Rank.Chi]: '支',
};

export const SUIT_CHARS: Record<Suit, string> = {
  [Suit.Van]: '萬',
  [Suit.Van2]: '文',
  [Suit.Sach]: '索',
};

// Chi Chi is red, all others are black
export function isRedCard(card: Card): boolean {
  return card.rank === Rank.Chi ||
    card.rank === Rank.Cuu ||
    card.rank === Rank.Bat ||
    card.rank === Rank.That;
}

// Only specific red cards count for "8 Đỏ" scoring
export function isRedScoreCard(card: Card): boolean {
  return card.rank === Rank.Chi ||
    (card.rank === Rank.Cuu && card.suit === Suit.Van) ||
    (card.rank === Rank.That && card.suit === Suit.Van2);
}

// Chi Chi has no suit (only one Chi card type)
export function isChiChi(card: Card): boolean {
  return card.rank === Rank.Chi;
}

export function cardName(card: Card): string {
  return `${RANK_NAMES[card.rank]} ${SUIT_NAMES[card.suit]}`;
}

export function createCard(suit: Suit, rank: Rank): Card {
  return { suit, rank, id: `${rank}_${suit}` };
}

// All possible card types (25 unique: 8 ranks × 3 suits + 1 Chi)
export function getAllCardTypes(): Card[] {
  const cards: Card[] = [];
  const regularRanks = [
    Rank.Nhi, Rank.Tam, Rank.Tu, Rank.Ngu,
    Rank.Luc, Rank.That, Rank.Bat, Rank.Cuu,
  ];
  const suits = [Suit.Van, Suit.Van2, Suit.Sach];

  for (const rank of regularRanks) {
    for (const suit of suits) {
      cards.push(createCard(suit, rank));
    }
  }

  // Chi Chi (only 4 copies, no suit distinction)
  cards.push(createCard(Suit.Van, Rank.Chi));

  return cards;
}
