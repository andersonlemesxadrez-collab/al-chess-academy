import React, { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color } from 'chess.js';
import { AlertTriangle, Brain, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Trophy, Flag } from 'lucide-react';
import { ChessBoard } from '../chess/ChessBoard';
import { getCheckSquare } from '../../utils/chessHelpers';
import { WEAKNESS } from '../../utils/aiDiagnostics';

export interface ReviewBlunder {
  /** Índice (a partir de 0) do lance errado dentro da lista de lances. */
  ply: number;
  san: string;
  category: string;
  cpLoss?: number;
  bestReply?: string;
}

interface GameReviewProps {
  /** Lances em notação SAN, na ordem. */
  moves: string[];
  orientation: Color;
  /** Posição inicial, quando a partida não começou do começo. */
  startFen?: string;
  blunders?: ReviewBlunder[];
  result?: { outcome: 'win' | 'loss' | 'draw'; text: string } | null;
  summary?: string;
  /** Mostra "analisando…" enquanto o diagnóstico ainda roda. */
  analyzing?: boolean;
  analysisFailed?: boolean;
}

const FRIENDLY: Record<string, string> = {
  [WEAKNESS.opening]: 'Na abertura, desenvolva as peças e controle o centro antes de atacar.',
  [WEAKNESS.tactics]: 'Uma peça ficou sem defesa. Antes de mover, olhe o que o adversário pode capturar.',
  [WEAKNESS.middlegame]: 'Antes de jogar, pense: o que o adversário pode fazer em resposta?',
  [WEAKNESS.endgame]: 'Nos finais cada lance pesa. Pense com calma no rei e nos peões.',
  [WEAKNESS.kingSafety]: 'Cuidado com o seu rei: havia perigo de xeque-mate.',
};

export const GameReview: React.FC<GameReviewProps> = ({
  moves,
  orientation,
  startFen,
  blunders = [],
  result,
  summary,
  analyzing,
  analysisFailed,
}) => {
  const frames = useMemo(() => {
    let g: Chess;
    try {
      g = new Chess(startFen);
    } catch {
      g = new Chess();
    }
    const fens = [g.fen()];
    const info: ({ from: string; to: string } | null)[] = [null];
    for (const san of moves) {
      try {
        const m = g.move(san);
        fens.push(g.fen());
        info.push({ from: m.from, to: m.to });
      } catch {
        break;
      }
    }
    return { fens, info };
  }, [moves, startFen]);

  const total = frames.fens.length - 1;
  const [ply, setPly] = useState(total);

  // Quando a lista de lances muda (ex.: partida acabou de terminar), vai para o fim.
  useEffect(() => {
    setPly(total);
  }, [total]);

  const go = (n: number) => setPly(Math.max(0, Math.min(total, n)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPly((p) => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setPly((p) => Math.min(total, p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const fen = frames.fens[ply];
  const lastMove = frames.info[ply];
  const blunderByPly = new Map(blunders.map((b) => [b.ply, b]));
  const currentBlunder = ply > 0 ? blunderByPly.get(ply - 1) : undefined;

  const rows: { n: number; w?: number; b?: number }[] = [];
  const firstIsBlack = startFen ? startFen.split(' ')[1] === 'b' : false;
  // índice i do lance -> número do lance; se começa pelas pretas, o primeiro "w" fica vazio
  let idx = 0;
  if (firstIsBlack && moves.length > 0) {
    rows.push({ n: 1, b: 0 });
    idx = 1;
  }
  for (; idx < moves.length; idx += 2) {
    rows.push({ n: rows.length + 1, w: idx, b: idx + 1 < moves.length ? idx + 1 : undefined });
  }

  const moveButton = (i: number | undefined) => {
    if (i === undefined) return <span />;
    const isCurrent = ply === i + 1;
    const bad = blunderByPly.has(i);
    return (
      <button
        type="button"
        onClick={() => go(i + 1)}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-left text-sm font-semibold transition ${
          isCurrent ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        {moves[i]}
        {bad && <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-rose-500'}`} aria-label="lance com erro" />}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {result && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 ${
            result.outcome === 'win' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          {result.outcome === 'win' ? <Trophy className="h-6 w-6 text-emerald-500" /> : <Flag className="h-6 w-6 text-slate-400" />}
          <h3 className="text-base font-bold sm:text-lg">{result.text}</h3>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <ChessBoard
            fen={fen}
            orientation={orientation}
            lastMove={lastMove}
            checkSquare={getCheckSquare(fen)}
            markSquare={currentBlunder ? lastMove?.to : null}
          />

          <div className="mx-auto flex max-w-[600px] items-center justify-between gap-2">
            {[
              { icon: ChevronsLeft, label: 'Início', onClick: () => go(0), disabled: ply === 0 },
              { icon: ChevronLeft, label: 'Lance anterior', onClick: () => go(ply - 1), disabled: ply === 0 },
              { icon: ChevronRight, label: 'Próximo lance', onClick: () => go(ply + 1), disabled: ply === total },
              { icon: ChevronsRight, label: 'Fim', onClick: () => go(total), disabled: ply === total },
            ].map(({ icon: Icon, label, onClick, disabled }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={onClick}
                disabled={disabled}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-semibold text-slate-500">
            {ply === 0 ? 'Posição inicial' : `Após o lance ${ply} de ${total}`}
          </p>

          {currentBlunder && (
            <div className="mx-auto flex max-w-[600px] gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div>
                <p className="font-bold">O lance {currentBlunder.san} foi um erro.</p>
                <p className="mt-1 font-medium">{FRIENDLY[currentBlunder.category] ?? currentBlunder.category}</p>
                {currentBlunder.bestReply && (
                  <p className="mt-1 text-xs font-semibold text-rose-700">O adversário podia responder com {currentBlunder.bestReply}.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 lg:max-h-[420px]">
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum lance registrado.</p>
            ) : (
              <ol className="grid grid-cols-[1.75rem_1fr_1fr] items-center gap-x-1 gap-y-0.5">
                {rows.map((row) => (
                  <li key={row.n} className="contents">
                    <span className="text-xs font-bold text-slate-400">{row.n}.</span>
                    {moveButton(row.w)}
                    {moveButton(row.b)}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {(summary || analyzing || analysisFailed) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-amber-900">
                <Brain className="h-4 w-4" /> Análise do robô
              </h4>
              {analyzing && (
                <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analisando seus lances...
                </p>
              )}
              {analysisFailed && <p className="text-sm font-medium text-amber-700">Não foi possível analisar esta partida.</p>}
              {summary && <p className="text-sm font-medium leading-relaxed text-amber-800">{summary}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
