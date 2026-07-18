namespace ChanDanGian.Services;

using System;
using ChanDanGian.Core.Engine;
using ChanDanGian.Core.Models;
using ChanDanGian.Core.AI;

public class GameManager
{
    public GameConfig Config { get; set; } = GameConfig.Default;
    public GameEngine Engine { get; private set; } = null!;
    public AiPlayer Ai { get; } = new();
    public GameState? GameState { get; set; }
    public bool GameStarted { get; set; }

    public void CreateEngine(string[] playerNames)
    {
        Engine = new GameEngine(Config, playerNames);
    }

    public GameState StartNewGame(int? seed = null)
    {
        var state = Engine.SetupGame(seed ?? Random.Shared.Next());
        state = Engine.DealCards();
        GameState = state;
        GameStarted = true;
        return state;
    }

    public void LoadState(GameState state)
    {
        Engine.LoadState(state);
        GameState = state;
        GameStarted = true;
    }

    public void Reset()
    {
        GameState = null;
        GameStarted = false;
    }
}
