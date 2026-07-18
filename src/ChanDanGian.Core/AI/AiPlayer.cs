namespace ChanDanGian.Core.AI;

using ChanDanGian.Core.Engine;
using ChanDanGian.Core.Models;

public record AiDecision(PlayerAction Action, string? CardId = null);

public interface IAiPlayer
{
    AiDecision Decide(GameState state, int playerId, IGameEngine engine);
}

public class AiPlayer : IAiPlayer
{
    public AiDecision Decide(GameState state, int playerId, IGameEngine engine)
    {
        var player = state.Players[playerId];
        var hand = player.Hand;
        var actions = engine.GetValidActions(state, playerId);

        // Priority 1: Declare U
        if (actions.Contains(PlayerAction.DeclareU))
            return new AiDecision(PlayerAction.DeclareU);

        // Priority 2: Chiu
        if (actions.Contains(PlayerAction.Chiu))
            return new AiDecision(PlayerAction.Chiu);

        // Priority 3: Eat (if forms Chan or Ca and we have room)
        if (actions.Contains(PlayerAction.Eat))
        {
            var lastDiscard = state.Deck.TopDiscard;
            if (lastDiscard != null)
            {
                var eatOptions = engine.GetEatOptions(state, playerId);
                if (eatOptions.Count > 0)
                {
                    if (MeldAnalyzer.WouldFormChan(hand, lastDiscard))
                        return new AiDecision(PlayerAction.Eat);

                    if (MeldAnalyzer.WouldFormCa(hand, lastDiscard))
                    {
                        var analysis = MeldAnalyzer.AnalyzeHand(hand);
                        if (analysis.ChanCount < 6)
                            return new AiDecision(PlayerAction.Eat);
                    }
                }
            }
        }

        // Priority 4: Draw
        if (actions.Contains(PlayerAction.Draw))
            return new AiDecision(PlayerAction.Draw);

        // Priority 5: Discard (choose lowest danger card)
        if (actions.Contains(PlayerAction.Discard))
        {
            var discardCard = ChooseDiscard(hand, state, playerId);
            if (discardCard != null)
                return new AiDecision(PlayerAction.Discard, discardCard.Id);
        }

        // Priority 6: Pass
        return new AiDecision(PlayerAction.Pass);
    }

    private static Card? ChooseDiscard(Hand hand, GameState state, int playerId)
    {
        var analysis = MeldAnalyzer.AnalyzeHand(hand);
        var chanCardIds = analysis.Chans
            .SelectMany(ch => ch.Cards.Select(c => c.Id))
            .ToHashSet();
        var discardable = hand.Cards.Where(c => !chanCardIds.Contains(c.Id)).ToList();

        if (discardable.Count == 0) return null;

        var scored = discardable
            .Select(c => (Card: c, Score: EvaluateDiscardScore(c, hand, state, analysis, playerId)))
            .ToList();

        return scored.OrderBy(s => s.Score).First().Card;
    }

    private static int CardValue(Card card, Hand hand, GameState state)
    {
        int value = 0;

        var sameRankCount = hand.CountByRank(card.Rank);
        value += sameRankCount * 10;

        var sameSuitCount = hand.CountBySuit(card.Suit);
        value += sameSuitCount * 3;

        var discardedCount = state.Deck.DiscardPile
            .Count(c => c.Rank == card.Rank && c.Suit == card.Suit);

        if (discardedCount >= 3)
            value -= 50;
        else if (discardedCount >= 2)
            value -= 15;

        // Scoring card bonus
        if (card.Rank == Rank.Chi) value += 8;
        if (card.Rank == Rank.Cuu && card.Suit == Suit.Van) value += 3;
        if (card.Rank == Rank.That && card.Suit == Suit.Van2) value += 3;

        // Isolation penalty
        bool hasSameRank = sameRankCount > 1;
        bool hasSameSuit = hand.Cards.Any(c => c.Suit == card.Suit && c.Rank != card.Rank);
        if (!hasSameRank && !hasSameSuit)
            value -= 15;

        return value;
    }

    private static bool IsSafeDiscard(Card card, GameState state, int playerId)
    {
        var discardCount = state.Deck.DiscardPile
            .Count(c => c.Rank == card.Rank && c.Suit == card.Suit);

        if (discardCount >= 3) return true;
        if (card.Rank == Rank.Chi) return false;
        if (card.Rank == Rank.Nhi || card.Rank == Rank.Cuu) return true;
        if (discardCount >= 1) return true;

        return false;
    }

    private static int EvaluateDiscardScore(
        Card card, Hand hand, GameState state,
        HandAnalysis analysis, int playerId)
    {
        int score = 0;

        // Value of keeping (negative = valuable)
        score -= CardValue(card, hand, state);

        // Danger of discarding
        score += DiscardDangerScore(card, hand, state, analysis, playerId);

        // Safe discard bonus
        if (IsSafeDiscard(card, state, playerId))
            score -= 15;

        return score;
    }

    private static int DiscardDangerScore(
        Card card, Hand hand, GameState state,
        HandAnalysis analysis, int playerId)
    {
        int danger = 0;

        // In Chan? Never discard
        if (analysis.Chans.Any(ch => ch.Cards.Any(c => c.Id == card.Id)))
            return 1000;

        // In Ca?
        if (analysis.Cas.Any(ca => ca.Cards.Any(c => c.Id == card.Id)))
            danger += 40;

        // In Ba Dau?
        if (analysis.BaDaus.Any(bd => bd.Cards.Any(c => c.Id == card.Id)))
            danger += 30;

        // Same rank count
        var sameRank = hand.CountByRank(card.Rank);
        danger += sameRank * 15;

        // Same suit count
        var sameSuit = hand.CountBySuit(card.Suit);
        danger += sameSuit * 5;

        // Safe card
        if (IsSafeDiscard(card, state, playerId))
            danger -= 20;

        // Already discarded copies
        var discardedCount = state.Deck.DiscardPile
            .Count(c => c.Rank == card.Rank && c.Suit == card.Suit);
        danger -= discardedCount * 10;

        return danger;
    }
}
