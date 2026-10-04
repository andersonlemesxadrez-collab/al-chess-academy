import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Award, Sparkles, Check, Shirt, User, Scissors, Glasses, Palette } from 'lucide-react';

interface AvatarShopModalProps {
  onClose: () => void;
}

const SHOP_CATEGORIES = [
  { id: 'base', label: 'Bonecos', icon: User },
  { id: 'hair', label: 'Cabelos / Chapéus', icon: Scissors },
  { id: 'outfit', label: 'Roupas', icon: Shirt },
  { id: 'accessory', label: 'Acessórios', icon: Glasses },
  { id: 'color', label: 'Cores', icon: Palette },
];

const COLORS = [
  { id: '#3B82F6', label: 'Azul Real', bgClass: 'bg-blue-500' },
  { id: '#10B981', label: 'Esmeralda', bgClass: 'bg-emerald-500' },
  { id: '#F59E0B', label: 'Ouro Real', bgClass: 'bg-amber-500' },
  { id: '#8B5CF6', label: 'Roxo Mágico', bgClass: 'bg-purple-500' },
  { id: '#EC4899', label: 'Rosa Brilhante', bgClass: 'bg-pink-500' },
  { id: '#F97316', label: 'Laranja Chama', bgClass: 'bg-orange-500' },
];

const ALL_SHOP_ITEMS = [
  // --- BONECOS (BASE) ---
  { id: 'skater', label: 'Skater Urbano', category: 'base', emoji: '🛹', cost: 200, description: 'Estilo radical para dominar o tabuleiro.' },
  { id: 'ninja', label: 'Ninja das Sombras', category: 'base', emoji: '🥷', cost: 350, description: 'Movimentos silenciosos e precisos.' },
  { id: 'zombie', label: 'Rocker Zumbi', category: 'base', emoji: '🧟', cost: 300, description: 'Não há derrota que o derrube.' },
  { id: 'robot', label: 'Robô do Futuro', category: 'base', emoji: '🤖', cost: 400, description: 'Cálculos perfeitos em cada lance.' },
  { id: 'alien', label: 'Alienspacer', category: 'base', emoji: '👽', cost: 450, description: 'Estratégias de outrem mundo.' },

  // --- CABELOS & CHAPÉUS ---
  { id: 'punk_hair', label: 'Iroquis Vermelho', category: 'hair', emoji: '🔥', cost: 150, description: 'Cabelo punk estilo atitude total.' },
  { id: 'blue_fade', label: 'Degradê Azul', category: 'hair', emoji: '💙', cost: 120, description: 'Moderno e cheio de estilo.' },
  { id: 'afro_puff', label: 'Afro Style', category: 'hair', emoji: '👑', cost: 130, description: 'Clássico, elegante e marcante.' },
  { id: 'crown', label: 'Coroa de Ouro', category: 'hair', emoji: '👑', cost: 250, description: 'Para os verdadeiros reis do xadrez.' },
  { id: 'wizard_hat', label: 'Chapéu Mágico', category: 'hair', emoji: '🧙‍♂️', cost: 180, description: 'Feitiços táticos ocultos.' },

  // --- ROUPAS ---
  { id: 'hoodie', label: 'Hoodie Urbano', category: 'outfit', emoji: '🧥', cost: 180, description: 'Moletom com capuz super estiloso.' },
  { id: 'suit', label: 'Terno Executivo', category: 'outfit', emoji: '🕴️', cost: 250, description: 'Elegância máxima para grandes mestres.' },
  { id: 'sport_shirt', label: 'Camisa Campeão #1', category: 'outfit', emoji: '👕', cost: 100, description: 'O uniforme oficial do vencedor.' },
  { id: 'rock_jacket', label: 'Jaqueta de Couro', category: 'outfit', emoji: '🎸', cost: 220, description: 'Atitude de roqueiro nas partidas.' },

  // --- ACESSÓRIOS ---
  { id: 'shades', label: 'Óculos Escuros', category: 'accessory', emoji: '🕶️️', cost: 90, description: 'Foco total sem distrações.' },
  { id: 'gold_chain', label: 'Corrente de Ouro', category: 'accessory', emoji: '🪙', cost: 150, description: 'Brilho puro no pescoço.' },
  { id: 'headphones', label: 'Fones Gamer', category: 'accessory', emoji: '🎧', cost: 130, description: 'A ouvir a música certa para pensar.' },
];

export const AvatarShopModal: React.FC<AvatarShopModalProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();
  const [activeTab, setActiveTab] = useState<string>('base');

  if (!currentStudent) return null;

  const inventory = currentStudent.inventory || [];
  const currentAvatar = currentStudent.avatar || { base: 'skater', color: '#3B82F6', outfit: 'sport_shirt' };

  const handleBuyOrEquip = (item: typeof ALL_SHOP_ITEMS[0]) => {
    const hasItem = inventory.includes(item.id);

    if (hasItem) {
      updateStudent(currentStudent.id, {
        avatar: {
          ...currentAvatar,
          [item.category]: item.id,
        },
      });
      triggerConfetti();
    } else {
      if (currentStudent.xp < item.cost) {
        alert('Precisas de mais XP para desbloquear este item! Joga mais partidas.');
        return;
      }

      const newXp = currentStudent.xp - item.cost;
      const newInventory = [...inventory, item.id];

      updateStudent(currentStudent.id, {
        xp: newXp,
        inventory: newInventory,
        avatar: {
          ...currentAvatar,
          [item.category]: item.id,
        },
      });
      triggerConfetti();
    }
  };

  const handleColorChange = (colorId: string) => {
    updateStudent(currentStudent.id, {
      avatar: {
        ...currentAvatar,
        color: colorId,
      },
    });
    triggerConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">
              Loja de Estilo & Guarda-Roupa (XP)
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo de XP */}
        <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 uppercase">Teu Saldo de XP:</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 font-black text-base">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{currentStudent.xp} XP</span>
          </div>
        </div>

        {/* Categorias da Loja (Abas) */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2 border-b border-slate-100">
          {SHOP_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === cat.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="mt-5">
          {activeTab === 'color' ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Escolha a cor de fundo do seu avatar</h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorChange(c.id)}
                    className={`w-12 h-12 rounded-full ${c.bgClass} flex items-center justify-center transition-transform shadow-md ${
                      currentAvatar.color === c.id ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {currentAvatar.color === c.id && <Check className="w-6 h-6 text-white stroke-3" />}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {ALL_SHOP_ITEMS.filter((i) => i.category === activeTab).map((item) => {
                const owned = inventory.includes(item.id);
                const isEquipped = (currentAvatar as Record<string, any>)[item.category] === item.id;

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 flex flex-col justify-between transition-all">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl bg-white p-2 rounded-2xl shadow-xs border border-slate-100">{item.emoji}</span>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      {!owned ? (
                        <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> {item.cost} XP
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Adquirido
                        </span>
                      )}

                      <button
                        onClick={() => handleBuyOrEquip(item)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                          isEquipped
                            ? 'bg-slate-200 text-slate-700 cursor-default'
                            : owned
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {isEquipped ? 'Equipado' : owned ? 'Equipar' : 'Comprar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition">
            Concluir / Voltar
          </button>
        </div>
      </div>
    </div>
  );
};