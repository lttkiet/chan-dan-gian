using System;
using System.Globalization;
using Avalonia.Data.Converters;

namespace ChanDanGian.Views;

public class BoolToOffsetConverter : IValueConverter
{
    public static readonly BoolToOffsetConverter Instance = new();

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value is true ? -18.0 : 0.0;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
