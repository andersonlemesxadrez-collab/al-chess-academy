import React, { useMemo } from 'react';
import { PieceIcon } from './ChessPieces';
import type { PieceColor, PieceType } from './ChessPieces';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const LIGHT = '#cbd5e1';
const DARK = '#64748b';

function parseFen(fen: string): Record<string, { type: PieceType; color: PieceColor }> {
  const out: Record<string, { type: PieceType; color: PieceColor }> = {};
  fen
    .split(' ')[0]
    .split('/')
    .forEach((row, r) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) {
          f += Number(ch);
        } else {
          out[`${FILES[f]}${8 - r}`] = {
            type: ch.toLowerCase() as PieceType,
            color: ch === ch.toUpperCase() ? 'w' : 'b',
          };
          f++;
        }
      }
    });
  return out;
}

export interface ChessBoardProps {
  fen: string;
  orientation?: PieceColor;
  selected?: string | null;
  /** Casas para onde a peça selecionada pode ir. */
  targets?: string[];
  lastMove?: { from: string; to: string } | null;
  /** Casa do rei em xeque. */
  checkSquare?: string | null;
  /** Casa destacada em vermelho (ex.: lance errado na revisão). */
  markSquare?: string | null;
  onSquareClick?: (square: string) => void;
}

/**
 * Tabuleiro responsivo. Usa o truque do padding-bottom em vez de `aspect-ratio`
 * (que não existe no iOS anterior ao 15) e inline styles nas partes críticas,
 * para ficar idêntico no Android, no iOS e no desktop.
 */
export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation = 'w',
  selected,
  targets = [],
  lastMove,
  checkSquare,
  markSquare,
  onSquareClick,
}) => {
  const pieces = useMemo(() => parseFen(fen), [fen]);
  const files = orientation === 'w' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();
  const interactive = !!onSquareClick;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
          border: '1px solid #334155',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
          }}
        >
          {ranks.flatMap((r, ri) =>
            files.map((f, fi) => {
              const sq = `${f}${r}`;
              const dark = (FILES.indexOf(f) + Number(r)) % 2 === 1;
              const piece = pieces[sq];
              const isTarget = targets.includes(sq);
              const isLast = lastMove?.from === sq || lastMove?.to === sq;
              const coordColor = dark ? '#e2e8f0' : '#475569';

              return (
                <button
                  key={sq}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onSquareClick?.(sq)}
                  aria-label={`${sq}${piece ? `, ${piece.color === 'w' ? 'branca' : 'preta'}` : ''}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    margin: 0,
                    border: 0,
                    borderRadius: 0,
                    background: dark ? DARK : LIGHT,
                    boxShadow: selected === sq ? 'inset 0 0 0 4px #3b82f6' : 'none',
                    cursor: interactive ? 'pointer' : 'default',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    opacity: 1,
                  }}
                >
                  {isLast && (
                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(245,158,11,0.45)' }} />
                  )}
                  {markSquare === sq && (
                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(239,68,68,0.55)' }} />
                  )}
                  {checkSquare === sq && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0) 70%)',
                      }}
                    />
                  )}

                  {fi === 0 && (
                    <span style={{ position: 'absolute', top: 1, left: 3, fontSize: 10, fontWeight: 700, lineHeight: 1, color: coordColor }}>
                      {r}
                    </span>
                  )}
                  {ri === 7 && (
                    <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 10, fontWeight: 700, lineHeight: 1, color: coordColor }}>
                      {f}
                    </span>
                  )}

                  {piece && (
                    <span style={{ position: 'relative', width: '90%', height: '90%', display: 'block' }}>
                      <PieceIcon type={piece.type} color={piece.color} />
                    </span>
                  )}

                  {isTarget && !piece && (
                    <span
                      style={{
                        position: 'absolute',
                        width: '28%',
                        height: '28%',
                        borderRadius: '50%',
                        background: 'rgba(37,99,235,0.7)',
                      }}
                    />
                  )}
                  {isTarget && piece && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: 3,
                        right: 3,
                        bottom: 3,
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 4px rgba(37,99,235,0.75)',
                      }}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};
