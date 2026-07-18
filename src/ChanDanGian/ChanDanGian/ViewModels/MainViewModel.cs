using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ChanDanGian.Models;
using System;

namespace ChanDanGian.ViewModels;

public partial class MainViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentScreen;

    public Services.GameManager GameManager { get; }
    public UiStrings Strings { get; } = UiStrings.Vietnamese;

    public MainViewModel()
    {
        GameManager = new Services.GameManager();
        _currentScreen = new HomeViewModel(GameManager, NavigateTo, Strings);
    }

    public void NavigateTo(Screen screen)
    {
        CurrentScreen = screen switch
        {
            Screen.Home => new HomeViewModel(GameManager, NavigateTo, Strings),
            Screen.Game => new GameViewModel(GameManager, NavigateTo, Strings),
            Screen.Settings => new SettingsViewModel(GameManager, NavigateTo, Strings),
            _ => CurrentScreen
        };
    }
}

public enum Screen { Home, Game, Settings }
