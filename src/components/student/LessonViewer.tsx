import React, { useState } from 'react';
import { ContentItem, LessonData, TaskAssignment } from '../../types/chess';
import { ChessBoard } from '../chess/ChessBoard';
import { useApp } from '../../context/AppContext';
import { Award, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface LessonViewerProps {
  content: ContentItem;
  assignment?: TaskAssignment;
  onBack?: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  content,
  assignment,
  onBack,
}) => {
  const lessonData = content.data as LessonData;
  const { completeTask } = useApp();
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  const section = lessonData.sections[currentSectionIdx];
  const isLastSection = currentSectionIdx === lessonData.sections.length - 1;

  const handleNextSection = () => {
    if (isLastSection) {
      if (assignment && assignment.status === 'pending') {
        completeTask(assignment.id, 90, 1, true);
      }
      if (onBack) onBack();
    } else {
      setCurrentSectionIdx((prev) => prev + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx((prev) => prev - 1);
    }
  };

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
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Tema / Lição
          </span>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>+{content.xpReward} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Educational Board */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <ChessBoard
            fen={section.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
            interactive={false}
            highlightSquares={section.highlightSquares || []}
            arrows={section.arrows || []}
          />

          {/* Section Indicator Pills */}
          <div className="mt-4 flex items-center gap-2">
            {lessonData.sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSectionIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSectionIdx === i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Parte ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Section Text & Controls */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>
                Parte {currentSectionIdx + 1} de {lessonData.sections.length}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {section.title}
            </h1>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed font-normal">
              {section.text}
            </p>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrevSection}
                disabled={currentSectionIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>

              <button
                onClick={handleNextSection}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition transform active:scale-98 ${
                  isLastSection
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLastSection ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Concluir Lição (+{content.xpReward} XP)</span>
                  </>
                ) : (
                  <>
                    <span>Próxima Parte</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
