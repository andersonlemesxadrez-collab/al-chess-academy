import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ContentItem, GameData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

interface GameViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
}

export const GameViewer: React.FC<GameViewerProps> = ({
  content,
  assignment,
  onBack,
}) => {
  const gameData = content.data as GameData;
  const { completeTask } = useApp();

  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(-1); // -1 is initial position
  const [boardFen, setBoardFen] = useState<string>(
    gameData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Replay moves up to index
  const goToMove = (index: number) => {
    try {
      const g = new Chess(gameData.initialFen || undefined);
      let lastM: { from: string; to: string } | null = null;

      for (let i = 0; i <= index && i < gameData.moves.length; i++) {
        const m = g.move(gameData.moves[i].san);
        if (m && i === index) {
          lastM = { from: m.from, to: m.to };
        }
      }

      setBoardFen(g.fen());
      setCurrentMoveIdx(index);
      setLastMove(lastM);
      sounds.playMove();

      // Check if finished entire game
      if (index === gameData.moves.length - 1 && assignment && assignment.status === 'pending') {
        completeTask(assignment.id, 120, 1, true);
      }
    } catch {
      // fallback
    }
  };

  const handleNext = () => {
    if (currentMoveIdx < gameData.moves.length - 1) {
      goToMove(currentMoveIdx + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentMoveIdx >= 0) {
      goToMove(currentMoveIdx - 1);
    }
  };

  const handleFirst = () => {
    goToMove(-1);
  };

  const handleLast = () => {
    goToMove(gameData.moves.length - 1);
  };

  // Autoplay
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentMoveIdx < gameData.moves.length - 1) {
          goToMove(currentMoveIdx + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIdx]);

  const currentComment =
    currentMoveIdx >= 0 && currentMoveIdx < gameData.moves.length
      ? gameData.moves[currentMoveIdx].comment
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            ← Voltar para minhas atividades
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
            Partida Comentada
          </span>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>+{content.xpReward} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Chess Board */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <ChessBoard fen={boardFen} interactive={false} lastMove={lastMove} />

          {/* Media navigation controls */}
          <div className="mt-4 flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={handleFirst}
              disabled={currentMoveIdx <= -1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Início"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentMoveIdx <= -1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Lance Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              title={isPlaying ? 'Pausar' : 'Reproduzir Automaticamente'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={handleNext}
              disabled={currentMoveIdx >= gameData.moves.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Próximo Lance"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleLast}
              disabled={currentMoveIdx >= gameData.moves.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Final"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Game Info, Commentary & Move List */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {content.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{gameData.white}</strong> vs <strong>{gameData.black}</strong> ({gameData.date})
            </p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              Evento: {gameData.event} • Resultado: <strong>{gameData.result}</strong>
            </p>

            {/* Current Move Commentary */}
            <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Comentário do Prof. Anderson:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentComment || 'Clique nas setas para avançar os lances e ver as explicações didáticas.'}
              </p>
            </div>
          </div>

          {/* Move List Notation Box */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Notação da Partida
            </h3>

            <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-1 text-xs font-mono">
              {Array.from({ length: Math.ceil(gameData.moves.length / 2) }).map((_, i) => {
                const whiteMove = gameData.moves[i * 2];
                const blackMove = gameData.moves[i * 2 + 1];
                const whiteIdx = i * 2;
                const blackIdx = i * 2 + 1;

                return (
                  <div key={i} className="flex items-center gap-1 py-0.5">
                    <span className="text-slate-400 w-5">{i + 1}.</span>
                    {whiteMove && (
                      <button
                        onClick={() => goToMove(whiteIdx)}
                        className={`px-1.5 py-0.5 rounded transition ${
                          currentMoveIdx === whiteIdx
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        {whiteMove.san}
                      </button>
                    )}
                    {blackMove && (
                      <button
                        onClick={() => goToMove(blackIdx)}
                        className={`px-1.5 py-0.5 rounded transition ${
                          currentMoveIdx === blackIdx
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        {blackMove.san}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
