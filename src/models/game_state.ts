import { Card } from './card';
import { Hand } from './hand';
import { Deck } from './deck';
import { Meld } from './meld';

export enum GamePhase {
  Setup = 'setup',
  Dealing = 'dealing',
  Playing = 'playing',
  Finished = 'finished',
}

export enum PlayerAction {
  Draw = 'draw',       // Bốc from Nọc
  Eat = 'eat',         // Ăn from discard pile
  Chiu = 'chiu',       // Chíu (4 of a kind)
  Discard = 'discard', // Đánh a card
  Pass = 'pass',       // Không ăn (pass turn)
  DeclareU = 'declare_u', // Declare Ù
}

export interface Player {
  readonly id: number;
  readonly name: string;
  readonly isHuman: boolean;
  readonly hand: Hand;
  readonly melds: Meld[];  // Revealed melds on table
}

export interface TurnState {
  readonly currentPlayerId: number;
  readonly phase: GamePhase;
  readonly lastAction: PlayerAction | null;
  readonly lastDiscardedCard: Card | null;
  readonly drawnCard: Card | null;
  readonly canEat: boolean;
  readonly canChiu: boolean;
  readonly hasDrawnThisTurn: boolean;
  readonly consecutivePasses: number; // for detecting a stalled/drawn round (hòa)
}

export interface GameState {
  readonly players: Player[];
  readonly deck: Deck;
  readonly turn: TurnState;
  readonly roundNumber: number;
  readonly consecutiveWins: number[];
  readonly winner: number | null;
}

export function createGameState(
  playerNames: string[],
  humanPlayerIndex: number = 0
): GameState {
  const players: Player[] = playerNames.map((name, i) => ({
    id: i,
    name,
    isHuman: i === humanPlayerIndex,
    hand: { cards: [] },
    melds: [],
  }));

  return {
    players,
    deck: { cards: [], drawPile: [], discardPile: [] },
    turn: {
      currentPlayerId: 0,
      phase: GamePhase.Setup,
      lastAction: null,
      lastDiscardedCard: null,
      drawnCard: null,
      canEat: false,
      canChiu: false,
      hasDrawnThisTurn: false,
      consecutivePasses: 0,
    },
    roundNumber: 1,
    consecutiveWins: playerNames.map(() => 0),
    winner: null,
  };
}
