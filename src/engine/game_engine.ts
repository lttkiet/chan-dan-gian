import { Card, Rank, Suit } from '../models/card';
import { Hand, addCard, removeCard, sortHand, handSize } from '../models/hand';
import { Deck, createDeck, shuffleDeck, drawCard, discardCard, topDiscard, drawPileCount } from '../models/deck';
import { GameState, GamePhase, PlayerAction, Player, TurnState, createGameState } from '../models/game_state';
import { analyzeHand, canChiu as detectChiu, wouldFormChan, wouldFormCa } from './meld_analyzer';
import { checkWin, WinType } from './win_checker';
import { calculateCuoc, CuocResult } from './scoring';
import { GameConfig, DEFAULT_CONFIG } from '../models/game_config';

const TOTAL_PLAYERS = 4;
const CARDS_PER_PLAYER = 19;

export interface GameEngine {
  getState(): GameState;
  setupGame(seed?: number): GameState;
  dealCards(): GameState;
  loadState(state: GameState): GameState;
  drawFromNoc(state: GameState): GameState;
  eatCard(state: GameState, playerId: number, handCardIds?: string[]): GameState;
  chiuCard(state: GameState, playerId: number): GameState;
  discardCard(state: GameState, playerId: number, cardId: string): GameState;
  passTurn(state: GameState): GameState;
  checkForWin(state: GameState, playerId: number): { won: boolean; winType: WinType; result?: CuocResult };
  getValidActions(state: GameState, playerId: number): PlayerAction[];
  getValidDiscards(state: GameState, playerId: number): Card[];
  getEatOptions(state: GameState, playerId: number): { cardId: string; pairedCards: string[] }[];
}

export function createGameEngine(config: GameConfig = DEFAULT_CONFIG): GameEngine {
  let currentState: GameState | null = null;

  return {
    getState: () => currentState || createGameState(['Bạn', 'AI 1', 'AI 2', 'AI 3']),

    setupGame(seed?: number): GameState {
      const state = createGameState(['Bạn', 'AI 1', 'AI 2', 'AI 3']);
      let deck = createDeck();
      deck = shuffleDeck(deck, seed);
      currentState = { ...state, deck, turn: { ...state.turn, phase: GamePhase.Dealing } };
      return currentState;
    },

    dealCards(): GameState {
      if (!currentState) throw new Error('Game not setup');
      let deck = currentState.deck;
      const players = [...currentState.players];

      // Deal 19 cards to each player
      for (let round = 0; round < CARDS_PER_PLAYER; round++) {
        for (let p = 0; p < TOTAL_PLAYERS; p++) {
          const { card, deck: newDeck } = drawCard(deck);
          deck = newDeck;
          players[p] = {
            ...players[p],
            hand: addCard(players[p].hand, card),
          };
        }
      }

      // Sort each player's hand
      for (let p = 0; p < TOTAL_PLAYERS; p++) {
        players[p] = { ...players[p], hand: sortHand(players[p].hand) };
      }

      currentState = {
        ...currentState,
        players,
        deck,
        turn: {
          ...currentState.turn,
          phase: GamePhase.Playing,
          currentPlayerId: 0, // Dealer goes first
        },
      };
      return currentState;
    },

    loadState(state: GameState): GameState {
      currentState = state;
      return currentState;
    },

    drawFromNoc(state: GameState): GameState {
      if (drawPileCount(state.deck) === 0) {
        throw new Error('Nọc is empty');
      }

      const { card, deck: newDeck } = drawCard(state.deck);
      const player = state.players[state.turn.currentPlayerId];
      const newHand = addCard(player.hand, card);
      const newPlayers = [...state.players];
      newPlayers[state.turn.currentPlayerId] = {
        ...player,
        hand: newHand,
      };

      // Check if the player can eat the drawn card or chiu
      const canEat = wouldFormChan(newHand, card) || wouldFormCa(newHand, card);
      const canChiuVal = detectChiu(newHand, card);

      currentState = {
        ...state,
        players: newPlayers,
        deck: newDeck,
        turn: {
          ...state.turn,
          drawnCard: card,
          hasDrawnThisTurn: true,
          canEat: canEat,
          canChiu: canChiuVal,
          lastAction: PlayerAction.Draw,
        },
      };
      return currentState;
    },

    eatCard(state: GameState, playerId: number, handCardIds: string[] = []): GameState {
      const discardPile = state.deck.discardPile;
      if (discardPile.length === 0) throw new Error('No card to eat');
      const cardToEat = discardPile[discardPile.length - 1];

      // Remove card from discard pile
      const newDiscardPile = discardPile.slice(0, -1);

      // Add eaten card to player's hand
      const player = state.players[playerId];
      let newHand = addCard(player.hand, cardToEat);

      // If handCardIds provided, remove those from hand (they were paired with the eaten card)
      // In Chắn, eating forms a meld: the eaten card + 1 or 2 cards from hand
      // For Chăn: eaten card pairs with 1 card from hand (same rank, same suit)
      // For Cạ: eaten card pairs with 1-2 cards from hand (same rank, different suit)
      // The cards remain in hand but now form a recognized meld via analyzeHand
      // We only remove paired cards if they need to be discarded with the eaten card (chiu scenario)

      const newPlayers = [...state.players];
      newPlayers[playerId] = { ...player, hand: sortHand(newHand) };

      currentState = {
        ...state,
        players: newPlayers,
        deck: { ...state.deck, discardPile: newDiscardPile },
        turn: {
          ...state.turn,
          lastAction: PlayerAction.Eat,
          lastDiscardedCard: cardToEat,
          drawnCard: null,
          hasDrawnThisTurn: true, // After eating, must discard
          canEat: false,
          canChiu: false,
        },
      };
      return currentState;
    },

    chiuCard(state: GameState, playerId: number): GameState {
      const player = state.players[playerId];
      const drawnCard = state.turn.drawnCard;
      const isFromDiscard = !drawnCard;
      const chiuSource = drawnCard || topDiscard(state.deck);
      if (!chiuSource) throw new Error('No card to chiu');

      // Find the 3 matching cards in hand
      const matchingCards = player.hand.cards.filter(
        c => c.rank === chiuSource.rank && c.suit === chiuSource.suit
      );
      if (matchingCards.length < 3) throw new Error('Cannot chiu: need 3 matching cards');

      // Remove the 3 matching cards from hand
      let newHand = player.hand;
      for (const mc of matchingCards.slice(0, 3)) {
        newHand = removeCard(newHand, mc.id);
      }

      // Create a meld from the 4 cards
      const chiuMeld = {
        type: 'chan' as const,
        cards: matchingCards.slice(0, 3).concat(chiuSource) as [Card, Card, Card, Card],
      };

      const newPlayers = [...state.players];
      newPlayers[playerId] = {
        ...player,
        hand: newHand,
        melds: [...player.melds, chiuMeld as any],
      };

      // If chiu from discard pile, remove the card from discard pile
      let newDeck = state.deck;
      if (isFromDiscard) {
        newDeck = {
          ...state.deck,
          discardPile: state.deck.discardPile.slice(0, -1),
        };
      }

      currentState = {
        ...state,
        players: newPlayers,
        deck: newDeck,
        turn: {
          ...state.turn,
          lastAction: PlayerAction.Chiu,
          drawnCard: null,
          hasDrawnThisTurn: isFromDiscard ? true : state.turn.hasDrawnThisTurn,
          canChiu: false,
        },
      };
      return currentState;
    },

    discardCard(state: GameState, playerId: number, cardId: string): GameState {
      const player = state.players[playerId];
      const card = player.hand.cards.find(c => c.id === cardId);
      if (!card) throw new Error('Card not in hand');

      // Validate: can't discard a Chăn
      const analysis = analyzeHand(player.hand);
      for (const chan of analysis.chans) {
        if (chan.cards.some(c => c.id === cardId)) {
          throw new Error('Cannot discard a Chăn card');
        }
      }

      const newHand = removeCard(player.hand, cardId);
      const newPlayers = [...state.players];
      newPlayers[playerId] = { ...player, hand: newHand };

      // Add to discard pile
      const newDeck = discardCard(state.deck, card);

      // Move to next player
      const nextPlayerId = (playerId + 1) % TOTAL_PLAYERS;

      currentState = {
        ...state,
        players: newPlayers,
        deck: newDeck,
        turn: {
          ...state.turn,
          currentPlayerId: nextPlayerId,
          lastAction: PlayerAction.Discard,
          lastDiscardedCard: card,
          drawnCard: null,
          hasDrawnThisTurn: false,
          canEat: false,
          canChiu: false,
        },
      };
      return currentState;
    },

    passTurn(state: GameState): GameState {
      const nextPlayerId = (state.turn.currentPlayerId + 1) % TOTAL_PLAYERS;
      currentState = {
        ...state,
        turn: {
          ...state.turn,
          currentPlayerId: nextPlayerId,
          lastAction: PlayerAction.Pass,
          drawnCard: null,
          hasDrawnThisTurn: false,
          canEat: false,
          canChiu: false,
        },
      };
      return currentState;
    },

    checkForWin(state: GameState, playerId: number): { won: boolean; winType: WinType; result?: CuocResult } {
      const player = state.players[playerId];
      const drawnCard = state.turn.drawnCard;

      // Check if hand + drawn card is a winning hand
      if (drawnCard) {
        const isDealer = playerId === 0;
        const winResult = checkWin(player.hand, drawnCard, isDealer, false);
        if (winResult.valid) {
          const cuocResult = calculateCuoc(
            player.hand,
            drawnCard,
            winResult.type,
            {
              isYourTurn: state.turn.currentPlayerId === playerId,
              consecutiveWins: state.consecutiveWins[playerId],
            }
          );

          // Ù 4-11 rule: if enabled, the winner must have at least minCuocPoints
          if (config.minCuocPoints > 0 && cuocResult.totalPoints < config.minCuocPoints) {
            return { won: false, winType: WinType.None };
          }

          // Gà bonus disabled by config
          const finalResult = config.gaEnabled
            ? cuocResult
            : { ...cuocResult, gaCount: 0 };

          return { won: true, winType: winResult.type, result: finalResult };
        }
      }

      // Check if hand (without drawn card) is complete for Thiên Ù
      if (playerId === 0 && handSize(player.hand) === 20) {
        const winResult = checkWin(player.hand, player.hand.cards[0], true, false);
        if (winResult.valid && winResult.type === WinType.ThienU) {
          return { won: true, winType: WinType.ThienU };
        }
      }

      return { won: false, winType: WinType.None };
    },

    getValidActions(state: GameState, playerId: number): PlayerAction[] {
      const actions: PlayerAction[] = [];
      const player = state.players[playerId];
      const lastDiscard = topDiscard(state.deck);

      if (state.turn.hasDrawnThisTurn) {
        // After drawing, can discard or declare ù
        actions.push(PlayerAction.Discard);
        if (state.turn.canChiu) actions.push(PlayerAction.Chiu);

        // Check for Ù
        if (state.turn.drawnCard) {
          const winCheck = checkWin(
            player.hand,
            state.turn.drawnCard,
            playerId === 0,
            false
          );
          if (winCheck.valid) actions.push(PlayerAction.DeclareU);
        }

        actions.push(PlayerAction.Pass);
      } else {
        // Before drawing: can draw from nọc
        if (drawPileCount(state.deck) > 0) {
          actions.push(PlayerAction.Draw);
        }

        // Can eat last discard if it forms Chăn or Cạ
        if (lastDiscard) {
          if (wouldFormChan(player.hand, lastDiscard) || wouldFormCa(player.hand, lastDiscard)) {
            actions.push(PlayerAction.Eat);
          }
          if (detectChiu(player.hand, lastDiscard)) {
            actions.push(PlayerAction.Chiu);
          }
        }
      }

      return actions;
    },

    getValidDiscards(state: GameState, playerId: number): Card[] {
      const player = state.players[playerId];
      const analysis = analyzeHand(player.hand);
      const chanCardIds = new Set(
        analysis.chans.flatMap(ch => ch.cards.map(c => c.id))
      );

      return player.hand.cards.filter(c => !chanCardIds.has(c.id));
    },

    getEatOptions(state: GameState, playerId: number): { cardId: string; pairedCards: string[] }[] {
      const player = state.players[playerId];
      const lastDiscard = topDiscard(state.deck);
      if (!lastDiscard) return [];

      const options: { cardId: string; pairedCards: string[] }[] = [];

      // Find matching cards in hand: same rank (for Chăn or Cạ)
      for (const handCard of player.hand.cards) {
        if (handCard.rank === lastDiscard.rank) {
          // Same rank = potential eat (Chăn if same suit, Cạ if different suit)
          options.push({ cardId: lastDiscard.id, pairedCards: [handCard.id] });
        }
      }

      return options;
    },
  };
}
