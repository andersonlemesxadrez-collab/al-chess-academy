import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ContentItem, 
  ContentType, 
  PuzzleData, 
  GameData, 
  AnalysisData,
  BotMatchData,
  PieceCaptureData,
  PawnBattleData
} from '../../types/chess';
import { PositionEditor } from '../chess/PositionEditor';
import { parsePgnString } from '../../utils/pgnParser';
import {
  X,
  Plus,
  Save,
  FileText,
  MessageSquare,
  Brain,
  Sparkles,
  Layers,
  Cpu,
  Crosshair,
  Swords,
  HelpCircle
} from 'lucide-react';

interface ContentEditorModalProps {
  editingContent?: ContentItem | null;
  onClose: () => void;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  editingContent,
  onClose,
}) => {
  const { addContent, updateContent, customCategories, addCustomCategory } = useApp();

  const isEditing = !!editingContent;

  const [contentType, setContentType] = useState<ContentType>(
    editingContent?.type || 'puzzle'
  );
  const [title, setTitle] = useState(editingContent?.title || '');
  const [description, setDescription] = useState(editingContent?.description || '');
  const [category, setCategory] = useState<string>(
    editingContent?.category || 'Tática'
  );
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const [tags, setTags] = useState<string[]>(editingContent?.tags || []);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(
    editingContent?.difficulty || 2
  );
  const [xpReward, setXpReward] = useState<number>(
    editingContent?.xpReward || 50
  );

  // FEN Global
  const [fen, setFen] = useState<string>(
    editingContent && (editingContent.data as any).initialFen 
      ? (editingContent.data as any).initialFen 
      : (editingContent?.data as PuzzleData)?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );

  // Puzzle state
  const [solutionMoves, setSolutionMoves] = useState<string[]>(
    editingContent?.type === 'puzzle' ? (editingContent.data as PuzzleData).solutionMoves : []
  );
  const [turn, setTurn] = useState<'w' | 'b'>(
    editingContent?.type === 'puzzle' ? (editingContent.data as PuzzleData).turn : 'w'
  );
  const [hint, setHint] = useState<string>(
    editingContent?.type === 'puzzle' ? (editingContent.data as PuzzleData).hint || '' : ''
  );
  const [explanation, setExplanation] = useState<string>(
    editingContent?.type === 'puzzle' ? (editingContent.data as PuzzleData).explanation || '' : ''
  );

  // PGN / Analysis state com perguntas por lance
  const [pgnText, setPgnText] = useState('');
  const [parsedMoves, setParsedMoves] = useState<any[]>(
    editingContent?.type === 'analysis' ? (editingContent.data as AnalysisData).moves || [] : []
  );
  const [guidanceText, setGuidanceText] = useState<string>(
    editingContent?.type === 'analysis' ? (editingContent.data as AnalysisData).guidanceText || '' : ''
  );

  // Bot Match State
  const [botLevel, setBotLevel] = useState<number>(
    editingContent?.type === 'bot_match' ? (editingContent.data as BotMatchData).botLevel : 5
  );
  const [botObjective, setBotObjective] = useState<string>(
    editingContent?.type === 'bot_match' ? (editingContent.data as BotMatchData).objective : 'Vença o bot!'
  );

  // Piece Capture State
  const [targetPieces, setTargetPieces] = useState<string>(
    editingContent?.type === 'piece_capture' ? (editingContent.data as PieceCaptureData).targetPieces.join(', ') : ''
  );

  const handleCreateCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed) {
      addCustomCategory(trimmed);
      setCategory(trimmed);
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleLoadPgn = () => {
    if (!pgnText.trim()) return;

    try {
      const parsed = parsePgnString(pgnText);

      if (!title) {
        setTitle(`${parsed.white} vs ${parsed.black} (${parsed.event})`);
      }

      setFen(parsed.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setParsedMoves(parsed.moves);

      if (contentType === 'puzzle') {
        setFen(parsed.finalFen);
        if (parsed.moves.length > 0) {
          const lastMoves = parsed.moves.slice(-3).map((m) => m.san);
          setSolutionMoves(lastMoves);
        }
      }
    } catch {
      alert('Erro ao interpretar PGN.');
    }
  };

  const handleUpdateMovePrompt = (index: number, prompt: string, required: boolean) => {
    const updated = [...parsedMoves];
    updated[index] = {
      ...updated[index],
      teacherPrompt: prompt,
      requiresStudentReflection: required
    };
    setParsedMoves(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let contentData: any;

    if (contentType === 'puzzle') {
      contentData = { fen, solutionMoves, turn, hint, explanation } as PuzzleData;
    } else if (contentType === 'analysis') {
      contentData = { 
        white: 'Brancas', 
        black: 'Pretas', 
        date: new Date().toLocaleDateString(),
        moves: parsedMoves, 
        guidanceText, 
        initialFen: fen 
      } as AnalysisData;
    } else if (contentType === 'game') {
      const parsed = pgnText.trim() ? parsePgnString(pgnText) : { moves: [] };
      contentData = { ...parsed, initialFen: fen } as GameData;
    } else if (contentType === 'bot_match') {
      contentData = { initialFen: fen, botLevel, objective: botObjective } as BotMatchData;
    } else if (contentType === 'piece_capture') {
      const pieces = targetPieces.split(',').map(s => s.trim()).filter(Boolean);
      contentData = { initialFen: fen, targetPieces: pieces } as PieceCaptureData;
    } else if (contentType === 'pawn_battle') {
      contentData = { initialFen: fen, winningCondition: 'promotion' } as PawnBattleData;
    }

    const payload = {
      type: contentType,
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      difficulty,
      xpReward: Number(xpReward),
      data: contentData,
    };

    if (isEditing && editingContent) {
      updateContent(editingContent.id, payload);
    } else {
      addContent({ ...payload, author: 'Prof. Anderson Lemes' });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
      {/* Margem superior grande (my-12) e padding interno generoso */}
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-12">
        
        {/* Header Principal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{isEditing ? 'Editar Atividade' : 'Criar Nova Atividade'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione o modo de jogo abaixo, configure o tabuleiro e as opções pedagógicas.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de TODOS os Modos de Atividade */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button type="button" onClick={() => setContentType('puzzle')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'puzzle' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <Brain className="w-4 h-4 mb-1 text-blue-600" />
            <span>Tática</span>
          </button>

          <button type="button" onClick={() => setContentType('bot_match')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'bot_match' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <Cpu className="w-4 h-4 mb-1 text-emerald-600" />
            <span>Jogar vs Bot</span>
          </button>

          <button type="button" onClick={() => setContentType('piece_capture')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'piece_capture' ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <Crosshair className="w-4 h-4 mb-1 text-amber-600" />
            <span>Captura</span>
          </button>

          <button type="button" onClick={() => setContentType('pawn_battle')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'pawn_battle' ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <Swords className="w-4 h-4 mb-1 text-orange-600" />
            <span>Peões</span>
          </button>

          <button type="button" onClick={() => setContentType('analysis')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'analysis' ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <MessageSquare className="w-4 h-4 mb-1 text-purple-600" />
            <span>Análise & Perguntas</span>
          </button>

          <button type="button" onClick={() => setContentType('game')} className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center h-20 ${contentType === 'game' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs' : 'border-slate-200 text-slate-600 text-[10px] font-semibold'}`}>
            <FileText className="w-4 h-4 mb-1 text-indigo-600" />
            <span>Didático</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Título e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Atividade *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Mate em 2 ou Análise de Partida" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Categoria</label>
                <button type="button" onClick={() => setShowNewCatInput(!showNewCatInput)} className="text-[11px] font-bold text-blue-600">
                  {showNewCatInput ? 'Cancelar' : '+ Nova'}
                </button>
              </div>
              {showNewCatInput ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder="Nova categoria..." className="w-full px-3 py-2.5 rounded-xl border border-blue-300 text-xs outline-none" />
                  <button type="button" onClick={handleCreateCategory} className="px-3 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0">Add</button>
                </div>
              ) : (
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none">
                  {customCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Descrição e Recompensas */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instruções para o Aluno</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o objetivo..." className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dificuldade</label>
              <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none">
                <option value={1}>⭐ 1</option>
                <option value={2}>⭐⭐ 2</option>
                <option value={3}>⭐⭐⭐ 3</option>
                <option value={4}>⭐⭐⭐⭐ 4</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">XP</label>
              <input type="number" value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none" />
            </div>
          </div>

          {/* Campos específicos do Modo Bot Match */}
          {contentType === 'bot_match' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Nível do Bot (1 a 20)</label>
                <input type="number" min="1" max="20" value={botLevel} onChange={(e) => setBotLevel(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Objetivo da Partida</label>
                <input type="text" value={botObjective} onChange={(e) => setBotObjective(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm outline-none" placeholder="Ex: Derrote o bot" />
              </div>
            </div>
          )}

          {/* Campos específicos do Modo Captura de Peças */}
          {contentType === 'piece_capture' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Casas Alvo (Ex: e4, d5, a8)</label>
              <input type="text" value={targetPieces} onChange={(e) => setTargetPieces(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-amber-300 text-sm outline-none" placeholder="Casas separadas por vírgula..." />
            </div>
          )}

          {/* Configuração de PGN com Perguntas por Lance (Específico para Análise) */}
          {contentType === 'analysis' && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
              <h3 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>Carregar PGN e Definir Perguntas nos Lances</span>
              </h3>

              <div className="flex gap-2">
                <textarea 
                  rows={2} 
                  value={pgnText} 
                  onChange={(e) => setPgnText(e.target.value)} 
                  placeholder="Cole o PGN completo aqui..." 
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                />
                <button type="button" onClick={handleLoadPgn} className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0">
                  Carregar Lances
                </button>
              </div>

              {parsedMoves.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1">
                  <p className="text-[11px] font-bold text-purple-800">Defina perguntas para o aluno em lances específicos:</p>
                  {parsedMoves.map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-center gap-3 text-xs">
                      <span className="font-bold font-mono text-slate-500 w-10">#{idx + 1} ({m.san})</span>
                      <input 
                        type="text" 
                        value={m.teacherPrompt || ''} 
                        onChange={(e) => handleUpdateMovePrompt(idx, e.target.value, true)}
                        placeholder="Pergunta neste lance (ex: Qual o plano aqui?)..."
                        className="w-full px-3 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor de Tabuleiro (Para Táticas e Posicionamento Inicial) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Configuração do Tabuleiro e Solução
                </h3>
              </div>
            </div>

            <PositionEditor
              initialFen={fen}
              initialSolutionMoves={solutionMoves}
              initialTurn={turn}
              onChange={(editorData) => {
                setFen(editorData.fen);
                setTurn(editorData.turn);
                setSolutionMoves(editorData.solutionMoves);
              }}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition">Cancelar</button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition">
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Atividade'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};