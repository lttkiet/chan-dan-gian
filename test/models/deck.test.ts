import { createDeck, shuffleDeck, drawCard, discardCard, topDiscard, drawPileCount } from '../../src/models/deck';
import { createCard, Suit, Rank } from '../../src/models/card';

describe('Deck Model', () => {
  test('creates a deck with 100 cards', () => {
    const deck = createDeck();
    expect(deck.drawPile.length).toBe(100);
    expect(deck.discardPile.length).toBe(0);
  });

  test('deck has 4 copies of each card type', () => {
    const deck = createDeck();
    const tamVanCount = deck.drawPile.filter(
      c => c.rank === Rank.Tam && c.suit === Suit.Van
    ).length;
    expect(tamVanCount).toBe(4);
  });

  test('shuffle does not mutate original deck', () => {
    const deck = createDeck();
    const originalOrder = [...deck.drawPile];
    const shuffled = shuffleDeck(deck, 42);
    expect(deck.drawPile).toEqual(originalOrder);
    expect(shuffled.drawPile.length).toBe(100);
  });

  test('shuffle with same seed produces same result', () => {
    const deck = createDeck();
    const s1 = shuffleDeck(deck, 123);
    const s2 = shuffleDeck(deck, 123);
    expect(s1.drawPile.map(c => c.id)).toEqual(s2.drawPile.map(c => c.id));
  });

  test('drawCard removes one card from draw pile', () => {
    const deck = shuffleDeck(createDeck(), 42);
    const { card, deck: newDeck } = drawCard(deck);
    expect(card).toBeDefined();
    expect(card.id).toBeTruthy();
    expect(newDeck.drawPile.length).toBe(99);
  });

  test('drawCard throws when pile is empty', () => {
    const deck: ReturnType<typeof createDeck> = {
      cards: [],
      drawPile: [],
      discardPile: [],
    };
    expect(() => drawCard(deck)).toThrow('Nọc is empty');
  });

  test('discardCard adds to discard pile', () => {
    const deck = createDeck();
    const card = createCard(Suit.Van, Rank.Tam);
    const newDeck = discardCard(deck, card);
    expect(newDeck.discardPile.length).toBe(1);
    expect(topDiscard(newDeck)?.id).toBe(card.id);
  });

  test('topDiscard returns null for empty pile', () => {
    const deck = createDeck();
    expect(topDiscard(deck)).toBeNull();
  });

  test('drawPileCount returns correct count', () => {
    const deck = createDeck();
    expect(drawPileCount(deck)).toBe(100);
    const { deck: d2 } = drawCard(deck);
    expect(drawPileCount(d2)).toBe(99);
  });
});
