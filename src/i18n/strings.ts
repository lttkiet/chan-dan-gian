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
  gaLabel: string;
  btnPlayAgain: string;
  btnBackToHome: string;

  // Settings screen
  settingsTitle: string;
  sectionRegion: string;
  sectionChiChi: string;
  sectionGa: string;
  sectionU411: string;
  sectionU411Hint: string;
  sectionSpeed: string;
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

  // Error messages
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
  gaLabel: 'Gà: ',
  btnPlayAgain: 'Chơi lại',
  btnBackToHome: 'Về trang chủ',

  settingsTitle: 'Cài đặt',
  sectionRegion: 'Quy tắc vùng miền',
  sectionChiChi: 'Luật Chi Chi',
  sectionGa: 'Gà (cược thêm)',
  sectionU411: 'Ù 4-11',
  sectionU411Hint: 'Nếu bật, người Ù phải đạt ít nhất 4 điểm nếu không sẽ đền cho cả làng',
  sectionSpeed: 'Tốc độ hiệu ứng',
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
  gaLabel: 'Ga: ',
  btnPlayAgain: 'Play Again',
  btnBackToHome: 'Back to Home',

  settingsTitle: 'Settings',
  sectionRegion: 'Regional Rules',
  sectionChiChi: 'Chi Chi Rules',
  sectionGa: 'Ga (bonus bet)',
  sectionU411: 'U 4-11',
  sectionU411Hint: 'If enabled, the winner must score at least 4 points or pay the whole table',
  sectionSpeed: 'Animation Speed',
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
};

export const STRINGS: Record<Language, AppStrings> = { vi, en };
