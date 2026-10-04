import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AvatarBadge } from './AvatarBadge';
import { X, Check, Sparkles } from 'lucide-react';

interface AvatarCustomizerModalProps {
  onClose: () => void;
}

const BASES = [
  { id: 'lion', label: 'Leão', emoji: '🦁' },
  { id: 'bear', label: 'Urso', emoji: '🐻' },
  { id: 'cat', label: 'Gatinho', emoji: '🐱' },
  { id: 'knight', label: 'Cavalo', emoji: '♞' },
  { id: 'rook', label: 'Torre', emoji: '♜' },
  { id: 'bishop', label: 'Bispo', emoji: '♝' },
  { id: 'queen', label: 'Dama', emoji: '♛' },
  { id: 'king', label: 'Rei', emoji: '♚' },
  { id: 'pawn', label: 'Peão', emoji: '♟️' },
];

const COLORS = [
  { id: '#3B82F6', label: 'Azul Real', bgClass: 'bg-blue-500' },
  { id: '#10B981', label: 'Esmeralda', bgClass: 'bg-emerald-500' },
  { id: '#F59E0B', label: 'Ouro Real', bgClass: 'bg-amber-500' },
  { id: '#8B5CF6', label: 'Roxo Mágico', bgClass: 'bg-purple-500' },
  { id: '#EC4899', label: 'Rosa Brilhante', bgClass: 'bg-pink-500' },
  { id: '#F97316', label: 'Laranja Chama', bgClass: 'bg-orange-500' },
  { id: '#1B2A4A', label: 'Navy Mestre', bgClass: 'bg-slate-800' },
];

const HATS = [
  { id: undefined, label: 'Sem chapéu', emoji: '❌' },
  { id: 'crown', label: 'Coroa Real', emoji: '👑' },
  { id: 'cap', label: 'Boné Tático', emoji: '🧢' },
  { id: 'wizard', label: 'Mago do Xadrez', emoji: '🧙‍♂️' },
  { id: 'glasses', label: 'Óculos Estilosos', emoji: '🕶️' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();

  if (!currentStudent) return null;

  const [base, setBase] = useState(currentStudent.avatar.base || 'knight');
  const [color, setColor] = useState(currentStudent.avatar.color || '#3B82F6');
  const [hat, setHat] = useState<string | undefined>(currentStudent.avatar.hat);

  // Temporary student object for live preview
  const previewStudent = {
    ...currentStudent,
    avatar: {
      base,
      color,
      hat,
    },
  };

  const handleSave = () => {
    updateStudent(currentStudent.id, {
      avatar: {
        base,
        color,
        hat,
      },
    });
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">
              Personalizar Meu Avatar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="mt-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100 shadow-inner">
          <AvatarBadge student={previewStudent} size="xl" />
          <h3 className="text-base font-extrabold text-slate-800 mt-4">
            {previewStudent.name}
          </h3>
          <span className="text-xs font-semibold text-blue-600">
            {previewStudent.rankName} (Nível {previewStudent.levelRank})
          </span>
        </div>

        {/* Character Base Selection */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Escolha seu Personagem / Peça
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BASES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBase(b.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    base === b.id
                      ? 'border-blue-600 bg-blue-50 shadow-xs scale-105'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Escolha sua Cor Favorita
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-9 h-9 rounded-full ${c.bgClass} flex items-center justify-center transition-transform shadow-xs ${
                    color === c.id ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {color === c.id && <Check className="w-4 h-4 text-white stroke-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hat / Accessory Selection */}
          {currentStudent.kidsMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Acessório Especial
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {HATS.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHat(h.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      hat === h.id
                        ? 'border-amber-500 bg-amber-50 shadow-xs scale-105'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-[9px] font-bold text-slate-700 mt-1 truncate">
                      {h.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Meu Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
