namespace ChanDanGian.Core.Models;

public enum Region
{
    Northern,
    Southern,
    Central
}

public enum ChiChiMode
{
    Wild,
    BonusOnly,
    Limited
}

public enum AnimationSpeed
{
    Slow,
    Normal,
    Fast
}

public record GameConfig(
    Region Region,
    ChiChiMode ChiChiMode,
    bool GaEnabled,
    int MinCuocPoints,
    AnimationSpeed AnimationSpeed)
{
    public static GameConfig Default => new(
        Region.Northern,
        ChiChiMode.BonusOnly,
        true,
        0,
        AnimationSpeed.Normal);

    public int AiDelayMs => AnimationSpeed switch
    {
        AnimationSpeed.Slow => 1400,
        AnimationSpeed.Normal => 800,
        AnimationSpeed.Fast => 400,
        _ => 800
    };
}
