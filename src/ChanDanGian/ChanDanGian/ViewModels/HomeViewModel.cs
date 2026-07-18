using CommunityToolkit.Mvvm.Input;
using ChanDanGian.Models;
using System;

namespace ChanDanGian.ViewModels;

public partial class HomeViewModel : ViewModelBase
{
    private readonly Services.GameManager _gm;
    private readonly Action<Screen> _navigate;
    private readonly UiStrings _strings;

    public string Title => _strings.AppName;
    public string Subtitle => _strings.AppSubtitle;
    public string PlayLabel => _strings.Play;
    public string SettingsLabel => _strings.SettingsMenu;

    public HomeViewModel(Services.GameManager gm, Action<Screen> navigate, UiStrings strings)
    {
        _gm = gm;
        _navigate = navigate;
        _strings = strings;
    }

    [RelayCommand]
    private void Play()
    {
        _gm.Config = ChanDanGian.Core.Models.GameConfig.Default;
        _navigate(Screen.Game);
    }

    [RelayCommand]
    private void OpenSettings()
    {
        _navigate(Screen.Settings);
    }
}
