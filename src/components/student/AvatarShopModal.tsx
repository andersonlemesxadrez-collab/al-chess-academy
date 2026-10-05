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
  { id: 'skater', label: 'Skater Urbano', category: 'base', emoji: '🛹', cost: 200, description: 'Estilo radical para dominar o tabuleiro.' },
  { id: 'ninja', label: 'Ninja das Sombras', category: 'base', emoji: '🥷', cost: 350, description: 'Movimentos silenciosos e precisos.' },
  { id: 'zombie', label: 'Rocker Zumbi', category: 'base', emoji: '🧟', cost: 300, description: 'Não há derrota que o derrube.' },
  { id: 'robot', label: 'Robô do Futuro', category: 'base', emoji: '🤖', cost: 400, description: 'Cálculos perfeitos em cada lance.' },
  { id: 'alien', label: 'Alienspacer', category: 'base', emoji: '👽', cost: 450, description: 'Estratégias de outro mundo.' },
  { id: 'punk_hair', label: 'Iroquis Vermelho', category: 'hair', emoji: '🔥', cost: 150, description: 'Cabelo punk estilo atitude total.' },
  { id: 'blue_fade', label: 'Degradê Azul', category: 'hair', emoji: '💙', cost: 120, description: 'Moderno e cheio de estilo.' },
  { id: 'afro_puff', label: 'Afro Style', category: 'hair', emoji: '👑', cost: 130, description: 'Clássico, elegante e marcante.' },
  { id: 'crown', label: 'Coroa de Ouro', category: 'hair', emoji: '👑', cost: 250, description: 'Para os verdadeiros reis do xadrez.' },
  { id: 'wizard_hat', label: 'Chapéu Mágico', category: 'hair', emoji: '🧙‍♂️', cost: 180, description: 'Feitiços táticos ocultos.' },
  { id: 'hoodie', label: 'Hoodie Urbano', category: 'outfit', emoji: '🧥', cost: 180, description: 'Moletom com capuz super estiloso.' },
  { id: 'suit', label: 'Terno Executivo', category: 'outfit', emoji: '🕴️️', cost: 250, description: 'Elegância máxima para grandes mestres.' },
  { id: 'sport_shirt', label: 'Camisa Campeão #1', category: 'outfit', emoji: '👕', cost: 100, description: 'O uniforme oficial do vencedor.' },
  { id: 'rock_jacket', label: 'Jaqueta de Couro', category: 'outfit', emoji: '🎸', cost: 220, description: 'Atitude de roqueiro nas partidas.' },
  { id: 'shades', label: 'Óculos Escuros', category: 'accessory', emoji: '🕶', cost: 90, description: 'Foco total sem distrações.' },
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
        avatar: { ...currentAvatar, [item.category]: item.id },
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
        avatar: { ...currentAvatar, [item.category]: item.id },
      });
      triggerConfetti();
    }
  };

  const handleColorChange = (colorId: string) => {
    updateStudent(currentStudent.id, {
      avatar: { ...currentAvatar, color: colorId },
    });
    triggerConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 max-h-[90vh]">
        
        {/* Header Fixo */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Loja de Estilo & XP
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 rounded-xl transition">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Conteúdo com Scroll Interno */}
        <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-black text-amber-900 uppercase">Seu Saldo:</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-black text-lg">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{currentStudent.xp} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
            {SHOP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                    activeTab === cat.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pb-2">
            {activeTab === 'color' ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">Escolha a cor de fundo</h3>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c.id)}
                      className={`w-14 h-14 rounded-full ${c.bgClass} flex items-center justify-center transition-transform shadow-md ${
                        currentAvatar.color === c.id ? 'ring-4 ring-offset-4 ring-blue-500 scale-110' : 'hover:scale-105 active:scale-95'
                      }`}
                    >
                      {currentAvatar.color === c.id && <Check className="w-7 h-7 text-white stroke-3" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {ALL_SHOP_ITEMS.filter((i) => i.category === activeTab).map((item) => {
                  const owned = inventory.includes(item.id);
                  const isEquipped = (currentAvatar as Record<string, any>)[item.category] === item.id;

                  return (
                    <div key={item.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 flex flex-col justify-between transition-all shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-4xl bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">{item.emoji}</span>
                        <div>
                          <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight">{item.label}</h3>
                          <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        {!owned ? (
                          <span className="text-xs font-black text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg">
                            <Award className="w-4 h-4" /> {item.cost} XP
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Adquirido
                          </span>
                        )}

                        <button
                          onClick={() => handleBuyOrEquip(item)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 shadow-sm ${
                            isEquipped
                              ? 'bg-slate-200 text-slate-700 cursor-default shadow-none'
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
        </div>
      </div>
    </div>
  );
};