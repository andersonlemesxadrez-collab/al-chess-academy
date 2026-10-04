import React from 'react';
import { Student } from '../../types/chess';
import { useApp } from '../../context/AppContext';
import { AvatarBadge } from '../student/AvatarBadge';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  FileText,
  Printer,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface StudentReportModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  student,
  onClose,
}) => {
  const { assignments, contents, activityLogs } = useApp();

  const studentTasks = assignments.filter((a) => a.studentId === student.id);
  const completedTasks = studentTasks.filter((a) => a.status === 'completed');
  const pendingTasks = studentTasks.filter((a) => a.status === 'pending');

  const firstTryWins = completedTasks.filter((a) => a.firstTrySuccess).length;
  const accuracyRate =
    completedTasks.length > 0
      ? Math.round((firstTryWins / completedTasks.length) * 100)
      : 0;

  const totalTimeSeconds = completedTasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);
  const avgTimeSeconds =
    completedTasks.length > 0 ? Math.round(totalTimeSeconds / completedTasks.length) : 0;

  const studentLogs = activityLogs.filter((l) => l.studentId === student.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <AvatarBadge student={student} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Relatório de Desempenho
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {student.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {student.age} anos • Nível {student.level} • {student.rankName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Imprimir / Salvar PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Taxa de Acerto
            </span>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">
              {accuracyRate}%
            </div>
            <span className="text-[11px] text-blue-700/80 font-medium">
              1ª tentativa
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Concluídas
            </span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">
              {completedTasks.length}
            </div>
            <span className="text-[11px] text-emerald-700/80 font-medium">
              de {studentTasks.length} tarefas
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Streak Atual
            </span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>{student.streak}</span>
            </div>
            <span className="text-[11px] text-amber-700/80 font-medium">
              Recorde: {student.maxStreak} dias
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
              Tempo Médio
            </span>
            <div className="text-2xl font-extrabold text-purple-900 mt-1">
              {avgTimeSeconds}s
            </div>
            <span className="text-[11px] text-purple-700/80 font-medium">
              por problema
            </span>
          </div>
        </div>

        {/* Completed Exercises Table */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Histórico de Tarefas
          </h3>

          <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Atividade</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Tentativas</th>
                  <th className="px-4 py-2.5">Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Nenhuma atividade atribuída ainda.
                    </td>
                  </tr>
                ) : (
                  studentTasks.map((task) => {
                    const content = contents.find((c) => c.id === task.contentId);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {content?.title || 'Exercício'}
                        </td>
                        <td className="px-4 py-2.5">
                          {task.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Concluído
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {task.attempts > 0 ? `${task.attempts}x` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {task.timeSpentSeconds > 0 ? `${task.timeSpentSeconds}s` : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature: Student's Written Comments / Analyses */}
        {studentTasks.some((t) => t.studentComments && Object.keys(t.studentComments).length > 0) && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-base">💬</span>
              <span>Anotações & Comentários do Aluno em Partidas</span>
            </h3>

            <div className="space-y-3">
              {studentTasks
                .filter((t) => t.studentComments && Object.keys(t.studentComments).length > 0)
                .map((task) => {
                  const content = contents.find((c) => c.id === task.contentId);
                  const comments = task.studentComments || {};

                  return (
                    <div key={task.id} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                        <span>{content?.title || 'Partida de Análise'}</span>
                        <span className="text-[11px] font-semibold text-purple-700">
                          {Object.keys(comments).length} lance(s) comentado(s)
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {Object.entries(comments).map(([idx, text]) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-purple-100 text-xs">
                            <span className="font-bold text-purple-800 mr-1.5">
                              Lance #{Number(idx) + 1}:
                            </span>
                            <span className="text-slate-700 italic">&ldquo;{text}&rdquo;</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Live Activity Log */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Registro de Ações Recentes
          </h3>

          <div className="space-y-2">
            {studentLogs.length === 0 ? (
              <p className="text-xs text-slate-400">Sem atividades recentes gravadas.</p>
            ) : (
              studentLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-800">{log.title}</strong>
                    {log.details && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                    )}
                  </div>
                  <span className="font-bold text-amber-600">+{log.xpEarned} XP</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
