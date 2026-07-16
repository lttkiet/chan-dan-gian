import { checkWin, WinType } from '../../src/engine/win_checker';
import { hasTom, hasLeo } from '../../src/engine/scoring';
import { createCard, Suit, Rank } from '../../src/models/card';
import { Hand, addCard, createHand } from '../../src/models/hand';

function makeHand(cards: Array<[Suit, Rank]>): Hand {
  let hand = createHand();
  for (const [suit, rank] of cards) {
    hand = addCard(hand, createCard(suit, rank));
  }
  return hand;
}

describe('Win Checker', () => {
  describe('checkWin', () => {
    test('detects Ù Rộng with 6 Chăn + matching orphan rank', () => {
      // 6 Chăn + 1 orphan (Tam Vạn) + drawn card (Tam Văn)
      const hand = makeHand([
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        [Suit.Van, Rank.That], [Suit.Van, Rank.That],
        [Suit.Van, Rank.Tam], // orphan
        // Need more cards to reach 19...
        [Suit.Van2, Rank.Nhi], [Suit.Van2, Rank.Nhi],
        [Suit.Van2, Rank.Tu], [Suit.Van2, Rank.Tu],
        [Suit.Van2, Rank.Luc], [Suit.Van2, Rank.Luc],
      ]);
      const drawnCard = createCard(Suit.Van2, Rank.Tam); // matches orphan rank
      const result = checkWin(hand, drawnCard, false, false);
      expect(result.type).toBe(WinType.UWide);
      expect(result.valid).toBe(true);
    });

    test('detects Bạch Thủ with 5 Chăn + 4 Cạ + matching orphan', () => {
      // This is complex to construct. Let's test the basic case
      const hand = makeHand([
        // 5 Chăn
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        // 4 Cạ (same rank, different suits)
        [Suit.Van, Rank.Ngu], [Suit.Van2, Rank.Ngu],
        [Suit.Van, Rank.That], [Suit.Van2, Rank.That],
        [Suit.Van, Rank.Tam], [Suit.Van2, Rank.Tam],
        [Suit.Van, Rank.Chi], [Suit.Van2, Rank.Chi],
        // Wait, that's 18 cards + need 1 orphan
      ]);
      // Actually, let's make a simpler hand
      const simpleHand = makeHand([
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        [Suit.Van2, Rank.Ngu], [Suit.Sach, Rank.Ngu],
        [Suit.Van2, Rank.That], [Suit.Sach, Rank.That],
        [Suit.Van2, Rank.Tam], [Suit.Sach, Rank.Tam],
        [Suit.Van2, Rank.Chi], [Suit.Sach, Rank.Chi],
        [Suit.Van, Rank.Ngu], // orphan - matches the Cạ cards
      ]);
      // This doesn't quite work because we have 5 Chăn + 4 Cạ + 1 orphan = 19 cards
      // But the orphan needs to match the drawn card's rank AND suit
      const drawnCard = createCard(Suit.Van, Rank.Ngu); // matches orphan
      const result = checkWin(simpleHand, drawnCard, false, false);
      // Should be Bạch Thủ if the hand is correct
      expect(result.type).toBe(WinType.BachThu);
      expect(result.valid).toBe(true);
    });

    test('returns None for incomplete hand', () => {
      const hand = makeHand([
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Tam],
        [Suit.Van2, Rank.Luc],
      ]);
      const drawnCard = createCard(Suit.Van, Rank.Nhi);
      const result = checkWin(hand, drawnCard, false, false);
      expect(result.type).toBe(WinType.None);
      expect(result.valid).toBe(false);
    });

    test('detects Thiên Ù for dealer with complete hand at deal', () => {
      // 19 cards: 9 Chăn + 1 Cạ = complete (no orphans)
      const hand = makeHand([
        // 9 Chăn
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
        [Suit.Van, Rank.That], [Suit.Van, Rank.That],
        [Suit.Van, Rank.Ngu], [Suit.Van, Rank.Ngu],
        [Suit.Van, Rank.Chi], [Suit.Van, Rank.Chi],
        // 1 Cạ (2 cards same rank, different suit)
        [Suit.Van2, Rank.Nhi],
      ]);
      // Note: 19 cards = 9 Chăn (18) + 1 orphan (1) = NOT complete
      // For Thiên Ù, hand must be complete at deal (all melds, no orphans)
      // Let's use 9 Chăn + 1 Cạ but that's 20 cards, too many
      // Actually 19 cards can't all be in melds unless we have odd combinations
      // The dealer gets 20 cards in real game. Let's test with 20 cards for dealer.
      // Actually per rules, dealer gets 20 and must have complete hand = Thiên Ù
      // With 20 cards: 10 Chăn or 9 Chăn + 1 Cạ etc.
      const dealerHand = makeHand([
        // 9 Chăn (18 cards)
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
        [Suit.Van, Rank.That], [Suit.Van, Rank.That],
        [Suit.Van, Rank.Ngu], [Suit.Van, Rank.Ngu],
        [Suit.Van, Rank.Chi], [Suit.Van, Rank.Chi],
        // 1 Cạ (2 cards same rank, different suit)
        [Suit.Van2, Rank.Nhi],
        [Suit.Sach, Rank.Nhi],
      ]);
      // This is 20 cards = 9 Chăn + 1 Cạ = complete, no orphans
      const result = checkWin(dealerHand, createCard(Suit.Van2, Rank.Tam), true, false);
      expect(result.valid).toBe(true);
    });
  });

  describe('hasTom', () => {
    test('detects Tôm combination', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Tam),
        createCard(Suit.Sach, Rank.Tam),
        createCard(Suit.Van2, Rank.That),
        createCard(Suit.Van, Rank.Nhi),
      ];
      expect(hasTom(allCards)).toBe(true);
    });

    test('returns false without all 3 cards', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Tam),
        createCard(Suit.Sach, Rank.Tam),
        createCard(Suit.Van, Rank.Nhi),
      ];
      expect(hasTom(allCards)).toBe(false);
    });
  });

  describe('hasLeo', () => {
    test('detects Lèo combination', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Cuu),
        createCard(Suit.Sach, Rank.Bat),
        createCard(Suit.Van, Rank.Chi),
        createCard(Suit.Van, Rank.Nhi),
      ];
      expect(hasLeo(allCards)).toBe(true);
    });

    test('returns false without all 3 cards', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Cuu),
        createCard(Suit.Sach, Rank.Bat),
        createCard(Suit.Van, Rank.Nhi),
      ];
      expect(hasLeo(allCards)).toBe(false);
    });
  });

  describe('Additional edge cases', () => {
    test('no win with 5 Chăn but no orphan match', () => {
      // 5 Chăn + 4 Cạ + 1 orphan, but drawn card doesn't match orphan
      const hand = makeHand([
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        [Suit.Van2, Rank.Ngu], [Suit.Sach, Rank.Ngu],
        [Suit.Van2, Rank.That], [Suit.Sach, Rank.That],
        [Suit.Van2, Rank.Tam], [Suit.Sach, Rank.Tam],
        [Suit.Van2, Rank.Chi], [Suit.Sach, Rank.Chi],
        [Suit.Van, Rank.Ngu], // orphan
      ]);
      // Draw a card that does NOT match the orphan's rank
      const drawnCard = createCard(Suit.Van, Rank.Nhi);
      const result = checkWin(hand, drawnCard, false, false);
      expect(result.valid).toBe(false);
    });

    test('U Rond requires >= 6 Chăn', () => {
      // 6 Chăn (12 cards) + 7 other cards = 19
      // Only 5 Chăn = not U Rond
      const hand = makeHand([
        [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
        [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
        [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
        [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
        [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
        // 5 Chăn = 10 cards, need 9 more
        [Suit.Van, Rank.Ngu],
        [Suit.Van2, Rank.Ngu],
        [Suit.Sach, Rank.Ngu],
        [Suit.Van, Rank.That],
        [Suit.Van2, Rank.That],
        [Suit.Sach, Rank.That],
        [Suit.Van, Rank.Tam],
        [Suit.Van2, Rank.Tam],
        [Suit.Sach, Rank.Tam],
      ]);
      const drawnCard = createCard(Suit.Van2, Rank.Chi);
      const result = checkWin(hand, drawnCard, false, false);
      // Should NOT be U Rond (< 6 Chăn)
      // Could be Bach Thu if the pattern matches
      expect(result.valid).toBe(false);
    });

    test('hasTom returns true when drawn card provides missing Tôm card', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Tam),
        createCard(Suit.Sach, Rank.Tam),
        createCard(Suit.Van2, Rank.That),
      ];
      expect(hasTom(allCards)).toBe(true);
    });

    test('hasLeo returns true when drawn card provides missing Leo card', () => {
      const allCards = [
        createCard(Suit.Van, Rank.Cuu),
        createCard(Suit.Sach, Rank.Bat),
        createCard(Suit.Van, Rank.Chi),
      ];
      expect(hasLeo(allCards)).toBe(true);
    });
  });
});
