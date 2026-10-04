import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPieceSvg: React.FC<PieceProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#1A1A1A';
  const stroke = isWhite ? '#1E293B' : '#FFFFFF';
  const strokeWidth = 1.5;

  switch (type.toLowerCase()) {
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill} />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23v.5C20 16 10.5 13 6.5 19.5c-3 6 5 10.5 5 10.5v7z" fill={fill} />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
          </g>
        </svg>
      );
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} fillRule="evenodd" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm9-2.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm9 2.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 12l4 14h25l4-14-6 6-6.5-8-4 8-4-8-6.5 8z" />
            <path d="M9 26c8.5-1.5 18.5-1.5 27 0l-1.5 7h-24z" />
            <path d="M9 33c9-1 18-1 27 0v3.5c-9 1-18 1-27 0z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1 3.5.5 1 1.5 1.5 1.5 2.5h20c0-1 1-1.5 1.5-2.5.5-1 .5-2.5-1-3.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4" fill="none" />
          </g>
        </svg>
      );
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} fillRule="evenodd" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-13.5h14l1.5 13.5H14zM11 14h23v4H11v-4z" />
            <path d="M12 14v-4h3v2h3v-2h6v2h3v-2h6v4H12z" />
            <path d="M14 29.5v-13h17v13H14z" stroke="none" fill={isWhite ? '#F1F5F9' : '#334155'} />
          </g>
        </svg>
      );
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <g fill={fill}>
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <circle cx="22.5" cy="8.5" r="1.5" />
            </g>
            <path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5" />
          </g>
        </svg>
      );
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={fill} />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.74-1 2-1 0-.58-1.1-1-1-1 0-.96 1.44-2 1-1.04-.44-2.04-.9-2-2 0-1.74 3.73-3.64 4-5 1.4-1.73.57-2.61.5-4.5-.47-2.73 4.29-6.3 6-7.5C18.5 7 21 6.5 22.5 8c2 .5 2 1.5 1.5 2z" fill={fill} />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5.5-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill={stroke} />
            <path d="M24.55 10.4s.78 4.25-1.55 6.6c-2.33 2.35-7 3.5-7 3.5" />
          </g>
        </svg>
      );
    case 'p':
    default:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
            <path d="M22.5 17c-2.76 0-5 2.24-5 5 0 1.95 1.13 3.63 2.76 4.45L18.5 32h8l-1.76-5.55C26.37 25.63 27.5 23.95 27.5 22c0-2.76-2.24-5-5-5z" />
            <path d="M12 37.5c3-1 18-1 21 0v-2.5c-3-1-18-1-21 0v2.5z" />
            <path d="M15 35c2.5-.5 12.5-.5 15 0" fill="none" />
          </g>
        </svg>
      );
  }
};
