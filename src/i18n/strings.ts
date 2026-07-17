export type Language = 'vi' | 'en';

export interface AppStrings {
  // App
  appName: string;
  appSubtitle: string;

  // Home screen
  play: string;
  settingsMenu: string;
  footerPlayers: string;

  // Game screen
  startGame: string;
  startPrompt: string;
  startMessage: string;
  backToHome: string;
  topBarTitle: string;
  cardCount: string;
  meldCount: string;
  yourTurn: string;
  turnOf: string;

  // Meld labels
  chanLabel: string;
  caLabel: string;
  baDauLabel: string;
  queLabel: string;

  // Discard info
  discardInfo: string;

  // Action buttons
  btnDraw: string;
  btnEat: string;
  btnChiu: string;
  btnDiscard: string;
  btnPass: string;
  btnDeclareU: string;

  // Hand label
  handLabel: string;
  discardHint: string;

  // Status messages
  msgDraw: string;
  msgEatError: string;
  msgEat: string;
  msgChiu: string;
  msgDiscarded: string;
  msgPassed: string;
  msgYouWin: string;

  // Win modal
  winTitle: string;
  loseTitle: string;
  winSubtitle: string;
  scoreLabel: string;
  dichLabel: string;
  gaLabel: string;
  btnPlayAgain: string;
  btnBackToHome: string;

  // Settings screen
  settingsTitle: string;
  sectionLanguage: string;
  sectionRegion: string;
  sectionChiChi: string;
  sectionGa: string;
  sectionU411: string;
  sectionU411Hint: string;
  sectionSpeed: string;
  langVietnamese: string;
  langEnglish: string;
  gaOn: string;
  gaOff: string;
  u411Off: string;
  u411On: string;
  btnBack: string;
  btnSave: string;
  speedSlow: string;
  speedNormal: string;
  speedFast: string;

  // Card pile
  pileEmpty: string;
  pileDiscard: string;

  // Region names
  regionNorth: string;
  regionSouth: string;
  regionCentral: string;

  // Chi Chi mode names
  chiChiWild: string;
  chiChiBonus: string;
  chiChiLimited: string;

  // Card rank names
  rankNhi: string;
  rankTam: string;
  rankTu: string;
  rankNgu: string;
  rankLuc: string;
  rankThat: string;
  rankBat: string;
  rankCuu: string;
  rankChi: string;

  // Card suit names
  suitVan: string;
  suitVan2: string;
  suitSach: string;

  // Cuoc (scoring combo) names
  cuocXuong: string;
  cuocUThong: string;
  cuocChi: string;
  cuocThienU: string;
  cuocDiaU: string;
  cuocTom: string;
  cuocLeo: string;
  cuocBachThu: string;
  cuocBachThuChi: string;
  cuocThienKhai: string;
  cuocChiu: string;
  cuocAnBon: string;
  cuocBachDinh: string;
  cuocDoRed: string;
  cuocKinhTuChi: string;
  cuocThapThanh: string;

  // Player names
  playerYou: string;
  playerAI1: string;
  playerAI2: string;
  playerAI3: string;

  // Error messages (from engine)
  errNocEmpty: string;
  errNoCardToChiu: string;
  errChiuNeed3: string;
  errCannotDiscardChan: string;
  errNoCardToEat: string;
  errCannotFormChan: string;
  errCannotFormCa: string;
  errCannotFormCaUseChan: string;
  errCannotFormBaDauRank: string;
  errCannotFormBaDauSuits: string;

  // Persistent state
  continueGame: string;
  savedAt: string;
  gameRestored: string;

  // Draw/stall
  drawTitle: string;
  drawSubtitle: string;
}

const vi: AppStrings = {
  appName: 'Chắn',
  appSubtitle: 'Dân Gian',

  play: 'Chơi',
  settingsMenu: '⚙️ Luật chơi & Cài đặt',
  footerPlayers: '1 người chơi vs 3 AI',

  startGame: 'Bắt đầu chơi',
  startPrompt: 'Nhấn "Bắt đầu" để chơi',
  startMessage: 'Bắt đầu! Bạn đi trước',
  backToHome: '← Về trang chủ',
  topBarTitle: 'Chắn Dân Gian',
  cardCount: 'lá',
  meldCount: 'phu',
  yourTurn: '🎮 Lượt bạn',
  turnOf: '🤖 ',

  chanLabel: 'Chắn: ',
  caLabel: 'Cạ: ',
  baDauLabel: 'Ba Đầu: ',
  queLabel: 'Què: ',

  discardInfo: 'Bài đánh: ',

  btnDraw: 'Bốc',
  btnEat: 'Ăn',
  btnChiu: 'Chíu',
  btnDiscard: 'Đánh',
  btnPass: 'Bỏ',
  btnDeclareU: 'Ù',

  handLabel: 'Bài của bạn (',
  discardHint: 'Chọn lá bài để đánh',

  msgDraw: 'Bạn đã bốc bài. Hãy đánh 1 lá',
  msgEatError: 'Không thể ăn bài này',
  msgEat: 'Bạn đã ăn bài. Hãy đánh 1 lá',
  msgChiu: 'Bạn đã chíu. Hãy đánh 1 lá',
  msgDiscarded: 'Đã đánh bài. Chờ lượt tiếp...',
  msgPassed: 'Đã bỏ lượt',
  msgYouWin: 'Bạn Ù!',

  winTitle: '🎉 Bạn thắng!',
  loseTitle: '😔 Bạn thua',
  winSubtitle: ' Ù — ',
  scoreLabel: 'Điểm: ',
  dichLabel: 'Dì: ',
  gaLabel: 'Gà: ',
  btnPlayAgain: 'Chơi lại',
  btnBackToHome: 'Về trang chủ',

  settingsTitle: 'Cài đặt',
  sectionLanguage: 'Ngôn ngữ',
  sectionRegion: 'Quy tắc vùng miền',
  sectionChiChi: 'Luật Chi Chi',
  sectionGa: 'Gà (cược thêm)',
  sectionU411: 'Ù 4-11',
  sectionU411Hint: 'Nếu bật, người Ù phải đạt ít nhất 4 điểm nếu không sẽ đền cho cả làng',
  sectionSpeed: 'Tốc độ hiệu ứng',
  langVietnamese: 'Tiếng Việt',
  langEnglish: 'English',
  gaOn: 'Bật',
  gaOff: 'Tắt',
  u411Off: 'Tắt',
  u411On: '4 điểm',
  btnBack: 'Quay lại',
  btnSave: 'Lưu',
  speedSlow: 'Chậm',
  speedNormal: 'Bình thường',
  speedFast: 'Nhanh',

  pileEmpty: 'Hết',
  pileDiscard: 'Rác',

  regionNorth: 'Bắc',
  regionSouth: 'Nam',
  regionCentral: 'Trung',

  chiChiWild: 'Tự do',
  chiChiBonus: 'Chỉ tính điểm',
  chiChiLimited: 'Giới hạn',

  rankNhi: 'Nhị',
  rankTam: 'Tam',
  rankTu: 'Tứ',
  rankNgu: 'Ngũ',
  rankLuc: 'Lục',
  rankThat: 'Thất',
  rankBat: 'Bát',
  rankCuu: 'Cửu',
  rankChi: 'Chi',

  suitVan: 'Vạn',
  suitVan2: 'Văn',
  suitSach: 'Sách',

  cuocXuong: 'Xuông',
  cuocUThong: 'Thông',
  cuocChi: 'Chì',
  cuocThienU: 'Thiên Ù',
  cuocDiaU: 'Địa Ù',
  cuocTom: 'Tôm',
  cuocLeo: 'Lèo',
  cuocBachThu: 'Bạch Thủ',
  cuocBachThuChi: 'Bạch Thủ Chi',
  cuocThienKhai: 'Thiên Khai',
  cuocChiu: 'Chíu',
  cuocAnBon: 'Ăn Bòn',
  cuocBachDinh: 'Bạch Định',
  cuocDoRed: '8 Đỏ',
  cuocKinhTuChi: 'Kính Tứ Chi',
  cuocThapThanh: 'Thập Thành',

  playerYou: 'Bạn',
  playerAI1: 'AI 1',
  playerAI2: 'AI 2',
  playerAI3: 'AI 3',

  errNocEmpty: 'Nọc hết bài',
  errNoCardToChiu: 'Không có bài để chíu',
  errChiuNeed3: 'Cần có 3 lá giống nhau để chíu',
  errCannotDiscardChan: 'Không thể đánh bài Chăn',
  errNoCardToEat: 'Không có bài để ăn',
  errCannotFormChan: 'Không thể tạo Chăn',
  errCannotFormCa: 'Không thể tạo Cạ: cùng chất',
  errCannotFormCaUseChan: 'Không thể tạo Cạ: phải khác chất (dùng Chăn)',
  errCannotFormBaDauRank: 'Không thể tạo Ba Đầu: phải cùng hạng',
  errCannotFormBaDauSuits: 'Không thể tạo Ba Đầu: phải khác 3 chất',

  continueGame: 'Tiếp tục chơi',
  savedAt: 'Đã lưu: ',
  gameRestored: 'Trò chơi đã được khôi phục',

  drawTitle: 'Hòa!',
  drawSubtitle: 'Không còn bài để bốc',
};

const en: AppStrings = {
  appName: 'Chan',
  appSubtitle: 'Folk Game',

  play: 'Play',
  settingsMenu: '⚙️ Rules & Settings',
  footerPlayers: '1 player vs 3 AI',

  startGame: 'Start Game',
  startPrompt: 'Press "Start" to play',
  startMessage: 'Game started! You go first',
  backToHome: '← Back to Home',
  topBarTitle: 'Chan Folk Game',
  cardCount: 'cards',
  meldCount: 'melds',
  yourTurn: '🎮 Your turn',
  turnOf: '🤖 ',

  chanLabel: 'Chan: ',
  caLabel: 'Ca: ',
  baDauLabel: 'Ba Dau: ',
  queLabel: 'Que: ',

  discardInfo: 'Discarded: ',

  btnDraw: 'Draw',
  btnEat: 'Eat',
  btnChiu: 'Chiu',
  btnDiscard: 'Discard',
  btnPass: 'Pass',
  btnDeclareU: 'Ù',

  handLabel: 'Your hand (',
  discardHint: 'Select a card to discard',

  msgDraw: 'You drew a card. Discard 1 card',
  msgEatError: 'Cannot eat this card',
  msgEat: 'You ate a card. Discard 1 card',
  msgChiu: 'You chiu-ed. Discard 1 card',
  msgDiscarded: 'Card discarded. Waiting...',
  msgPassed: 'Turn passed',
  msgYouWin: 'You won!',

  winTitle: '🎉 You win!',
  loseTitle: '😔 You lose',
  winSubtitle: ' won — ',
  scoreLabel: 'Score: ',
  dichLabel: 'Dich: ',
  gaLabel: 'Ga: ',
  btnPlayAgain: 'Play Again',
  btnBackToHome: 'Back to Home',

  settingsTitle: 'Settings',
  sectionLanguage: 'Language',
  sectionRegion: 'Regional Rules',
  sectionChiChi: 'Chi Chi Rules',
  sectionGa: 'Ga (bonus bet)',
  sectionU411: 'U 4-11',
  sectionU411Hint: 'If enabled, the winner must score at least 4 points or pay the whole table',
  sectionSpeed: 'Animation Speed',
  langVietnamese: 'Tiếng Việt',
  langEnglish: 'English',
  gaOn: 'On',
  gaOff: 'Off',
  u411Off: 'Off',
  u411On: '4 points',
  btnBack: 'Back',
  btnSave: 'Save',
  speedSlow: 'Slow',
  speedNormal: 'Normal',
  speedFast: 'Fast',

  pileEmpty: 'Empty',
  pileDiscard: 'Discard',

  regionNorth: 'North',
  regionSouth: 'South',
  regionCentral: 'Central',

  chiChiWild: 'Wild',
  chiChiBonus: 'Bonus only',
  chiChiLimited: 'Limited',

  rankNhi: 'Nhi',
  rankTam: 'Tam',
  rankTu: 'Tu',
  rankNgu: 'Ngu',
  rankLuc: 'Luc',
  rankThat: 'That',
  rankBat: 'Bat',
  rankCuu: 'Cuu',
  rankChi: 'Chi Chi',

  suitVan: 'Van',
  suitVan2: 'Van',
  suitSach: 'Sach',

  cuocXuong: 'Xuong',
  cuocUThong: 'Thong',
  cuocChi: 'Chi',
  cuocThienU: 'Thien U',
  cuocDiaU: 'Dia U',
  cuocTom: 'Tom',
  cuocLeo: 'Leo',
  cuocBachThu: 'Bach Thu',
  cuocBachThuChi: 'Bach Thu Chi',
  cuocThienKhai: 'Thien Khai',
  cuocChiu: 'Chiu',
  cuocAnBon: 'An Bon',
  cuocBachDinh: 'Bach Dinh',
  cuocDoRed: '8 Red',
  cuocKinhTuChi: 'Kinh Tu Chi',
  cuocThapThanh: 'Thap Thanh',

  playerYou: 'You',
  playerAI1: 'AI 1',
  playerAI2: 'AI 2',
  playerAI3: 'AI 3',

  errNocEmpty: 'Draw pile is empty',
  errNoCardToChiu: 'No card to chiu',
  errChiuNeed3: 'Need 3 matching cards to chiu',
  errCannotDiscardChan: 'Cannot discard a Chan card',
  errNoCardToEat: 'No card to eat',
  errCannotFormChan: 'Cannot form Chan',
  errCannotFormCa: 'Cannot form Ca: same suit',
  errCannotFormCaUseChan: 'Cannot form Ca: must be different suits (use Chan)',
  errCannotFormBaDauRank: 'Cannot form Ba Dau: must be same rank',
  errCannotFormBaDauSuits: 'Cannot form Ba Dau: must be 3 different suits',

  continueGame: 'Continue',
  savedAt: 'Saved: ',
  gameRestored: 'Game restored',

  drawTitle: 'Draw!',
  drawSubtitle: 'No cards left to draw',
};

export const STRINGS: Record<Language, AppStrings> = { vi, en };
