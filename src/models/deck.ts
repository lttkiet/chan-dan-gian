import { Card, Suit, Rank, createCard, getAllCardTypes } from './card';

const COPIES_PER_CARD = 4;

export interface Deck {
  readonly cards: Card[];
  readonly drawPile: Card[];
  readonly discardPile: Card[];
}

export function createDeck(): Deck {
  const cards: Card[] = [];
  const types = getAllCardTypes();

  for (const cardType of types) {
    for (let i = 0; i < COPIES_PER_CARD; i++) {
      cards.push({
        ...cardType,
        id: `${cardType.rank}_${cardType.suit}_${i}`,
      });
    }
  }

  return {
    cards,
    drawPile: [...cards],
    discardPile: [],
  };
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Deck, seed?: number): Deck {
  const drawPile = [...deck.drawPile];

  let rng = seed !== undefined ? createSeededRandom(seed) : Math.random;

  for (let i = drawPile.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
  }

  return { ...deck, drawPile };
}

export function drawCard(deck: Deck): { card: Card; deck: Deck } {
  if (deck.drawPile.length === 0) {
    throw new Error('Nọc is empty - no cards left to draw');
  }

  const [card, ...remaining] = deck.drawPile;
  return {
    card,
    deck: { ...deck, drawPile: remaining },
  };
}

export function discardCard(deck: Deck, card: Card): Deck {
  return {
    ...deck,
    discardPile: [...deck.discardPile, card],
  };
}

export function topDiscard(deck: Deck): Card | null {
  if (deck.discardPile.length === 0) return null;
  return deck.discardPile[deck.discardPile.length - 1];
}

export function drawPileCount(deck: Deck): number {
  return deck.drawPile.length;
}

// Simple seeded PRNG (mulberry32)
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
