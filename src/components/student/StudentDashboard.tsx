import React, { useState } from 'react';
import { BotMatchViewer } from './BotMatchViewer';
import { PieceCaptureViewer } from './PieceCaptureViewer';
import { PawnBattleViewer } from './PawnBattleViewer';
import { useApp } from '../../context/AppContext';
import { ContentItem, TaskAssignment } from '../../types/chess';
import { AvatarBadge } from './AvatarBadge';
import { PuzzleSolver } from './PuzzleSolver';
import { GameViewer } from './GameViewer';
import { LessonViewer } from './LessonViewer';
import { GameAnalysisViewer } from './GameAnalysisViewer';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { AvatarShopModal } from './AvatarShopModal';
import {
  Flame,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  BookOpen,
  Trophy,
  Shield,
  Star,
  Palette,
  ShoppingBag,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentStudent, assignments, contents, achievements } = useApp();
  const [activeTask, setActiveTask] = useState<{
    content: ContentItem;
    assignment?: TaskAssignment;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Nenhum aluno selecionado.</div>;
  }

  if (activeTask) {
    if (activeTask.content.type === 'bot_match') {
      return (
        <BotMatchViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
          onNext={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'piece_capture') {
      return (
        <PieceCaptureViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
          onNext={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'pawn_battle') {
      return (
        <PawnBattleViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
          onNext={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'puzzle') {
      return (
        <PuzzleSolver
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
          onNext={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'game') {
      return (
        <GameViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'lesson') {
      return (
        <LessonViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
        />
      );
    }
    if (activeTask.content.type === 'analysis') {
      return (
        <GameAnalysisViewer
          content={activeTask.content}
          assignment={activeTask.assignment}
          onBack={() => setActiveTask(null)}
        />
      );
    }
  }

  const studentAssignments = assignments.filter((a) => a.studentId === currentStudent.id);
  const pendingAssignments = studentAssignments.filter((a) => a.status === 'pending');
  const completedAssignments = studentAssignments.filter((a) => a.status === 'completed');

  const nextRankXp = currentStudent.levelRank * 350;
  const currentLevelProgress = Math.min(100, Math.round((currentStudent.xp / nextRankXp) * 100));

  const isKids = currentStudent.kidsMode;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Cartão de Perfil do Aluno */}
      <div
        className={`rounded-3xl p-5 sm:p-8 shadow-sm transition-all duration-300 ${
          isKids
            ? 'bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/15 border-2 border-amber-300/40'
            : 'bg-white border border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
            <div className="flex flex-col items-center">
              <AvatarBadge student={currentStudent} size="xl" />
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-white/90 hover:bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-xs transition transform active:scale-95"
                >
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowShopModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs transition transform active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Loja XP</span>
                </button>
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentStudent.name}
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow-sm">
                  Nível {currentStudent.level}
                </span>
              </div>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                Patente: <strong className="text-blue-600 font-bold">{currentStudent.rankName}</strong> (Nível {currentStudent.levelRank})
              </p>

              {currentStudent.notes && (
                <p className="mt-2 text-xs text-slate-500 italic">
                  &ldquo;{currentStudent.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Indicadores de Estatísticas */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
            <div className="flex flex-col items-center bg-white px-4 py-3 rounded-2xl border border-amber-200 shadow-xs flex-1 md:flex-none min-w-[90px]">
              <div className="flex items-center gap-1 text-amber-500 font-extrabold text-lg sm:text-xl">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-500 animate-bounce" />
                <span>{currentStudent.streak}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Dias Seguidos
              </span>
            </div>

            <div className="flex flex-col items-center bg-white px-4 py-3 rounded-2xl border border-blue-200 shadow-xs flex-1 md:flex-none min-w-[90px]">
              <div className="flex items-center gap-1 text-blue-600 font-extrabold text-lg sm:text-xl">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>{currentStudent.streakShields}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Escudo
              </span>
            </div>

            <div className="flex flex-col items-center bg-white px-4 py-3 rounded-2xl border border-amber-200 shadow-xs flex-1 md:flex-none min-w-[90px]">
              <div className="flex items-center gap-1 text-[#F5C542] font-extrabold text-lg sm:text-xl">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-slate-900">{currentStudent.xp}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Pontos XP
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-6 pt-5 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span>Progresso para o próximo nível</span>
            <span className="text-blue-600 font-extrabold">
              {currentStudent.xp} / {nextRankXp} XP ({currentLevelProgress}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Abas e Listagem de Tarefas */}
      <div className="space-y-4">
        <div className="flex items-center overflow-x-auto pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pendentes ({pendingAssignments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluídas ({completedAssignments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Biblioteca Livre ({contents.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAssignments.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Parabéns! Nenhuma tarefa pendente!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Concluíste todas as lições. Podes treinar livremente na Biblioteca.
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition"
                >
                  Ver Biblioteca Livre
                </button>
              </div>
            ) : (
              pendingAssignments.map((assignment) => {
                const content = contents.find((c) => c.id === assignment.contentId);
                if (!content) return null;

                return (
                  <div
                    key={assignment.id}
                    onClick={() => setActiveTask({ content, assignment })}
                    className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                          {content.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < content.difficulty ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {content.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {content.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Award className="w-3.5 h-3.5" />
                        <span>+{content.xpReward} XP</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                        <span>Iniciar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAssignments.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-slate-400 text-xs">
                Nenhuma atividade concluída ainda.
              </div>
            ) : (
              completedAssignments.map((assignment) => {
                const content = contents.find((c) => c.id === assignment.contentId);
                if (!content) return null;

                return (
                  <div
                    key={assignment.id}
                    onClick={() => setActiveTask({ content, assignment })}
                    className="bg-white/90 rounded-2xl p-5 border border-emerald-200 hover:shadow-sm transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Concluído
                        </span>
                        {assignment.firstTrySuccess && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                            🎯 De primeira
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-800">
                        {content.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Tempo: {assignment.timeSpentSeconds}s • {assignment.attempts} tentativa(s)
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Praticar novamente</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content) => (
              <div
                key={content.id}
                onClick={() => setActiveTask({ content })}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                      {content.type}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      +{content.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {content.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {content.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Abrir no Tabuleiro</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quadro de Conquistas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Quadro de Conquistas
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Desbloqueia subindo de nível e resolvendo desafios
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map((ach, idx) => {
            const isUnlocked = idx < currentStudent.levelRank;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/60 border border-amber-200/80 shadow-xs'
                    : 'bg-slate-50 border border-slate-200 opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl mb-1.5">{ach.icon}</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {ach.title}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {ach.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {showAvatarModal && (
        <AvatarCustomizerModal onClose={() => setShowAvatarModal(false)} />
      )}

      {showShopModal && (
        <AvatarShopModal onClose={() => setShowShopModal(false)} />
      )}
    </div>
  );
};