namespace ChanDanGian.Core.Engine;

using ChanDanGian.Core.Models;

public record HandAnalysis(
    List<ChanMeld> Chans,
    List<CaMeld> Cas,
    List<BaDauMeld> BaDaus,
    List<QuanLe> QuanLes,
    List<IMeld> AllMelds,
    int ChanCount)
{
    public static HandAnalysis Empty => new([], [], [], [], [], 0);
}

public static class MeldAnalyzer
{
    public static HandAnalysis AnalyzeHand(Hand hand)
    {
        var cards = hand.Cards;
        var chans = new List<ChanMeld>();
        var cas = new List<CaMeld>();
        var baDaus = new List<BaDauMeld>();
        var quanLes = new List<QuanLe>();
        var used = new HashSet<string>();

        // Group by rank
        var byRank = cards.GroupBy(c => c.Rank)
            .ToDictionary(g => g.Key, g => g.ToList());

        // First pass: find Chan (identical pairs)
        foreach (var (_, rankCards) in byRank)
        {
            var bySuit = rankCards.GroupBy(c => c.Suit)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var (_, suitCards) in bySuit)
            {
                var remaining = new List<Card>(suitCards);
                while (remaining.Count >= 2)
                {
                    var c1 = remaining[^1]; remaining.RemoveAt(remaining.Count - 1);
                    var c2 = remaining[^1]; remaining.RemoveAt(remaining.Count - 1);
                    chans.Add(MeldFactory.CreateChan(c1, c2));
                    used.Add(c1.Id);
                    used.Add(c2.Id);
                }
            }
        }

        // Second pass: Ba Dau and Ca from remaining
        var remainingByRank = cards
            .Where(c => !used.Contains(c.Id))
            .GroupBy(c => c.Rank)
            .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var (_, rankCards) in remainingByRank)
        {
            if (rankCards.Count >= 3)
            {
                var uniqueSuits = rankCards.Select(c => c.Suit).Distinct().ToList();
                if (uniqueSuits.Count >= 3)
                {
                    var picked = new List<Card>();
                    var seenSuits = new HashSet<Suit>();
                    foreach (var card in rankCards)
                    {
                        if (!seenSuits.Contains(card.Suit) && picked.Count < 3)
                        {
                            picked.Add(card);
                            seenSuits.Add(card.Suit);
                        }
                    }
                    if (picked.Count == 3)
                    {
                        baDaus.Add(MeldFactory.CreateBaDau(picked[0], picked[1], picked[2]));
                        foreach (var c in picked) used.Add(c.Id);
                    }
                }
            }

            var remaining = rankCards.Where(c => !used.Contains(c.Id)).ToList();
            if (remaining.Count == 2)
            {
                cas.Add(MeldFactory.CreateCa(remaining[0], remaining[1]));
                used.Add(remaining[0].Id);
                used.Add(remaining[1].Id);
            }
        }

        // Third pass: remaining singles are Quan Le
        foreach (var card in cards)
        {
            if (!used.Contains(card.Id))
                quanLes.Add(new QuanLe(card));
        }

        var allMelds = new List<IMeld>();
        allMelds.AddRange(chans);
        allMelds.AddRange(cas);
        allMelds.AddRange(baDaus);
        allMelds.AddRange(quanLes);

        return new HandAnalysis(chans, cas, baDaus, quanLes, allMelds, chans.Count);
    }

    public static bool WouldFormChan(Hand hand, Card card) =>
        hand.Cards.Any(c => c.Rank == card.Rank && c.Suit == card.Suit);

    public static bool WouldFormCa(Hand hand, Card card) =>
        hand.Cards.Any(c => c.Rank == card.Rank && c.Suit != card.Suit);

    public static bool CanChiu(Hand hand, Card card) =>
        hand.Cards.Count(c => c.Rank == card.Rank && c.Suit == card.Suit) >= 3;

    public static bool IsBachThuPattern(HandAnalysis analysis) =>
        analysis.ChanCount == 5 &&
        analysis.Cas.Count == 4 &&
        analysis.QuanLes.Count == 1;

    public static bool IsUWideEligible(HandAnalysis analysis) =>
        analysis.ChanCount >= 6;
}
