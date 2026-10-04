import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { sounds } from '../../utils/audio';

export interface ChessBoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  onMove?: (move: { from: Square; to: Square; promotion?: string; san: string }) => boolean | void;
  interactive?: boolean;
  highlightSquares?: string[];
  arrows?: [string, string][];
  showCoordinates?: boolean;
  customSquareStyles?: Record<string, string>;
  lastMove?: { from: string; to: string } | null;
  // NOVO: Exibe lances tentados que foram incorretos (como um rastro vermelho)
  wrongMovesHistory?: string[]; 
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation = 'white',
  onMove,
  interactive = true,
  highlightSquares = [],
  arrows = [],
  showCoordinates = true,
  customSquareStyles = {},
  lastMove = null,
  wrongMovesHistory = [],
}) => {
  const [game, setGame] = useState<Chess>(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Sync game instance with fen changes
  useEffect(() => {
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setSelectedSquare(null);
      setValidMoves([]);
    } catch {
      // In case of invalid FEN, keep current
    }
  }, [fen]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = orientation === 'white' ? files : [...files].reverse();
  const displayedRanks = orientation === 'white' ? ranks : [...ranks].reverse();

  // Find king in check
  let kingInCheckSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          kingInCheckSquare = `${files[c]}${8 - r}` as Square;
        }
      }
    }
  }

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    // If already selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Check if valid destination
      if (validMoves.includes(square)) {
        executeMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
    }

    // Otherwise select piece if matching current turn
    const piece = game.get(square);
    if (piece) {
      // Allow selecting own pieces to move
      if (piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setValidMoves(moves.map(m => m.to as Square));
      }
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const executeMove = (from: Square, to: Square) => {
    try {
      const piece = game.get(from);
      const isPromotion = piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1');
      const promotion = isPromotion ? 'q' : undefined;

      const tempGame = new Chess(game.fen());
      const moveResult = tempGame.move({ from, to, promotion });

      if (moveResult) {
        if (moveResult.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }
        if (tempGame.inCheck()) {
          sounds.playCheck();
        }

        if (onMove) {
          const accepted = onMove({
            from,
            to,
            promotion,
            san: moveResult.san,
          });
          
          // Se onMove retornar falso, significa que foi um lance errado na atividade
          if (accepted === false) {
            sounds.playError();
            // We do not set the tempGame, reverting the move visually
            return;
          }
        }
        setGame(tempGame);
      } else {
        sounds.playError();
      }
    } catch {
      sounds.playError();
    }
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!interactive) return;
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) return;

    setDraggedSquare(square);
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true });
    setValidMoves(moves.map(m => m.to as Square));
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (!interactive || !draggedSquare) return;

    if (validMoves.includes(targetSquare)) {
      executeMove(draggedSquare, targetSquare);
    } else if (draggedSquare !== targetSquare) {
      sounds.playError();
    }

    setDraggedSquare(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const getSquareCoordinates = (square: string) => {
    const file = square[0];
    const rank = square[1];
    const fileIdx = displayedFiles.indexOf(file);
    const rankIdx = displayedRanks.indexOf(rank);
    return {
      x: (fileIdx + 0.5) * 12.5,
      y: (rankIdx + 0.5) * 12.5,
    };
  };

  // Helper to determine if a square is the destination of a wrong move in history
  const isWrongMoveSquare = (square: Square) => {
    return wrongMovesHistory.some(san => {
      try {
        // We use a dummy temp game to parse the SAN and get the 'to' square
        const temp = new Chess(fen);
        const parsed = temp.move(san);
        return parsed && parsed.to === square;
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="relative w-full max-w-[520px] aspect-square select-none shadow-2xl rounded-2xl overflow-hidden border-4 border-[#1E293B] bg-[#1E293B]">
      <div ref={boardRef} className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayedRanks.map((rank, rIdx) =>
          displayedFiles.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const isLight = (displayedFiles.indexOf(file) + displayedRanks.indexOf(rank)) % 2 === 0;
            const piece = game.get(square);
            const isSelected = selectedSquare === square;
            const isValidDestination = validMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheckSquare = kingInCheckSquare === square;
            const isHighlighted = highlightSquares.includes(square);
            const customStyle = customSquareStyles[square];
            const isWrongMoveDest = isWrongMoveSquare(square);

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]'
                } ${customStyle || ''}`}
              >
                {/* Last move indicator */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div className="absolute inset-0 bg-yellow-300/40 pointer-events-none" />
                )}

                {/* Wrong move indicator */}
                {isWrongMoveDest && (
                  <div className="absolute inset-0 bg-rose-500/40 ring-2 ring-rose-500 ring-inset pointer-events-none" />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-400/50 ring-4 ring-amber-400 ring-inset pointer-events-none" />
                )}

                {/* Custom highlight */}
                {isHighlighted && (
                  <div className="absolute inset-0 bg-blue-400/40 ring-2 ring-blue-500 ring-inset pointer-events-none" />
                )}

                {/* King in check red radial pulse */}
                {isCheckSquare && (
                  <div className="absolute inset-0 bg-radial from-red-600/80 via-red-500/40 to-transparent animate-pulse pointer-events-none" />
                )}

                {/* Valid move target markers */}
                {isValidDestination && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {piece ? (
                      <div className="w-full h-full rounded-full border-4 border-green-600/60" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-green-600/60 shadow-sm" />
                    )}
                  </div>
                )}

                {/* Rank & File labels */}
                {showCoordinates && (
                  <>
                    {fIdx === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none ${
                          isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'
                        }`}
                      >
                        {rank}
                      </span>
                    )}
                    {rIdx === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none ${
                          isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'
                        }`}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Piece */}
                {piece && (
                  <div
                    draggable={interactive && piece.color === game.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`relative w-[85%] h-[85%] z-20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                      interactive && piece.color === game.turn() ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                    }`}
                  >
                    <ChessPieceSvg
                      type={piece.type as PieceSymbol}
                      color={piece.color as Color}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Overlay for arrows */}
      {arrows.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="2.5"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill="#3B82F6" opacity="0.85" />
            </marker>
          </defs>
          {arrows.map(([from, to], i) => {
            const start = getSquareCoordinates(from);
            const end = getSquareCoordinates(to);
            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};