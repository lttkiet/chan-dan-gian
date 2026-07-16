import {
  MeldType, createChan, createCa, createBaDau, createChiu,
  isChan, isCa, isBaDau, isChiu, meldCards, countChan,
} from '../../src/models/meld';
import { createCard, Suit, Rank } from '../../src/models/card';

describe('Meld Model', () => {
  describe('ChiuMeld', () => {
    test('creates a Chiu meld from 4 identical cards', () => {
      const c1 = createCard(Suit.Van, Rank.Tam);
      const c2 = { ...c1, id: '3_van_1' };
      const c3 = { ...c1, id: '3_van_2' };
      const c4 = { ...c1, id: '3_van_3' };
      const meld = createChiu(c1, c2, c3, c4);
      expect(meld.type).toBe(MeldType.Chiu);
      expect(meld.cards).toHaveLength(4);
      expect(isChiu(meld)).toBe(true);
    });

    test('throws if cards have different ranks', () => {
      const c1 = createCard(Suit.Van, Rank.Tam);
      const c2 = { ...c1, id: 'x' };
      const c3 = { ...c1, id: 'y' };
      const c4 = createCard(Suit.Van, Rank.Bat);
      expect(() => createChiu(c1, c2, c3, c4)).toThrow();
    });

    test('throws if cards have different suits', () => {
      const c1 = createCard(Suit.Van, Rank.Tam);
      const c2 = { ...c1, id: 'x' };
      const c3 = { ...c1, id: 'y' };
      const c4 = createCard(Suit.Sach, Rank.Tam);
      expect(() => createChiu(c1, c2, c3, c4)).toThrow();
    });

    test('meldCards returns all 4 cards', () => {
      const c1 = createCard(Suit.Van, Rank.Chi);
      const c2 = { ...c1, id: 'chi_1' };
      const c3 = { ...c1, id: 'chi_2' };
      const c4 = { ...c1, id: 'chi_3' };
      const meld = createChiu(c1, c2, c3, c4);
      expect(meldCards(meld)).toHaveLength(4);
    });
  });

  describe('countChan', () => {
    test('counts Chiu as 2 Chăn', () => {
      const chan = createChan(
        createCard(Suit.Van, Rank.Tam),
        { ...createCard(Suit.Van, Rank.Tam), id: 'x' }
      );
      const chiu = createChiu(
        createCard(Suit.Van, Rank.Bat),
        { ...createCard(Suit.Van, Rank.Bat), id: 'x' },
        { ...createCard(Suit.Van, Rank.Bat), id: 'y' },
        { ...createCard(Suit.Van, Rank.Bat), id: 'z' }
      );
      expect(countChan([chan, chiu])).toBe(3); // 1 + 2
    });

    test('counts only Chăn when no Chiu', () => {
      const chan1 = createChan(
        createCard(Suit.Van, Rank.Tam),
        { ...createCard(Suit.Van, Rank.Tam), id: 'x' }
      );
      const chan2 = createChan(
        createCard(Suit.Van, Rank.Bat),
        { ...createCard(Suit.Van, Rank.Bat), id: 'y' }
      );
      expect(countChan([chan1, chan2])).toBe(2);
    });
  });

  describe('Type guards', () => {
    test('isChan, isCa, isBaDau, isChiu work correctly', () => {
      const chan = createChan(createCard(Suit.Van, Rank.Tam), { ...createCard(Suit.Van, Rank.Tam), id: 'x' });
      const ca = createCa(createCard(Suit.Van, Rank.Tam), createCard(Suit.Van2, Rank.Tam));
      const baDau = createBaDau(
        createCard(Suit.Van, Rank.Nhi),
        createCard(Suit.Van2, Rank.Nhi),
        createCard(Suit.Sach, Rank.Nhi)
      );
      const chiu = createChiu(
        createCard(Suit.Van, Rank.Luc),
        { ...createCard(Suit.Van, Rank.Luc), id: 'x' },
        { ...createCard(Suit.Van, Rank.Luc), id: 'y' },
        { ...createCard(Suit.Van, Rank.Luc), id: 'z' }
      );

      expect(isChan(chan)).toBe(true);
      expect(isCa(ca)).toBe(true);
      expect(isBaDau(baDau)).toBe(true);
      expect(isChiu(chiu)).toBe(true);

      expect(isChan(ca)).toBe(false);
      expect(isCa(chan)).toBe(false);
      expect(isChiu(chan)).toBe(false);
      expect(isBaDau(chiu)).toBe(false);
    });
  });
});
