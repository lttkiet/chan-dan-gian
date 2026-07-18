namespace ChanDanGian.Core.Engine;

using ChanDanGian.Core.Models;

public enum WinType
{
    None,
    UWide,
    BachThu,
    ThienU
}

public record WinResult(bool Valid, WinType Type);

public static class WinChecker
{
    private const int TotalCardsPerPlayer = 19;

    public static WinResult CheckWin(Hand handBeforeDraw, Card drawnCard, bool isDealer, bool hasChiu)
    {
        var allCards = new List<Card>(handBeforeDraw.Cards) { drawnCard };
        var tempHand = new Hand(allCards);
        var analysis = MeldAnalyzer.AnalyzeHand(tempHand);

        // Thien U: dealer's hand is complete at deal
        if (isDealer && allCards.Count == TotalCardsPerPlayer + 1 && hasChiu == false)
        {
            // Check if all cards form valid melds
            if (analysis.QuanLes.Count == 0 &&
                analysis.ChanCount + analysis.BaDaus.Count >= 5)
            {
                return new WinResult(true, WinType.ThienU);
            }
        }

        // U Rong: 6+ Chan, no orphans
        if (MeldAnalyzer.IsUWideEligible(analysis) && analysis.QuanLes.Count == 0)
            return new WinResult(true, WinType.UWide);

        // Bach Thu: exactly 5 Chan + 4 Ca + 1 orphan matching drawn card
        if (MeldAnalyzer.IsBachThuPattern(analysis))
        {
            var orphan = analysis.QuanLes[0];
            if (orphan.Card.Rank == drawnCard.Rank && orphan.Card.Suit == drawnCard.Suit)
                return new WinResult(true, WinType.BachThu);
        }

        return new WinResult(false, WinType.None);
    }
}
