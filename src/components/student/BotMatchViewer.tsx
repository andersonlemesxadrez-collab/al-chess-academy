import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { ContentItem, BotMatchData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  Cpu,
  Award,
  ArrowRight,
  RotateCcw,
  Shield,
  Swords,
  Trophy,
  AlertTriangle,
} from 'lucide-react';

interface BotMatchViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
  onNext?: () => void;
}

export const BotMatchViewer: React.FC<BotMatchViewerProps> = ({
  content,
  assignment,
  onBack,
  onNext,
}) => {
  const matchData = content.data as BotMatchData;
  const { completeTask } = useApp();

  const [game, setGame] = useState(new Chess(matchData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [moveCount, setMoveCount] = useState(0);

  // O aluno joga sempre com as Brancas por padrão nesta versão
  const playerColor = 'w';

  // Lógica simples do Bot baseada no nível (1 a 20)
  const calculateBotMove = useCallback((currentGame: Chess, level: number): Move | null => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Tática do Bot: A probabilidade de escolher a "melhor" captura é proporcional ao nível
    const precisionProb = level / 20; 
    const isPlayingSmart = Math.random() < precisionProb;

    if (isPlayingSmart) {
      // Tenta encontrar capturas ou cheques
      const captures = moves.filter(m => m.captured);
      const checks = moves.filter(m => m.san.includes('+'));
      
      const goodMoves = [...captures, ...checks];
      
      if (goodMoves.length > 0) {
        // Ordena por valor da peça capturada (simplificado)
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        goodMoves.sort((a, b) => (pieceValues[b.captured || 'p'] || 0) - (pieceValues[a.captured || 'p'] || 0));
        return goodMoves[0]; // Retorna a melhor captura
      }
    }

    // Caso não haja jogadas óbvias ou se o "dado" ditou uma falha (nível baixo), faz um lance aleatório
    return moves[Math.floor(Math.random() * moves.length)];
  }, []);

  const triggerBotMove = useCallback(() => {
    if (status !== 'playing' || game.turn() === playerColor) return;

    setIsBotThinking(true);

    // Adiciona um atraso artificial para simular o tempo de pensamento do bot
    const thinkingTime = Math.random() * 1000 + 500; // Entre 0.5s e 1.5s

    setTimeout(() => {
      const move = calculateBotMove(game, matchData.botLevel);
      
      if (move) {
        const newGame = new Chess(game.fen());
        newGame.move(move.san);
        
        setGame(newGame);
        setLastMove({ from: move.from, to: move.to });
        
        if (move.captured) sounds.playCapture();
        else sounds.playMove();
        
        checkGameEnd(newGame);
      }
      setIsBotThinking(false);
    }, thinkingTime);
  }, [game, matchData.botLevel, status, calculateBotMove]);

  // Se for a vez do bot, aciona a jogada automaticamente
  useEffect(() => {
    if (game.turn() !== playerColor && status === 'playing') {
      triggerBotMove();
    }
  }, [game, status, triggerBotMove]);

  const checkGameEnd = (currentGame: Chess) => {
    if (currentGame.isCheckmate()) {
      const isPlayerWin = currentGame.turn() !== playerColor;
      setStatus(isPlayerWin ? 'won' : 'lost');
      if (isPlayerWin) {
        sounds.playSuccess();
        finishTask(true);
      } else {
        sounds.playError();
      }
    } else if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition()) {
      setStatus('draw');
      sounds.playError(); // Ou um som neutro
    }
  };

  const handlePlayerMove = (move: { from: Square; to: Square; promotion?: string; san: string }) => {
    if (status !== 'playing' || isBotThinking || game.turn() !== playerColor) return false;

    try {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move(move);

      if (moveResult) {
        setGame(newGame);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setMoveCount(prev => prev + 1);
        
        checkGameEnd(newGame);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const finishTask = (isWin: boolean) => {
    if (assignment && isWin) {
      const timeSpent = Math.max(10, Math.round((Date.now() - startTime) / 1000));
      completeTask(assignment.id, timeSpent, 1, true);
    }
  };

  const handleReset = () => {
    setGame(new Chess(matchData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
    setStatus('playing');
    setLastMove(null);
    setMoveCount(0);
    setIsBotThinking(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition">
            ← Voltar para minhas atividades
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Jogo vs Bot
          </span>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>+{content.xpReward} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tabuleiro */}
        <div className="lg:col-span-7 flex flex-col items-center relative">
          
          {/* Indicador do Oponente (Bot) */}
          <div className="w-full max-w-[520px] mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-md relative">
                <Cpu className={`w-6 h-6 text-emerald-400 ${isBotThinking ? 'animate-pulse' : ''}`} />
                {isBotThinking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  Stockfish Jr. <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded uppercase">Lvl {matchData.botLevel}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isBotThinking ? 'O bot está a pensar...' : 'A aguardar o teu lance.'}
                </p>
              </div>
            </div>
            <div className="text-right">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lances</span>
               <div className="text-lg font-black text-slate-700 leading-none">{moveCount}</div>
            </div>
          </div>

          <ChessBoard
            fen={game.fen()}
            orientation={playerColor === 'w' ? 'white' : 'black'}
            onMove={handlePlayerMove}
            interactive={status === 'playing' && !isBotThinking}
            lastMove={lastMove}
          />
        </div>

        {/* Painel Lateral */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{content.title}</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{content.description}</p>

            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <Shield className="w-4 h-4 text-emerald-600" /> Objetivo da Missão:
              </div>
              <p className="text-xs text-emerald-700">{matchData.objective || 'Vence o bot para ganhares os teus pontos de XP!'}</p>
            </div>

            {/* Painel de Estado do Jogo */}
            {status !== 'playing' && (
              <div className={`mt-6 p-5 rounded-2xl border text-center transition-all duration-500 transform scale-100 animate-fadeIn ${
                status === 'won' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg' : 
                status === 'lost' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                {status === 'won' && (
                  <>
                    <Trophy className="w-12 h-12 mx-auto text-amber-300 mb-2 drop-shadow-md" />
                    <h2 className="text-xl font-black mb-1">Vitória Épica!</h2>
                    <p className="text-sm text-emerald-50 opacity-90">Derrotaste o Stockfish Jr. nível {matchData.botLevel}.</p>
                  </>
                )}
                {status === 'lost' && (
                  <>
                    <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-2" />
                    <h2 className="text-lg font-black mb-1">Foste Derrotado</h2>
                    <p className="text-xs text-rose-700">Não desistas! Analisa os teus erros e tenta novamente.</p>
                  </>
                )}
                {status === 'draw' && (
                  <>
                    <Swords className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <h2 className="text-lg font-black mb-1">Empate</h2>
                    <p className="text-xs text-slate-500">Foi um jogo renhido.</p>
                  </>
                )}

                <div className="mt-5 flex items-center justify-center gap-3">
                  <button onClick={handleReset} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${status === 'won' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                    <RotateCcw className="w-4 h-4" /> Tentar Novamente
                  </button>
                  {status === 'won' && onNext && (
                    <button onClick={onNext} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-black shadow-sm transition">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};