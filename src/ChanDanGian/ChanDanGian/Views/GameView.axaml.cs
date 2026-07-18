namespace ChanDanGian.Views;

using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using ChanDanGian.ViewModels;

public partial class GameView : UserControl
{
    public GameView()
    {
        InitializeComponent();
    }

    private void CardPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (sender is Border border && border.Tag is CardViewModel card)
        {
            if (DataContext is GameViewModel vm)
            {
                vm.SelectCardCommand.Execute(card);
            }
        }
    }
}
