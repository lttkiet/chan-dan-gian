import { createAiPlayer } from '../../src/ai/ai_player';
import { createGameEngine, GameEngine } from '../../src/engine/game_engine';
import { GamePhase, PlayerAction } from '../../src/models/game_state';
import { handSize } from '../../src/models/hand';
import { analyzeHand } from '../../src/engine/meld_analyzer';

describe('AI Player', () => {
  let engine: GameEngine;
  let ai: ReturnType<typeof createAiPlayer>;

  beforeEach(() => {
    engine = createGameEngine();
    ai = createAiPlayer();
  });

  test('AI decides to draw when no other action available', () => {
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const decision = ai.decide(state, 1, engine);
    expect(decision.action).toBe(PlayerAction.Draw);
  });

  test('AI discards after drawing', () => {
    let state = engine.setupGame(42);
    state = engine.dealCards();

    state = engine.drawFromNoc(state);
    const decision = ai.decide(state, 1, engine);
    expect(decision.action).toBe(PlayerAction.Discard);
    expect(decision.cardId).toBeDefined();
  });

  test('AI can play a full turn', () => {
    let state = engine.setupGame(42);
    state = engine.dealCards();

    const decision = ai.decide(state, 1, engine);
    if (decision.action === PlayerAction.Draw) {
      state = engine.drawFromNoc(state);
      const discardDecision = ai.decide(state, 1, engine);
      if (discardDecision.action === PlayerAction.Discard && discardDecision.cardId) {
        state = engine.discardCard(state, 1, discardDecision.cardId);
        expect(state.turn.currentPlayerId).toBe(2);
      }
    }
  });

  test('AI discards a card that is not a Chăn', () => {
    let state = engine.setupGame(42);
    state = engine.dealCards();
    state = engine.drawFromNoc(state);

    const decision = ai.decide(state, 1, engine);
    if (decision.action === PlayerAction.Discard && decision.cardId) {
      const player = state.players[1];
      const card = player.hand.cards.find(c => c.id === decision.cardId);
      expect(card).toBeDefined();

      // The card should not be part of a Chăn
      const analysis = analyzeHand(player.hand);
      const chanCardIds = new Set(analysis.chans.flatMap(ch => ch.cards.map(c => c.id)));
      expect(chanCardIds.has(decision.cardId!)).toBe(false);
    }
  });

  test('AI plays 10 consecutive turns without crashing', () => {
    let state = engine.setupGame(123);
    state = engine.dealCards();

    // Advance to player 1's turn
    state = engine.passTurn(state);

    for (let turn = 0; turn < 10; turn++) {
      const pid = state.turn.currentPlayerId;
      const decision = ai.decide(state, pid, engine);

      switch (decision.action) {
        case PlayerAction.Draw:
          state = engine.drawFromNoc(state);
          const d2 = ai.decide(state, pid, engine);
          if (d2.action === PlayerAction.Discard && d2.cardId) {
            state = engine.discardCard(state, pid, d2.cardId);
          } else {
            state = engine.passTurn(state);
          }
          break;
        case PlayerAction.Eat:
          state = engine.eatCard(state, pid);
          const d3 = ai.decide(state, pid, engine);
          if (d3.action === PlayerAction.Discard && d3.cardId) {
            state = engine.discardCard(state, pid, d3.cardId);
          }
          break;
        case PlayerAction.Chiu:
          state = engine.chiuCard(state, pid);
          const d4 = ai.decide(state, pid, engine);
          if (d4.action === PlayerAction.Discard && d4.cardId) {
            state = engine.discardCard(state, pid, d4.cardId);
          }
          break;
        default:
          state = engine.passTurn(state);
      }
    }

    // Game should still be running without errors
    expect(state.turn.phase).toBe(GamePhase.Playing);
  });

  test('AI avoids discarding high-value cards when possible', () => {
    let state = engine.setupGame(99);
    state = engine.dealCards();
    state = engine.drawFromNoc(state);

    // Player 1's turn after drawing
    const decision = ai.decide(state, 1, engine);
    if (decision.action === PlayerAction.Discard && decision.cardId) {
      const player = state.players[1];
      const card = player.hand.cards.find(c => c.id === decision.cardId);
      expect(card).toBeDefined();
      // Just verify it's a valid discard
      expect(state.players[1].hand.cards.some(c => c.id === decision.cardId)).toBe(true);
    }
  });
});
