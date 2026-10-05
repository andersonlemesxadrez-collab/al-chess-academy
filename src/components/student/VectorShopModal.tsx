import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Award, Sparkles, Lock, Check } from 'lucide-react';
import { VectorAvatar } from './VectorAvatar';
import {
  CATALOG, CATEGORIES, Category, CatalogItem, Equipped, Gender,
  isOwned, key, normalizeEquipped,
} from './avatarCatalog';

interface VectorShopModalProps {
  onClose: () => void;
}

const BG_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#1E293B'];

// Recorte do avatar nas miniaturas, para o item aparecer em destaque.
const THUMB_VIEW: Record<Category, string> = {
  outfit: '212 400 600 600',
  shoes: '352 720 320 320',
  hair: '332 20 360 360',
  hat: '332 20 360 360',
  accessory: '332 20 360 360',
  neck: '362 420 300 300',
  item: '212 420 600 600',
  companion: '662 760 300 300',
};

export const VectorShopModal: React.FC<VectorShopModalProps> = ({ onClose }) => {
  const { currentStudent, updateStudent, triggerConfetti, role } = useApp();
  const isTeacher = role === 'teacher';

  const [activeTab, setActiveTab] = useState<'shop' | 'wardrobe' | 'colors'>('shop');
  const [activeCat, setActiveCat] = useState<Category>('outfit');
  const [equipped, setEquipped] = useState<Equipped>(() =>
    normalizeEquipped((currentStudent as any)?.avatar?.equipped)
  );
  const [color, setColor] = useState<string>((currentStudent as any)?.avatar?.color || '#F59E0B');
  const [gender, setGender] = useState<Gender>((currentStudent as any)?.avatar?.gender || 'm');

  if (!currentStudent && !isTeacher) return null;

  const inventory: string[] = (currentStudent as any)?.inventory || [];
  const owned = (it: CatalogItem) => isTeacher || isOwned(inventory, it.category, it.id);
  const items = CATALOG.filter((it) => it.category === activeCat);

  const persist = (next: { equipped?: Equipped; color?: string; gender?: Gender; xp?: number; inventory?: string[] }) => {
    if (!currentStudent) return;
    const avatar = (currentStudent as any).avatar || {};
    updateStudent(currentStudent.id, {
      ...(next.xp !== undefined && { xp: next.xp }),
      ...(next.inventory && { inventory: next.inventory }),
      avatar: {
        ...avatar,
        color: next.color ?? color,
        gender: next.gender ?? gender,
        equipped: next.equipped ?? equipped,
      },
    } as any);
  };

  const handleBuy = (it: CatalogItem) => {
    if (!currentStudent) return;
    if (currentStudent.xp < it.cost) {
      alert('Pontos XP insuficientes! Resolva mais exercícios para ganhar XP.');
      return;
    }
    const nextEquipped = { ...equipped, [it.category]: it.id };
    setEquipped(nextEquipped);
    persist({
      xp: currentStudent.xp - it.cost,
      inventory: [...inventory, key(it.category, it.id)],
      equipped: nextEquipped,
    });
    triggerConfetti();
  };

  const handleToggleEquip = (it: CatalogItem) => {
    const nextEquipped = { ...equipped, [it.category]: equipped[it.category] === it.id ? '' : it.id };
    setEquipped(nextEquipped);
    persist({ equipped: nextEquipped });
  };

  const handleColor = (c: string) => {
    setColor(c);
    persist({ color: c });
  };

  const handleGender = (g: Gender) => {
    setGender(g);
    persist({ gender: g });
  };

  const tabBtn = (id: typeof activeTab, label: string, active: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
        activeTab === id ? `${active} text-white shadow-sm` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  const Thumb = ({ it }: { it: CatalogItem }) => (
    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
      <VectorAvatar gender={gender} equippedLayers={{ [it.category]: it.id }} viewBox={THUMB_VIEW[it.category]} size="h-full" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {isTeacher ? 'Estúdio 3D (Modo Professor - Tudo Liberado)' : 'Estúdio e Loja Vetorial'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo + pré-visualização */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center shrink-0">
          <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
              <span className="text-xs font-extrabold text-amber-900 uppercase">Seu Saldo de XP:</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-black text-lg">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{isTeacher ? '∞' : `${currentStudent?.xp || 0} XP`}</span>
            </div>
          </div>

          <div
            className="flex justify-center rounded-2xl p-2 h-44 border-2 border-white shadow-md relative overflow-hidden transition-colors"
            style={{ backgroundColor: color }}
          >
            <VectorAvatar gender={gender} equippedLayers={equipped} size="h-full" />
          </div>
        </div>

        {/* Abas principais */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 shrink-0 overflow-x-auto">
          {tabBtn('shop', '🛍️ Loja XP (Comprar)', 'bg-amber-500')}
          {tabBtn('wardrobe', '👕 Guarda-roupa (Equipar)', 'bg-blue-600')}
          {tabBtn('colors', '🎨 Personagem e Cor', 'bg-indigo-600')}
        </div>

        {/* Categorias (loja e guarda-roupa) */}
        {activeTab !== 'colors' && (
          <div className="flex items-center gap-2 pt-3 shrink-0 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                  activeCat === cat.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Listagem */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {activeTab === 'shop' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((it) => (
                <div key={key(it.category, it.id)} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <Thumb it={it} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{it.label}</h3>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        <Award className="w-4 h-4" /> {it.cost} XP
                      </span>
                      {owned(it) ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> {isTeacher ? 'Liberado' : 'Adquirido'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuy(it)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition active:scale-95"
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((it) => {
                const isEquipped = equipped[it.category] === it.id;
                if (!owned(it)) {
                  return (
                    <div key={key(it.category, it.id)} className="p-3 rounded-2xl border border-slate-200 bg-slate-100/60 flex items-center gap-3 opacity-60">
                      <Thumb it={it} />
                      <div>
                        <h3 className="font-bold text-slate-700 text-sm">{it.label}</h3>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3" /> Bloqueado (compre na Loja)
                        </span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key(it.category, it.id)} className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3">
                    <Thumb it={it} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{it.label}</h3>
                      <button
                        onClick={() => handleToggleEquip(it)}
                        className={`mt-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                          isEquipped ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isEquipped ? 'Desequipar' : 'Equipar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Personagem:</h3>
                <div className="flex gap-2">
                  {([['m', '👦 Menino'], ['f', '👧 Menina']] as [Gender, string][]).map(([g, label]) => (
                    <button
                      key={g}
                      onClick={() => handleGender(g)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        gender === g ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Escolha a cor de fundo do seu perfil:</h3>
                <div className="flex flex-wrap gap-3">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColor(c)}
                      aria-label={`Cor ${c}`}
                      className={`w-12 h-12 rounded-2xl transition transform hover:scale-110 active:scale-95 shadow-md border-4 ${
                        color === c ? 'border-slate-900 ring-2 ring-amber-400' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};