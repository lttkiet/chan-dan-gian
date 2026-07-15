import { Card, Rank, Suit, isChiChi } from './card';

// Meld types in Chắn
export enum MeldType {
  Chan = 'chan',       // Chắn: 2 identical cards
  Ca = 'ca',           // Cạ: 2 cards same rank, different suit
  BaDau = 'ba_dau',   // Ba Đầu: 3 cards same rank, different suits
  QuanLe = 'quan_le', // Què: unmatched single card
}

export interface ChanMeld {
  readonly type: MeldType.Chan;
  readonly cards: [Card, Card]; // exactly 2 identical cards
}

export interface CaMeld {
  readonly type: MeldType.Ca;
  readonly cards: [Card, Card]; // same rank, different suit
}

export interface BaDauMeld {
  readonly type: MeldType.BaDau;
  readonly cards: [Card, Card, Card]; // same rank, 3 different suits
}

export interface QuanLe {
  readonly type: MeldType.QuanLe;
  readonly card: Card; // single unmatched card
}

export type Meld = ChanMeld | CaMeld | BaDauMeld;

export type MeldOrLe = Meld | QuanLe;

// Create a Chắn meld from two identical cards
export function createChan(c1: Card, c2: Card): ChanMeld {
  if (c1.rank !== c2.rank || c1.suit !== c2.suit) {
    throw new Error(`Cannot form Chắn: cards must be identical`);
  }
  return { type: MeldType.Chan, cards: [c1, c2] };
}

// Create a Cạ meld from two same-rank different-suit cards
export function createCa(c1: Card, c2: Card): CaMeld {
  if (c1.rank !== c2.rank) {
    throw new Error(`Cannot form Cạ: cards must have same rank`);
  }
  if (c1.suit === c2.suit) {
    throw new Error(`Cannot form Cạ: cards must have different suits (use Chắn instead)`);
  }
  return { type: MeldType.Ca, cards: [c1, c2] };
}

// Create a Ba Đầu meld from three same-rank different-suit cards
export function createBaDau(c1: Card, c2: Card, c3: Card): BaDauMeld {
  if (c1.rank !== c2.rank || c2.rank !== c3.rank) {
    throw new Error(`Cannot form Ba Đầu: all cards must have same rank`);
  }
  const suits = new Set([c1.suit, c2.suit, c3.suit]);
  if (suits.size !== 3) {
    throw new Error(`Cannot form Ba Đầu: all 3 suits must be different`);
  }
  return { type: MeldType.BaDau, cards: [c1, c2, c3] };
}

export function isChan(meld: MeldOrLe): meld is ChanMeld {
  return meld.type === MeldType.Chan;
}

export function isCa(meld: MeldOrLe): meld is CaMeld {
  return meld.type === MeldType.Ca;
}

export function isBaDau(meld: MeldOrLe): meld is BaDauMeld {
  return meld.type === MeldType.BaDau;
}

export function isQuanLe(meld: MeldOrLe): meld is QuanLe {
  return meld.type === MeldType.QuanLe;
}

// Get all cards in a meld
export function meldCards(meld: MeldOrLe): Card[] {
  if (isQuanLe(meld)) return [meld.card];
  return [...meld.cards];
}

// Count Chăn in a list of melds
export function countChan(melds: MeldOrLe[]): number {
  return melds.filter(isChan).length;
}
