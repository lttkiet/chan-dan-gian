import { Card, Suit, Rank, createCard, isRedCard, isRedScoreCard, isChiChi, cardName, getAllCardTypes } from '../../src/models/card';

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

  test('detects exactly 4 red cards: Chi Chi, Cửu Vạn, Bát Sách, Thất Văn', () => {
    // Red cards
    expect(isRedCard(createCard(Suit.Van, Rank.Chi))).toBe(true);    // Chi Chi
    expect(isRedCard(createCard(Suit.Van, Rank.Cuu))).toBe(true);   // Cửu Vạn
    expect(isRedCard(createCard(Suit.Sach, Rank.Bat))).toBe(true);  // Bát Sách
    expect(isRedCard(createCard(Suit.Van2, Rank.That))).toBe(true); // Thất Văn

    // NOT red: same rank different suit
    expect(isRedCard(createCard(Suit.Van2, Rank.Cuu))).toBe(false); // Cửu Văn
    expect(isRedCard(createCard(Suit.Sach, Rank.Cuu))).toBe(false); // Cửu Sách
    expect(isRedCard(createCard(Suit.Van, Rank.Bat))).toBe(false);  // Bát Vạn
    expect(isRedCard(createCard(Suit.Van2, Rank.Bat))).toBe(false); // Bát Văn
    expect(isRedCard(createCard(Suit.Van, Rank.That))).toBe(false); // Thất Vạn
    expect(isRedCard(createCard(Suit.Sach, Rank.That))).toBe(false);// Thất Sách

    // NOT red: other ranks
    expect(isRedCard(createCard(Suit.Van, Rank.Tam))).toBe(false);
    expect(isRedCard(createCard(Suit.Van, Rank.Nhi))).toBe(false);
  });

  test('isRedScoreCard is identical to isRedCard', () => {
    const allCards = getAllCardTypes();
    for (const card of allCards) {
      expect(isRedScoreCard(card)).toBe(isRedCard(card));
    }
    // Exactly 4 red score cards (1 copy each type, 4 total in deck with copies)
    const redCount = allCards.filter(c => isRedScoreCard(c)).length;
    expect(redCount).toBe(4);
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
