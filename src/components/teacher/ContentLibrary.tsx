import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentItem } from '../../types/chess';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Users,
  Eye,
  Star,
  Tag,
  BookOpen,
  Brain,
  MessageSquare,
  FileText,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface ContentLibraryProps {
  onEditContent: (content: ContentItem) => void;
  onPreviewContent: (content: ContentItem) => void;
  onCreateNew: () => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onEditContent,
  onPreviewContent,
  onCreateNew,
}) => {
  const {
    contents,
    customCategories,
    duplicateContent,
    deleteContent,
    students,
    assignContentToMultipleStudents,
    assignments,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Multi-student assignment modal state
  const [assigningContent, setAssigningContent] = useState<ContentItem | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Extract all unique tags across all contents
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contents.forEach((c) => {
      c.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [contents]);

  // Filter contents
  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }

      return true;
    });
  }, [contents, searchQuery, selectedCategory, selectedType, selectedDifficulty, selectedTag]);

  const handleOpenAssignModal = (content: ContentItem) => {
    setAssigningContent(content);
    // Pre-select students who don't have this task yet
    const alreadyAssignedIds = new Set(
      assignments.filter((a) => a.contentId === content.id).map((a) => a.studentId)
    );
    setSelectedStudentIds(students.filter((s) => !alreadyAssignedIds.has(s.id)).map((s) => s.id));
    setAssignSuccess(false);
  };

  const handleConfirmAssignment = () => {
    if (!assigningContent || selectedStudentIds.length === 0) return;
    assignContentToMultipleStudents(assigningContent.id, selectedStudentIds);
    setAssignSuccess(true);
    setTimeout(() => {
      setAssigningContent(null);
      setAssignSuccess(false);
    }, 1200);
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'puzzle':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
            <Brain className="w-3 h-3 text-blue-600" />
            Problema Tático
          </span>
        );
      case 'analysis':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
            <MessageSquare className="w-3 h-3 text-purple-600" />
            Análise do Aluno
          </span>
        );
      case 'game':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
            <FileText className="w-3 h-3 text-indigo-600" />
            Partida Didática
          </span>
        );
      case 'lesson':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
            <BookOpen className="w-3 h-3 text-emerald-600" />
            Lição / Tema
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Banco de Atividades do Professor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie, edite, duplique e organize todas as suas atividades por áreas e classificações.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition transform active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Atividade</span>
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, descrição ou classificação (#tag)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:border-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Área / Categoria:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
            >
              <option value="all">Todas as Categorias ({contents.length})</option>
              {customCategories.map((cat) => {
                const count = contents.filter((c) => c.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Tipo de Atividade:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
            >
              <option value="all">Todos os Tipos</option>
              <option value="puzzle">Problemas Táticos</option>
              <option value="analysis">Partidas para Comentar</option>
              <option value="game">Partidas Didáticas</option>
              <option value="lesson">Lições / Teoria</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Dificuldade:
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
            >
              <option value="all">Todas as Dificuldades</option>
              <option value={1}>⭐ 1 Estrela (Iniciante)</option>
              <option value={2}>⭐⭐ 2 Estrelas</option>
              <option value={3}>⭐⭐⭐ 3 Estrelas (Médio)</option>
              <option value={4}>⭐⭐⭐⭐ 4 Estrelas</option>
              <option value={5}>⭐⭐⭐⭐⭐ 5 Estrelas (Mestre)</option>
            </select>
          </div>
        </div>

        {/* Tag chips row */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                selectedTag === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">
              Nenhuma atividade encontrada com estes filtros.
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tente redefinir a busca ou crie um novo exercício clicando no botão acima.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedDifficulty('all');
                setSelectedTag(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          filteredContents.map((item) => {
            const assignmentCount = assignments.filter((a) => a.contentId === item.id).length;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {getTypeBadge(item.type)}
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: item.difficulty }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Category & Tags pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-slate-400">
                    {assignmentCount} aluno(s)
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Test / Preview */}
                    <button
                      type="button"
                      onClick={() => onPreviewContent(item)}
                      title="Testar como Aluno"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Assign to multiple students */}
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(item)}
                      title="Atribuir a Alunos"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <Users className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => duplicateContent(item.id)}
                      title="Duplicar Atividade"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEditContent(item)}
                      title="Editar Atividade"
                      className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition font-bold"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
                          deleteContent(item.id);
                        }
                      }}
                      title="Excluir Atividade"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Multi-Student Assignment Modal */}
      {assigningContent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Atribuir &ldquo;{assigningContent.title}&rdquo;
              </h3>
              <button
                onClick={() => setAssigningContent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Marque os alunos que devem receber esta tarefa:
            </p>

            <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
              {students.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <label
                    key={st.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">
                        {st.name}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {st.age} anos • {st.level}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudentSelection(st.id)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningContent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleConfirmAssignment}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                {assignSuccess ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                <span>
                  {assignSuccess
                    ? 'Atribuído com Sucesso!'
                    : `Atribuir a ${selectedStudentIds.length} Aluno(s)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
