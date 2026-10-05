import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, ContentItem } from '../../types/chess';
import { AvatarBadge } from '../student/AvatarBadge';
import { ContentEditorModal } from './ContentEditorModal';
import { ContentLibrary } from './ContentLibrary';
import { StudentReportModal } from './StudentReportModal';
import { TaskAssignModal } from './TaskAssignModal';
import { PuzzleSolver } from '../student/PuzzleSolver';
import { GameViewer } from '../student/GameViewer';
import { LessonViewer } from '../student/LessonViewer';
import { GameAnalysisViewer } from '../student/GameAnalysisViewer';
import { BotMatchViewer } from '../student/BotMatchViewer';
import { PieceCaptureViewer } from '../student/PieceCaptureViewer';
import { PawnBattleViewer } from '../student/PawnBattleViewer';
import {
  Users,
  Plus,
  BookPlus,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  ExternalLink,
  BookOpen,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

type Gender = 'm' | 'f';

// Seletor do personagem do avatar (rapaz / rapariga), usado nos formulários de aluno.
const GenderPicker: React.FC<{ value: Gender; onChange: (g: Gender) => void }> = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Personagem do Avatar</label>
    <div className="grid grid-cols-2 gap-2">
      {([['m', '👦 Rapaz'], ['f', '👧 Rapariga']] as [Gender, string][]).map(([g, label]) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`py-2.5 rounded-xl text-xs font-bold border transition ${
            value === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export const TeacherDashboard: React.FC = () => {
  const {
    students,
    assignments,
    contents,
    toggleKidsMode,
    setRole,
    setCurrentStudentId,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'library'>('students');

  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<Student | null>(null);

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentAge, setNewStudentAge] = useState(8);
  const [newStudentLevel, setNewStudentLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [newStudentKidsMode, setNewStudentKidsMode] = useState(true);
  const [newStudentGender, setNewStudentGender] = useState<Gender>('m');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [editStudentAge, setEditStudentAge] = useState(8);
  const [editStudentLevel, setEditStudentLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [editStudentKidsMode, setEditStudentKidsMode] = useState(true);
  const [editStudentGender, setEditStudentGender] = useState<Gender>('m');

  const completedTasks = assignments.filter((a) => a.status === 'completed').length;
  const pendingTasks = assignments.filter((a) => a.status === 'pending').length;

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentPassword) return;

    addStudent({
      name: newStudentName,
      password: newStudentPassword,
      age: Number(newStudentAge),
      level: newStudentLevel,
      kidsMode: newStudentKidsMode,
      // Avatar no formato do estúdio vetorial: começa só com o boneco base.
      avatar: {
        color: '#3B82F6',
        gender: newStudentGender,
        equipped: {},
      } as any,
    });

    setNewStudentName('');
    setNewStudentPassword('');
    setNewStudentGender('m');
    setShowAddStudentModal(false);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
    setEditStudentPassword(student.password || '');
    setEditStudentAge(student.age || 8);
    setEditStudentLevel((student.level as any) || 'Iniciante');
    setEditStudentKidsMode(!!student.kidsMode);
    setEditStudentGender(((student.avatar as any)?.gender as Gender) ?? 'm');
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName) return;

    updateStudent(editingStudent.id, {
      name: editStudentName,
      password: editStudentPassword,
      age: Number(editStudentAge),
      level: editStudentLevel,
      kidsMode: editStudentKidsMode,
      avatar: { ...((editingStudent.avatar ?? {}) as any), gender: editStudentGender } as any,
    });

    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja excluir o aluno ${name}? Todo o histórico será apagado e esta ação não pode ser desfeita.`)) {
      deleteStudent(id);
    }
  };

  const handleViewAsStudent = (studentId: string) => {
    setCurrentStudentId(studentId);
    setRole('student');
  };

  const handleOpenEdit = (content: ContentItem) => {
    setEditingContent(content);
    setShowContentModal(true);
  };

  const handleOpenCreateNew = () => {
    setEditingContent(null);
    setShowContentModal(true);
  };

  if (previewContent) {
    return (
      <div className="space-y-4 pb-10">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Eye className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Modo de Pré-visualização do Professor (Testando como Aluno)</span>
            </div>
            <button
              onClick={() => setPreviewContent(null)}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>

        {previewContent.type === 'puzzle' && <PuzzleSolver content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'game' && <GameViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'lesson' && <LessonViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'analysis' && <GameAnalysisViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'bot_match' && <BotMatchViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'piece_capture' && <PieceCaptureViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
        {previewContent.type === 'pawn_battle' && <PawnBattleViewer content={previewContent} onBack={() => setPreviewContent(null)} />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Cabeçalho */}
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Painel do Professor
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestão de alunos, turmas e criação de conteúdos interativos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleOpenCreateNew}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md transition"
            >
              <BookPlus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Criar Atividade</span>
            </button>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Novo Aluno</span>
            </button>
          </div>
        </div>

        {/* KPIs Globais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Alunos</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{students.length}</div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Concluídas</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{completedTasks}</div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Pendentes</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{pendingTasks}</div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Atividades</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{contents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação de Abas Responsiva */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
            activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão dos Alunos ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
            activeTab === 'library' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Banco de Atividades ({contents.length})</span>
        </button>
      </div>

      {/* Aba: Gestão de Alunos */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Alunos Matriculados</h2>
            <p className="text-xs text-slate-500">Toque em "Atribuir Tarefas" para enviar desafios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const studentTasks = assignments.filter((a) => a.studentId === student.id);
              const studentCompleted = studentTasks.filter((a) => a.status === 'completed').length;
              const studentPending = studentTasks.filter((a) => a.status === 'pending').length;

              return (
                <div key={student.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <AvatarBadge student={student} size="md" />
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">{student.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">{student.age} anos</span>
                            <span className="text-[10px] font-bold text-blue-600">{student.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Edição Compactos */}
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleOpenEditStudent(student)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar Perfil">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id, student.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir Aluno">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{studentCompleted} feitas</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" />{studentPending} espera</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 shrink-0 ${student.kidsMode ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">{student.kidsMode ? 'Modo Lúdico' : 'Modo Analítico'}</span>
                      </div>
                      <button type="button" onClick={() => toggleKidsMode(student.id)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${student.kidsMode ? 'bg-amber-400' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${student.kidsMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => setSelectedStudentForAssign(student)} className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-bold text-xs transition text-center whitespace-nowrap">
                        Atribuir Tarefa
                      </button>
                      <button onClick={() => setSelectedStudentForReport(student)} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition">
                        <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>

                    <button onClick={() => handleViewAsStudent(student.id)} className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 sm:bg-transparent py-2 sm:py-0 rounded-xl transition">
                      <span>Ver app</span><ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aba: Biblioteca */}
      {activeTab === 'library' && (
        <ContentLibrary onEditContent={handleOpenEdit} onPreviewContent={(item) => setPreviewContent(item)} onCreateNew={handleOpenCreateNew} />
      )}

      {/* Modal: Editor de Conteúdo */}
      {showContentModal && (
        <ContentEditorModal editingContent={editingContent} onClose={() => { setShowContentModal(false); setEditingContent(null); }} />
      )}

      {/* Modal: Adicionar Aluno (Adaptado para Mobile com Scroll) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Cadastrar Novo Aluno</h2>
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Aluno *</label>
                <input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Gabriel Silva" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso *</label>
                <input type="text" required value={newStudentPassword} onChange={(e) => setNewStudentPassword(e.target.value)} placeholder="Ex: xadrez123" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Idade</label>
                  <input type="number" min={4} max={99} value={newStudentAge} onChange={(e) => { const val = Number(e.target.value); setNewStudentAge(val); setNewStudentKidsMode(val <= 10); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nível</label>
                  <select value={newStudentLevel} onChange={(e) => setNewStudentLevel(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none bg-white">
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Modo Gamificado</span>
                  <span className="text-[10px] text-slate-500">Avatar e sons ativos</span>
                </div>
                <input type="checkbox" checked={newStudentKidsMode} onChange={(e) => setNewStudentKidsMode(e.target.checked)} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
              </div>

              {newStudentKidsMode && <GenderPicker value={newStudentGender} onChange={setNewStudentGender} />}

              <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Aluno (Adaptado para Mobile com Scroll) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" /> Editar Aluno
            </h2>
            <form onSubmit={handleEditStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Aluno *</label>
                <input type="text" required value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso</label>
                <input type="text" value={editStudentPassword} onChange={(e) => setEditStudentPassword(e.target.value)} placeholder="Deixe em branco p/ remover" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Idade</label>
                  <input type="number" min={4} max={99} value={editStudentAge} onChange={(e) => setEditStudentAge(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nível</label>
                  <select value={editStudentLevel} onChange={(e) => setEditStudentLevel(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none bg-white">
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Modo Gamificado</span>
                  <span className="text-[10px] text-slate-500">Avatar e sons ativos</span>
                </div>
                <input type="checkbox" checked={editStudentKidsMode} onChange={(e) => setEditStudentKidsMode(e.target.checked)} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
              </div>

              {editStudentKidsMode && <GenderPicker value={editStudentGender} onChange={setEditStudentGender} />}

              <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudentForAssign && <TaskAssignModal student={selectedStudentForAssign} onClose={() => setSelectedStudentForAssign(null)} />}
      {selectedStudentForReport && <StudentReportModal student={selectedStudentForReport} onClose={() => setSelectedStudentForReport(null)} />}
    </div>
  );
};