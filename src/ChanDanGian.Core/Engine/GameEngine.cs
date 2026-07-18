namespace ChanDanGian.Core.Engine;

using ChanDanGian.Core.Models;

public interface IGameEngine
{
    GameState GetState();
    GameState SetupGame(int? seed = null);
    GameState DealCards();
    GameState LoadState(GameState state);
    GameState DrawFromNoc(GameState state);
    GameState EatCard(GameState state, int playerId);
    GameState ChiuCard(GameState state, int playerId);
    GameState DiscardCard(GameState state, int playerId, string cardId);
    GameState PassTurn(GameState state);
    WinCheckResult CheckForWin(GameState state, int playerId);
    List<PlayerAction> GetValidActions(GameState state, int playerId);
    List<Card> GetValidDiscards(GameState state, int playerId);
    List<EatOption> GetEatOptions(GameState state, int playerId);
}

public record WinCheckResult(bool Won, WinType WinType, CuocResult? Result = null);
public record EatOption(string CardId, List<string> PairedCards);

public class GameEngine : IGameEngine
{
    private const int TotalPlayers = 4;
    private const int CardsPerPlayer = 19;

    private GameState? _currentState;
    private readonly GameConfig _config;
    private readonly string[] _playerNames;

    public GameEngine(GameConfig? config = null, string[]? playerNames = null)
    {
        _config = config ?? GameConfig.Default;
        _playerNames = playerNames ?? ["Bạn", "AI 1", "AI 2", "AI 3"];
    }

    public GameState GetState() => _currentState ?? GameState.Create([.. _playerNames]);

    public GameState SetupGame(int? seed = null)
    {
        var state = GameState.Create([.. _playerNames]);
        var deck = DeckFactory.CreateDeck();
        deck = DeckFactory.ShuffleDeck(deck, seed);
        _currentState = state with
        {
            Deck = deck,
            Turn = state.Turn with { Phase = GamePhase.Dealing }
        };
        return _currentState;
    }

    public GameState DealCards()
    {
        if (_currentState == null)
            throw new InvalidOperationException("Game not setup");

        var deck = _currentState.Deck;
        var players = _currentState.Players.ToList();

        for (int round = 0; round < CardsPerPlayer; round++)
        {
            for (int p = 0; p < TotalPlayers; p++)
            {
                var (card, newDeck) = DeckFactory.DrawCard(deck);
                deck = newDeck;
                players[p] = players[p] with
                {
                    Hand = players[p].Hand.AddCard(card)
                };
            }
        }

        // Dealer gets 1 extra card
        var (extraCard, afterExtra) = DeckFactory.DrawCard(deck);
        deck = afterExtra;
        players[0] = players[0] with
        {
            Hand = players[0].Hand.AddCard(extraCard)
        };

        // Sort each player's hand
        for (int p = 0; p < TotalPlayers; p++)
        {
            players[p] = players[p] with { Hand = players[p].Hand.Sort() };
        }

        _currentState = _currentState with
        {
            Players = players,
            Deck = deck,
            Turn = _currentState.Turn with
            {
                Phase = GamePhase.Playing,
                CurrentPlayerId = 0
            }
        };
        return _currentState;
    }

    public GameState LoadState(GameState state)
    {
        _currentState = state;
        return _currentState;
    }

    public GameState DrawFromNoc(GameState state)
    {
        if (state.Deck.DrawPileCount == 0)
            throw new InvalidOperationException("Nọc is empty");

        var (card, newDeck) = DeckFactory.DrawCard(state.Deck);
        var player = state.Players[state.Turn.CurrentPlayerId];
        var newHand = player.Hand.AddCard(card);
        var newPlayers = state.Players.ToList();
        newPlayers[state.Turn.CurrentPlayerId] = player with { Hand = newHand };

        var canChiu = MeldAnalyzer.CanChiu(newHand, card);

        _currentState = state with
        {
            Players = newPlayers,
            Deck = newDeck,
            Turn = state.Turn with
            {
                DrawnCard = card,
                HasDrawnThisTurn = true,
                CanEat = false,
                CanChiu = canChiu,
                LastAction = PlayerAction.Draw,
                ConsecutivePasses = 0
            }
        };
        return _currentState;
    }

    public GameState EatCard(GameState state, int playerId)
    {
        var discardPile = state.Deck.DiscardPile;
        if (discardPile.Count == 0)
            throw new InvalidOperationException("No card to eat");

        var cardToEat = discardPile[^1];
        var newDiscardPile = discardPile.Take(discardPile.Count - 1).ToList();
        var player = state.Players[playerId];
        var newHand = player.Hand.AddCard(cardToEat);
        var newPlayers = state.Players.ToList();
        newPlayers[playerId] = player with { Hand = newHand.Sort() };

        _currentState = state with
        {
            Players = newPlayers,
            Deck = state.Deck with { DiscardPile = newDiscardPile },
            Turn = state.Turn with
            {
                LastAction = PlayerAction.Eat,
                LastDiscardedCard = cardToEat,
                DrawnCard = null,
                HasDrawnThisTurn = true,
                CanEat = false,
                CanChiu = false,
                ConsecutivePasses = 0
            }
        };
        return _currentState;
    }

    public GameState ChiuCard(GameState state, int playerId)
    {
        var player = state.Players[playerId];
        var drawnCard = state.Turn.DrawnCard;
        var isFromDiscard = drawnCard == null;
        var chiuSource = drawnCard ?? state.Deck.TopDiscard;
        if (chiuSource == null)
            throw new InvalidOperationException("No card to chiu");

        var matchingCards = player.Hand.Cards
            .Where(c => c.Rank == chiuSource.Rank && c.Suit == chiuSource.Suit)
            .ToList();

        if (matchingCards.Count < 3)
            throw new InvalidOperationException("Cannot chiu: need 3 matching cards");

        var newHand = player.Hand;
        foreach (var mc in matchingCards.Take(3))
            newHand = newHand.RemoveCard(mc.Id);

        var chiuMeld = MeldFactory.CreateChiu(matchingCards[0], matchingCards[1], matchingCards[2], chiuSource);
        var newPlayers = state.Players.ToList();
        newPlayers[playerId] = player with
        {
            Hand = newHand,
            Melds = [.. player.Melds, chiuMeld]
        };

        var newDeck = state.Deck;
        if (isFromDiscard)
        {
            newDeck = state.Deck with
            {
                DiscardPile = state.Deck.DiscardPile.Take(state.Deck.DiscardPile.Count - 1).ToList()
            };
        }

        _currentState = state with
        {
            Players = newPlayers,
            Deck = newDeck,
            Turn = state.Turn with
            {
                LastAction = PlayerAction.Chiu,
                DrawnCard = null,
                HasDrawnThisTurn = isFromDiscard || state.Turn.HasDrawnThisTurn,
                CanChiu = false,
                ConsecutivePasses = 0
            }
        };
        return _currentState;
    }

    public GameState DiscardCard(GameState state, int playerId, string cardId)
    {
        var player = state.Players[playerId];
        var card = player.Hand.Cards.FirstOrDefault(c => c.Id == cardId)
            ?? throw new InvalidOperationException("Card not in hand");

        // Validate: can't discard a Chan
        var analysis = MeldAnalyzer.AnalyzeHand(player.Hand);
        if (analysis.Chans.Any(ch => ch.Cards.Any(c => c.Id == cardId)))
            throw new InvalidOperationException("Cannot discard a Chăn card");

        var newHand = player.Hand.RemoveCard(cardId);
        var newPlayers = state.Players.ToList();
        newPlayers[playerId] = player with { Hand = newHand };

        var newDeck = DeckFactory.DiscardCard(state.Deck, card);
        var nextPlayerId = (playerId + 1) % TotalPlayers;

        _currentState = state with
        {
            Players = newPlayers,
            Deck = newDeck,
            Turn = state.Turn with
            {
                CurrentPlayerId = nextPlayerId,
                LastAction = PlayerAction.Discard,
                LastDiscardedCard = card,
                DrawnCard = null,
                HasDrawnThisTurn = false,
                CanEat = false,
                CanChiu = false,
                ConsecutivePasses = 0
            }
        };
        return _currentState;
    }

    public GameState PassTurn(GameState state)
    {
        var nextPlayerId = (state.Turn.CurrentPlayerId + 1) % TotalPlayers;
        var consecutivePasses = state.Turn.ConsecutivePasses + 1;

        var stalled = consecutivePasses >= TotalPlayers && state.Deck.DrawPileCount == 0;

        _currentState = state with
        {
            Turn = state.Turn with
            {
                CurrentPlayerId = nextPlayerId,
                Phase = stalled ? GamePhase.Finished : state.Turn.Phase,
                LastAction = PlayerAction.Pass,
                DrawnCard = null,
                HasDrawnThisTurn = false,
                CanEat = false,
                CanChiu = false,
                ConsecutivePasses = consecutivePasses
            }
        };
        return _currentState;
    }

    public WinCheckResult CheckForWin(GameState state, int playerId)
    {
        var player = state.Players[playerId];
        var drawnCard = state.Turn.DrawnCard;

        if (drawnCard != null)
        {
            var isDealer = playerId == 0;
            var handBeforeDraw = player.Hand.RemoveCard(drawnCard.Id);
            var winResult = WinChecker.CheckWin(handBeforeDraw, drawnCard, isDealer, false);

            if (winResult.Valid)
            {
                var cuocResult = Scoring.CalculateCuoc(
                    handBeforeDraw,
                    drawnCard,
                    winResult.Type,
                    isYourTurn: state.Turn.CurrentPlayerId == playerId,
                    consecutiveWins: state.ConsecutiveWins[playerId]);

                if (_config.MinCuocPoints > 0 && cuocResult.TotalPoints < _config.MinCuocPoints)
                    return new WinCheckResult(false, WinType.None);

                var finalResult = _config.GaEnabled
                    ? cuocResult
                    : cuocResult with { GaCount = 0 };

                return new WinCheckResult(true, winResult.Type, finalResult);
            }
        }

        // Check Thien U (dealer with 20 cards)
        if (playerId == 0 && player.Hand.Size == 20)
        {
            var winResult = WinChecker.CheckWin(player.Hand, player.Hand.Cards[0], true, false);
            if (winResult.Valid && winResult.Type == WinType.ThienU)
                return new WinCheckResult(true, WinType.ThienU);
        }

        return new WinCheckResult(false, WinType.None);
    }

    public List<PlayerAction> GetValidActions(GameState state, int playerId)
    {
        var actions = new List<PlayerAction>();
        var player = state.Players[playerId];
        var lastDiscard = state.Deck.TopDiscard;

        if (state.Turn.HasDrawnThisTurn)
        {
            actions.Add(PlayerAction.Discard);
            if (state.Turn.CanChiu)
                actions.Add(PlayerAction.Chiu);

            if (state.Turn.DrawnCard != null)
            {
                var handBeforeDraw = player.Hand.RemoveCard(state.Turn.DrawnCard.Id);
                var winCheck = WinChecker.CheckWin(
                    handBeforeDraw, state.Turn.DrawnCard,
                    playerId == 0, false);
                if (winCheck.Valid)
                    actions.Add(PlayerAction.DeclareU);
            }

            actions.Add(PlayerAction.Pass);
        }
        else
        {
            if (state.Deck.DrawPileCount > 0)
                actions.Add(PlayerAction.Draw);

            if (lastDiscard != null)
            {
                if (MeldAnalyzer.WouldFormChan(player.Hand, lastDiscard) ||
                    MeldAnalyzer.WouldFormCa(player.Hand, lastDiscard))
                    actions.Add(PlayerAction.Eat);

                if (MeldAnalyzer.CanChiu(player.Hand, lastDiscard))
                    actions.Add(PlayerAction.Chiu);
            }
        }

        return actions;
    }

    public List<Card> GetValidDiscards(GameState state, int playerId)
    {
        var player = state.Players[playerId];
        var analysis = MeldAnalyzer.AnalyzeHand(player.Hand);
        var chanCardIds = analysis.Chans
            .SelectMany(ch => ch.Cards.Select(c => c.Id))
            .ToHashSet();

        return player.Hand.Cards.Where(c => !chanCardIds.Contains(c.Id)).ToList();
    }

    public List<EatOption> GetEatOptions(GameState state, int playerId)
    {
        var player = state.Players[playerId];
        var lastDiscard = state.Deck.TopDiscard;
        if (lastDiscard == null) return [];

        var options = new List<EatOption>();
        var seenPairs = new HashSet<string>();

        foreach (var handCard in player.Hand.Cards)
        {
            if (handCard.Rank == lastDiscard.Rank && handCard.Suit != lastDiscard.Suit)
            {
                var pairKey = $"{lastDiscard.Id}:{handCard.Id}";
                if (seenPairs.Add(pairKey))
                {
                    options.Add(new EatOption(lastDiscard.Id, [handCard.Id]));
                }
            }
        }

        return options;
    }
}
