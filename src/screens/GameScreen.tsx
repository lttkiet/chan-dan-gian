import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardHand } from '../components/CardHand';
import { AISidePanel } from '../components/AISidePanel';
import { ActionPanel } from '../components/ActionPanel';
import { GameStatusBar } from '../components/GameStatusBar';
import { WinModal, GameResult } from '../components/WinModal';
import { createGameEngine, GameEngine } from '../engine/game_engine';
import { createAiPlayer } from '../ai/ai_player';
import { GameState, GamePhase, PlayerAction } from '../models/game_state';
import { Card } from '../models/card';
import { handSize } from '../models/hand';
import { drawPileCount } from '../models/deck';
import { analyzeHand } from '../engine/meld_analyzer';
import { GameConfig, DEFAULT_CONFIG } from '../models/game_config';
import { useTranslation } from '../i18n';
import { saveGame, clearGame, SavedGame } from '../utils/storage';
import { getAiDelay } from '../utils/animation';

interface GameScreenProps {
  config?: GameConfig;
  savedGame?: SavedGame | null;
  onOpenSettings?: () => void;
  onBackToHome?: () => void;
}

export default function GameScreen({ config = DEFAULT_CONFIG, savedGame, onOpenSettings, onBackToHome }: GameScreenProps) {
  const { t } = useTranslation();
  const [engine] = useState(() => createGameEngine(config, [t.playerYou, t.playerAI1, t.playerAI2, t.playerAI3]));
  const [ai] = useState(() => createAiPlayer());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [message, setMessage] = useState(t.startPrompt);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [pendingDiscard, setPendingDiscard] = useState(false);
  const gameStateRef = useRef<GameState | null>(null);
  const configRef = useRef(config);

  configRef.current = config;

  useEffect(() => {
    if (savedGame && !gameStarted) {
      engine.loadState(savedGame.gameState);
      setGameState(savedGame.gameState);
      setGameStarted(true);
      setMessage(t.gameRestored);
    }
  }, []);

  useEffect(() => {
    if (!gameState || !gameStarted || gameState.turn.phase !== GamePhase.Playing || gameResult) return;
    const timer = setTimeout(() => {
      saveGame(gameState, configRef.current);
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState, gameStarted, gameResult]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!gameState || !gameStarted || gameResult) return;
    if (gameState.turn.phase === GamePhase.Finished) {
      clearGame();
      setGameResult({
        winner: '',
        isHumanWin: false,
        isDraw: true,
        winType: '',
      });
    }
  }, [gameState?.turn.phase, gameStarted, gameResult]);

  const startGame = useCallback(() => {
    clearGame();
    let state = engine.setupGame(Date.now());
    state = engine.dealCards();
    setGameState(state);
    setGameStarted(true);
    setSelectedCard(null);
    setPendingDiscard(false);
    setMessage(t.startMessage);
  }, [engine, t]);

  const resetGame = () => {
    clearGame();
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

  useEffect(() => {
    if (!gameState || !gameStarted || gameResult) return;
    const currentPlayer = gameState.players[gameState.turn.currentPlayerId];
    if (currentPlayer.isHuman) return;
    if (gameState.turn.phase !== GamePhase.Playing) return;

    const timer = setTimeout(() => {
      runAiTurn(gameState.turn.currentPlayerId);
    }, getAiDelay(configRef.current));

    return () => clearTimeout(timer);
  }, [gameState?.turn.currentPlayerId, gameStarted, gameResult]);

  const runAiTurn = (playerId: number) => {
    const currentState = gameStateRef.current;
    if (!currentState) return;

    const decision = ai.decide(currentState, playerId, engine);
    let newState = currentState;

    switch (decision.action) {
      case PlayerAction.Draw:
        newState = engine.drawFromNoc(newState);
        if (tryDeclareWin(newState, playerId)) return;
        const discardDecision = ai.decide(newState, playerId, engine);
        if (discardDecision.action === PlayerAction.DeclareU) {
          if (tryDeclareWin(newState, playerId)) return;
        }
        if (discardDecision.action === PlayerAction.Discard && discardDecision.cardId) {
          newState = engine.discardCard(newState, playerId, discardDecision.cardId);
        } else {
          newState = engine.passTurn(newState);
        }
        break;
      case PlayerAction.Eat:
        newState = engine.eatCard(newState, playerId);
        const postEatDecision = ai.decide(newState, playerId, engine);
        if (postEatDecision.action === PlayerAction.DeclareU) {
          if (tryDeclareWin(newState, playerId)) return;
        }
        if (postEatDecision.action === PlayerAction.Discard && postEatDecision.cardId) {
          newState = engine.discardCard(newState, playerId, postEatDecision.cardId);
        }
        break;
      case PlayerAction.Chiu:
        newState = engine.chiuCard(newState, playerId);
        const postChiuDecision = ai.decide(newState, playerId, engine);
        if (postChiuDecision.action === PlayerAction.DeclareU) {
          if (tryDeclareWin(newState, playerId)) return;
        }
        if (postChiuDecision.action === PlayerAction.Discard && postChiuDecision.cardId) {
          newState = engine.discardCard(newState, playerId, postChiuDecision.cardId);
        }
        break;
      case PlayerAction.DeclareU:
        if (tryDeclareWin(newState, playerId)) return;
        break;
      default:
        newState = engine.passTurn(newState);
    }

    setGameState(newState);
  };

  const tryDeclareWin = (state: GameState, playerId: number): boolean => {
    const winCheck = engine.checkForWin(state, playerId);
    if (winCheck.won) {
      const winnerName = state.players[playerId].name;
      const isHumanWin = state.players[playerId].isHuman;
      setMessage(`${winnerName} ${t.winSubtitle}${winCheck.winType}`);
      clearGame();
      setGameResult({
        winner: winnerName,
        isHumanWin,
        winType: winCheck.winType,
        cuocResult: winCheck.result,
      });
      return true;
    }
    return false;
  };

  const getErrorMessage = (error: any): string => {
    const msg = String(error.message || error);
    if (msg.includes('Nọc is empty')) return t.errNocEmpty;
    if (msg.includes('No card to eat')) return t.errNoCardToEat;
    if (msg.includes('No card to chiu')) return t.errNoCardToChiu;
    if (msg.includes('need 3 matching')) return t.errChiuNeed3;
    if (msg.includes('Cannot discard a Chăn')) return t.errCannotDiscardChan;
    return msg;
  };

  const handleDraw = () => {
    if (!gameState || gameState.turn.currentPlayerId !== 0) return;
    try {
      const newState = engine.drawFromNoc(gameState);
      setGameState(newState);
      setMessage(t.msgDraw);
      setPendingDiscard(true);
    } catch (e: any) {
      setMessage(getErrorMessage(e));
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
      setMessage(getErrorMessage(e));
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
        clearGame();
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
      setMessage(getErrorMessage(e));
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
        clearGame();
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
      setMessage(getErrorMessage(e));
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

  const handleDeclareU = () => {
    if (!gameState) return;
    const winCheck = engine.checkForWin(gameState, 0);
    if (winCheck.won) {
      setMessage(t.msgYouWin);
      clearGame();
      setGameResult({
        winner: t.appName,
        isHumanWin: true,
        winType: winCheck.winType,
        cuocResult: winCheck.result,
      });
    }
  };

  if (!gameState || !gameStarted) {
    return (
      <View style={styles.preGame}>
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
  const topDiscardCard = gameState.deck.discardPile.length > 0
    ? gameState.deck.discardPile[gameState.deck.discardPile.length - 1]
    : null;
  const analysis = analyzeHand(gameState.players[0].hand);
  const isMyTurn = gameState.turn.currentPlayerId === 0;
  const actions = isMyTurn ? engine.getValidActions(gameState, 0) : [];

  const validDiscardIds = pendingDiscard && isMyTurn
    ? new Set(engine.getValidDiscards(gameState, 0).map(c => c.id))
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={goHome}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t.topBarTitle}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.mainArea}>
        <AISidePanel
          players={gameState.players}
          playerIds={[1]}
          currentPlayerId={gameState.turn.currentPlayerId}
          cardCountLabel={t.cardCount}
          meldCountLabel={t.meldCount}
        />

        <GameStatusBar
          message={message}
          isMyTurn={isMyTurn}
          currentPlayerName={gameState.players[gameState.turn.currentPlayerId].name}
          topDiscardCard={topDiscardCard}
          drawPileCount={drawPileCount(gameState.deck)}
          discardPile={gameState.deck.discardPile}
          analysis={analysis}
          onDrawPress={handleDraw}
          t={t}
        />

        <AISidePanel
          players={gameState.players}
          playerIds={[2, 3]}
          currentPlayerId={gameState.turn.currentPlayerId}
          cardCountLabel={t.cardCount}
          meldCountLabel={t.meldCount}
        />
      </View>

      {isMyTurn && !gameResult && (
        <ActionPanel
          actions={actions}
          pendingDiscard={pendingDiscard}
          selectedCard={selectedCard}
          t={t}
          onDraw={handleDraw}
          onEat={handleEat}
          onChiu={handleChiu}
          onDiscard={handleDiscard}
          onPass={handlePass}
          onDeclareU={handleDeclareU}
        />
      )}

      <View style={styles.handContainer}>
        <Text style={styles.handLabel}>{t.handLabel}{humanHand.length})</Text>
        <CardHand
          cards={humanHand}
          selectedCardId={selectedCard}
          highlightedCardIds={validDiscardIds}
          onCardPress={handleCardPress}
        />
        {pendingDiscard && (
          <Text style={styles.discardHint}>{t.discardHint}</Text>
        )}
      </View>

      <WinModal
        result={gameResult}
        visible={gameResult !== null}
        t={t}
        onPlayAgain={resetGame}
        onBackToHome={onBackToHome ? goHome : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  preGame: {
    flex: 1,
    backgroundColor: '#1a472a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 4,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  topBarSpacer: {
    width: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
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
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  handContainer: {
    paddingBottom: 12,
  },
  handLabel: {
    color: '#ecf0f1',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  discardHint: {
    color: '#f39c12',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
});
