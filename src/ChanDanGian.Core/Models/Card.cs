namespace ChanDanGian.Core.Models;

public enum Rank
{
    Nhi = 2,
    Tam = 3,
    Tu = 4,
    Ngu = 5,
    Luc = 6,
    That = 7,
    Bat = 8,
    Cuu = 9,
    Chi = 10
}

public enum Suit
{
    Van,
    Van2,
    Sach
}

public record Card(string Id, Rank Rank, Suit Suit)
{
    public static readonly Dictionary<Rank, string> RankChars = new()
    {
        [Rank.Nhi] = "二", [Rank.Tam] = "三", [Rank.Tu] = "四",
        [Rank.Ngu] = "五", [Rank.Luc] = "六", [Rank.That] = "七",
        [Rank.Bat] = "八", [Rank.Cuu] = "九", [Rank.Chi] = "十"
    };

    public static readonly Dictionary<Suit, string> SuitChars = new()
    {
        [Suit.Van] = "萬", [Suit.Van2] = "文", [Suit.Sach] = "索"
    };

    public static readonly HashSet<(Rank, Suit)> RedCards = new()
    {
        (Rank.Chi, Suit.Van2),   // Chi Chi (red)
        (Rank.Cuu, Suit.Van),    // Cuu Van (red)
        (Rank.Bat, Suit.Sach),   // Bat Sach (red)
        (Rank.That, Suit.Van2)   // That Van (red)
    };

    public static readonly HashSet<(Rank, Suit)> RedScoreCards = new()
    {
        (Rank.Chi, Suit.Van2),   // Chi Chi
        (Rank.Cuu, Suit.Van),    // Cuu Van
        (Rank.Bat, Suit.Sach),   // Bat Sach
        (Rank.That, Suit.Van2),  // That Van
        (Rank.Chi, Suit.Van),    // Chi Van
        (Rank.Chi, Suit.Sach)    // Chi Sach
    };

    public bool IsRedCard => RedCards.Contains((Rank, Suit));
    public bool IsRedScoreCard => RedScoreCards.Contains((Rank, Suit));
    public bool IsChiChi => Rank == Rank.Chi && Suit == Suit.Van2;

    public string DisplayRank => RankChars[Rank];
    public string DisplaySuit => SuitChars[Suit];
    public string Display => $"{DisplayRank}{DisplaySuit}";

    public static readonly Dictionary<Suit, string> SuitImagePrefix = new()
    {
        [Suit.Van] = "van",
        [Suit.Van2] = "loc",
        [Suit.Sach] = "sach"
    };

    public string ImageName => $"{SuitImagePrefix[Suit]}_{(int)Rank}";
    public string ImagePath => $"avares://ChanDanGian/Assets/Cards/{ImageName}.png";
}

public static class CardFactory
{
    public static Card CreateCard(Rank rank, Suit suit, string? id = null) =>
        new(id ?? $"{rank}_{suit}", rank, suit);
}
