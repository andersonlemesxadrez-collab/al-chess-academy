import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ContentItem, PuzzleData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  Sparkles,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Star,
  Brain,
} from 'lucide-react';

interface PuzzleSolverProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
  onNext?: () => void;
}

export const PuzzleSolver: React.FC<PuzzleSolverProps> = ({
  content,
  assignment,
  onBack,
  onNext,
}) => {
  const puzzle = content.data as PuzzleData;
  const { completeTask, currentStudent } = useApp();

  const [currentFen, setCurrentFen] = useState(puzzle.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'solved' | 'wrong'>('playing');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Sua vez! Encontre o melhor lance.');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [startTime] = useState<number>(Date.now());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  
  // NOVO: Estado para armazenar o histórico de lances errados na posição atual
  const [wrongMoves, setWrongMoves] = useState<string[]>([]);

  const isKidsMode = currentStudent?.kidsMode ?? true;

  // Reset when puzzle changes
  useEffect(() => {
    setCurrentFen(puzzle.fen);
    setMoveIndex(0);
    setStatus('playing');
    setFeedbackMessage('Sua vez! Encontre o melhor lance.');
    setShowHint(false);
    setAttempts(1);
    setLastMove(null);
    setWrongMoves([]); // Limpa o histórico de erros ao mudar de puzzle
  }, [content]);

  const handleMove = (move: { from: Square; to: Square; promotion?: string; san: string }) => {
    if (status === 'solved') return false;

    const expectedSan = puzzle.solutionMoves[moveIndex];

    // Check if the move made matches expected SAN
    if (move.san === expectedSan) {
      const nextIndex = moveIndex + 1;
      setLastMove({ from: move.from, to: move.to });
      setWrongMoves([]); // Limpa os erros anteriores ao acertar o lance

      // Check if puzzle is fully solved
      if (nextIndex >= puzzle.solutionMoves.length) {
        setStatus('solved');
        setFeedbackMessage('Sensacional! Você resolveu o problema com precisão!');
        sounds.playSuccess();

        // Calculate time spent
        const timeSpent = Math.max(5, Math.round((Date.now() - startTime) / 1000));
        const firstTry = attempts === 1;

        if (assignment) {
          completeTask(assignment.id, timeSpent, attempts, firstTry);
        }
        return true;
      }

      // If there is an opponent reply move in solutionMoves
      const opponentSan = puzzle.solutionMoves[nextIndex];
      setFeedbackMessage('Ótimo lance! O oponente está respondendo...');

      setTimeout(() => {
        try {
          const tempGame = new Chess(currentFen);
          // Play user move first
          tempGame.move(move.san);
          // Play opponent move
          const opponentMoveObj = tempGame.move(opponentSan);

          if (opponentMoveObj) {
            setCurrentFen(tempGame.fen());
            setLastMove({ from: opponentMoveObj.from, to: opponentMoveObj.to });
            if (opponentMoveObj.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
            setMoveIndex(nextIndex + 1);
            setFeedbackMessage('Sua vez novamente! Continue o ataque.');
          }
        } catch {
          // fallback
        }
      }, 500);

      return true;
    } else {
      // Wrong move
      setStatus('wrong');
      setAttempts((prev) => prev + 1);
      setFeedbackMessage('Ops! Esse não é o melhor lance. Tente novamente!');
      setWrongMoves((prev) => [...prev, move.san]); // Adiciona o lance errado ao histórico
      sounds.playError();
      return false;
    }
  };

  const handleReset = () => {
    setCurrentFen(puzzle.fen);
    setMoveIndex(0);
    setStatus('playing');
    setFeedbackMessage('Posição reiniciada. Vamos lá!');
    setLastMove(null);
    setWrongMoves([]); // Limpa os erros ao reiniciar
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Breadcrumb & Navigation */}
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
          <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {content.category}
          </span>
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < content.difficulty ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Chess Board */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <ChessBoard
            fen={currentFen}
            orientation={puzzle.turn === 'w' ? 'white' : 'black'}
            onMove={handleMove}
            interactive={status !== 'solved'}
            lastMove={lastMove}
            wrongMovesHistory={wrongMoves} // NOVO: Passagem do histórico para o tabuleiro
          />

          <div className="mt-4 flex items-center justify-between w-full max-w-[520px] text-xs font-medium text-slate-500 px-2">
            <span>
              Jogam as <strong className="text-slate-800">{puzzle.turn === 'w' ? 'Brancas' : 'Pretas'}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
              {puzzle.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? 'Ocultar Dica' : 'Pedir Dica'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Feedback & Educational Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {content.title}
                </h1>
                <p className="text-xs text-blue-600 font-medium mt-0.5">
                  Por {content.author}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span>+{content.xpReward} XP</span>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {content.description}
            </p>

            {/* Hint Box */}
            {showHint && puzzle.hint && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Dica do Professor:</strong>
                  <p className="mt-0.5">{puzzle.hint}</p>
                </div>
              </div>
            )}

            {/* Live Status Box */}
            <div
              className={`mt-5 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                status === 'solved'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : status === 'wrong'
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              {status === 'solved' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : status === 'wrong' ? (
                <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
              ) : (
                <Brain className="w-6 h-6 text-blue-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">{feedbackMessage}</p>
                {status === 'playing' && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mova a peça correta arrastando ou clicando nas casas.
                  </p>
                )}
              </div>
            </div>

            {/* Explanation when solved */}
            {status === 'solved' && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-950 text-xs">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Lição do Professor:
                </h4>
                <p className="leading-relaxed text-blue-800">{puzzle.explanation}</p>
              </div>
            )}

            {/* Actions button */}
            {status === 'solved' && onNext && (
              <button
                onClick={onNext}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition transform active:scale-98"
              >
                <span>Próxima Atividade</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};