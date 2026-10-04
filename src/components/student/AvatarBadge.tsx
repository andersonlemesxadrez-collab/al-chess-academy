import React from 'react';
import { Student } from '../../types/chess';

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
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-base',
    lg: 'w-24 h-36 text-2xl',
    xl: 'w-32 h-48 text-4xl',
  };

  const getBaseEmoji = (base?: string) => {
    switch (base) {
      case 'skater': return '🛹';
      case 'ninja': return '🥷';
      case 'zombie': return '🧟';
      case 'robot': return '🤖';
      case 'alien': return '👽';
      case 'lion': return '🦁';
      case 'bear': return '🐻';
      default: return '🧑‍🎤';
    }
  };

  const getHairEmoji = (hair?: string) => {
    switch (hair) {
      case 'punk_hair': return '🔥';
      case 'blue_fade': return '💙';
      case 'afro_puff': return '👑';
      case 'crown': return '👑';
      case 'wizard_hat': return '🧙‍♂️';
      default: return null;
    }
  };

  const getOutfitEmoji = (outfit?: string) => {
    switch (outfit) {
      case 'hoodie': return '🧥';
      case 'suit': return '🕴️';
      case 'sport_shirt': return '👕';
      case 'rock_jacket': return '🎸';
      default: return '👕';
    }
  };

  const getAccessoryEmoji = (acc?: string) => {
    switch (acc) {
      case 'shades': return '🕶️';
      case 'gold_chain': return '🪙';
      case 'headphones': return '🎧';
      default: return null;
    }
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
        className={`${sizeContainerClasses[size]} rounded-2xl flex items-center justify-center font-bold tracking-tight text-white shadow-md border-2 border-slate-700/20`}
        style={{ backgroundColor: avatar.color || '#3B82F6' }}
      >
        <span className="font-black">{initials}</span>
      </div>
    );
  }

  // Visualizador de Corpo Inteiro Estilizado
  return (
    <div
      className={`relative flex flex-col items-center justify-between p-2 rounded-2xl shadow-lg border-2 border-white ring-4 ring-amber-400/40 select-none transition transform hover:scale-105 ${sizeContainerClasses[size]}`}
      style={{ backgroundColor: avatar.color || '#F59E0B' }}
    >
      {/* Cabeça / Cabelo / Chapéu */}
      <div className="relative flex items-center justify-center">
        {avatar.hair && (
          <span className="absolute -top-3 z-20 transform -rotate-12 drop-shadow-md">
            {getHairEmoji(avatar.hair)}
          </span>
        )}
        <span className="text-2xl sm:text-3xl filter drop-shadow">
          {getBaseEmoji(avatar.base)}
        </span>
      </div>

      {/* Roupa de Corpo Inteiro */}
      <div className="relative flex items-center justify-center bg-white/30 w-full rounded-xl py-1 my-1">
        <span className="text-xl sm:text-2xl">
          {getOutfitEmoji(avatar.outfit)}
        </span>
        {avatar.accessory && (
          <span className="absolute -right-1 bottom-0 text-sm">
            {getAccessoryEmoji(avatar.accessory)}
          </span>
        )}
      </div>

      {/* Sapatos / Base dos Pés */}
      <div className="w-8 h-1.5 bg-slate-900/30 rounded-full" />
    </div>
  );
};