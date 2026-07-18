using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ChanDanGian.Core.AI;
using ChanDanGian.Core.Engine;
using ChanDanGian.Core.Models;
using ChanDanGian.Models;
using Avalonia.Platform;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace ChanDanGian.ViewModels;

public partial class GameViewModel : ViewModelBase
{
    private readonly Services.GameManager _gm;
    private readonly Action<Screen> _navigate;
    private readonly UiStrings _strings;
    private bool _aiRunning;

    [ObservableProperty]
    private ObservableCollection<CardViewModel> _hand = new();

    [ObservableProperty]
    private int _drawPileCount;

    [ObservableProperty]
    private string _statusMessage = "";

    [ObservableProperty]
    private bool _isPlayerTurn;

    [ObservableProperty]
    private bool _gameOver;

    [ObservableProperty]
    private string _resultTitle = "";

    [ObservableProperty]
    private string _resultSubtitle = "";

    [ObservableProperty]
    private bool _showWinModal;

    [ObservableProperty]
    private bool _canDraw;

    [ObservableProperty]
    private bool _canDiscard;

    [ObservableProperty]
    private bool _canPass;

    [ObservableProperty]
    private bool _canDeclareU;

    [ObservableProperty]
    private int _selectedCardIndex = -1;

    [ObservableProperty]
    private string? _selectedCardId;

    [ObservableProperty]
    private string _handLabel = "";

    [ObservableProperty]
    private string _discardCountLabel = "";

    [ObservableProperty]
    private string _chanInfo = "";

    [ObservableProperty]
    private string _caInfo = "";

    [ObservableProperty]
    private string _baDauInfo = "";

    [ObservableProperty]
    private string _queCount = "";

    [ObservableProperty]
    private int _ai1HandCount;

    [ObservableProperty]
    private int _ai2HandCount;

    [ObservableProperty]
    private int _ai3HandCount;

    [ObservableProperty]
    private bool _isAi1Turn;

    [ObservableProperty]
    private bool _isAi2Turn;

    [ObservableProperty]
    private bool _isAi3Turn;

    [ObservableProperty]
    private string _ai1MeldInfo = "";

    [ObservableProperty]
    private string _ai2MeldInfo = "";

    [ObservableProperty]
    private string _ai3MeldInfo = "";

    public GameViewModel(Services.GameManager gm, Action<Screen> navigate, UiStrings strings)
    {
        _gm = gm;
        _navigate = navigate;
        _strings = strings;

        _gm.CreateEngine(new[] { "Người chơi", "AI 1", "AI 2", "AI 3" });
        var state = _gm.StartNewGame();
        RefreshFromState(state);
    }

    partial void OnSelectedCardIndexChanged(int value)
    {
        foreach (var c in Hand) c.IsSelected = false;
        if (value >= 0 && value < Hand.Count)
        {
            Hand[value].IsSelected = true;
            SelectedCardId = Hand[value].CardId;
        }
        else
        {
            SelectedCardId = null;
        }
        CanDiscard = value >= 0 && IsPlayerTurn;
    }

    private void RefreshFromState(GameState state)
    {
        DrawPileCount = state.Deck.DrawPileCount;
        IsPlayerTurn = state.Turn.CurrentPlayerId == 0;
        GameOver = state.Turn.Phase == GamePhase.Finished ||
                   (state.Deck.DrawPileCount == 0 && state.Turn.ConsecutivePasses >= 4);

        StatusMessage = GameOver ? "" :
            IsPlayerTurn ? _strings.YourTurn : $"{_strings.TurnOf}AI {state.Turn.CurrentPlayerId}";

        Hand = new ObservableCollection<CardViewModel>(
            state.Players[0].Hand.Cards.Select(c => new CardViewModel(c)));

        HandLabel = $"{_strings.HandLabel}{Hand.Count} {_strings.CardCount})";
        DiscardCountLabel = $"{_strings.DiscardInfo}{state.Deck.DiscardPile.Count} {_strings.CardCount}";

        var p0 = state.Players[0];
        ChanInfo = $"{_strings.ChanLabel}{p0.Melds.Count(m => m is ChanMeld)}";
        CaInfo = $"{_strings.CaLabel}{p0.Melds.Count(m => m is CaMeld)}";
        BaDauInfo = $"{_strings.BaDauLabel}{p0.Melds.Count(m => m is BaDauMeld)}";
        QueCount = $"{_strings.QueLabel}{p0.Hand.Size}";

        Ai1HandCount = state.Players.Count > 1 ? state.Players[1].Hand.Size : 0;
        Ai2HandCount = state.Players.Count > 2 ? state.Players[2].Hand.Size : 0;
        Ai3HandCount = state.Players.Count > 3 ? state.Players[3].Hand.Size : 0;

        var currentId = state.Turn.CurrentPlayerId;
        IsAi1Turn = currentId == 1;
        IsAi2Turn = currentId == 2;
        IsAi3Turn = currentId == 3;

        if (state.Players.Count > 1)
        {
            var p1 = state.Players[1];
            var c1 = p1.Melds.Count(m => m is ChanMeld);
            var ca1 = p1.Melds.Count(m => m is CaMeld);
            Ai1MeldInfo = $"{Ai1HandCount} lá · {c1}C {ca1}Ca";
        }
        if (state.Players.Count > 2)
        {
            var p2 = state.Players[2];
            var c2 = p2.Melds.Count(m => m is ChanMeld);
            var ca2 = p2.Melds.Count(m => m is CaMeld);
            Ai2MeldInfo = $"{Ai2HandCount} lá · {c2}C {ca2}Ca";
        }
        if (state.Players.Count > 3)
        {
            var p3 = state.Players[3];
            var c3 = p3.Melds.Count(m => m is ChanMeld);
            var ca3 = p3.Melds.Count(m => m is CaMeld);
            Ai3MeldInfo = $"{Ai3HandCount} lá · {c3}C {ca3}Ca";
        }

        var actions = _gm.Engine.GetValidActions(state, 0);
        CanDraw = actions.Contains(PlayerAction.Draw);
        CanPass = actions.Contains(PlayerAction.Pass);
        CanDeclareU = actions.Contains(PlayerAction.DeclareU);
        CanDiscard = false;
        SelectedCardIndex = -1;

        if (GameOver)
        {
            ShowWinModal = true;
            ResultTitle = _strings.DrawTitle;
            ResultSubtitle = _strings.DrawSubtitle;
        }

        if (IsPlayerTurn && CanDraw && !_aiRunning)
        {
            // Wait for player action
        }
        else if (!IsPlayerTurn && !GameOver && !_aiRunning)
        {
            _ = RunAiTurns();
        }
    }

    private async Task RunAiTurns()
    {
        _aiRunning = true;
        try
        {
            while (true)
            {
                var state = _gm.GameState;
                if (state == null || state.Turn.Phase == GamePhase.Finished) break;
                if (state.Turn.CurrentPlayerId == 0) break;

                await Task.Delay(_gm.Config.AiDelayMs);

                var decision = _gm.Ai.Decide(state, state.Turn.CurrentPlayerId, _gm.Engine);

                if (decision.Action == PlayerAction.DeclareU)
                {
                    state = state with
                    {
                        Turn = state.Turn with { Phase = GamePhase.Finished }
                    };
                    _gm.GameState = state;
                    RefreshFromState(state);
                    return;
                }

                state = ApplyAiDecision(state, state.Turn.CurrentPlayerId, decision);
                _gm.GameState = state;

                if (state.Turn.Phase == GamePhase.Finished) break;

                RefreshFromState(state);
            }
        }
        finally
        {
            _aiRunning = false;
        }
        RefreshFromState(_gm.GameState!);
    }

    private GameState ApplyAiDecision(GameState state, int playerId, AiDecision decision)
    {
        return decision.Action switch
        {
            PlayerAction.Draw when state.Deck.DrawPileCount > 0 =>
                _gm.Engine.DrawFromNoc(state),
            PlayerAction.Eat =>
                _gm.Engine.EatCard(state, playerId),
            PlayerAction.Chiu =>
                _gm.Engine.ChiuCard(state, playerId),
            PlayerAction.Discard when decision.CardId != null =>
                _gm.Engine.DiscardCard(state, playerId, decision.CardId),
            _ => _gm.Engine.PassTurn(state)
        };
    }

    [RelayCommand]
    private void Draw()
    {
        var state = _gm.GameState;
        if (state == null || state.Deck.DrawPileCount == 0) return;
        state = _gm.Engine.DrawFromNoc(state);
        _gm.GameState = state;
        StatusMessage = _strings.MsgDraw;
        RefreshFromState(state);
    }

    [RelayCommand]
    private void Discard()
    {
        if (SelectedCardIndex < 0) return;
        var state = _gm.GameState;
        if (state == null) return;
        var card = state.Players[0].Hand.Cards[SelectedCardIndex];
        state = _gm.Engine.DiscardCard(state, 0, card.Id);
        _gm.GameState = state;
        StatusMessage = _strings.MsgDiscarded;
        SelectedCardIndex = -1;
        RefreshFromState(state);
    }

    [RelayCommand]
    private void Pass()
    {
        var state = _gm.GameState;
        if (state == null) return;
        state = _gm.Engine.PassTurn(state);
        _gm.GameState = state;
        StatusMessage = _strings.MsgPassed;
        RefreshFromState(state);
    }

    [RelayCommand]
    private void DeclareU()
    {
        var state = _gm.GameState;
        if (state == null) return;
        state = state with
        {
            Turn = state.Turn with { Phase = GamePhase.Finished }
        };
        _gm.GameState = state;
        ResultTitle = _strings.WinTitle;
        ResultSubtitle = _strings.ScoreLabel + " " + state.Players[0].Hand.Cards.Count;
        ShowWinModal = true;
        GameOver = true;
    }

    [RelayCommand]
    private void PlayAgain()
    {
        ShowWinModal = false;
        _gm.CreateEngine(new[] { "Người chơi", "AI 1", "AI 2", "AI 3" });
        var state = _gm.StartNewGame();
        RefreshFromState(state);
    }

    [RelayCommand]
    private void BackToHome()
    {
        _gm.Reset();
        _navigate(Screen.Home);
    }

    [RelayCommand]
    private void SelectCard(CardViewModel card)
    {
        var idx = Hand.IndexOf(card);
        if (idx >= 0)
            SelectedCardIndex = idx;
    }
}

public partial class CardViewModel : ViewModelBase
{
    private static readonly Dictionary<string, Avalonia.Media.Imaging.Bitmap> _cache = new();

    public Core.Models.Card Card { get; }
    public string DisplayRank => Card.DisplayRank;
    public string DisplaySuit => Card.DisplaySuit;
    public bool IsRed => Card.IsRedCard;
    public string TextColor => IsRed ? "#e74c3c" : "#1a1a1a";
    public string CardId => Card.Id;

    [ObservableProperty]
    private bool _isSelected;

    public Avalonia.Media.Imaging.Bitmap? CardImage { get; }

    public CardViewModel(Core.Models.Card card)
    {
        Card = card;
        CardImage = LoadCardImage(Card.ImageName);
    }

    private static Avalonia.Media.Imaging.Bitmap? LoadCardImage(string name)
    {
        if (_cache.TryGetValue(name, out var cached)) return cached;
        try
        {
            var uri = new Uri($"avares://ChanDanGian/Assets/Cards/{name}.png");
            using var stream = AssetLoader.Open(uri);
            var bmp = new Avalonia.Media.Imaging.Bitmap(stream);
            _cache[name] = bmp;
            return bmp;
        }
        catch { }
        return null;
    }
}
