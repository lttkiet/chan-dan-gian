namespace ChanDanGian.Core.Engine;

using ChanDanGian.Core.Models;

public enum CuocType
{
    Xuong,
    UThong,
    Chi,
    ThienU,
    DiaU,
    Tom,
    Leo,
    BachThu,
    BachThuChi,
    ThienKhai,
    Chiu,
    AnBon,
    BachDinh,
    DoRed,
    KinhTuChi,
    ThapThanh
}

public record CuocDef(
    CuocType Type,
    int Points,
    int Dich,
    string NameVi,
    string NameEn)
{
    public static readonly Dictionary<CuocType, CuocDef> Table = new()
    {
        [CuocType.Xuong] = new(CuocType.Xuong, 0, 1, "Ù Xuông", "Xuong"),
        [CuocType.UThong] = new(CuocType.UThong, 3, 1, "Ù Thông", "Thong"),
        [CuocType.Chi] = new(CuocType.Chi, 3, 1, "Chì", "Chi"),
        [CuocType.ThienU] = new(CuocType.ThienU, 3, 1, "Thiên Ù", "Thien U"),
        [CuocType.DiaU] = new(CuocType.DiaU, 2, 1, "Địa Ù", "Dia U"),
        [CuocType.Tom] = new(CuocType.Tom, 4, 1, "Tôm", "Tom"),
        [CuocType.Leo] = new(CuocType.Leo, 5, 2, "Lèo", "Leo"),
        [CuocType.BachThu] = new(CuocType.BachThu, 4, 1, "Bạch Thủ", "Bach Thu"),
        [CuocType.BachThuChi] = new(CuocType.BachThuChi, 4, 3, "Bạch Thủ Chi", "Bach Thu Chi"),
        [CuocType.ThienKhai] = new(CuocType.ThienKhai, 5, 2, "Thiên Khai", "Thien Khai"),
        [CuocType.Chiu] = new(CuocType.Chiu, 5, 2, "Chíu", "Chiu"),
        [CuocType.AnBon] = new(CuocType.AnBon, 5, 2, "Ăn Bòn", "An Bon"),
        [CuocType.BachDinh] = new(CuocType.BachDinh, 7, 4, "Bạch Định", "Bach Dinh"),
        [CuocType.DoRed] = new(CuocType.DoRed, 8, 5, "8 Đỏ", "8 Red"),
        [CuocType.KinhTuChi] = new(CuocType.KinhTuChi, 12, 9, "Kính Tứ Chi", "Kinh Tu Chi"),
        [CuocType.ThapThanh] = new(CuocType.ThapThanh, 12, 9, "Thập Thành", "Thap Thanh"),
    };
}

public record CuocResult(
    List<CuocType> Cuocs,
    int TotalPoints,
    int TotalDich,
    int GaCount);

public static class Scoring
{
    public static bool HasTom(List<Card> allCards) =>
        allCards.Any(c => c.Rank == Rank.Tam && c.Suit == Suit.Van) &&
        allCards.Any(c => c.Rank == Rank.Tam && c.Suit == Suit.Sach) &&
        allCards.Any(c => c.Rank == Rank.That && c.Suit == Suit.Van2);

    public static bool HasLeo(List<Card> allCards) =>
        allCards.Any(c => c.Rank == Rank.Cuu && c.Suit == Suit.Van) &&
        allCards.Any(c => c.Rank == Rank.Bat && c.Suit == Suit.Sach) &&
        allCards.Any(c => c.Rank == Rank.Chi);

    public static CuocResult CalculateCuoc(
        Hand handBeforeDraw,
        Card drawnCard,
        WinType winType,
        bool isYourTurn = false,
        int consecutiveWins = 0,
        bool isFirstDraw = false,
        bool hasChiu = false,
        List<Card>? chiuCards = null)
    {
        var allCards = new List<Card>(handBeforeDraw.Cards) { drawnCard };
        var tempHand = new Hand(allCards);
        var analysis = MeldAnalyzer.AnalyzeHand(tempHand);
        var cuocs = new List<CuocType>();

        // Xuong - always possible
        cuocs.Add(CuocType.Xuong);

        if (winType == WinType.ThienU)
            cuocs.Add(CuocType.ThienU);

        if (isFirstDraw)
            cuocs.Add(CuocType.DiaU);

        if (isYourTurn)
            cuocs.Add(CuocType.Chi);

        if (consecutiveWins >= 2)
            cuocs.Add(CuocType.UThong);

        if (winType == WinType.BachThu)
        {
            cuocs.Add(drawnCard.Rank == Rank.Chi ? CuocType.BachThuChi : CuocType.BachThu);
        }

        if (HasTom(allCards))
            cuocs.Add(CuocType.Tom);

        if (HasLeo(allCards))
            cuocs.Add(CuocType.Leo);

        if (chiuCards?.Count > 0)
        {
            foreach (var chiuCard in chiuCards)
            {
                var count = allCards.Count(c => c.Rank == chiuCard.Rank && c.Suit == chiuCard.Suit);
                if (count == 4)
                {
                    cuocs.Add(CuocType.ThienKhai);
                    break;
                }
            }
        }

        if (hasChiu)
            cuocs.Add(CuocType.Chiu);

        if (allCards.All(c => !c.IsRedCard))
            cuocs.Add(CuocType.BachDinh);

        var redCount = allCards.Count(c => c.IsRedCard);
        if (redCount >= 8)
            cuocs.Add(CuocType.DoRed);

        var chiCount = allCards.Count(c => c.Rank == Rank.Chi);
        if (chiCount == 4)
            cuocs.Add(CuocType.KinhTuChi);

        if (analysis.ChanCount >= 10)
            cuocs.Add(CuocType.ThapThanh);

        // Calculate total points
        int totalPoints, totalDich;
        int gaCount = 0;

        if (cuocs.Contains(CuocType.ThapThanh))
        {
            totalPoints = cuocs.Sum(c => CuocDef.Table[c].Points);
            totalDich = cuocs.Sum(c => CuocDef.Table[c].Dich);
        }
        else if (cuocs.Count == 1 && cuocs[0] == CuocType.Xuong)
        {
            totalPoints = 0;
            totalDich = 1 + 2;
        }
        else if (cuocs.All(c => CuocDef.Table[c].Points <= 3 && (
            c == CuocType.Xuong || c == CuocType.UThong ||
            c == CuocType.Chi || c == CuocType.ThienU)))
        {
            totalPoints = 0;
            totalDich = cuocs.Sum(c => CuocDef.Table[c].Dich) + 2;
        }
        else
        {
            var sorted = cuocs.OrderByDescending(c => CuocDef.Table[c].Points).ToList();
            totalPoints = CuocDef.Table[sorted[0]].Points;
            totalDich = sorted.Skip(1).Sum(c => CuocDef.Table[c].Dich);
        }

        // Ga bonus
        if (cuocs.Contains(CuocType.BachDinh)) gaCount++;
        if (cuocs.Contains(CuocType.DoRed)) gaCount++;
        if (cuocs.Contains(CuocType.KinhTuChi)) gaCount++;
        if (cuocs.Contains(CuocType.ThapThanh)) gaCount++;
        if (cuocs.Contains(CuocType.BachThu) && cuocs.Contains(CuocType.Chi)) gaCount++;

        return new CuocResult(cuocs, totalPoints, totalDich, gaCount);
    }
}
