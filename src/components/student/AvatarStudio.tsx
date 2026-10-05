import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Award, Sparkles, Shirt, User, Scissors, Glasses, 
  Check, ShoppingBag
} from 'lucide-react';

interface AvatarStudioProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'base', label: 'Corpo Base', icon: User },
  { id: 'hair', label: 'Cabelo & Cabeça', icon: Scissors },
  { id: 'outfit', label: 'Roupas', icon: Shirt },
  { id: 'accessory', label: 'Acessórios', icon: Glasses },
];

const SHOP_ITEMS = [
  // BASES
  { id: 'base_boy', label: 'Rapaz 3D', category: 'base', cost: 0, image: '/avatars/bases/boy.png', color: 'bg-orange-200' },
  { id: 'base_girl', label: 'Rapariga 3D', category: 'base', cost: 0, image: '/avatars/bases/girl.png', color: 'bg-orange-200' },
  { id: 'base_robot', label: 'Ciborgue', category: 'base', cost: 1000, image: '/avatars/bases/robot.png', color: 'bg-slate-400' },
  
  // ROUPAS
  { id: 'outfit_casual', label: 'Casaco Verde', category: 'outfit', cost: 150, image: '/avatars/outfits/casual_green.png', color: 'bg-emerald-500' },
  { id: 'outfit_ninja', label: 'Traje Ninja', category: 'outfit', cost: 500, image: '/avatars/outfits/ninja.png', color: 'bg-slate-900' },
  { id: 'outfit_suit', label: 'Fato de Mestre', category: 'outfit', cost: 800, image: '/avatars/outfits/suit.png', color: 'bg-blue-900' },

  // CABELOS
  { id: 'hair_spiky', label: 'Espetado Moderno', category: 'hair', cost: 100, image: '/avatars/hair/spiky.png', color: 'bg-amber-800' },
  { id: 'hair_pony', label: 'Rabo de Cavalo Rosa', category: 'hair', cost: 150, image: '/avatars/hair/pony.png', color: 'bg-pink-400' },
  
  // ACESSÓRIOS
  { id: 'acc_glasses', label: 'Óculos de Sol', category: 'accessory', cost: 200, image: '/avatars/accessories/glasses.png', color: 'bg-slate-800' },
  { id: 'acc_headphones', label: 'Fones Gamer', category: 'accessory', cost: 300, image: '/avatars/accessories/headphones.png', color: 'bg-red-500' },
];

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti } = useApp();
  const [activeTab, setActiveTab] = useState<string>('outfit');

  if (!currentStudent) return null;

  const inventory = currentStudent.inventory || ['base_boy', 'base_girl'];
  const [previewAvatar, setPreviewAvatar] = useState(
    currentStudent.avatar || { base: 'base_boy', outfit: null, hair: null, accessory: null }
  );

  const handleEquipOrBuy = (item: typeof SHOP_ITEMS[0]) => {
    const hasItem = inventory.includes(item.id);

    if (hasItem) {
      const newAvatar = { ...previewAvatar, [item.category]: item.id };
      setPreviewAvatar(newAvatar);
      updateStudent(currentStudent.id, { avatar: newAvatar });
      triggerConfetti();
    } else {
      if (currentStudent.xp < item.cost) {
        alert('Pontos XP insuficientes! Resolve mais exercícios para ganhares XP.');
        return;
      }
      const newAvatar = { ...previewAvatar, [item.category]: item.id };
      setPreviewAvatar(newAvatar);
      updateStudent(currentStudent.id, {
        xp: currentStudent.xp - item.cost,
        inventory: [...inventory, item.id],
        avatar: newAvatar,
      });
      triggerConfetti();
    }
  };

  const handleRemoveItem = (category: string) => {
    if (category === 'base') return; // Não pode ficar sem corpo
    const newAvatar = { ...previewAvatar, [category]: null };
    setPreviewAvatar(newAvatar);
    updateStudent(currentStudent.id, { avatar: newAvatar });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-slate-900 animate-fadeIn">
      {/* Lado Esquerdo: O Pódio do Avatar */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative bg-gradient-to-b from-slate-800 to-slate-950 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col items-center justify-center pt-10 lg:pt-0">
        
        <button onClick={onClose} className="absolute top-4 left-4 lg:top-6 lg:left-6 p-2 lg:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50 backdrop-blur-md">
          <X className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 lg:w-96 lg:h-96 bg-blue-500/20 rounded-full blur-[80px]" />
        
        {/* Renderização em Camadas */}
        <div className="relative w-48 h-64 lg:w-80 lg:h-[500px] flex items-center justify-center z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
          
          {/* Fallback visual: Mostra blocos de cor enquanto não tem os PNGs */}
          <div className="absolute bottom-0 w-24 h-48 lg:w-32 lg:h-80 rounded-full opacity-30 blur-sm flex flex-col items-center justify-end gap-2 pb-4">
             {previewAvatar.hair && <div className="w-16 h-16 rounded-full bg-amber-500"/>}
             {previewAvatar.outfit && <div className="w-full h-1/2 rounded-3xl bg-emerald-500"/>}
             {previewAvatar.base && <div className="w-full h-full absolute -z-10 rounded-3xl bg-orange-200"/>}
          </div>

          {/* Camadas reais de Imagem (Carregam os ficheiros PNG da pasta public/avatars/...) */}
          {previewAvatar.base && <img src={SHOP_ITEMS.find(i => i.id === previewAvatar.base)?.image} className="absolute inset-0 w-full h-full object-contain z-10" alt="Base" onError={(e) => e.currentTarget.style.display = 'none'} />}
          {previewAvatar.outfit && <img src={SHOP_ITEMS.find(i => i.id === previewAvatar.outfit)?.image} className="absolute inset-0 w-full h-full object-contain z-20" alt="Roupa" onError={(e) => e.currentTarget.style.display = 'none'} />}
          {previewAvatar.hair && <img src={SHOP_ITEMS.find(i => i.id === previewAvatar.hair)?.image} className="absolute inset-0 w-full h-full object-contain z-30" alt="Cabelo" onError={(e) => e.currentTarget.style.display = 'none'} />}
          {previewAvatar.accessory && <img src={SHOP_ITEMS.find(i => i.id === previewAvatar.accessory)?.image} className="absolute inset-0 w-full h-full object-contain z-40" alt="Acessório" onError={(e) => e.currentTarget.style.display = 'none'} />}
        </div>

        <div className="w-48 lg:w-[400px] h-8 lg:h-12 bg-white/5 rounded-[100%] absolute bottom-10 lg:bottom-24 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-white/10" />
        
        <div className="absolute bottom-4 lg:bottom-8 text-center z-20 hidden lg:block">
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{currentStudent.name}</h2>
        </div>
      </div>

      {/* Lado Direito: Loja e Inventário */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-slate-50 flex flex-col relative">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600"/> Estúdio 3D
            </h1>
            <div className="flex items-center gap-2 lg:gap-3 bg-amber-50 border border-amber-200 px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />
              <div className="flex flex-col text-right lg:text-left">
                <span className="text-[9px] lg:text-[10px] font-bold text-amber-700 uppercase leading-none">XP Disponível</span>
                <span className="text-base lg:text-lg font-black text-amber-600 leading-none mt-0.5">{currentStudent.xp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-95 ${
                    isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {activeTab !== 'base' && previewAvatar[activeTab as keyof typeof previewAvatar] && (
            <button onClick={() => handleRemoveItem(activeTab)} className="mb-4 w-full py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-rose-200">
              <X className="w-4 h-4"/> Remover item atual
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SHOP_ITEMS.filter(i => i.category === activeTab).map((item) => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = previewAvatar[item.category as keyof typeof previewAvatar] === item.id;

              return (
                <div key={item.id} className={`relative bg-white rounded-2xl p-3 sm:p-4 border-2 transition-all flex flex-col justify-between h-48 sm:h-56 ${isEquipped ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-blue-300'}`}>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                    {isEquipped ? (
                      <div className="bg-blue-500 text-white p-1 rounded-full"><Check className="w-3 h-3 stroke-3" /></div>
                    ) : isOwned ? (
                      <div className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[9px] font-bold">Adquirido</div>
                    ) : null}
                  </div>

                  <div className="h-20 sm:h-24 w-full bg-slate-50 rounded-xl mb-2 sm:mb-3 flex items-center justify-center border border-slate-100 overflow-hidden relative">
                     <div className={`absolute inset-0 opacity-20 ${item.color}`} />
                     <span className="text-[10px] text-slate-400 font-bold z-10">Imagem 3D aqui</span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm leading-tight line-clamp-2">{item.label}</h3>
                  </div>

                  <button
                    onClick={() => handleEquipOrBuy(item)}
                    className={`mt-2 w-full py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                      isEquipped ? 'bg-blue-50 text-blue-700 cursor-default' : 
                      isOwned ? 'bg-slate-900 text-white hover:bg-slate-800' : 
                      'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                    }`}
                  >
                    {isEquipped ? 'Equipado' : isOwned ? 'Usar Item' : (
                      <span className="flex items-center justify-center gap-1">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4" /> {item.cost} XP
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};