namespace ChanDanGian.Core.Models;

public record Hand(List<Card> Cards)
{
    public int Size => Cards.Count;

    public Hand AddCard(Card card) =>
        this with { Cards = new List<Card>(Cards) { card } };

    public Hand RemoveCard(string cardId) =>
        this with { Cards = Cards.Where(c => c.Id != cardId).ToList() };

    public Hand Sort()
    {
        var sorted = Cards
            .OrderBy(c => (int)c.Rank)
            .ThenBy(c => (int)c.Suit)
            .ToList();
        return this with { Cards = sorted };
    }

    public int CountByRank(Rank rank) =>
        Cards.Count(c => c.Rank == rank);

    public int CountBySuit(Suit suit) =>
        Cards.Count(c => c.Suit == suit);

    public List<Card> CardsOfRank(Rank rank) =>
        Cards.Where(c => c.Rank == rank).ToList();

    public int RedCardCount =>
        Cards.Count(c => c.IsRedCard);

    public int RedScoreCardCount =>
        Cards.Count(c => c.IsRedScoreCard);
}
