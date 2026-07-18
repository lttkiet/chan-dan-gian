namespace ChanDanGian.Views.Components;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Media;
using System;
using System.Collections.Generic;

public class FanPanel : Panel
{
    public static readonly StyledProperty<double> FanAngleProperty =
        AvaloniaProperty.Register<FanPanel, double>(nameof(FanAngle), 60.0);

    public double FanAngle
    {
        get => GetValue(FanAngleProperty);
        set => SetValue(FanAngleProperty, value);
    }

    private static readonly Size CardSize = new(36, 72);

    protected override Size MeasureOverride(Size availableSize)
    {
        foreach (var child in Children)
        {
            child.Measure(CardSize);
        }

        double w = double.IsInfinity(availableSize.Width) ? 800 : availableSize.Width;
        double h = double.IsInfinity(availableSize.Height) ? 150 : availableSize.Height;
        return new Size(w, h);
    }

    protected override Size ArrangeOverride(Size finalSize)
    {
        var children = new List<Control>();
        foreach (var child in Children)
            if (child is Control c) children.Add(c);

        int count = children.Count;
        if (count == 0) return finalSize;

        double cardW = children[0].DesiredSize.Width > 0 ? children[0].DesiredSize.Width : 36;
        double cardH = children[0].DesiredSize.Height > 0 ? children[0].DesiredSize.Height : 72;

        double halfAngle = FanAngle / 2.0 * Math.PI / 180.0;
        double centerX = finalSize.Width / 2.0;
        double topY = 0.0;

        double cardSpacing = cardW * 0.6;
        double totalArc = (count - 1) * cardSpacing;
        double radius = totalArc / (2.0 * Math.Sin(halfAngle));
        if (radius < finalSize.Width * 0.35) radius = finalSize.Width * 0.35;
        if (radius < cardH * 2.5) radius = cardH * 2.5;

        double actualHalfAngle = Math.Asin(Math.Min(totalArc / 2.0 / radius, 1.0));

        for (int i = 0; i < count; i++)
        {
            double t = count == 1 ? 0.5 : (double)i / (count - 1);
            double angle = -actualHalfAngle + t * 2.0 * actualHalfAngle;

            double cardX = centerX + radius * Math.Sin(angle);
            double cardY = topY + radius - radius * Math.Cos(angle);

            var child = children[i];

            child.RenderTransformOrigin = new RelativePoint(0.5, 0.0, RelativeUnit.Relative);
            child.RenderTransform = new RotateTransform(-angle * 180.0 / Math.PI);

            child.Arrange(new Rect(cardX - cardW / 2, cardY, cardW, cardH));
        }

        return finalSize;
    }
}
