import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CardHand } from '../components/CardHand';
import { CardPile } from '../components/CardPile';
import { createGameEngine, GameEngine } from '../engine/game_engine';
import { createAiPlayer } from '../ai/ai_player';
import { GameState, GamePhase, PlayerAction } from '../models/game_state';
import { Card } from '../models/card';
import { handSize } from '../models/hand';
import { drawPileCount } from '../models/deck';
import { analyzeHand } from '../engine/meld_analyzer';
import { GameConfig, DEFAULT_CONFIG } from '../models/game_config';
import { CuocResult } from '../engine/scoring';
import { useTranslation } from '../i18n';

interface GameScreenProps {
  config?: GameConfig;
  onOpenSettings?: () => void;
  onBackToHome?: () => void;
}

export default function GameScreen({ config = DEFAULT_CONFIG, onOpenSettings, onBackToHome }: GameScreenProps) {
  const { t } = useTranslation();
  const [engine] = useState(() => createGameEngine(config));
  const [ai] = useState(() => createAiPlayer());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [message, setMessage] = useState(t.startPrompt);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: string;
    isHumanWin: boolean;
    winType: string;
    cuocResult?: CuocResult;
  } | null>(null);
  const [pendingDiscard, setPendingDiscard] = useState(false);

  const startGame = useCallback(() => {
    let state = engine.setupGame(Date.now());
    state = engine.dealCards();
    setGameState(state);
    setGameStarted(true);
    setSelectedCard(null);
    setPendingDiscard(false);
    setMessage(t.startMessage);
  }, [engine, t]);

  const resetGame = () => {
    setGameResult(null);
    setGameStarted(false);
    setGameState(null);
    setSelectedCard(null);
    setPendingDiscard(false);
    setMessage(t.startPrompt);
  };

  const goHome = () => {
    resetGame();
    onBackToHome?.();
  };

  // AI turn
  useEffect(() => {
    if (!gameState || !gameStarted || gameResult) return;
    const currentPlayer = gameState.players[gameState.turn.currentPlayerId];
    if (currentPlayer.isHuman) return;
    if (gameState.turn.phase !== GamePhase.Playing) return;

    const timer = setTimeout(() => {
      runAiTurn(gameState.turn.currentPlayerId);
    }, 800);

    return () => clearTimeout(timer);
  }, [gameState?.turn.currentPlayerId, gameStarted, gameResult]);

  const runAiTurn = (playerId: number) => {
    if (!gameState) return;

    const decision = ai.decide(gameState, playerId, engine);
    let newState = gameState;

    switch (decision.action) {
      case PlayerAction.Draw:
        newState = engine.drawFromNoc(newState);
        const discardDecision = ai.decide(newState, playerId, engine);
        if (discardDecision.action === PlayerAction.Discard && discardDecision.cardId) {
          newState = engine.discardCard(newState, playerId, discardDecision.cardId);
        } else {
          newState = engine.passTurn(newState);
        }
        break;
      case PlayerAction.Eat:
        newState = engine.eatCard(newState, playerId);
        const postEatDecision = ai.decide(newState, playerId, engine);
        if (postEatDecision.action === PlayerAction.Discard && postEatDecision.cardId) {
          newState = engine.discardCard(newState, playerId, postEatDecision.cardId);
        }
        break;
      case PlayerAction.Chiu:
        newState = engine.chiuCard(newState, playerId);
        const postChiuDecision = ai.decide(newState, playerId, engine);
        if (postChiuDecision.action === PlayerAction.Discard && postChiuDecision.cardId) {
          newState = engine.discardCard(newState, playerId, postChiuDecision.cardId);
        }
        break;
      default:
        newState = engine.passTurn(newState);
    }

    // Check for win after AI action
    const winCheck = engine.checkForWin(newState, playerId);
    if (winCheck.won) {
      const winnerName = newState.players[playerId].name;
      const isHumanWin = newState.players[playerId].isHuman;
      setMessage(`${winnerName} ${t.winSubtitle}${winCheck.winType}`);
      setGameResult({
        winner: winnerName,
        isHumanWin,
        winType: winCheck.winType,
        cuocResult: winCheck.result,
      });
    }

    setGameState(newState);
  };

  const handleDraw = () => {
    if (!gameState || gameState.turn.currentPlayerId !== 0) return;
    try {
      const newState = engine.drawFromNoc(gameState);
      setGameState(newState);
      setMessage(t.msgDraw);
      setPendingDiscard(true);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleEat = () => {
    if (!gameState || gameState.turn.currentPlayerId !== 0) return;
    const actions = engine.getValidActions(gameState, 0);
    if (!actions.includes(PlayerAction.Eat)) {
      setMessage(t.msgEatError);
      return;
    }
    try {
      const newState = engine.eatCard(gameState, 0);
      setGameState(newState);
      setMessage(t.msgEat);
      setPendingDiscard(true);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleChiu = () => {
    if (!gameState || gameState.turn.currentPlayerId !== 0) return;
    try {
      const newState = engine.chiuCard(gameState, 0);
      setGameState(newState);

      const winCheck = engine.checkForWin(newState, 0);
      if (winCheck.won) {
        setMessage(t.msgYouWin);
        setGameResult({
          winner: t.appName,
          isHumanWin: true,
          winType: winCheck.winType,
          cuocResult: winCheck.result,
        });
        return;
      }

      setMessage(t.msgChiu);
      setPendingDiscard(true);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleCardPress = (card: Card) => {
    if (!gameState || gameState.turn.currentPlayerId !== 0) return;
    if (pendingDiscard) {
      setSelectedCard(selectedCard === card.id ? null : card.id);
    }
  };

  const handleDiscard = () => {
    if (!gameState || !selectedCard) return;
    try {
      const newState = engine.discardCard(gameState, 0, selectedCard);
      setGameState(newState);
      setSelectedCard(null);
      setPendingDiscard(false);

      const winCheck = engine.checkForWin(newState, 0);
      if (winCheck.won) {
        setMessage(t.msgYouWin);
        setGameResult({
          winner: t.appName,
          isHumanWin: true,
          winType: winCheck.winType,
          cuocResult: winCheck.result,
        });
        return;
      }

      setMessage(t.msgDiscarded);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handlePass = () => {
    if (!gameState) return;
    const newState = engine.passTurn(gameState);
    setGameState(newState);
    setSelectedCard(null);
    setPendingDiscard(false);
    setMessage(t.msgPassed);
  };

  if (!gameState || !gameStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t.appName} {t.appSubtitle}</Text>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>{t.startGame}</Text>
        </TouchableOpacity>
        {onOpenSettings && (
          <TouchableOpacity style={styles.navButton} onPress={onOpenSettings}>
            <Text style={styles.navButtonText}>{t.settingsMenu}</Text>
          </TouchableOpacity>
        )}
        {onBackToHome && (
          <TouchableOpacity style={[styles.navButton, { marginTop: 12 }]} onPress={goHome}>
            <Text style={styles.navButtonText}>{t.backToHome}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const humanHand = gameState.players[0].hand.cards;
  const topDiscard = gameState.deck.discardPile.length > 0
    ? gameState.deck.discardPile[gameState.deck.discardPile.length - 1]
    : null;
  const analysis = analyzeHand(gameState.players[0].hand);
  const isMyTurn = gameState.turn.currentPlayerId === 0;
  const actions = isMyTurn ? engine.getValidActions(gameState, 0) : [];

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={goHome}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t.topBarTitle}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* AI players */}
      <View style={styles.aiRow}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[
            styles.aiPlayer,
            gameState.turn.currentPlayerId === i && styles.aiPlayerActive,
          ]}>
            <Text style={styles.aiName}>{gameState.players[i].name}</Text>
            <Text style={styles.cardCount}>{handSize(gameState.players[i].hand)} {t.cardCount}</Text>
            {gameState.players[i].melds.length > 0 && (
              <Text style={styles.meldCount}>{gameState.players[i].melds.length} {t.meldCount}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{message}</Text>
        <Text style={styles.turnText}>
          {isMyTurn ? t.yourTurn : `${t.turnOf}${gameState.players[gameState.turn.currentPlayerId].name}`}
        </Text>
      </View>

      {/* Meld info */}
      <View style={styles.meldInfo}>
        <Text style={styles.meldText}>{t.chanLabel}{analysis.chanCount}</Text>
        <Text style={styles.meldText}>{t.caLabel}{analysis.cas.length}</Text>
        <Text style={styles.meldText}>{t.baDauLabel}{analysis.baDaus.length}</Text>
        <Text style={styles.meldText}>{t.queLabel}{analysis.quanLes.length}</Text>
      </View>

      {/* Pile area */}
      <CardPile
        discardPile={gameState.deck.discardPile}
        drawPileCount={drawPileCount(gameState.deck)}
        onDrawPress={handleDraw}
      />

      {/* Last discard info */}
      {topDiscard && (
        <Text style={styles.discardInfo}>
          {t.discardInfo}{topDiscard.rank} {topDiscard.suit}
        </Text>
      )}

      {/* Action buttons */}
      {isMyTurn && !gameResult && (
        <View style={styles.actions}>
          {!pendingDiscard && actions.includes(PlayerAction.Draw) && (
            <TouchableOpacity style={styles.actionButton} onPress={handleDraw}>
              <Text style={styles.actionText}>{t.btnDraw}</Text>
            </TouchableOpacity>
          )}
          {!pendingDiscard && actions.includes(PlayerAction.Eat) && (
            <TouchableOpacity style={[styles.actionButton, styles.eatButton]} onPress={handleEat}>
              <Text style={styles.actionText}>{t.btnEat}</Text>
            </TouchableOpacity>
          )}
          {!pendingDiscard && actions.includes(PlayerAction.Chiu) && (
            <TouchableOpacity style={[styles.actionButton, styles.chiuButton]} onPress={handleChiu}>
              <Text style={styles.actionText}>{t.btnChiu}</Text>
            </TouchableOpacity>
          )}
          {pendingDiscard && selectedCard && (
            <TouchableOpacity style={[styles.actionButton, styles.discardButton]} onPress={handleDiscard}>
              <Text style={styles.actionText}>{t.btnDiscard}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
            <Text style={styles.actionText}>{t.btnPass}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Player hand */}
      <View style={styles.handContainer}>
        <Text style={styles.handLabel}>{t.handLabel}{humanHand.length})</Text>
        <CardHand
          cards={humanHand}
          selectedCardId={selectedCard}
          onCardPress={handleCardPress}
        />
        {pendingDiscard && (
          <Text style={styles.discardHint}>{t.discardHint}</Text>
        )}
      </View>

      {/* Win/Lose Modal */}
      <Modal visible={gameResult !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, gameResult?.isHumanWin && styles.winText]}>
              {gameResult?.isHumanWin ? t.winTitle : t.loseTitle}
            </Text>
            <Text style={styles.modalSubtitle}>
              {gameResult?.winner} {t.winSubtitle}{gameResult?.winType}
            </Text>
            {gameResult?.cuocResult && (
              <View style={styles.cuocInfo}>
                <Text style={styles.cuocText}>
                  {t.scoreLabel}{gameResult.cuocResult.totalPoints} | Dì: {gameResult.cuocResult.totalDich}
                  {gameResult.cuocResult.gaCount > 0 ? ` | ${t.gaLabel}${gameResult.cuocResult.gaCount}` : ''}
                </Text>
                <Text style={styles.cuocList}>
                  {gameResult.cuocResult.cuocs.join(', ')}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
              <Text style={styles.modalButtonText}>{t.btnPlayAgain}</Text>
            </TouchableOpacity>
            {onBackToHome && (
              <TouchableOpacity style={[styles.modalButton, styles.modalHomeButton]} onPress={goHome}>
                <Text style={styles.modalButtonText}>{t.btnBackToHome}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#f1c40f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topBarTitle: {
    color: '#f1c40f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
    marginTop: 100,
  },
  startButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 40,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1c40f',
    alignSelf: 'center',
  },
  navButtonText: {
    color: '#f1c40f',
    fontSize: 16,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  aiPlayer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  aiPlayerActive: {
    borderColor: '#f1c40f',
    borderWidth: 1,
  },
  aiName: {
    color: '#ecf0f1',
    fontSize: 12,
    fontWeight: '600',
  },
  cardCount: {
    color: '#95a5a6',
    fontSize: 10,
  },
  meldCount: {
    color: '#27ae60',
    fontSize: 10,
  },
  statusBar: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    color: '#f1c40f',
    fontSize: 14,
    textAlign: 'center',
  },
  turnText: {
    color: '#ecf0f1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  meldInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  meldText: {
    color: '#ecf0f1',
    fontSize: 11,
  },
  discardInfo: {
    color: '#95a5a6',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  eatButton: {
    backgroundColor: '#27ae60',
  },
  chiuButton: {
    backgroundColor: '#8e44ad',
  },
  discardButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  handContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  handLabel: {
    color: '#ecf0f1',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  discardHint: {
    color: '#f39c12',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  winText: {
    color: '#f1c40f',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#95a5a6',
  },
  cuocInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  cuocText: {
    color: '#ecf0f1',
    fontSize: 14,
  },
  cuocList: {
    color: '#f39c12',
    fontSize: 12,
    marginTop: 4,
  },
  modalButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  modalHomeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#95a5a6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
