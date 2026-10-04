import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ContentItem, PieceCaptureData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  Crosshair,
  Award,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  CheckCircle2
} from 'lucide-react';

interface PieceCaptureViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
  onNext?: () => void;
}

export const PieceCaptureViewer: React.FC<PieceCaptureViewerProps> = ({
  content,
  assignment,
  onBack,
  onNext,
}) => {
  const captureData = content.data as PieceCaptureData;
  const { completeTask } = useApp();

  const [game, setGame] = useState(new Chess(captureData.initialFen || '8/8/8/8/8/8/8/8 w - - 0 1'));
  const [status, setStatus] = useState<'playing' | 'won'>('playing');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [movesCount, setMovesCount] = useState(0);
  const [startTime] = useState<number>(Date.now());
  
  // Limpa e normaliza os alvos definidos pelo professor (ex: "e4", "d5")
  const initialTargets = captureData.targetPieces.map(t => t.trim().toLowerCase());
  const [remainingTargets, setRemainingTargets] = useState<string[]>(initialTargets);

  // Reinicia o jogo se o conteúdo mudar
  useEffect(() => {
    setGame(new Chess(captureData.initialFen || '8/8/8/8/8/8/8/8 w - - 0 1'));
    setStatus('playing');
    setLastMove(null);
    setMovesCount(0);
    setRemainingTargets(captureData.targetPieces.map(t => t.trim().toLowerCase()));
  }, [content, captureData]);

  const handleMove = (move: { from: Square; to: Square; promotion?: string; san: string }) => {
    if (status !== 'playing') return false;

    try {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move(move);

      if (moveResult) {
        setGame(newGame);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setMovesCount(prev => prev + 1);

        // Verifica se a casa de destino (to) é um dos alvos
        const destination = moveResult.to.toLowerCase();
        if (remainingTargets.includes(destination)) {
          sounds.playSuccess(); // Som especial ao capturar um alvo
          
          const updatedTargets = remainingTargets.filter(t => t !== destination);
          setRemainingTargets(updatedTargets);

          // Verifica se concluiu todos os alvos
          if (updatedTargets.length === 0) {
            setStatus('won');
            sounds.playSuccess(); // Toca novamente ou um som de vitória
            finishTask();
          }
        } else {
          // Se não foi um alvo, toca o som normal de lance/captura
          if (moveResult.captured) {
            sounds.playCapture();
          } else {
            sounds.playMove();
          }
        }
        return true;
      }
    } catch {
      sounds.playError();
      return false;
    }
    return false;
  };

  const finishTask = () => {
    if (assignment) {
      const timeSpent = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      // Consideramos "firstTry" sempre true para este tipo de exercício exploratório
      completeTask(assignment.id, timeSpent, 1, true); 
    }
  };

  const handleReset = () => {
    setGame(new Chess(captureData.initialFen || '8/8/8/8/8/8/8/8 w - - 0 1'));
    setStatus('playing');
    setLastMove(null);
    setMovesCount(0);
    setRemainingTargets(initialTargets);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 transition">
            ← Voltar para as minhas atividades
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5" /> Captura de Peças
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
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Alvos Restantes: <span className="text-amber-600">{remainingTargets.length}</span>
              </h3>
            </div>
            <div className="text-right">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lances</span>
               <div className="text-lg font-black text-slate-700 leading-none">{movesCount}</div>
            </div>
          </div>

          <ChessBoard
            fen={game.fen()}
            onMove={handleMove}
            interactive={status === 'playing'}
            lastMove={lastMove}
            highlightSquares={remainingTargets} // Destaca as casas que ainda precisam ser capturadas
          />
        </div>

        {/* Painel Lateral */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{content.title}</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{content.description}</p>

            {/* Progresso de Capturas */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Tuas Missões:</h4>
              <div className="flex flex-wrap gap-2">
                {initialTargets.map((target, idx) => {
                  const isCaptured = !remainingTargets.includes(target);
                  return (
                    <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${isCaptured ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200 shadow-xs'}`}>
                      {isCaptured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5 opacity-60" />}
                      <span>Casa {target.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel de Estado de Vitória */}
            {status === 'won' && (
              <div className="mt-6 p-5 rounded-2xl border text-center bg-amber-400 border-amber-500 text-amber-950 shadow-lg transform scale-100 animate-fadeIn">
                <Trophy className="w-12 h-12 mx-auto text-amber-100 mb-2 drop-shadow-md" />
                <h2 className="text-xl font-black mb-1">Missão Cumprida!</h2>
                <p className="text-sm font-medium opacity-90">Capturaste todos os alvos em {movesCount} lances.</p>
                
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition bg-amber-500 hover:bg-amber-600 text-white shadow-inner">
                    <RotateCcw className="w-4 h-4" /> Jogar Novamente
                  </button>
                  {onNext && (
                    <button onClick={onNext} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-700 hover:bg-amber-50 text-xs font-black shadow-sm transition">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {status === 'playing' && (
               <button onClick={handleReset} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                  <RotateCcw className="w-4 h-4" /> Reiniciar Posição
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};