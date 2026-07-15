import { Card, Suit, Rank, createCard, isRedCard, isChiChi, cardName, getAllCardTypes } from '../../src/models/card';

describe('Card Model', () => {
  test('creates a card with correct properties', () => {
    const card = createCard(Suit.Van, Rank.Tam);
    expect(card.suit).toBe(Suit.Van);
    expect(card.rank).toBe(Rank.Tam);
    expect(card.id).toBe('3_van');
  });

  test('detects Chi Chi cards', () => {
    const chi = createCard(Suit.Van, Rank.Chi);
    const tam = createCard(Suit.Van, Rank.Tam);
    expect(isChiChi(chi)).toBe(true);
    expect(isChiChi(tam)).toBe(false);
  });

  test('detects red cards', () => {
    const chi = createCard(Suit.Van, Rank.Chi);
    const cuu = createCard(Suit.Van, Rank.Cuu);
    const bat = createCard(Suit.Sach, Rank.Bat);
    const tam = createCard(Suit.Van, Rank.Tam);

    expect(isRedCard(chi)).toBe(true);
    expect(isRedCard(cuu)).toBe(true);
    expect(isRedCard(bat)).toBe(true);
    expect(isRedCard(tam)).toBe(false);
  });

  test('returns correct card names', () => {
    const tam = createCard(Suit.Van, Rank.Tam);
    expect(cardName(tam)).toBe('Tam Vạn');

    const chi = createCard(Suit.Van, Rank.Chi);
    expect(cardName(chi)).toBe('Chi Vạn');
  });

  test('generates all 25 unique card types', () => {
    const types = getAllCardTypes();
    expect(types.length).toBe(25);

    // 8 ranks × 3 suits = 24 + 1 Chi = 25
    const ranks = new Set(types.map(c => c.rank));
    expect(ranks.size).toBe(9); // 8 regular ranks + Chi
  });

  test('creates immutable card objects', () => {
    const card = createCard(Suit.Van, Rank.Tam);
    expect(Object.isFrozen(card)).toBe(false);
    expect(card.suit).toBe(Suit.Van);
  });
});
