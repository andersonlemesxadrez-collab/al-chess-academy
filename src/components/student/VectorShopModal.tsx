import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Award, Sparkles, Shirt, Palette, Check, Lock } from 'lucide-react';
import { VectorAvatar } from './VectorAvatar';

interface VectorShopModalProps {
  onClose: () => void;
}

const CATALOG = [
  { id: 'outfit', category: 'outfit', label: 'Roupa Estilizada', cost: 150, description: 'Colete desportivo e calças de xadrez.' },
  { id: 'shoes', category: 'shoes', label: 'Ténis Neon', cost: 100, description: 'Sapatos luminosos de alta velocidade.' },
  { id: 'hat', category: 'hat', label: 'Chapéu Mágico', cost: 200, description: 'Sinal de sabedoria no tabuleiro.' },
  { id: 'accessory', category: 'accessory', label: 'Óculos Táticos', cost: 120, description: 'Foco total nas diagonais.' },
  { id: 'item', category: 'item', label: 'Peça de Ouro', cost: 250, description: 'Leve um rei em miniatura na mão.' },
  { id: 'companion', category: 'companion', label: 'Mascote Dragão', cost: 500, description: 'Um fiel companheiro voador.' },
];

const BG_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#1E293B'];

export const VectorShopModal: React.FC<VectorShopModalProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();
  const [activeTab, setActiveTab] = useState<'shop' | 'wardrobe' | 'colors'>('shop');

  if (!currentStudent) return null;

  const inventory = currentStudent.inventory || ['outfit', 'shoes', 'hat', 'accessory', 'item', 'companion'];
  const equipped = currentStudent.avatar?.equipped || {
    outfit: true,
    shoes: true,
    hat: true,
    accessory: true,
    item: true,
    companion: true,
  };
  const avatarColor = currentStudent.avatar?.color || '#F59E0B';

  const [previewEquipped, setPreviewEquipped] = useState(equipped);
  const [previewColor, setPreviewColor] = useState(avatarColor);

  const handleBuy = (item: typeof CATALOG[0]) => {
    if (currentStudent.xp < item.cost) {
      alert('Pontos XP insuficientes! Resolve mais exercícios para ganhares XP.');
      return;
    }

    const newXp = currentStudent.xp - item.cost;
    const newInventory = [...inventory, item.id];
    const newEquipped = { ...previewEquipped, [item.id]: true };

    setPreviewEquipped(newEquipped);
    updateStudent(currentStudent.id, {
      xp: newXp,
      inventory: newInventory,
      avatar: { ...currentStudent.avatar, color: previewColor, equipped: newEquipped }
    });
    triggerConfetti();
  };

  const handleToggleEquip = (itemId: string) => {
    const newEquipped = { ...previewEquipped, [itemId]: !previewEquipped[itemId as keyof typeof previewEquipped] };
    setPreviewEquipped(newEquipped);
    updateStudent(currentStudent.id, {
      avatar: { ...currentStudent.avatar, color: previewColor, equipped: newEquipped }
    });
  };

  const handleSelectColor = (color: string) => {
    setPreviewColor(color);
    updateStudent(currentStudent.id, {
      avatar: { ...currentStudent.avatar, color, equipped: previewEquipped }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        
        {/* Header do Modal com fecho optimizado para mobile */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Estúdio & Loja Vetorial
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Painel Superior: Pré-visualização e Saldo XP */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center shrink-0">
          <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
              <span className="text-xs font-extrabold text-amber-900 uppercase">Teu Saldo de XP:</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-black text-lg">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{currentStudent.xp} XP</span>
            </div>
          </div>

          {/* Avatar Preview ao vivo com a cor escolhida */}
          <div 
            className="flex justify-center rounded-2xl p-2 h-32 border-2 border-white shadow-md relative overflow-hidden transition-colors"
            style={{ backgroundColor: previewColor }}
          >
            <div className="w-full h-full transform scale-75 flex items-center justify-center">
              <VectorAvatar
                outfit={previewEquipped.outfit}
                shoes={previewEquipped.shoes}
                hat={previewEquipped.hat}
                accessory={previewEquipped.accessory}
                item={previewEquipped.item}
                companion={previewEquipped.companion}
                size="h-full"
              />
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Estúdio */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'shop' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🛍️ Loja XP (Comprar)
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'wardrobe' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👕 Guarda-Roupa (Equipar)
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'colors' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎨 Cor de Fundo
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas (Com Scroll Independente) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          
          {/* ABA 1: LOJA XP */}
          {activeTab === 'shop' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATALOG.map((item) => {
                const isOwned = inventory.includes(item.id);
                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
                        <Shirt className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        <Award className="w-4 h-4" /> {item.cost} XP
                      </span>

                      {isOwned ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Adquirido
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition active:scale-95"
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 2: GUARDA-ROUPA */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATALOG.map((item) => {
                const isOwned = inventory.includes(item.id);
                const isEquipped = previewEquipped[item.id as keyof typeof previewEquipped];

                if (!isOwned) {
                  return (
                    <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-100/60 flex items-center justify-between opacity-60">
                      <div>
                        <h3 className="font-bold text-slate-700 text-sm">{item.label}</h3>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3" /> Bloqueado (Disponível na Loja)
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                      <span className="text-[10px] font-bold text-blue-600">Disponível no inventário</span>
                    </div>

                    <button
                      onClick={() => handleToggleEquip(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                        isEquipped ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isEquipped ? 'Desequipar' : 'Equipar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 3: COR DE FUNDO */}
          {activeTab === 'colors' && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Escolhe a cor de fundo do teu perfil:</h3>
              <div className="flex flex-wrap gap-3">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSelectColor(color)}
                    className={`w-12 h-12 rounded-2xl transition transform hover:scale-110 active:scale-95 shadow-md border-4 ${
                      previewColor === color ? 'border-slate-900 ring-2 ring-amber-400' : 'border-white'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md">
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};