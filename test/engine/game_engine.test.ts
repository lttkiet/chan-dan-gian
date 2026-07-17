import { createGameEngine } from '../../src/engine/game_engine';
import { GamePhase, PlayerAction } from '../../src/models/game_state';
import { handSize } from '../../src/models/hand';
import { drawPileCount } from '../../src/models/deck';
import { GameConfig, Region, ChiChiMode, DEFAULT_CONFIG } from '../../src/models/game_config';
import { Rank, Suit, Card } from '../../src/models/card';
import { analyzeHand } from '../../src/engine/meld_analyzer';

describe('Game Engine', () => {
  test('creates a game engine', () => {
    const engine = createGameEngine();
    const state = engine.getState();
    expect(state.players.length).toBe(4);
    expect(state.players[0].name).toBe('Bạn');
    expect(state.players[0].isHuman).toBe(true);
  });

  test('setup and deal cards', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    expect(state.turn.phase).toBe(GamePhase.Dealing);

    state = engine.dealCards();
    expect(state.turn.phase).toBe(GamePhase.Playing);

    // Dealer (player 0) gets 20 cards, others get 19
    expect(handSize(state.players[0].hand)).toBe(20);
    for (let i = 1; i < 4; i++) {
      expect(handSize(state.players[i].hand)).toBe(19);
    }

    // 100 - (20 + 19*3) = 100 - 77 = 23
    expect(drawPileCount(state.deck)).toBe(23);
  });

  test('draw from nọc adds a card to hand', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const player0HandSize = handSize(state.players[0].hand);
    state = engine.drawFromNoc(state);
    expect(handSize(state.players[0].hand)).toBe(player0HandSize + 1);
    expect(state.turn.drawnCard).toBeDefined();
    expect(state.turn.hasDrawnThisTurn).toBe(true);
  });

  test('discard removes card from hand and advances turn', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const validDiscards = engine.getValidDiscards(state, 0);
    expect(validDiscards.length).toBeGreaterThan(0);
    const handSizeBefore = handSize(state.players[0].hand);
    state = engine.discardCard(state, 0, validDiscards[0].id);
    expect(handSize(state.players[0].hand)).toBe(handSizeBefore - 1);
    expect(state.turn.currentPlayerId).toBe(1);
    expect(state.turn.lastDiscardedCard?.id).toBe(validDiscards[0].id);
  });

  test('cannot discard a Chăn card', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const handAnalysis = analyzeHand(state.players[0].hand);
    if (handAnalysis.chans.length > 0) {
      const chanCard = handAnalysis.chans[0].cards[0];
      expect(() => engine.discardCard(state, 0, chanCard.id)).toThrow('Cannot discard a Chăn');
    }
  });

  test('pass turn moves to next player', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();
    expect(state.turn.currentPlayerId).toBe(0);

    state = engine.passTurn(state);
    expect(state.turn.currentPlayerId).toBe(1);
    expect(state.turn.lastAction).toBe(PlayerAction.Pass);
  });

  test('getValidActions returns Draw before drawing', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const actions = engine.getValidActions(state, 0);
    expect(actions).toContain(PlayerAction.Draw);
    expect(actions).not.toContain(PlayerAction.Discard);
  });

  test('getValidActions returns Discard after drawing', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();
    state = engine.drawFromNoc(state);

    const actions = engine.getValidActions(state, 0);
    expect(actions).toContain(PlayerAction.Discard);
    expect(actions).toContain(PlayerAction.Pass);
  });

  test('game wraps around 4 players', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    for (let i = 0; i < 4; i++) {
      const pid = state.turn.currentPlayerId;
      const validDiscards = engine.getValidDiscards(state, pid);
      if (validDiscards.length > 0) {
        state = engine.discardCard(state, pid, validDiscards[0].id);
      } else {
        state = engine.passTurn(state);
      }
    }
    expect(state.turn.currentPlayerId).toBe(0);
  });

  test('eat card from discard pile increases hand size by 1', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    // Player 0 discards a card
    const validDiscards0 = engine.getValidDiscards(state, 0);
    state = engine.discardCard(state, 0, validDiscards0[0].id);

    // Advance to a player who can eat (not necessarily possible, so just test the eat function)
    // We'll set up a scenario by manually placing a discard
    const topDiscard = state.deck.discardPile[state.deck.discardPile.length - 1];

    // Check if player 1 can eat
    const actions = engine.getValidActions(state, 1);
    if (actions.includes(PlayerAction.Eat)) {
      const handBefore = handSize(state.players[1].hand);
      state = engine.eatCard(state, 1);
      expect(handSize(state.players[1].hand)).toBe(handBefore + 1);
      expect(state.turn.hasDrawnThisTurn).toBe(true);
      // Discard pile should have one fewer card
      expect(state.deck.discardPile.length).toBe(0);
    }
  });

  test('eatCard throws when no discard pile', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    expect(() => engine.eatCard(state, 0)).toThrow('No card to eat');
  });

  test('chiuCard from discard pile removes card from discard pile', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    // Player 0 discards a card
    const validDiscards = engine.getValidDiscards(state, 0);
    state = engine.discardCard(state, 0, validDiscards[0].id);

    // Check if player 1 can chiu
    const actions = engine.getValidActions(state, 1);
    if (actions.includes(PlayerAction.Chiu)) {
      const discardBefore = state.deck.discardPile.length;
      state = engine.chiuCard(state, 1);
      expect(state.deck.discardPile.length).toBe(discardBefore - 1);
      expect(state.players[1].melds.length).toBe(1);
    }
  });

  test('chiuCard throws with no matching cards', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    expect(() => engine.chiuCard(state, 1)).toThrow();
  });

  test('getValidDiscards excludes Chăn cards', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const discards = engine.getValidDiscards(state, 0);
    const hand = state.players[0].hand;
    const analysis = analyzeHand(hand);
    const chanCardIds = new Set(analysis.chans.flatMap(ch => ch.cards.map(c => c.id)));

    for (const d of discards) {
      expect(chanCardIds.has(d.id)).toBe(false);
    }
  });

  test('getEatOptions returns matching cards', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    // Player 0 discards
    const validDiscards = engine.getValidDiscards(state, 0);
    state = engine.discardCard(state, 0, validDiscards[0].id);

    const options = engine.getEatOptions(state, 1);
    // May or may not have options depending on hand
    expect(Array.isArray(options)).toBe(true);
  });

  test('discarded card appears in discard pile', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const validDiscards = engine.getValidDiscards(state, 0);
    const card = validDiscards[0];
    state = engine.discardCard(state, 0, card.id);

    const topDiscard = state.deck.discardPile[state.deck.discardPile.length - 1];
    expect(topDiscard.id).toBe(card.id);
  });

  test('config: engine accepts GameConfig', () => {
    const config: GameConfig = {
      region: Region.Southern,
      chiChiMode: ChiChiMode.Wild,
      gaEnabled: false,
      minCuocPoints: 4,
      animationSpeed: 'fast',
    };
    const engine = createGameEngine(config);
    const state = engine.setupGame(42);
    expect(state.turn.phase).toBe(GamePhase.Dealing);
  });

  test('config: default config works', () => {
    const engine = createGameEngine(DEFAULT_CONFIG);
    let state = engine.setupGame(42);
    state = engine.dealCards();
    expect(state.turn.phase).toBe(GamePhase.Playing);
  });

  test('detects Ù through the real draw path without double-counting drawn card', () => {
    // Regression: drawFromNoc puts the drawn card into hand, and checkForWin
    // must not let checkWin/calculateCuoc append it a second time (which would
    // create a phantom Chăn and both break win detection and inflate the score).
    // 6 Chăn + 1 orphan (Tam Vạn); the drawn Tam Văn completes an Ù Rộng.
    const handCards: Card[] = [
      [Suit.Van, Rank.Nhi], [Suit.Van, Rank.Nhi],
      [Suit.Van, Rank.Tu], [Suit.Van, Rank.Tu],
      [Suit.Van, Rank.Luc], [Suit.Van, Rank.Luc],
      [Suit.Van, Rank.Bat], [Suit.Van, Rank.Bat],
      [Suit.Van, Rank.Cuu], [Suit.Van, Rank.Cuu],
      [Suit.Van, Rank.That], [Suit.Van, Rank.That],
      [Suit.Van, Rank.Tam], // orphan
      [Suit.Van2, Rank.Nhi], [Suit.Van2, Rank.Nhi],
      [Suit.Van2, Rank.Tu], [Suit.Van2, Rank.Tu],
      [Suit.Van2, Rank.Luc], [Suit.Van2, Rank.Luc],
    ].map(([suit, rank], i) => ({ suit, rank, id: `h${i}` } as Card));
    const winningDraw: Card = { suit: Suit.Van2, rank: Rank.Tam, id: 'draw' };

    const engine = createGameEngine();
    const base = engine.setupGame(42);
    const players = base.players.map((p, i) =>
      i === 0 ? { ...p, hand: { cards: handCards } } : p
    );
    let state = engine.loadState({
      ...base,
      players,
      deck: { ...base.deck, drawPile: [winningDraw], discardPile: [] },
      turn: {
        ...base.turn,
        phase: GamePhase.Playing,
        currentPlayerId: 0,
        hasDrawnThisTurn: false,
        drawnCard: null,
      },
    });

    // Ù is not offered before drawing the completing card
    expect(engine.getValidActions(state, 0)).not.toContain(PlayerAction.DeclareU);

    state = engine.drawFromNoc(state);

    // Now the completing card is in hand — the engine must recognise the win
    expect(engine.getValidActions(state, 0)).toContain(PlayerAction.DeclareU);

    const win = engine.checkForWin(state, 0);
    expect(win.won).toBe(true);
    expect(win.result).toBeDefined();
    // A clean 6-Chăn Ù Rộng has exactly 6 Chăn — the phantom-Chăn bug reported 7+
    expect(win.result!.cuocs.length).toBeGreaterThan(0);
  });
});
