import { Card, Rank, Suit, isChiChi } from '../models/card';
import { Hand } from '../models/hand';
import { analyzeHand, HandAnalysis } from './meld_analyzer';
import { MeldType, isChan, isCa, isBaDau, isQuanLe } from '../models/meld';

export enum WinType {
  None = 'none',
  UWide = 'u_rong',       // Ù Rộng: ≥6 Chăn, drawn card matches rank of orphan
  BachThu = 'bach_thu',   // Bạch Thủ: exactly 5 Chăn + 4 Cạ + 1 orphan, must match rank AND suit
  ThienU = 'thien_u',     // Thiên Ù: winning hand at deal (dealer only)
}

export interface WinResult {
  readonly type: WinType;
  readonly valid: boolean;
  readonly drawnCard: Card | null;
  readonly analysis: HandAnalysis;
}

// Check if a hand + drawn card forms a winning combination
export function checkWin(hand: Hand, drawnCard: Card, isDealer: boolean, isFirstDraw: boolean): WinResult {
  const allCards = [...hand.cards, drawnCard];
  const analysis = analyzeHand({ cards: allCards });

  // Check Thiên Ù: dealer's 20 cards form complete hand at deal
  // (hand has 20 cards for dealer, 19 for others)
  if (isDealer && hand.cards.length === 20) {
    const dealerAnalysis = analyzeHand(hand);
    if (isCompleteHand(dealerAnalysis, 20)) {
      return {
        type: WinType.ThienU,
        valid: true,
        drawnCard: null,
        analysis: dealerAnalysis,
      };
    }
  }

  // Bạch Thủ: 19-card hand has exactly 5 Chăn + 1 Ba Dau + 3 Cạ
  // The Ba Dau (3 cards same rank) can be split as Cạ + orphan.
  // The drawn card must match one of those 3 cards exactly (rank + suit).
  const handAnalysis = analyzeHand(hand);
  if (handAnalysis.chanCount === 5 && handAnalysis.baDaus.length === 1 && handAnalysis.cas.length === 3) {
    const baDauCards = handAnalysis.baDaus[0].cards;
    // Check if drawn card matches any of the 3 Ba Dau cards (exact rank + suit)
    for (const bCard of baDauCards) {
      if (bCard.rank === drawnCard.rank && bCard.suit === drawnCard.suit) {
        return { type: WinType.BachThu, valid: true, drawnCard, analysis };
      }
    }
  }

  // Also check: 5 Chăn + 4 Cạ + 1 orphan (when no Ba Dau is formed)
  if (handAnalysis.chanCount === 5 && handAnalysis.cas.length === 4 && handAnalysis.quanLes.length === 1) {
    const orphanCard = handAnalysis.quanLes[0].card;
    if (orphanCard.rank === drawnCard.rank && orphanCard.suit === drawnCard.suit) {
      return { type: WinType.BachThu, valid: true, drawnCard, analysis };
    }
  }

  // Ù Rộng: hand + drawnCard forms complete hand with ≥6 Chăn
  // (0 orphans, all cards in melds)
  if (analysis.chanCount >= 6 && analysis.quanLes.length === 0) {
    const totalMelded = analysis.chans.length * 2 + analysis.cas.length * 2 + analysis.baDaus.length * 3;
    if (totalMelded === allCards.length) {
      return {
        type: WinType.UWide,
        valid: true,
        drawnCard,
        analysis,
      };
    }
  }

  return {
    type: WinType.None,
    valid: false,
    drawnCard,
    analysis,
  };
}

// Check if hand is complete (all cards in melds, no orphans)
function isCompleteHand(analysis: HandAnalysis, totalCards: number): boolean {
  if (analysis.chanCount < 6) return false;
  if (analysis.quanLes.length > 0) return false;

  const meldedCards = analysis.chans.length * 2 +
    analysis.cas.length * 2 +
    analysis.baDaus.length * 3;

  return meldedCards === totalCards;
}

// Check if Chi Chi card matches (for scoring purposes)
export function hasChiChi(hand: Hand, drawnCard: Card): boolean {
  const allCards = [...hand.cards, drawnCard];
  return allCards.filter(c => c.rank === Rank.Chi).length === 4;
}

// Check for Tôm: has Tam Vạn + Tam Sách + Thất Văn
export function hasTom(hand: Hand, drawnCard: Card): boolean {
  const allCards = [...hand.cards, drawnCard];
  const hasTamVan = allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Van);
  const hasTamSach = allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Sach);
  const hasThatVan = allCards.some(c => c.rank === Rank.That && c.suit === Suit.Van2);
  return hasTamVan && hasTamSach && hasThatVan;
}

// Check for Lèo: has Cửu Vạn + Bát Sách + Chi Chi
export function hasLeo(hand: Hand, drawnCard: Card): boolean {
  const allCards = [...hand.cards, drawnCard];
  const hasCuuVan = allCards.some(c => c.rank === Rank.Cuu && c.suit === Suit.Van);
  const hasBatSach = allCards.some(c => c.rank === Rank.Bat && c.suit === Suit.Sach);
  const hasChi = allCards.some(c => c.rank === Rank.Chi);
  return hasCuuVan && hasBatSach && hasChi;
}

// Count how many Tôm in hand (max 4)
export function countTom(hand: Hand, drawnCard: Card): number {
  const allCards = [...hand.cards, drawnCard];
  let count = 0;

  // Each Tôm is a set of 3 specific cards
  const tamVan = allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Van);
  const tamSach = allCards.some(c => c.rank === Rank.Tam && c.suit === Suit.Sach);
  const thatVan = allCards.some(c => c.rank === Rank.That && c.suit === Suit.Van2);

  if (tamVan && tamSach && thatVan) count++;

  return count;
}

// Count how many Lèo in hand (max 4)
export function countLeo(hand: Hand, drawnCard: Card): number {
  const allCards = [...hand.cards, drawnCard];
  let count = 0;

  const cuuVan = allCards.some(c => c.rank === Rank.Cuu && c.suit === Suit.Van);
  const batSach = allCards.some(c => c.rank === Rank.Bat && c.suit === Suit.Sach);
  const chi = allCards.some(c => c.rank === Rank.Chi);

  if (cuuVan && batSach && chi) count++;

  return count;
}
