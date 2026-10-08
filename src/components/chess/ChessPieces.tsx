import React from 'react';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

/**
 * Peças desenhadas em SVG. Substituem os caracteres Unicode (♚ ♛ ♜ ♝ ♞ ♟),
 * que o iOS troca por emoji ou por fontes diferentes das do Android.
 * Todas usam a grade 45x45.
 */
const SHAPES: Record<PieceType, (p: React.SVGProps<SVGPathElement>) => React.ReactNode> = {
  p: (d) => (
    <>
      <circle cx="22.5" cy="14" r="5.5" {...(d as object)} />
      <path d="M16 35 C16 28 19.5 26 20 21 H25 C25.5 26 29 28 29 35 Z" {...d} />
      <path d="M10 38.5 V35 H35 V38.5 Z" {...d} />
    </>
  ),
  r: (d) => (
    <path
      d="M12 38.5 V35 L15 32 V19 L12 16 V9 H17.5 V12 H20.5 V9 H24.5 V12 H27.5 V9 H33 V16 L30 19 V32 L33 35 V38.5 Z"
      {...d}
    />
  ),
  n: (d) => (
    <>
      <path
        d="M12 38.5 C12 30 15 24 20 20 C18 19 15 20 13 22 L11 21 C12 18 15 12 20 9 L20.5 5.5 L24 8.5 C31 9 36 16 35.5 38.5 Z"
        {...d}
      />
      <circle cx="19.5" cy="13.5" r="1.3" fill="currentColor" />
    </>
  ),
  b: (d) => (
    <>
      <path d="M13 38.5 V35.5 C13 32 18 31 18.5 27 H26.5 C27 31 32 32 32 35.5 V38.5 Z" {...d} />
      <path
        d="M22.5 7 C28 12 30.5 17 28 21.5 C27 23.5 26.5 25 26.5 27 H18.5 C18.5 25 18 23.5 17 21.5 C14.5 17 17 12 22.5 7 Z"
        {...d}
      />
      <circle cx="22.5" cy="6" r="2.2" {...(d as object)} />
      <path d="M21 14 L25 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  q: (d) => (
    <>
      <path
        d="M12 38.5 V35 L8.5 15 L15.5 24 L15 9.5 L20 23 L22.5 8 L25 23 L30 9.5 L29.5 24 L36.5 15 L33 35 V38.5 Z"
        {...d}
      />
      {[
        [8.5, 14],
        [15, 8.5],
        [22.5, 6.5],
        [30, 8.5],
        [36.5, 14],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" {...(d as object)} />
      ))}
    </>
  ),
  k: (d) => (
    <>
      <path
        d="M12 38.5 V35 C12 31 16 29 16.5 24 C15 21 12 20 12 16.5 C12 13 15 12 17.5 12.5 C19.5 13 21 14 22.5 17 C24 14 25.5 13 27.5 12.5 C30 12 33 13 33 16.5 C33 20 30 21 28.5 24 C29 29 33 31 33 35 V38.5 Z"
        {...d}
      />
      <path d="M22.5 17 V5 M19 8.5 H26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  style?: React.CSSProperties;
}

export const PieceIcon: React.FC<PieceIconProps> = ({ type, color, style }) => {
  const white = color === 'w';
  const fill = white ? '#ffffff' : '#1f2937';
  const stroke = white ? '#0f172a' : '#e2e8f0';
  const shapeProps = {
    fill,
    stroke,
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg
      viewBox="0 0 45 45"
      focusable="false"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%', color: stroke, pointerEvents: 'none', ...style }}
    >
      {SHAPES[type](shapeProps)}
    </svg>
  );
};
