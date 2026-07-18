namespace ChanDanGian.Core.Models;

public record Deck(List<Card> DrawPile, List<Card> DiscardPile)
{
    public int DrawPileCount => DrawPile.Count;
    public Card? TopDiscard => DiscardPile.Count > 0 ? DiscardPile[^1] : null;
}

public static class DeckFactory
{
    public const int CopiesPerCard = 4;

    public static Deck CreateDeck()
    {
        var cards = new List<Card>();
        int id = 0;

        foreach (Rank rank in Enum.GetValues<Rank>())
        {
            foreach (Suit suit in Enum.GetValues<Suit>())
            {
                for (int copy = 0; copy < CopiesPerCard; copy++)
                {
                    cards.Add(new Card($"c{id++}", rank, suit));
                }
            }
        }

        return new Deck(cards, new List<Card>());
    }

    public static Deck ShuffleDeck(Deck deck, int? seed = null)
    {
        var rng = seed.HasValue ? new Random(seed.Value) : new Random();
        var shuffled = deck.DrawPile.ToList();

        // Fisher-Yates shuffle
        for (int i = shuffled.Count - 1; i > 0; i--)
        {
            int j = rng.Next(i + 1);
            (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
        }

        return deck with { DrawPile = shuffled };
    }

    public static (Card Card, Deck Deck) DrawCard(Deck deck)
    {
        if (deck.DrawPile.Count == 0)
            throw new InvalidOperationException("Nọc is empty");

        var card = deck.DrawPile[^1];
        var newPile = deck.DrawPile.Take(deck.DrawPile.Count - 1).ToList();
        return (card, deck with { DrawPile = newPile });
    }

    public static Deck DiscardCard(Deck deck, Card card)
    {
        var newDiscard = new List<Card>(deck.DiscardPile) { card };
        return deck with { DiscardPile = newDiscard };
    }
}
