export type Category =
  | 'outfit' | 'shoes' | 'hair' | 'hat' | 'accessory' | 'neck' | 'item' | 'companion';

export type Gender = 'm' | 'f';
export type Equipped = Partial<Record<Category, string>>; // '' ou ausente = nada equipado

export interface CatalogItem {
  category: Category;
  id: string;
  label: string;
  cost: number;
}

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'outfit', label: 'Roupas', emoji: '👕' },
  { id: 'shoes', label: 'Ténis', emoji: '👟' },
  { id: 'hair', label: 'Cabelos', emoji: '💇' },
  { id: 'hat', label: 'Chapéus', emoji: '🎩' },
  { id: 'accessory', label: 'Acessórios', emoji: '🕶️' },
  { id: 'neck', label: 'Colares', emoji: '📿' },
  { id: 'item', label: 'Itens', emoji: '🎸' },
  { id: 'companion', label: 'Mascotes', emoji: '🐶' },
];

const c = (category: Category, id: string, label: string, cost: number): CatalogItem => ({ category, id, label, cost });

export const CATALOG: CatalogItem[] = [
  c('outfit', 'A', 'Casaco Desportivo', 100),
  c('outfit', 'B', 'Jaqueta Rock/Zombie', 150),
  c('outfit', 'C', 'Fato de Grande Mestre', 300),
  c('outfit', 'D', 'Camisola de Futebol', 120),
  c('outfit', 'E', 'Super-herói', 180),
  c('outfit', 'F', 'Armadura de Cavaleiro', 220),
  c('outfit', 'G', 'Fato de Dino', 150),
  c('outfit', 'H', 'Astronauta', 200),
  c('outfit', 'I', 'Pijama de Patinho', 120),
  c('outfit', 'J', 'Pirata', 160),
  c('outfit', 'T1', 'Time: Vermelho e Preto', 120),
  c('outfit', 'T2', 'Time: Azul e Branco', 120),
  c('outfit', 'T3', 'Time: Amarelo e Verde', 120),
  c('outfit', 'T4', 'Time: Branco com Faixa', 120),
  c('outfit', 'T5', 'Time: Preto e Branco', 120),

  c('shoes', 'W', 'Ténis Brancos', 60),
  c('shoes', 'R', 'Ténis Cano Alto', 90),
  c('shoes', 'N', 'Ténis Neon', 100),
  c('shoes', 'K', 'Botas Gamer', 120),

  c('hair', 'A', 'Cabelo Anime', 80),
  c('hair', 'B', 'Degradê com Fita', 60),
  c('hair', 'C', 'Coroa de Rei', 300),
  c('hair', 'D', 'Black Power', 80),
  c('hair', 'E', 'Rabo-de-cavalo', 70),
  c('hair', 'F', 'Tranças', 80),
  c('hair', 'G', 'Moicano', 90),

  c('hat', 'C', 'Boné', 70),
  c('hat', 'B', 'Gorro', 70),
  c('hat', 'T', 'Cartola', 120),
  c('hat', 'W', 'Chapéu Mágico', 200),
  c('hat', 'Y', 'Orelhas de Gato', 100),
  c('hat', 'U', 'Unicórnio', 150),
  c('hat', 'P', 'Chapéu de Pirata', 130),

  c('accessory', 'S', 'Óculos de Sol', 80),
  c('accessory', 'H', 'Headphones Gamer', 150),
  c('accessory', 'R', 'Óculos Redondos', 60),
  c('accessory', 'M', 'Máscara de Herói', 100),
  c('accessory', 'C', 'Nariz de Palhaço', 40),
  c('accessory', 'B', 'Bigode Falso', 40),

  c('neck', 'G', 'Corrente de Ouro', 150),
  c('neck', 'S', 'Corrente de Prata', 100),
  c('neck', 'M', 'Medalha de Campeão', 120),

  c('item', 'G', 'Guitarra', 250),
  c('item', 'P', 'Peão', 100),
  c('item', 'K', 'Rei', 200),
  c('item', 'S', 'Skate', 180),
  c('item', 'O', 'Bola de Futebol', 80),
  c('item', 'L', 'Balão', 50),

  c('companion', 'D', 'Cachorro', 300),
  c('companion', 'G', 'Gato', 300),
  c('companion', 'C', 'Capivara', 400),
  c('companion', 'P', 'Patinho', 200),
  c('companion', 'R', 'Dragãozinho', 500),
];

export const key = (category: Category, id: string) => `${category}:${id}`;

/** Compatibilidade com dados antigos (equipped booleano / inventário com ids genéricos). */
export const LEGACY_DEFAULT: Record<Category, string> = {
  outfit: 'A', shoes: 'N', hair: '', hat: 'W', accessory: 'S', neck: '', item: 'K', companion: 'R',
};

export function normalizeEquipped(raw: unknown): Equipped {
  const out: Equipped = {};
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  for (const { id } of CATEGORIES) {
    const v = src[id];
    out[id] = typeof v === 'string' ? v : v === true ? LEGACY_DEFAULT[id] : '';
  }
  return out;
}

export function isOwned(inventory: string[], category: Category, id: string): boolean {
  return inventory.includes(key(category, id)) || (inventory.includes(category) && LEGACY_DEFAULT[category] === id);
}