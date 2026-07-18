using System;
using System.Collections.Generic;
using Avalonia.Controls;
using Avalonia.Controls.Templates;
using ChanDanGian.ViewModels;
using ChanDanGian.Views;

namespace ChanDanGian;

public class ViewLocator : IDataTemplate
{
    private static readonly Dictionary<Type, Func<Control>> ViewMap = new()
    {
        [typeof(HomeViewModel)] = () => new HomeView(),
        [typeof(GameViewModel)] = () => new GameView(),
        [typeof(SettingsViewModel)] = () => new SettingsView(),
        [typeof(MainViewModel)] = () => new MainView(),
    };

    public Control? Build(object? param)
    {
        if (param is null)
            return null;

        var type = param.GetType();

        if (ViewMap.TryGetValue(type, out var factory))
            return factory();

        return new TextBlock { Text = "Not Found: " + type.FullName };
    }

    public bool Match(object? data)
    {
        return data is ViewModelBase;
    }
}
