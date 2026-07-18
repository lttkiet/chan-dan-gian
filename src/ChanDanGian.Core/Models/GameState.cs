namespace ChanDanGian.Core.Models;

public record Player(
    int Id,
    string Name,
    Hand Hand,
    List<IMeld> Melds,
    bool IsHuman)
{
    public static Player Create(int id, string name, bool isHuman) =>
        new(id, name, new Hand([]), [], isHuman);
}

public enum GamePhase
{
    Setup,
    Dealing,
    Playing,
    Finished
}

public enum PlayerAction
{
    Draw,
    Eat,
    Chiu,
    Discard,
    Pass,
    DeclareU
}

public record TurnState(
    int CurrentPlayerId,
    GamePhase Phase,
    PlayerAction? LastAction,
    Card? LastDiscardedCard,
    Card? DrawnCard,
    bool HasDrawnThisTurn,
    bool CanEat,
    bool CanChiu,
    int ConsecutivePasses)
{
    public static TurnState Create() => new(
        0, GamePhase.Setup, null, null, null, false, false, false, 0);
}

public record GameState(
    List<Player> Players,
    Deck Deck,
    TurnState Turn,
    int RoundNumber,
    List<int> ConsecutiveWins)
{
    public static GameState Create(List<string> playerNames)
    {
        var players = playerNames.Select((name, i) =>
            Player.Create(i, name, i == 0)).ToList();
        return new GameState(
            players,
            DeckFactory.CreateDeck(),
            TurnState.Create(),
            1,
            playerNames.Select(_ => 0).ToList());
    }
}
