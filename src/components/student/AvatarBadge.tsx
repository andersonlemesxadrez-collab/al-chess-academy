import React from 'react';
import { Student } from '../../types/chess';
import { VectorAvatar } from './VectorAvatar';

interface AvatarBadgeProps {
  student: Student;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  student,
  size = 'md',
}) => {
  const { kidsMode, avatar } = student;

  const sizeContainerClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  if (!kidsMode) {
    const initials = student.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div
        className={`${sizeContainerClasses[size]} rounded-2xl flex items-center justify-center font-bold tracking-tight text-white shadow-md border-2 border-slate-700/20 shrink-0`}
        style={{ backgroundColor: avatar?.color || '#3B82F6' }}
      >
        <span className="font-black">{initials}</span>
      </div>
    );
  }

  // Puxa as opções equipadas do aluno (ou ativa todas por defeito se for novo)
  const userEquipped = avatar?.equipped || {
    outfit: true,
    shoes: true,
    hat: true,
    accessory: true,
    item: true,
    companion: true,
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-3xl shadow-lg border-2 border-white ring-4 ring-amber-400/40 select-none overflow-hidden shrink-0 ${sizeContainerClasses[size]}`}
      style={{ backgroundColor: avatar?.color || '#F59E0B' }}
    >
      <div className="w-full h-full transform scale-125 origin-bottom">
        <VectorAvatar
          outfit={userEquipped.outfit}
          shoes={userEquipped.shoes}
          hat={userEquipped.hat}
          accessory={userEquipped.accessory}
          item={userEquipped.item}
          companion={userEquipped.companion}
          size="w-full h-full"
        />
      </div>
    </div>
  );
};