using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ChanDanGian.Core.Models;
using ChanDanGian.Models;
using System;

namespace ChanDanGian.ViewModels;

public partial class SettingsViewModel : ViewModelBase
{
    private readonly Services.GameManager _gm;
    private readonly Action<Screen> _navigate;
    private readonly UiStrings _strings;

    [ObservableProperty]
    private bool _enableGa;

    [ObservableProperty]
    private bool _enableChiChi;

    [ObservableProperty]
    private bool _useU411;

    public SettingsViewModel(Services.GameManager gm, Action<Screen> navigate, UiStrings strings)
    {
        _gm = gm;
        _navigate = navigate;
        _strings = strings;

        EnableGa = gm.Config.GaEnabled;
        EnableChiChi = gm.Config.ChiChiMode != ChiChiMode.Limited;
        UseU411 = gm.Config.MinCuocPoints > 0;
    }

    [RelayCommand]
    private void Save()
    {
        _gm.Config = GameConfig.Default with
        {
            GaEnabled = EnableGa,
            ChiChiMode = EnableChiChi ? ChiChiMode.BonusOnly : ChiChiMode.Limited,
            MinCuocPoints = UseU411 ? 4 : 0,
        };
        _navigate(Screen.Home);
    }

    [RelayCommand]
    private void Back()
    {
        _navigate(Screen.Home);
    }
}
