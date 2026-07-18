using Android.App;
using Android.Content.PM;
using Avalonia;
using Avalonia.Android;

namespace ChanDanGian.Android;

[Activity(
    Label = "ChanDanGian.Android",
    Theme = "@style/MyTheme.NoActionBar",
    Icon = "@drawable/icon",
    MainLauncher = true,
    ScreenOrientation = ScreenOrientation.Landscape,
    ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.UiMode)]
public class MainActivity : AvaloniaMainActivity
{
}
