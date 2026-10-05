import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Award, Sparkles, Check, Shirt } from 'lucide-react';
import { VectorAvatar } from './VectorAvatar';

interface VectorShopModalProps {
  onClose: () => void;
}

const SHOP_ITEMS = [
  { id: 'outfit', label: 'Roupa Estilizada', cost: 150, description: 'Colete desportivo e calças de xadrez.' },
  { id: 'shoes', label: 'Ténis Neon', cost: 100, description: 'Sapatos luminosos de alta velocidade.' },
  { id: 'hat', label: 'Chapéu Mágico', cost: 200, description: 'Sinal de sabedoria no tabuleiro.' },
  { id: 'accessory', label: 'Óculos Táticos', cost: 120, description: 'Foco total nas diagonais.' },
  { id: 'item', label: 'Peça de Ouro', cost: 250, description: 'Leve um rei em miniatura na mão.' },
  { id: 'companion', label: 'Mascote Dragão', cost: 500, description: 'Um fiel companheiro voador.' },
];

export const VectorShopModal: React.FC<VectorShopModalProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();

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

  const [previewEquipped, setPreviewEquipped] = useState(equipped);

  const handleToggleEquipOrBuy = (itemId: string, cost: number) => {
    const hasItem = inventory.includes(itemId);

    if (hasItem) {
      // Alterna entre equipar e desequipar
      const newEquipped = { ...previewEquipped, [itemId]: !previewEquipped[itemId as keyof typeof previewEquipped] };
      setPreviewEquipped(newEquipped);
      updateStudent(currentStudent.id, {
        avatar: { ...currentStudent.avatar, equipped: newEquipped }
      });
      triggerConfetti();
    } else {
      if (currentStudent.xp < cost) {
        alert('Precisas de mais XP para desbloquear este item! Resolve mais exercícios.');
        return;
      }

      const newXp = currentStudent.xp - cost;
      const newInventory = [...inventory, itemId];
      const newEquipped = { ...previewEquipped, [itemId]: true };

      setPreviewEquipped(newEquipped);
      updateStudent(currentStudent.id, {
        xp: newXp,
        inventory: newInventory,
        avatar: { ...currentStudent.avatar, equipped: newEquipped }
      });
      triggerConfetti();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">
              Loja e Guarda-Roupa Vetorial (XP)
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo de XP e Pré-visualização ao vivo */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase">Teu Saldo de XP:</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-black text-base">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{currentStudent.xp} XP</span>
            </div>
          </div>

          <div className="flex justify-center bg-slate-100 rounded-2xl p-2 h-28 border border-slate-200">
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

        {/* Lista de Itens da Loja */}
        <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {SHOP_ITEMS.map((item) => {
            const owned = inventory.includes(item.id);
            const isEquipped = previewEquipped[item.id as keyof typeof previewEquipped];

            return (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
                    <Shirt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {!owned && (
                    <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {item.cost} XP
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleEquipOrBuy(item.id, item.cost)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isEquipped
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : owned
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {isEquipped ? 'Desequipar' : owned ? 'Equipar' : 'Comprar'}
                  </button>
                </div>
              </div>
            );
          })}
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