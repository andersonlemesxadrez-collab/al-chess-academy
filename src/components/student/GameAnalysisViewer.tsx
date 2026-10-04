import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ContentItem, AnalysisData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Send,
  Award,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface GameAnalysisViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
}

export const GameAnalysisViewer: React.FC<GameAnalysisViewerProps> = ({
  content,
  assignment,
  onBack,
}) => {
  const analysisData = content.data as AnalysisData;
  const { completeTask } = useApp();

  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(-1);
  const [boardFen, setBoardFen] = useState<string>(
    analysisData.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Student comments storage: moveIndex -> comment
  const [comments, setComments] = useState<Record<number, string>>(() => {
    return assignment?.studentComments || {};
  });

  const [currentInput, setCurrentInput] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());

  // Keep currentInput synced with selected move's comment
  useEffect(() => {
    if (currentMoveIdx >= 0 && comments[currentMoveIdx]) {
      setCurrentInput(comments[currentMoveIdx]);
    } else {
      setCurrentInput('');
    }
  }, [currentMoveIdx, comments]);

  const goToMove = (index: number) => {
    try {
      const g = new Chess(analysisData.initialFen || undefined);
      let lastM: { from: string; to: string } | null = null;

      for (let i = 0; i <= index && i < analysisData.moves.length; i++) {
        const m = g.move(analysisData.moves[i].san);
        if (m && i === index) {
          lastM = { from: m.from, to: m.to };
        }
      }

      setBoardFen(g.fen());
      setCurrentMoveIdx(index);
      setLastMove(lastM);
      sounds.playMove();
    } catch {
      // fallback
    }
  };

  const handleSaveComment = () => {
    if (currentMoveIdx < 0 || !currentInput.trim()) return;

    const newComments = {
      ...comments,
      [currentMoveIdx]: currentInput.trim(),
    };
    setComments(newComments);

    // Save in assignment if available
    if (assignment) {
      assignment.studentComments = newComments;
    }

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    sounds.playCheck();
  };

  const totalCommentedCount = Object.keys(comments).length;

  const handleSubmitAnalysis = () => {
    const timeSpent = Math.max(30, Math.round((Date.now() - startTime) / 1000));
    if (assignment) {
      assignment.studentComments = comments;
      completeTask(assignment.id, timeSpent, 1, true);
    }
    sounds.playSuccess();
    if (onBack) onBack();
  };

  const currentMoveObj =
    currentMoveIdx >= 0 && currentMoveIdx < analysisData.moves.length
      ? analysisData.moves[currentMoveIdx]
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
          <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Análise e Comentários
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
              onClick={() => goToMove(-1)}
              disabled={currentMoveIdx <= -1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Posição Inicial"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goToMove(currentMoveIdx - 1)}
              disabled={currentMoveIdx <= -1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Lance Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-3 text-xs font-mono font-bold text-slate-700">
              {currentMoveIdx >= 0 ? `${Math.floor(currentMoveIdx / 2) + 1}. ${currentMoveObj?.san}` : 'Início'}
            </span>

            <button
              onClick={() => goToMove(currentMoveIdx + 1)}
              disabled={currentMoveIdx >= analysisData.moves.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Próximo Lance"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => goToMove(analysisData.moves.length - 1)}
              disabled={currentMoveIdx >= analysisData.moves.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Posição Final"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Comments Input Box & Move Notations */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {content.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{analysisData.white}</strong> vs <strong>{analysisData.black}</strong> ({analysisData.date})
            </p>

            {analysisData.guidanceText && (
              <div className="mt-3 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Instrução do Professor:</strong>
                  <span>{analysisData.guidanceText}</span>
                </div>
              </div>
            )}

            {/* Comment Area for Currently Selected Move */}
            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {currentMoveIdx >= 0
                      ? `Comentário sobre o lance ${currentMoveObj?.san}:`
                      : 'Selecione um lance para comentar:'}
                  </span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {totalCommentedCount} lances anotados
                </span>
              </div>

              {currentMoveObj?.teacherPrompt && (
                <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  💡 Pergunta: {currentMoveObj.teacherPrompt}
                </p>
              )}

              <textarea
                rows={3}
                disabled={currentMoveIdx < 0}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={
                  currentMoveIdx >= 0
                    ? 'Escreva sua análise... (Ex: Qual era a ameaça? Este lance é bom ou ruim? O que você jogaria?)'
                    : 'Avançe para um lance da partida usando as setas para escrever seu comentário.'
                }
                className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
              />

              <div className="flex items-center justify-between pt-1">
                {savedFeedback ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Anotação salva!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Suas notas serão enviadas ao professor.
                  </span>
                )}

                <button
                  type="button"
                  disabled={currentMoveIdx < 0 || !currentInput.trim()}
                  onClick={handleSaveComment}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition"
                >
                  Salvar Lance
                </button>
              </div>
            </div>

            {/* Submit all analysis button */}
            <button
              onClick={handleSubmitAnalysis}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Análise para o Professor (+{content.xpReward} XP)</span>
            </button>
          </div>

          {/* Move notation list with comment indicators */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Lances da Partida (com seus comentários)
            </h3>

            <div className="max-h-44 overflow-y-auto pr-1 grid grid-cols-2 gap-1 text-xs font-mono">
              {Array.from({ length: Math.ceil(analysisData.moves.length / 2) }).map((_, i) => {
                const whiteMove = analysisData.moves[i * 2];
                const blackMove = analysisData.moves[i * 2 + 1];
                const whiteIdx = i * 2;
                const blackIdx = i * 2 + 1;

                const hasWhiteComment = !!comments[whiteIdx];
                const hasBlackComment = !!comments[blackIdx];

                return (
                  <div key={i} className="flex items-center gap-1 py-0.5">
                    <span className="text-slate-400 w-5">{i + 1}.</span>
                    {whiteMove && (
                      <button
                        onClick={() => goToMove(whiteIdx)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                          currentMoveIdx === whiteIdx
                            ? 'bg-purple-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span>{whiteMove.san}</span>
                        {hasWhiteComment && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    )}
                    {blackMove && (
                      <button
                        onClick={() => goToMove(blackIdx)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                          currentMoveIdx === blackIdx
                            ? 'bg-purple-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span>{blackMove.san}</span>
                        {hasBlackComment && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
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
