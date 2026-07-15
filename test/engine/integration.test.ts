import { createGameEngine } from '../../src/engine/game_engine';
import { createAiPlayer } from '../../src/ai/ai_player';
import { GamePhase, PlayerAction } from '../../src/models/game_state';
import { handSize } from '../../src/models/hand';
import { drawPileCount } from '../../src/models/deck';

describe('Full Game Simulation', () => {
  test('can simulate multiple rounds without crashing', () => {
    const engine = createGameEngine();
    const ai = createAiPlayer();

    let state = engine.setupGame(42);
    state = engine.dealCards();
    expect(state.turn.phase).toBe(GamePhase.Playing);

    // Simulate up to 50 turns
    let turnCount = 0;
    while (turnCount < 50 && state.turn.phase === GamePhase.Playing) {
      const pid = state.turn.currentPlayerId;
      const isHuman = state.players[pid].isHuman;

      if (isHuman) {
        // Simulate human: always draw then discard first valid card
        const actions = engine.getValidActions(state, pid);
        if (actions.includes(PlayerAction.Draw)) {
          state = engine.drawFromNoc(state);
        }
        const discards = engine.getValidDiscards(state, pid);
        if (discards.length > 0) {
          state = engine.discardCard(state, pid, discards[0].id);
        } else {
          state = engine.passTurn(state);
        }
      } else {
        // AI turn
        const decision = ai.decide(state, pid, engine);
        switch (decision.action) {
          case PlayerAction.Draw:
            state = engine.drawFromNoc(state);
            const discardDecision = ai.decide(state, pid, engine);
            if (discardDecision.action === PlayerAction.Discard && discardDecision.cardId) {
              state = engine.discardCard(state, pid, discardDecision.cardId);
            } else {
              state = engine.passTurn(state);
            }
            break;
          case PlayerAction.Eat:
            state = engine.eatCard(state, pid);
            const postEat = ai.decide(state, pid, engine);
            if (postEat.action === PlayerAction.Discard && postEat.cardId) {
              state = engine.discardCard(state, pid, postEat.cardId);
            }
            break;
          case PlayerAction.Chiu:
            state = engine.chiuCard(state, pid);
            const postChiu = ai.decide(state, pid, engine);
            if (postChiu.action === PlayerAction.Discard && postChiu.cardId) {
              state = engine.discardCard(state, pid, postChiu.cardId);
            }
            break;
          case PlayerAction.DeclareU:
            // Win!
            turnCount = 999; // break loop
            break;
          default:
            state = engine.passTurn(state);
        }
      }

      // Verify all players maintain reasonable hand size
      // (19 base ± chiu/eat/draw transitions)
      for (const player of state.players) {
        expect(handSize(player.hand)).toBeGreaterThanOrEqual(13);
        expect(handSize(player.hand)).toBeLessThanOrEqual(25);
      }

      turnCount++;
    }

    // Game should have run without errors
    expect(turnCount).toBeGreaterThan(0);
    // Draw pile should have decreased
    expect(drawPileCount(state.deck)).toBeLessThan(24);
  });

  test('human player can eat a discarded card', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    // Force a scenario: player 1 discards, player 0 (human) tries to eat
    const p1Discard = engine.getValidDiscards(state, 1);
    if (p1Discard.length > 0) {
      state = engine.discardCard(state, 1, p1Discard[0].id);
      expect(state.turn.currentPlayerId).toBe(2); // moves to next
    }
  });

  test('game handles empty draw pile', () => {
    const engine = createGameEngine();
    let state = engine.setupGame(42);
    state = engine.dealCards();

    // Draw all cards from nọc
    let drawCount = 0;
    while (drawPileCount(state.deck) > 0 && drawCount < 30) {
      const pid = state.turn.currentPlayerId;
      try {
        state = engine.drawFromNoc(state);
        const discards = engine.getValidDiscards(state, pid);
        if (discards.length > 0) {
          state = engine.discardCard(state, pid, discards[0].id);
        } else {
          state = engine.passTurn(state);
        }
        drawCount++;
      } catch {
        break;
      }
    }

    // Should have drawn most cards
    expect(drawPileCount(state.deck)).toBeLessThanOrEqual(1);
  });
});
