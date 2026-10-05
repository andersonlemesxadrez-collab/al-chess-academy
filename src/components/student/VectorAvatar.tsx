import React, { useMemo } from 'react';
import { BASE, LAYERS } from './avatarKit';
import { LEGACY_DEFAULT, Category } from './avatarCatalog';

// Ordem de empilhamento, de trás para a frente. Não depende da ordem das chaves do objeto.
const ORDER: Category[] = ['outfit', 'shoes', 'hair', 'hat', 'accessory', 'neck', 'item', 'companion'];

interface VectorAvatarProps {
  gender?: 'm' | 'f';
  /** Ex.: { outfit: 'C', hat: 'W', item: null }. Aceita também true (usa o item por defeito). */
  equippedLayers?: Record<string, string | null | boolean | undefined>;
  /** Classe de tamanho do <svg>. */
  size?: string;
  /** Recorte opcional, útil para miniaturas (ex.: "332 20 360 360"). */
  viewBox?: string;
}

export const VectorAvatar: React.FC<VectorAvatarProps> = ({
  gender = 'm',
  equippedLayers = {},
  size = 'w-full h-full',
  viewBox = '0 0 1024 1024',
}) => {
  const markup = useMemo(() => {
    let svg = BASE[gender] || BASE.m;
    for (const category of ORDER) {
      const v = equippedLayers[category];
      if (!v) continue;
      const id = typeof v === 'string' ? v : LEGACY_DEFAULT[category];
      const layer = LAYERS[category]?.[id];
      if (layer) svg += layer;
    }
    return svg;
  }, [gender, equippedLayers]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={size}
      role="img"
      aria-label="Avatar"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};