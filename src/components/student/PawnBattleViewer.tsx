import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { ContentItem, PawnBattleData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  Swords,
  Award,
  ArrowRight,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Cpu
} from 'lucide-react';

interface PawnBattleViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
  onNext?: () => void;
}

export const PawnBattleViewer: React.FC<PawnBattleViewerProps> = ({
  content,
  assignment,
  onBack,
  onNext,
}) => {
  const battleData = content.data as PawnBattleData;
  const { completeTask } = useApp();

  const [game, setGame] = useState(new Chess(battleData.initialFen || '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1'));
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [moveCount, setMoveCount] = useState(0);

  const playerColor = 'w';

  // Verifica as condições de vitória da Batalha de Peões
  const checkBattleCondition = (currentGame: Chess, lastMoveObj: Move): 'continue' | 'won' | 'lost' | 'draw' => {
    // 1. Alguém promoveu um peão?
    if (lastMoveObj.promotion) {
      return lastMoveObj.color === playerColor ? 'won' : 'lost';
    }

    // 2. Alguém ficou sem peões?
    const board = currentGame.board();
    let whitePawns = 0;
    let blackPawns = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'p') {
          if (piece.color === 'w') whitePawns++;
          if (piece.color === 'b') blackPawns++;
        }
      }
    }

    if (whitePawns === 0) return 'lost';
    if (blackPawns === 0) return 'won';

    // 3. Jogo bloqueado (sem lances válidos)
    if (currentGame.moves().length === 0) {
      // Quem tiver a vez de jogar e não puder mover-se perde (na Batalha de Peões bloqueada)
      // Ou consideramos empate. Vamos considerar empate para ser justo.
      return 'draw';
    }

    return 'continue';
  };

  const calculateBotMove = useCallback((currentGame: Chess): Move | null => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Lógica do bot para peões: Prefere promover > capturar > avançar
    const promotions = moves.filter(m => m.promotion);
    if (promotions.length > 0) return promotions[0];

    const captures = moves.filter(m => m.captured);
    if (captures.length > 0) {
      // Pega uma captura aleatória
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Avança aleatoriamente
    return moves[Math.floor(Math.random() * moves.length)];
  }, []);

  const triggerBotMove = useCallback(() => {
    if (status !== 'playing' || game.turn() === playerColor) return;

    setIsBotThinking(true);
    const thinkingTime = Math.random() * 800 + 400; // Responde um pouco mais rápido

    setTimeout(() => {
      const move = calculateBotMove(game);
      
      if (move) {
        const newGame = new Chess(game.fen());
        newGame.move(move.san);
        
        setGame(newGame);
        setLastMove({ from: move.from, to: move.to });
        
        if (move.captured) sounds.playCapture();
        else sounds.playMove();
        
        const condition = checkBattleCondition(newGame, move);
        if (condition !== 'continue') {
          setStatus(condition);
          if (condition === 'lost') sounds.playError();
          if (condition === 'draw') sounds.playError();
        }
      } else {
        // Bot não tem movimentos (bloqueado)
        setStatus('won');
        sounds.playSuccess();
        finishTask();
      }
      setIsBotThinking(false);
    }, thinkingTime);
  }, [game, status, calculateBotMove]);

  useEffect(() => {
    if (game.turn() !== playerColor && status === 'playing') {
      triggerBotMove();
    }
  }, [game, status, triggerBotMove]);

  const handlePlayerMove = (move: { from: Square; to: Square; promotion?: string; san: string }) => {
    if (status !== 'playing' || isBotThinking || game.turn() !== playerColor) return false;

    try {
      const newGame = new Chess(game.fen());
      
      // Se a Batalha de Peões chegar ao fim, forçamos a promoção a Dama automaticamente
      const moveAttempt = { ...move };
      if (move.to[1] === '8' || move.to[1] === '1') {
        moveAttempt.promotion = 'q';
      }

      const moveResult = newGame.move(moveAttempt);

      if (moveResult) {
        setGame(newGame);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setMoveCount(prev => prev + 1);

        if (moveResult.captured) sounds.playCapture();
        else sounds.playMove();

        const condition = checkBattleCondition(newGame, moveResult);
        if (condition !== 'continue') {
          setStatus(condition);
          if (condition === 'won') {
            sounds.playSuccess();
            finishTask();
          }
          if (condition === 'lost' || condition === 'draw') {
            sounds.playError();
          }
        }
        
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const finishTask = () => {
    if (assignment) {
      const timeSpent = Math.max(10, Math.round((Date.now() - startTime) / 1000));
      completeTask(assignment.id, timeSpent, 1, true);
    }
  };

  const handleReset = () => {
    setGame(new Chess(battleData.initialFen || '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1'));
    setStatus('playing');
    setLastMove(null);
    setMoveCount(0);
    setIsBotThinking(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition">
            ← Voltar para as minhas atividades
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Swords className="w-3.5 h-3.5" /> Batalha de Peões
          </span>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>+{content.xpReward} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tabuleiro */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full max-w-[520px] mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-md relative">
                  <Cpu className={`w-6 h-6 text-orange-400 ${isBotThinking ? 'animate-pulse' : ''}`} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-800 text-sm">Oponente (Bot)</h3>
                  <p className="text-xs text-slate-500 font-medium">
                     {isBotThinking ? 'A pensar...' : 'A aguardar o teu lance.'}
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

            <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
              <h4 className="text-orange-800 font-bold text-sm mb-1">Regras da Batalha:</h4>
              <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                 <li>Sê o primeiro a levar um peão até à última fila (Promoção).</li>
                 <li>OU captura todos os peões do adversário.</li>
                 <li>Atenção: não deixes que os teus peões fiquem todos bloqueados!</li>
              </ul>
            </div>

            {/* Painel de Estado de Vitória */}
            {status !== 'playing' && (
              <div className={`mt-6 p-5 rounded-2xl border text-center transition-all duration-500 transform scale-100 animate-fadeIn ${
                status === 'won' ? 'bg-orange-500 border-orange-600 text-white shadow-lg' : 
                status === 'lost' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                {status === 'won' && (
                  <>
                    <Trophy className="w-12 h-12 mx-auto text-amber-300 mb-2 drop-shadow-md" />
                    <h2 className="text-xl font-black mb-1">Vitória!</h2>
                    <p className="text-sm text-orange-50 opacity-90">Dominaste a estrutura de peões e venceste.</p>
                  </>
                )}
                {status === 'lost' && (
                  <>
                    <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-2" />
                    <h2 className="text-lg font-black mb-1">Derrota...</h2>
                    <p className="text-xs text-rose-700">O bot foi mais rápido. Pensa melhor na tua estratégia de avanço!</p>
                  </>
                )}
                {status === 'draw' && (
                  <>
                    <Swords className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <h2 className="text-lg font-black mb-1">Bloqueio Geral (Empate)</h2>
                    <p className="text-xs text-slate-500">Nenhum lado se consegue mexer.</p>
                  </>
                )}

                <div className="mt-5 flex items-center justify-center gap-3">
                  <button onClick={handleReset} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${status === 'won' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                    <RotateCcw className="w-4 h-4" /> Tentar Novamente
                  </button>
                  {status === 'won' && onNext && (
                    <button onClick={onNext} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 text-xs font-black shadow-sm transition">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {status === 'playing' && (
               <button onClick={handleReset} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                  <RotateCcw className="w-4 h-4" /> Reiniciar Partida
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};