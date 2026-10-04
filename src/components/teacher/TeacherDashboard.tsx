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
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    students,
    assignments,
    contents,
    toggleKidsMode,
    setRole,
    setCurrentStudentId,
    addStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'library'>('students');

  // Modal states
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<Student | null>(null);

  // New student quick form state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentAge, setNewStudentAge] = useState(8);
  const [newStudentLevel, setNewStudentLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [newStudentKidsMode, setNewStudentKidsMode] = useState(true);

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
      avatar: {
        base: newStudentKidsMode ? 'knight' : 'pawn',
        color: '#3B82F6',
        hat: newStudentKidsMode ? 'cap' : undefined,
      },
    });

    setNewStudentName('');
    setNewStudentPassword('');
    setShowAddStudentModal(false);
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

  // Preview Mode for the teacher
  if (previewContent) {
    return (
      <div className="space-y-4">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Modo de Pré-visualização do Professor (Testando como Aluno)</span>
            </div>
            <button
              onClick={() => setPreviewContent(null)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>

        {previewContent.type === 'puzzle' && (
          <PuzzleSolver content={previewContent} onBack={() => setPreviewContent(null)} />
        )}
        {previewContent.type === 'game' && (
          <GameViewer content={previewContent} onBack={() => setPreviewContent(null)} />
        )}
        {previewContent.type === 'lesson' && (
          <LessonViewer content={previewContent} onBack={() => setPreviewContent(null)} />
        )}
        {previewContent.type === 'analysis' && (
          <GameAnalysisViewer content={previewContent} onBack={() => setPreviewContent(null)} />
        )}
        {(previewContent.type === 'bot_match' || previewContent.type === 'piece_capture' || previewContent.type === 'pawn_battle') && (
          <div className="text-center py-20 text-slate-500 font-bold">
            Nova interface de jogo sendo desenvolvida... Volte em breve!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Painel do Professor Anderson Lemes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Plataforma pedagógica personalizada para gestão de alunos, criação e edição de conteúdos interativos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenCreateNew}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition transform active:scale-98"
            >
              <BookPlus className="w-4 h-4" />
              <span>Criar Atividade</span>
            </button>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition transform active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aluno</span>
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Alunos Ativos
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{students.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tarefas Concluídas
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{completedTasks}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tarefas Pendentes
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{pendingTasks}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Banco de Atividades
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{contents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão dos Alunos ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'library' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Banco de Atividades & Editor ({contents.length})</span>
        </button>
      </div>

      {/* Tab 1: Students Roster */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Alunos Matriculados</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure o estilo, atribua tarefas e veja relatórios individuais.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => {
              const studentTasks = assignments.filter((a) => a.studentId === student.id);
              const studentCompleted = studentTasks.filter((a) => a.status === 'completed').length;
              const studentPending = studentTasks.filter((a) => a.status === 'pending').length;

              return (
                <div key={student.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <AvatarBadge student={student} size="lg" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900">{student.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{student.age} anos</span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">Nível: <strong className="text-slate-800">{student.level}</strong> • {student.rankName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{student.streak}d</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                          <Award className="w-3.5 h-3.5 text-blue-500" />
                          <span>{student.xp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>{studentCompleted} concluídas</span></span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /><span>{studentPending} pendentes</span></span>
                    </div>

                    <div className="mt-4 flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${student.kidsMode ? 'text-amber-500' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Perfil Gamificado (Lúdico)</span>
                          <span className="text-[10px] text-slate-500">{student.kidsMode ? 'Ativado: Avatar, Loja de Moedas e Animações' : 'Desativado: Foco puramente analítico'}</span>
                        </div>
                      </div>

                      <button type="button" onClick={() => toggleKidsMode(student.id)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${student.kidsMode ? 'bg-amber-400' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${student.kidsMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedStudentForAssign(student)} className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition">Atribuir Tarefas</button>
                      <button onClick={() => setSelectedStudentForReport(student)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-500" /><span>Relatório</span>
                      </button>
                    </div>

                    <button onClick={() => handleViewAsStudent(student.id)} title="Ver como este aluno" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
                      <span>Ver app</span><ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Activity Bank / Library */}
      {activeTab === 'library' && (
        <ContentLibrary onEditContent={handleOpenEdit} onPreviewContent={(item) => setPreviewContent(item)} onCreateNew={handleOpenCreateNew} />
      )}

      {/* Unified Content Editor Modal */}
      {showContentModal && (
        <ContentEditorModal editingContent={editingContent} onClose={() => { setShowContentModal(false); setEditingContent(null); }} />
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Cadastrar Novo Aluno</h2>
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Aluno *</label>
                <input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Gabriel Silva" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso *</label>
                <input type="text" required value={newStudentPassword} onChange={(e) => setNewStudentPassword(e.target.value)} placeholder="Ex: xadrez123" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Idade</label>
                  <input type="number" min={4} max={99} value={newStudentAge} onChange={(e) => { const val = Number(e.target.value); setNewStudentAge(val); setNewStudentKidsMode(val <= 10); }} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nível</label>
                  <select value={newStudentLevel} onChange={(e) => setNewStudentLevel(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none">
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Ativar Modo Gamificado</span>
                  <span className="text-[11px] text-slate-500">Avatar, sons e loja de itens</span>
                </div>
                <input type="checkbox" checked={newStudentKidsMode} onChange={(e) => setNewStudentKidsMode(e.target.checked)} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition">Cadastrar Aluno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStudentForAssign && <TaskAssignModal student={selectedStudentForAssign} onClose={() => setSelectedStudentForAssign(null)} />}
      {selectedStudentForReport && <StudentReportModal student={selectedStudentForReport} onClose={() => setSelectedStudentForReport(null)} />}
    </div>
  );
};