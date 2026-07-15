import { Card, Rank, Suit, isChiChi } from '../models/card';
import { Hand, cardsOfRank } from '../models/hand';
import {
  Meld, MeldType, ChanMeld, CaMeld, BaDauMeld, QuanLe, MeldOrLe,
  createChan, createCa, createBaDau, countChan, isChan, isCa, isBaDau, isQuanLe,
} from '../models/meld';

export interface HandAnalysis {
  readonly chans: ChanMeld[];
  readonly cas: CaMeld[];
  readonly baDaus: BaDauMeld[];
  readonly quanLes: QuanLe[];
  readonly allMelds: MeldOrLe[];
  readonly chanCount: number;
}

// Analyze a hand and extract all melds
export function analyzeHand(hand: Hand): HandAnalysis {
  const cards = [...hand.cards];
  const chans: ChanMeld[] = [];
  const cas: CaMeld[] = [];
  const baDaus: BaDauMeld[] = [];
  const quanLes: QuanLe[] = [];

  const used = new Set<string>();

  // Group cards by rank
  const byRank = new Map<Rank, Card[]>();
  for (const card of cards) {
    if (!byRank.has(card.rank)) byRank.set(card.rank, []);
    byRank.get(card.rank)!.push(card);
  }

  // First pass: find Chăn (identical pairs)
  for (const [, rankCards] of byRank) {
    if (rankCards.length >= 2) {
      // Group by suit within this rank
      const bySuit = new Map<Suit, Card[]>();
      for (const card of rankCards) {
        if (!bySuit.has(card.suit)) bySuit.set(card.suit, []);
        bySuit.get(card.suit)!.push(card);
      }

      for (const [, suitCards] of bySuit) {
        while (suitCards.length >= 2) {
          const c1 = suitCards.pop()!;
          const c2 = suitCards.pop()!;
          chans.push(createChan(c1, c2));
          used.add(c1.id);
          used.add(c2.id);
        }
      }
    }
  }

  // Second pass: find Ba Đầu and Cạ from remaining cards
  const remainingByRank = new Map<Rank, Card[]>();
  for (const card of cards) {
    if (used.has(card.id)) continue;
    if (!remainingByRank.has(card.rank)) remainingByRank.set(card.rank, []);
    remainingByRank.get(card.rank)!.push(card);
  }

  for (const [, rankCards] of remainingByRank) {
    if (rankCards.length >= 3) {
      // Try to form Ba Đầu (all 3 suits present)
      const suits = rankCards.map(c => c.suit);
      const uniqueSuits = new Set(suits);

      if (uniqueSuits.size >= 3) {
        // Pick one card from each suit
        const picked: Card[] = [];
        const seenSuits = new Set<Suit>();
        for (const card of rankCards) {
          if (!seenSuits.has(card.suit) && picked.length < 3) {
            picked.push(card);
            seenSuits.add(card.suit);
          }
        }
        if (picked.length === 3) {
          baDaus.push(createBaDau(picked[0], picked[1], picked[2]));
          for (const card of picked) used.add(card.id);
        }
      }
    }

    if (rankCards.length === 2) {
      const remaining = rankCards.filter(c => !used.has(c.id));
      if (remaining.length === 2) {
        cas.push(createCa(remaining[0], remaining[1]));
        used.add(remaining[0].id);
        used.add(remaining[1].id);
      }
    }
  }

  // Third pass: remaining single cards are Què
  for (const card of cards) {
    if (!used.has(card.id)) {
      quanLes.push({ type: MeldType.QuanLe, card });
    }
  }

  const allMelds: MeldOrLe[] = [...chans, ...cas, ...baDaus, ...quanLes];

  return {
    chans,
    cas,
    baDaus,
    quanLes,
    allMelds,
    chanCount: chans.length,
  };
}

// Check if adding a card to hand would form a Chăn with any existing card
export function wouldFormChan(hand: Hand, card: Card): boolean {
  return hand.cards.some(
    c => c.rank === card.rank && c.suit === card.suit
  );
}

// Check if adding a card to hand would form a Cạ with any existing card
export function wouldFormCa(hand: Hand, card: Card): boolean {
  return hand.cards.some(
    c => c.rank === card.rank && c.suit !== card.suit
  );
}

// Check if player has 3 of a kind and could Chíu the 4th
export function canChiu(hand: Hand, card: Card): boolean {
  const matchingCards = hand.cards.filter(
    c => c.rank === card.rank && c.suit === card.suit
  );
  return matchingCards.length >= 3;
}

// Check if hand has exactly 5 Chăn + 4 Cạ + 1 orphan (Bạch Thủ pattern)
export function isBachThuPattern(analysis: HandAnalysis): boolean {
  return analysis.chanCount === 5 &&
    analysis.cas.length === 4 &&
    analysis.quanLes.length === 1;
}

// Check if hand has ≥6 Chăn (Ù Rộng eligible)
export function isUWideEligible(analysis: HandAnalysis): boolean {
  return analysis.chanCount >= 6;
}
