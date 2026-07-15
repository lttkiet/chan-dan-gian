import { Card, Rank, Suit, isChiChi, isRedCard } from './card';

export interface Hand {
  readonly cards: Card[];
}

export function createHand(): Hand {
  return { cards: [] };
}

export function addCard(hand: Hand, card: Card): Hand {
  return { cards: [...hand.cards, card] };
}

export function removeCard(hand: Hand, cardId: string): Hand {
  return {
    cards: hand.cards.filter(c => c.id !== cardId),
  };
}

export function hasCard(hand: Hand, cardId: string): boolean {
  return hand.cards.some(c => c.id === cardId);
}

export function findCard(hand: Hand, cardId: string): Card | undefined {
  return hand.cards.find(c => c.id === cardId);
}

export function sortHand(hand: Hand): Hand {
  const suitOrder: Record<Suit, number> = {
    [Suit.Van]: 0,
    [Suit.Van2]: 1,
    [Suit.Sach]: 2,
  };

  const sorted = [...hand.cards].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return suitOrder[a.suit] - suitOrder[b.suit];
  });

  return { cards: sorted };
}

export function handSize(hand: Hand): number {
  return hand.cards.length;
}

// Count how many cards of a specific rank the player holds
export function countByRank(hand: Hand, rank: Rank): number {
  return hand.cards.filter(c => c.rank === rank).length;
}

// Count how many cards of a specific suit the player holds
export function countBySuit(hand: Hand, suit: Suit): number {
  return hand.cards.filter(c => c.suit === suit).length;
}

// Get all cards of a specific rank
export function cardsOfRank(hand: Hand, rank: Rank): Card[] {
  return hand.cards.filter(c => c.rank === rank);
}

// Get all cards of a specific suit
export function cardsOfSuit(hand: Hand, suit: Suit): Card[] {
  return hand.cards.filter(c => c.suit === suit);
}

// Count red score cards (for "8 Đỏ" cước)
export function countRedScoreCards(hand: Hand): number {
  return hand.cards.filter(c => isRedCard(c)).length;
}
