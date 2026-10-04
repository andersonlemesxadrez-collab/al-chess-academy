import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { sounds } from '../../utils/audio';
import {
  RotateCcw,
  Trash2,
  Play,
  RotateCw,
  Copy,
  Check,
  Disc,
  ArrowRight,
  Hand,
  Eraser,
  RefreshCw,
} from 'lucide-react';

interface PositionEditorProps {
  initialFen?: string;
  initialSolutionMoves?: string[];
  initialTurn?: 'w' | 'b';
  onChange: (data: {
    fen: string;
    turn: 'w' | 'b';
    solutionMoves: string[];
  }) => void;
}

type PaletteTool = 
  | { type: PieceSymbol; color: Color }
  | 'erase'
  | 'hand';

const PALETTE_WHITE: PieceSymbol[] = ['k', 'q', 'r', 'b', 'n', 'p'];
const PALETTE_BLACK: PieceSymbol[] = ['k', 'q', 'r', 'b', 'n', 'p'];

export const PositionEditor: React.FC<PositionEditorProps> = ({
  initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  initialSolutionMoves = [],
  initialTurn = 'w',
  onChange,
}) => {
  // 8x8 Board representation: matrix of { type, color } | null
  const [boardState, setBoardState] = useState<((null | { type: PieceSymbol; color: Color })[])[]>(() => {
    try {
      const g = new Chess(initialFen);
      return g.board();
    } catch {
      return new Chess().board();
    }
  });

  const [activeTool, setActiveTool] = useState<PaletteTool>('hand');
  const [turn, setTurn] = useState<'w' | 'b'>(initialTurn);
  const [castling, setCastling] = useState({
    K: true,
    Q: true,
    k: true,
    q: true,
  });
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [fenInput, setFenInput] = useState<string>(initialFen);
  const [copiedFen, setCopiedFen] = useState(false);

  // Recording moves mode
  const [recordMode, setRecordMode] = useState<boolean>(false);
  const [recordedGame, setRecordedGame] = useState<Chess | null>(null);
  const [recordedMoves, setRecordedMoves] = useState<string[]>(initialSolutionMoves);
  const [recordingFen, setRecordingFen] = useState<string>(initialFen);
  const [selectedRecordSquare, setSelectedRecordSquare] = useState<Square | null>(null);
  const [validRecordMoves, setValidRecordMoves] = useState<Square[]>([]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = orientation === 'white' ? files : [...files].reverse();
  const displayedRanks = orientation === 'white' ? ranks : [...ranks].reverse();

  // Generate valid FEN from current boardState
  const generateFen = (
    board: (null | { type: PieceSymbol; color: Color })[][],
    currentTurn: 'w' | 'b',
    castlingRights = castling
  ): string => {
    let fenRows: string[] = [];

    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      let rowStr = '';

      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          const char = piece.type;
          rowStr += piece.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        }
      }

      if (emptyCount > 0) {
        rowStr += emptyCount;
      }
      fenRows.push(rowStr);
    }

    let castlingStr = '';
    if (castlingRights.K) castlingStr += 'K';
    if (castlingRights.Q) castlingStr += 'Q';
    if (castlingRights.k) castlingStr += 'k';
    if (castlingRights.q) castlingStr += 'q';
    if (!castlingStr) castlingStr = '-';

    return `${fenRows.join('/')} ${currentTurn} ${castlingStr} - 0 1`;
  };

  // Sync board with initialFen when prop changes externally
  useEffect(() => {
    try {
      const g = new Chess(initialFen);
      setBoardState(g.board());
      setFenInput(initialFen);
    } catch {
      // ignore
    }
  }, [initialFen]);

  const updatePosition = (
    newBoard: (null | { type: PieceSymbol; color: Color })[][],
    newTurn: 'w' | 'b',
    newCastling = castling
  ) => {
    setBoardState(newBoard);
    const newFen = generateFen(newBoard, newTurn, newCastling);
    setFenInput(newFen);
    onChange({
      fen: newFen,
      turn: newTurn,
      solutionMoves: recordedMoves,
    });
  };

  // Click on a board square in Setup Mode
  const handleSquareClickSetup = (rIdx: number, cIdx: number) => {
    const file = displayedFiles[cIdx];
    const rank = displayedRanks[rIdx];
    const originalR = 8 - parseInt(rank);
    const originalC = files.indexOf(file);

    const newBoard = boardState.map((row) => [...row]);

    if (activeTool === 'erase') {
      newBoard[originalR][originalC] = null;
      sounds.playCapture();
    } else if (typeof activeTool === 'object') {
      newBoard[originalR][originalC] = {
        type: activeTool.type,
        color: activeTool.color,
      };
      sounds.playMove();
    } else if (activeTool === 'hand') {
      // If clicking with hand, toggle or erase on second click
      // For drag or select
    }

    updatePosition(newBoard, turn);
  };

  // Quick Action Buttons
  const handleSetStartingPosition = () => {
    const g = new Chess();
    setBoardState(g.board());
    setTurn('w');
    setCastling({ K: true, Q: true, k: true, q: true });
    updatePosition(g.board(), 'w', { K: true, Q: true, k: true, q: true });
    sounds.playMove();
  };

  const handleClearBoard = () => {
    const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    setBoardState(emptyBoard);
    updatePosition(emptyBoard, turn);
    sounds.playCapture();
  };

  const handleFenInputChange = (val: string) => {
    setFenInput(val);
    try {
      const g = new Chess(val);
      setBoardState(g.board());
      const newTurn = g.turn();
      setTurn(newTurn);
      onChange({
        fen: val,
        turn: newTurn,
        solutionMoves: recordedMoves,
      });
    } catch {
      // waiting for valid FEN
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fenInput);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Recording moves mode toggle
  const toggleRecordMode = () => {
    if (!recordMode) {
      // Start recording moves from current FEN
      try {
        const curFen = generateFen(boardState, turn);
        const g = new Chess(curFen);
        setRecordedGame(g);
        setRecordingFen(curFen);
        setRecordMode(true);
        setSelectedRecordSquare(null);
        setValidRecordMoves([]);
        sounds.playCheck();
      } catch {
        alert('A posição atual precisa ter Reis legais para gravar lances de jogo!');
      }
    } else {
      setRecordMode(false);
      setRecordedGame(null);
    }
  };

  const handleRecordSquareClick = (square: Square) => {
    if (!recordedGame) return;

    if (selectedRecordSquare) {
      if (selectedRecordSquare === square) {
        setSelectedRecordSquare(null);
        setValidRecordMoves([]);
        return;
      }

      if (validRecordMoves.includes(square)) {
        try {
          const move = recordedGame.move({
            from: selectedRecordSquare,
            to: square,
            promotion: 'q',
          });

          if (move) {
            if (move.captured) sounds.playCapture();
            else sounds.playMove();

            const newMoves = [...recordedMoves, move.san];
            setRecordedMoves(newMoves);
            setRecordingFen(recordedGame.fen());
            onChange({
              fen: generateFen(boardState, turn),
              turn,
              solutionMoves: newMoves,
            });
          }
        } catch {
          sounds.playError();
        }

        setSelectedRecordSquare(null);
        setValidRecordMoves([]);
        return;
      }
    }

    const piece = recordedGame.get(square);
    if (piece && piece.color === recordedGame.turn()) {
      setSelectedRecordSquare(square);
      const moves = recordedGame.moves({ square, verbose: true });
      setValidRecordMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedRecordSquare(null);
      setValidRecordMoves([]);
    }
  };

  const handleClearMoves = () => {
    const curFen = generateFen(boardState, turn);
    const g = new Chess(curFen);
    setRecordedGame(g);
    setRecordingFen(curFen);
    setRecordedMoves([]);
    onChange({
      fen: curFen,
      turn,
      solutionMoves: [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 rounded-2xl border border-slate-200">
        {/* Quick presets */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSetStartingPosition}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Posição Inicial</span>
          </button>

          <button
            type="button"
            onClick={handleClearBoard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Tabuleiro</span>
          </button>

          <button
            type="button"
            onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Inverter ({orientation === 'white' ? 'Brancas' : 'Pretas'})</span>
          </button>
        </div>

        {/* Turn to move */}
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600">Vez de:</span>
          <label className="flex items-center gap-1 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="radio"
              name="turnSelect"
              checked={turn === 'w'}
              onChange={() => {
                setTurn('w');
                updatePosition(boardState, 'w');
              }}
              className="text-blue-600 cursor-pointer"
            />
            <span>Brancas</span>
          </label>
          <label className="flex items-center gap-1 text-xs font-bold text-slate-800 cursor-pointer ml-1">
            <input
              type="radio"
              name="turnSelect"
              checked={turn === 'b'}
              onChange={() => {
                setTurn('b');
                updatePosition(boardState, 'b');
              }}
              className="text-blue-600 cursor-pointer"
            />
            <span>Pretas</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Piece Palette */}
        <div className="lg:col-span-3 flex lg:flex-col flex-wrap gap-3">
          {/* Black Pieces Palette */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 w-full">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Peças Pretas
            </span>
            <div className="grid grid-cols-6 lg:grid-cols-3 gap-1.5">
              {PALETTE_BLACK.map((p) => {
                const isSelected =
                  typeof activeTool === 'object' &&
                  activeTool.color === 'b' &&
                  activeTool.type === p;
                return (
                  <button
                    key={`b-${p}`}
                    type="button"
                    onClick={() => setActiveTool({ type: p, color: 'b' })}
                    className={`aspect-square p-1 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 scale-105'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7">
                      <ChessPieceSvg type={p} color="b" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* White Pieces Palette */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 w-full">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Peças Brancas
            </span>
            <div className="grid grid-cols-6 lg:grid-cols-3 gap-1.5">
              {PALETTE_WHITE.map((p) => {
                const isSelected =
                  typeof activeTool === 'object' &&
                  activeTool.color === 'w' &&
                  activeTool.type === p;
                return (
                  <button
                    key={`w-${p}`}
                    type="button"
                    onClick={() => setActiveTool({ type: p, color: 'w' })}
                    className={`aspect-square p-1 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 scale-105'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7">
                      <ChessPieceSvg type={p} color="w" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Tools: Hand & Eraser */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={() => setActiveTool('hand')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                activeTool === 'hand'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>Mover</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('erase')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                activeTool === 'erase'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-rose-600 border-slate-200 hover:bg-rose-50'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Apagar</span>
            </button>
          </div>
        </div>

        {/* Center: The Board */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[440px] aspect-square select-none shadow-xl rounded-2xl overflow-hidden border-4 border-[#1E293B] bg-[#1E293B]">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {displayedRanks.map((rank, rIdx) =>
                displayedFiles.map((file, cIdx) => {
                  const square = `${file}${rank}` as Square;
                  const isLight =
                    (displayedFiles.indexOf(file) + displayedRanks.indexOf(rank)) % 2 === 0;

                  const originalR = 8 - parseInt(rank);
                  const originalC = files.indexOf(file);

                  const piece = recordMode && recordedGame
                    ? recordedGame.get(square)
                    : boardState[originalR]?.[originalC];

                  const isSelectedRecord = selectedRecordSquare === square;
                  const isValidRecord = validRecordMoves.includes(square);

                  return (
                    <div
                      key={square}
                      onClick={() => {
                        if (recordMode) {
                          handleRecordSquareClick(square);
                        } else {
                          handleSquareClickSetup(rIdx, cIdx);
                        }
                      }}
                      className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                        isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]'
                      }`}
                    >
                      {/* Highlight in record mode */}
                      {isSelectedRecord && (
                        <div className="absolute inset-0 bg-amber-400/50 ring-4 ring-amber-400 ring-inset pointer-events-none" />
                      )}

                      {/* Valid target dot in record mode */}
                      {isValidRecord && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          {piece ? (
                            <div className="w-full h-full rounded-full border-4 border-green-600/60" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-green-600/60 shadow-sm" />
                          )}
                        </div>
                      )}

                      {/* Rank & File label */}
                      {cIdx === 0 && (
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

                      {/* Piece Icon */}
                      {piece && (
                        <div className="relative w-[85%] h-[85%] z-20 flex items-center justify-center transform transition-transform hover:scale-105">
                          <ChessPieceSvg
                            type={piece.type}
                            color={piece.color}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            {recordMode
              ? '🔴 Modo Gravação Ativo: Jogue os lances no tabuleiro para gravar a solução!'
              : 'Clique nas peças da paleta à esquerda e depois nas casas para adicionar ou remover.'}
          </p>
        </div>

        {/* Right Side: Move Recorder & FEN */}
        <div className="lg:col-span-3 space-y-4">
          {/* Solution Moves Recorder */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Disc className={`w-4 h-4 ${recordMode ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
                <span>Lances de Solução</span>
              </span>

              <button
                type="button"
                onClick={toggleRecordMode}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs ${
                  recordMode
                    ? 'bg-rose-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {recordMode ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Concluir</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Gravar no Tabuleiro</span>
                  </>
                )}
              </button>
            </div>

            {/* Recorded moves list */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-16 flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {recordedMoves.length === 0 ? (
                <span className="text-slate-400 text-[11px] font-sans">
                  Nenhum lance gravado. Clique em &ldquo;Gravar no Tabuleiro&rdquo; e jogue os lances da solução!
                </span>
              ) : (
                recordedMoves.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-blue-700 shadow-xs"
                  >
                    {idx + 1}. {m}
                  </span>
                ))
              )}
            </div>

            {recordedMoves.length > 0 && (
              <button
                type="button"
                onClick={handleClearMoves}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar lances gravados</span>
              </button>
            )}
          </div>

          {/* Castling rights */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Direitos de Roque
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.K}
                  onChange={(e) => {
                    const c = { ...castling, K: e.target.checked };
                    setCastling(c);
                    updatePosition(boardState, turn, c);
                  }}
                  className="rounded text-blue-600"
                />
                <span>Brancas O-O</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.Q}
                  onChange={(e) => {
                    const c = { ...castling, Q: e.target.checked };
                    setCastling(c);
                    updatePosition(boardState, turn, c);
                  }}
                  className="rounded text-blue-600"
                />
                <span>Brancas O-O-O</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.k}
                  onChange={(e) => {
                    const c = { ...castling, k: e.target.checked };
                    setCastling(c);
                    updatePosition(boardState, turn, c);
                  }}
                  className="rounded text-blue-600"
                />
                <span>Pretas O-O</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.q}
                  onChange={(e) => {
                    const c = { ...castling, q: e.target.checked };
                    setCastling(c);
                    updatePosition(boardState, turn, c);
                  }}
                  className="rounded text-blue-600"
                />
                <span>Pretas O-O-O</span>
              </label>
            </div>
          </div>

          {/* FEN String display */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Código FEN
              </span>
              <button
                type="button"
                onClick={handleCopyFen}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {copiedFen ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFen ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <input
              type="text"
              value={fenInput}
              onChange={(e) => handleFenInputChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
