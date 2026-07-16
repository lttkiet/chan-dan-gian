import { Card, Rank, Suit } from '../models/card';
import { Hand, handSize, countByRank, countBySuit } from '../models/hand';
import { GameState, PlayerAction } from '../models/game_state';
import { analyzeHand, wouldFormChan, wouldFormCa, canChiu } from '../engine/meld_analyzer';
import { GameEngine } from '../engine/game_engine';

export interface AiDecision {
  action: PlayerAction;
  cardId?: string;
}

export interface AiPlayer {
  decide(state: GameState, playerId: number, engine: GameEngine): AiDecision;
}

function cardValue(card: Card, hand: Hand, state: GameState): number {
  let value = 0;

  const sameRankCount = countByRank(hand, card.rank);
  value += sameRankCount * 10;

  const sameSuitCount = countBySuit(hand, card.suit);
  value += sameSuitCount * 3;

  const discardedCount = state.deck.discardPile.filter(
    c => c.rank === card.rank && c.suit === card.suit
  ).length;
  // If 3 copies are already discarded, this card is dead weight (can never form Chăn)
  if (discardedCount >= 3) {
    value -= 50;
  } else if (discardedCount === 2) {
    value -= 15;
  }

  // Bonus for scoring cards
  if (card.rank === Rank.Chi) value += 8;
  if (card.rank === Rank.Cuu && card.suit === Suit.Van) value += 3;
  if (card.rank === Rank.That && card.suit === Suit.Van2) value += 3;

  // Penalty for isolated cards (no same-rank, no same-suit neighbor)
  const hasSameRank = sameRankCount > 1;
  const hasSameSuit = hand.cards.some(
    c => c.suit === card.suit && c.rank !== card.rank
  );
  if (!hasSameRank && !hasSameSuit) {
    value -= 15;
  }

  return value;
}

function isSafeDiscard(card: Card, state: GameState, playerId: number): boolean {
  const discardCount = state.deck.discardPile.filter(
    c => c.rank === card.rank && c.suit === card.suit
  ).length;

  // If 3+ of this card type are visible, it's safe
  if (discardCount >= 3) return true;

  // Chi Chi is risky
  if (card.rank === Rank.Chi) return false;

  // Edge ranks (2, 9) are slightly safer
  if (card.rank === Rank.Nhi || card.rank === Rank.Cuu) return true;

  // Cards that have been discarded once are somewhat safe
  if (discardCount === 1) return true;

  return false;
}

// Evaluate how many "steps" a card is from becoming useful
function discardDangerScore(
  card: Card,
  hand: Hand,
  state: GameState,
  analysis: ReturnType<typeof analyzeHand>,
  playerId: number
): number {
  let danger = 0;

  // Is the card part of a Chăn? (highest priority to keep)
  const inChan = analysis.chans.some(ch => ch.cards.some(c => c.id === card.id));
  if (inChan) return 1000; // Never discard Chăn

  // Is the card part of a Cạ?
  const inCa = analysis.cas.some(ca => ca.cards.some(c => c.id === card.id));
  if (inCa) danger += 40;

  // Is the card part of a Ba Đầu?
  const inBaDau = analysis.baDaus.some(bd => bd.cards.some(c => c.id === card.id));
  if (inBaDau) danger += 30;

  // How many cards of same rank? (2 = potential Chăn, 3 = can Chiu)
  const sameRank = countByRank(hand, card.rank);
  danger += sameRank * 15;

  // How many cards of same suit? (potential Cạ)
  const sameSuit = countBySuit(hand, card.suit);
  danger += sameSuit * 5;

  // Safe cards are less dangerous to discard
  if (isSafeDiscard(card, state, playerId)) {
    danger -= 20;
  }

  // Already discarded copies make it safer
  const discardedCount = state.deck.discardPile.filter(
    c => c.rank === card.rank && c.suit === card.suit
  ).length;
  danger -= discardedCount * 10;

  return danger;
}

function chooseDiscard(hand: Hand, state: GameState, playerId: number): Card | null {
  const analysis = analyzeHand(hand);

  const chanCardIds = new Set(
    analysis.chans.flatMap(ch => ch.cards.map(c => c.id))
  );
  const discardable = hand.cards.filter(c => !chanCardIds.has(c.id));

  if (discardable.length === 0) return null;

  const scored = discardable.map(card => ({
    card,
    score: evaluateDiscardScore(card, hand, state, analysis, playerId),
  }));

  scored.sort((a, b) => a.score - b.score);
  return scored[0].card;
}

function evaluateDiscardScore(
  card: Card,
  hand: Hand,
  state: GameState,
  analysis: ReturnType<typeof analyzeHand>,
  playerId: number
): number {
  let score = 0;

  // Value of keeping the card
  score -= cardValue(card, hand, state);

  // Danger of discarding (lower = safer to discard)
  score += discardDangerScore(card, hand, state, analysis, playerId);

  // Bonus for safe discards
  if (isSafeDiscard(card, state, playerId)) {
    score -= 15;
  }

  return score;
}

export function createAiPlayer(): AiPlayer {
  return {
    decide(state: GameState, playerId: number, engine: GameEngine): AiDecision {
      const player = state.players[playerId];
      const hand = player.hand;
      const actions = engine.getValidActions(state, playerId);

      if (actions.includes(PlayerAction.DeclareU)) {
        return { action: PlayerAction.DeclareU };
      }

      if (actions.includes(PlayerAction.Chiu)) {
        return { action: PlayerAction.Chiu };
      }

      if (actions.includes(PlayerAction.Eat)) {
        const lastDiscard = state.deck.discardPile[state.deck.discardPile.length - 1];
        if (lastDiscard) {
          const eatOpts = engine.getEatOptions(state, playerId);
          if (eatOpts.length > 0) {
            if (wouldFormChan(hand, lastDiscard)) {
              return { action: PlayerAction.Eat };
            }
            if (wouldFormCa(hand, lastDiscard)) {
              const analysis = analyzeHand(hand);
              if (analysis.chanCount < 6) {
                return { action: PlayerAction.Eat };
              }
            }
          }
        }
      }

      if (actions.includes(PlayerAction.Draw)) {
        return { action: PlayerAction.Draw };
      }

      if (actions.includes(PlayerAction.Discard)) {
        const discardCard = chooseDiscard(hand, state, playerId);
        if (discardCard) {
          return { action: PlayerAction.Discard, cardId: discardCard.id };
        }
      }

      return { action: PlayerAction.Pass };
    },
  };
}
