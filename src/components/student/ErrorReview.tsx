import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ErrorReviewProps {
  onBack: () => void;
}

export const ErrorReview: React.FC<ErrorReviewProps> = ({ onBack }) => {
  const { currentStudent, assignments, contents } = useApp();

  // Filtra tarefas com tentativas falhadas ou que exigem revisão
  const studentAssignments = assignments.filter((a) => a.studentId === currentStudent?.id);
  const missedAssignments = studentAssignments.filter((a) => a.attempts > 1 || !a.firstTrySuccess);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black text-slate-900">Banco de Revisão (Erros Anteriores)</h2>
        </div>
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Reforça os conceitos em que tiveste mais dificuldade. A prática constante de erros anteriores acelera drasticamente a tua evolução no xadrez.
      </p>

      <div className="space-y-3">
        {missedAssignments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Excelente! Nenhum erro pendente de revisão.</p>
          </div>
        ) : (
          missedAssignments.map((assignment) => {
            const content = contents.find((c) => c.id === assignment.contentId);
            if (!content) return null;

            return (
              <div key={assignment.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                    {content.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{content.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Tentativas necessárias: {assignment.attempts}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
                  Rever Agora
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};