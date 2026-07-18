namespace ChanDanGian.Core.Models;

public enum MeldType
{
    Chan,
    Ca,
    BaDau,
    Chiu,
    QuanLe
}

public interface IMeld
{
    MeldType Type { get; }
    List<Card> Cards { get; }
}

public record ChanMeld(Card Card1, Card Card2) : IMeld
{
    public MeldType Type => MeldType.Chan;
    public List<Card> Cards => [Card1, Card2];
}

public record CaMeld(Card Card1, Card Card2) : IMeld
{
    public MeldType Type => MeldType.Ca;
    public List<Card> Cards => [Card1, Card2];
}

public record BaDauMeld(Card Card1, Card Card2, Card Card3) : IMeld
{
    public MeldType Type => MeldType.BaDau;
    public List<Card> Cards => [Card1, Card2, Card3];
}

public record ChiuMeld(Card Card1, Card Card2, Card Card3, Card Card4) : IMeld
{
    public MeldType Type => MeldType.Chiu;
    public List<Card> Cards => [Card1, Card2, Card3, Card4];
    public int ChanCount => 2; // Chiu counts as 2 Chan
}

public record QuanLe(Card Card) : IMeld
{
    public MeldType Type => MeldType.QuanLe;
    public List<Card> Cards => [Card];
}

public static class MeldFactory
{
    public static ChanMeld CreateChan(Card c1, Card c2)
    {
        if (c1.Rank != c2.Rank || c1.Suit != c2.Suit)
            throw new ArgumentException("Chan requires identical cards (same rank and suit)");
        return new ChanMeld(c1, c2);
    }

    public static CaMeld CreateCa(Card c1, Card c2)
    {
        if (c1.Rank != c2.Rank)
            throw new ArgumentException("Ca requires same rank");
        if (c1.Suit == c2.Suit)
            throw new ArgumentException("Ca requires different suits");
        return new CaMeld(c1, c2);
    }

    public static BaDauMeld CreateBaDau(Card c1, Card c2, Card c3)
    {
        if (c1.Rank != c2.Rank || c2.Rank != c3.Rank)
            throw new ArgumentException("Ba Dau requires all cards to have the same rank");
        var suits = new HashSet<Suit> { c1.Suit, c2.Suit, c3.Suit };
        if (suits.Count != 3)
            throw new ArgumentException("Ba Dau requires 3 different suits");
        return new BaDauMeld(c1, c2, c3);
    }

    public static ChiuMeld CreateChiu(Card c1, Card c2, Card c3, Card c4)
    {
        if (c1.Rank != c2.Rank || c1.Suit != c2.Suit)
            throw new ArgumentException("Chiu requires all 4 cards to match rank and suit");
        return new ChiuMeld(c1, c2, c3, c4);
    }

    public static int CountChan(IEnumerable<IMeld> melds)
    {
        int count = 0;
        foreach (var m in melds)
        {
            switch (m)
            {
                case ChanMeld: count++; break;
                case ChiuMeld: count += 2; break;
            }
        }
        return count;
    }

    public static bool IsChan(IMeld meld) => meld is ChanMeld;
    public static bool IsCa(IMeld meld) => meld is CaMeld;
    public static bool IsBaDau(IMeld meld) => meld is BaDauMeld;
    public static bool IsQuanLe(IMeld meld) => meld is QuanLe;
}
