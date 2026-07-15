import { calculateCuoc, CuocType, CUOC_TABLE } from '../../src/engine/scoring';
import { createCard, Suit, Rank } from '../../src/models/card';
import { Hand, addCard, createHand } from '../../src/models/hand';
import { WinType } from '../../src/engine/win_checker';

function makeHand(cards: Array<[Suit, Rank]>): Hand {
  let hand = createHand();
  for (const [suit, rank] of cards) {
    hand = addCard(hand, createCard(suit, rank));
  }
  return hand;
}

describe('Scoring System', () => {
  test('CUOC_TABLE has correct values', () => {
    expect(CUOC_TABLE[CuocType.Xuong].points).toBe(0);
    expect(CUOC_TABLE[CuocType.Xuong].dich).toBe(1);
    expect(CUOC_TABLE[CuocType.ThapThanh].points).toBe(12);
    expect(CUOC_TABLE[CuocType.KinhTuChi].points).toBe(12);
  });

  test('calculates Xuông for basic win', () => {
    const hand = makeHand([
      [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
      [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
      [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
      [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
      [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
      [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
      [Suit.Van2, Rank.Nhi], [Suit.Van2, Rank.Nhi],
      [Suit.Van2, Rank.Tu], [Suit.Van2, Rank.Tu],
      [Suit.Van2, Rank.Luc], [Suit.Van2, Rank.Luc],
      [Suit.Van2, Rank.Bat],
    ]);
    const drawnCard = createCard(Suit.Van2, Rank.Bat);
    const result = calculateCuoc(hand, drawnCard, WinType.UWide);
    expect(result.cuocs).toContain(CuocType.Xuong);
    expect(result.totalPoints).toBeGreaterThanOrEqual(0);
  });

  test('detects Tôm', () => {
    const hand = makeHand([
      [Suit.Van, Rank.Tam],
      [Suit.Sach, Rank.Tam],
      [Suit.Van2, Rank.That],
    ]);
    const drawnCard = createCard(Suit.Van, Rank.Nhi);
    const result = calculateCuoc(hand, drawnCard, WinType.UWide, {});
    expect(result.cuocs).toContain(CuocType.Tom);
  });

  test('detects Lèo', () => {
    const hand = makeHand([
      [Suit.Van, Rank.Cuu],
      [Suit.Sach, Rank.Bat],
      [Suit.Van, Rank.Chi],
    ]);
    const drawnCard = createCard(Suit.Van, Rank.Nhi);
    const result = calculateCuoc(hand, drawnCard, WinType.UWide, {});
    expect(result.cuocs).toContain(CuocType.Leo);
  });

  test('detects Chì when winning on your turn', () => {
    const hand = makeHand([
      [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
      [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
      [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
      [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
      [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
      [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
      [Suit.Van2, Rank.Nhi], [Suit.Van2, Rank.Nhi],
      [Suit.Van2, Rank.Tu], [Suit.Van2, Rank.Tu],
      [Suit.Van2, Rank.Luc], [Suit.Van2, Rank.Luc],
      [Suit.Van2, Rank.Bat],
    ]);
    const drawnCard = createCard(Suit.Van2, Rank.Bat);
    const result = calculateCuoc(hand, drawnCard, WinType.UWide, { isYourTurn: true });
    expect(result.cuocs).toContain(CuocType.Chi);
  });

  test('detects Thiên Ù', () => {
    const hand = makeHand([
      [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
      [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
      [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
      [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
      [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
      [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
      [Suit.Van, Rank.That], [Suit.Van, Rank.That],
      [Suit.Van, Rank.Ngu], [Suit.Van, Rank.Ngu],
      [Suit.Van, Rank.Chi], [Suit.Van, Rank.Chi],
      [Suit.Van2, Rank.Nhi], [Suit.Van2, Rank.Nhi],
    ]);
    const drawnCard = createCard(Suit.Van2, Rank.Tam);
    const result = calculateCuoc(hand, drawnCard, WinType.ThienU, {});
    expect(result.cuocs).toContain(CuocType.ThienU);
  });

  test('detects Bạch Định (all black)', () => {
    // All cards are black (rank 3,4,5,6 = Tam,Tứ,Ngũ,Lục)
    const hand = makeHand([
      [Suit.Van, Rank.Tam], [Suit.Van, Rank.Tam],
      [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
      [Suit.Van, Rank.Ngu], [Suit.Van, Rank.Ngu],
      [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
      [Suit.Van2, Rank.Tam], [Suit.Van2, Rank.Tam],
      [Suit.Van2, Rank.Tu], [Suit.Van2, Rank.Tu],
      [Suit.Van2, Rank.Ngu], [Suit.Van2, Rank.Ngu],
      [Suit.Van2, Rank.Luc], [Suit.Van2, Rank.Luc],
      [Suit.Sach, Rank.Tam], [Suit.Sach, Rank.Tam],
      [Suit.Sach, Rank.Tu],
    ]);
    const drawnCard = createCard(Suit.Sach, Rank.Tu);
    const result = calculateCuoc(hand, drawnCard, WinType.UWide, {});
    expect(result.cuocs).toContain(CuocType.BachDinh);
  });
});
