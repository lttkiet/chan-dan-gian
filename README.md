# Chắn Dân Gian

A traditional Vietnamese card game (Chắn) — single player vs 3 AI opponents.

## About

Chắn (also known as Chắn Dân Gian or "Folk Chan") is a classic Vietnamese tile/card game derived from the Chinese game Jong (忠). This implementation features a 100-card deck (25 unique cards × 4 copies) across 3 suits and 9 ranks.

## Features

- Full Chắn rules: Chăn, Cạ, Ba Đầu, Chíu, Què melds
- 16 scoring combinations (Cước): Xuông, Tôm, Lèo, Chì, Thiên Ù, Địa Ù, Bạch Thủ, Thập Thành, and more
- 3 win conditions: Ù Rộng, Bạch Thủ, Thiên Ù
- 3 AI opponents with heuristic-based decision engine
- Regional rule variants: Northern, Southern, Central
- Chi Chi mode options: Wild, Bonus Only, Limited
- Gà (bonus bet) and Ù 4-11 rule toggles
- Vietnamese and English language support
- Auto-save / restore game state
- Configurable animation speed

## Tech Stack

- **Framework:** Expo SDK 57 + React Native 0.86
- **Language:** TypeScript (strict mode)
- **UI:** React Native components with landscape layout
- **Persistence:** AsyncStorage for save/load
- **Testing:** Jest + ts-jest (~64 tests)
- **CI/CD:** GitHub Actions (lint, test, build, deploy)

## Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn

### Install

```bash
npm install
```

### Run

```bash
npm start          # Expo dev server
npm run web        # Web browser
npm run android    # Android device/emulator
npm run ios        # iOS simulator
```

### Test

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run lint       # Type check
```

## Project Structure

```
src/
├── ai/              # AI decision engine
├── components/      # Reusable UI components
├── engine/          # Game logic (engine, melds, scoring, win detection)
├── i18n/            # Vietnamese/English translations
├── models/          # Data types (card, deck, hand, meld, config)
├── screens/         # App screens (Home, Game, Settings)
└── utils/           # Storage, animation helpers
test/                # Test suites
```

## Game Rules

### Cards

25 unique cards × 4 copies = 100 cards total.
- 3 suits: **Vạn** (萬), **Văn** (文), **Sách** (策)
- 9 ranks: Nhị (2) through Chi (十)

### Melds

| Meld | Description |
|------|-------------|
| **Chăn** | 2 identical cards (same rank + suit) |
| **Cạ** | 2 cards of same rank, different suits |
| **Ba Đầu** | 3 cards of same rank, all 3 different suits |
| **Chíu** | 4 identical cards |
| **Què** | Unmatched single card |

### Win Conditions

- **Ù Rộng**: 6+ Chăn melds, no orphan cards
- **Bạch Thủ**: Exactly 5 Chăn + 4 Cạ + 1 orphan matching the drawn card
- **Thiên Ù**: Dealer's hand is complete at deal

### Scoring (Cước)

16 scoring combinations with varying point/dich values. The highest-point Cước determines the base score, with remaining Cước contributing dich points. Special rules apply for Thập Thành (sum all) and Ù Xuông (dich + 2).

## License

MIT
