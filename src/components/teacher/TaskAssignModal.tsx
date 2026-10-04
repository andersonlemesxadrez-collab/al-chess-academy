import React, { useState } from 'react';
import { Student } from '../../types/chess';
import { useApp } from '../../context/AppContext';
import { X, Plus, Copy, Check, Star } from 'lucide-react';

interface TaskAssignModalProps {
  student: Student;
  onClose: () => void;
}

export const TaskAssignModal: React.FC<TaskAssignModalProps> = ({ student, onClose }) => {
  const { contents, assignments, assignTask, copyTasksToStudent, students } = useApp();

  const [selectedSourceStudentId, setSelectedSourceStudentId] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Contents already assigned to this student
  const assignedContentIds = new Set(
    assignments.filter((a) => a.studentId === student.id).map((a) => a.contentId)
  );

  const handleToggleAssign = (contentId: string) => {
    assignTask(student.id, contentId);
  };

  const handleCopyFromStudent = () => {
    if (!selectedSourceStudentId) return;
    copyTasksToStudent(selectedSourceStudentId, student.id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const otherStudents = students.filter((s) => s.id !== student.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Atribuir Atividades para {student.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha tarefas individuais ou copie tarefas de outro aluno de nível semelhante.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature: Copy from another student */}
        {otherStudents.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-blue-900">
              <strong className="block font-bold">Copiar tarefas de outro aluno:</strong>
              <span className="text-blue-700/80">
                Ideal para alunos com nível parecido!
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSourceStudentId}
                onChange={(e) => setSelectedSourceStudentId(e.target.value)}
                className="bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none w-full sm:w-auto"
              >
                <option value="">Selecione o aluno...</option>
                {otherStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.level})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCopyFromStudent}
                disabled={!selectedSourceStudentId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition shrink-0"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content items list */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Biblioteca de Conteúdo Disponível
          </h3>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {contents.map((content) => {
              const isAssigned = assignedContentIds.has(content.id);

              return (
                <div
                  key={content.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isAssigned
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {content.category}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: content.difficulty }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {content.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {content.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleAssign(content.id)}
                    disabled={isAssigned}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 ${
                      isAssigned
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isAssigned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Já atribuído</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Atribuir</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
