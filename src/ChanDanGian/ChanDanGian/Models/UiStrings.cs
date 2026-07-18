namespace ChanDanGian.Models;

public class UiStrings
{
    public static UiStrings Vietnamese { get; } = new()
    {
        AppName = "Chắn", AppSubtitle = "Dân Gian",
        Play = "Chơi", SettingsMenu = "⚙️ Luật chơi & Cài đặt",
        StartGame = "Bắt đầu chơi", StartPrompt = "Nhấn \"Bắt đầu\" để chơi",
        StartMessage = "Bắt đầu! Bạn đi trước", BackToHome = "← Về trang chủ",
        TopBarTitle = "Chắn Dân Gian", CardCount = "lá", MeldCount = "phu",
        YourTurn = "🎮 Lượt bạn", TurnOf = "🤖 ",
        ChanLabel = "Chắn: ", CaLabel = "Cạ: ", BaDauLabel = "Ba Đầu: ", QueLabel = "Què: ",
        DiscardInfo = "Bài đánh: ",
        BtnDraw = "Bốc", BtnEat = "Ăn", BtnChiu = "Chíu", BtnDiscard = "Đánh", BtnPass = "Bỏ", BtnDeclareU = "Ù",
        HandLabel = "Bài của bạn (", DiscardHint = "Chọn lá bài để đánh",
        MsgDraw = "Bạn đã bốc bài. Hãy đánh 1 lá", MsgEatError = "Không thể ăn bài này",
        MsgEat = "Bạn đã ăn bài. Hãy đánh 1 lá", MsgChiu = "Bạn đã chíu. Hãy đánh 1 lá",
        MsgDiscarded = "Đã đánh bài. Chờ lượt tiếp...", MsgPassed = "Đã bỏ lượt",
        WinTitle = "🎉 Bạn thắng!", LoseTitle = "😔 Bạn thua", WinSubtitle = " Ù — ",
        ScoreLabel = "Điểm: ", DichLabel = "Dì: ", GaLabel = "Gà: ", GameRestored = "Trò chơi đã được khôi phục",
        DrawTitle = "Hòa!", DrawSubtitle = "Không còn bài để bốc",
        BtnPlayAgain = "Chơi lại", BtnBackToHome = "Về trang chủ",
        SettingsTitle = "Cài đặt", SectionLanguage = "Ngôn ngữ", SectionRegion = "Quy tắc vùng miền",
        SectionChiChi = "Luật Chi Chi", SectionGa = "Gà (cược thêm)",
        SectionU411 = "Ù 4-11", SectionSpeed = "Tốc độ hiệu ứng",
        LangVietnamese = "Tiếng Việt", LangEnglish = "English",
        GaOn = "Bật", GaOff = "Tắt", U411Off = "Tắt", U411On = "4 điểm",
        BtnSave = "Lưu", BtnBack = "Quay lại",
        SpeedSlow = "Chậm", SpeedNormal = "Bình thường", SpeedFast = "Nhanh",
        PileEmpty = "Hết", PileDiscard = "Rác",
        ErrNocEmpty = "Nọc hết bài", ErrCannotDiscardChan = "Không thể đánh bài Chăn",
        ErrNoCardToEat = "Không có bài để ăn", ErrNoCardToChiu = "Không có bài để chíu",
        ErrChiuNeed3 = "Cần có 3 lá giống nhau để chíu",
    };

    public static UiStrings English { get; } = new()
    {
        AppName = "Chan", AppSubtitle = "Folk Game",
        Play = "Play", SettingsMenu = "⚙️ Rules & Settings",
        StartGame = "Start Game", StartPrompt = "Press \"Start\" to play",
        StartMessage = "Game started! You go first", BackToHome = "← Back to Home",
        TopBarTitle = "Chan Folk Game", CardCount = "cards", MeldCount = "melds",
        YourTurn = "🎮 Your turn", TurnOf = "🤖 ",
        ChanLabel = "Chan: ", CaLabel = "Ca: ", BaDauLabel = "Ba Dau: ", QueLabel = "Que: ",
        DiscardInfo = "Discarded: ",
        BtnDraw = "Draw", BtnEat = "Eat", BtnChiu = "Chiu", BtnDiscard = "Discard", BtnPass = "Pass", BtnDeclareU = "Ù",
        HandLabel = "Your hand (", DiscardHint = "Select a card to discard",
        MsgDraw = "You drew a card. Discard 1 card", MsgEatError = "Cannot eat this card",
        MsgEat = "You ate a card. Discard 1 card", MsgChiu = "You chiu-ed. Discard 1 card",
        MsgDiscarded = "Card discarded. Waiting...", MsgPassed = "Turn passed",
        WinTitle = "🎉 You win!", LoseTitle = "😔 You lose", WinSubtitle = " won — ",
        ScoreLabel = "Score: ", DichLabel = "Dich: ", GaLabel = "Ga: ", GameRestored = "Game restored",
        DrawTitle = "Draw!", DrawSubtitle = "No cards left to draw",
        BtnPlayAgain = "Play Again", BtnBackToHome = "Back to Home",
        SettingsTitle = "Settings", SectionLanguage = "Language", SectionRegion = "Regional Rules",
        SectionChiChi = "Chi Chi Rules", SectionGa = "Ga (bonus bet)",
        SectionU411 = "U 4-11", SectionSpeed = "Animation Speed",
        LangVietnamese = "Tiếng Việt", LangEnglish = "English",
        GaOn = "On", GaOff = "Off", U411Off = "Off", U411On = "4 points",
        BtnSave = "Save", BtnBack = "Back",
        SpeedSlow = "Slow", SpeedNormal = "Normal", SpeedFast = "Fast",
        PileEmpty = "Empty", PileDiscard = "Discard",
        ErrNocEmpty = "Draw pile is empty", ErrCannotDiscardChan = "Cannot discard a Chan card",
        ErrNoCardToEat = "No card to eat", ErrNoCardToChiu = "No card to chiu",
        ErrChiuNeed3 = "Need 3 matching cards to chiu",
    };

    public string AppName { get; init; } = "";
    public string AppSubtitle { get; init; } = "";
    public string Play { get; init; } = "";
    public string SettingsMenu { get; init; } = "";
    public string StartGame { get; init; } = "";
    public string StartPrompt { get; init; } = "";
    public string StartMessage { get; init; } = "";
    public string BackToHome { get; init; } = "";
    public string TopBarTitle { get; init; } = "";
    public string CardCount { get; init; } = "";
    public string MeldCount { get; init; } = "";
    public string YourTurn { get; init; } = "";
    public string TurnOf { get; init; } = "";
    public string ChanLabel { get; init; } = "";
    public string CaLabel { get; init; } = "";
    public string BaDauLabel { get; init; } = "";
    public string QueLabel { get; init; } = "";
    public string DiscardInfo { get; init; } = "";
    public string BtnDraw { get; init; } = "";
    public string BtnEat { get; init; } = "";
    public string BtnChiu { get; init; } = "";
    public string BtnDiscard { get; init; } = "";
    public string BtnPass { get; init; } = "";
    public string BtnDeclareU { get; init; } = "";
    public string HandLabel { get; init; } = "";
    public string DiscardHint { get; init; } = "";
    public string MsgDraw { get; init; } = "";
    public string MsgEatError { get; init; } = "";
    public string MsgEat { get; init; } = "";
    public string MsgChiu { get; init; } = "";
    public string MsgDiscarded { get; init; } = "";
    public string MsgPassed { get; init; } = "";
    public string WinTitle { get; init; } = "";
    public string LoseTitle { get; init; } = "";
    public string WinSubtitle { get; init; } = "";
    public string ScoreLabel { get; init; } = "";
    public string DichLabel { get; init; } = "";
    public string GaLabel { get; init; } = "";
    public string GameRestored { get; init; } = "";
    public string DrawTitle { get; init; } = "";
    public string DrawSubtitle { get; init; } = "";
    public string BtnPlayAgain { get; init; } = "";
    public string BtnBackToHome { get; init; } = "";
    public string SettingsTitle { get; init; } = "";
    public string SectionLanguage { get; init; } = "";
    public string SectionRegion { get; init; } = "";
    public string SectionChiChi { get; init; } = "";
    public string SectionGa { get; init; } = "";
    public string SectionU411 { get; init; } = "";
    public string SectionSpeed { get; init; } = "";
    public string LangVietnamese { get; init; } = "";
    public string LangEnglish { get; init; } = "";
    public string GaOn { get; init; } = "";
    public string GaOff { get; init; } = "";
    public string U411Off { get; init; } = "";
    public string U411On { get; init; } = "";
    public string BtnSave { get; init; } = "";
    public string BtnBack { get; init; } = "";
    public string SpeedSlow { get; init; } = "";
    public string SpeedNormal { get; init; } = "";
    public string SpeedFast { get; init; } = "";
    public string PileEmpty { get; init; } = "";
    public string PileDiscard { get; init; } = "";
    public string ErrNocEmpty { get; init; } = "";
    public string ErrCannotDiscardChan { get; init; } = "";
    public string ErrNoCardToEat { get; init; } = "";
    public string ErrNoCardToChiu { get; init; } = "";
    public string ErrChiuNeed3 { get; init; } = "";
}
