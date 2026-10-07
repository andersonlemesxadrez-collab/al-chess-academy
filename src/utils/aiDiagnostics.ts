import { Chess } from 'chess.js';
import type { Color } from 'chess.js';
import type { StockfishClient } from './stockfishClient';

export const WEAKNESS = {
  opening: 'Erros de Abertura',
  tactics: 'Visão Tática / Penduradas',
  middlegame: 'Cálculo no Meio-jogo',
  endgame: 'Finais',
  kingSafety: 'Segurança do Rei',
} as const;

export type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface BlunderInfo {
  ply: number;
  moveNumber: number;
  san: string;
  fenBefore: string;
  cpLoss: number;
  phase: GamePhase;
  category: string;
  lostPiece?: string;
  bestReply?: string;
}

export interface DiagnosticReport {
  analyzedMoves: number;
  averageCpLoss: number;
  blunders: BlunderInfo[];
  mistakes: number;
  weaknesses: string[];
  summary: string;
}

export interface AnalyzeInput {
  moves?: string[];
  pgn?: string;
  playerColor: Color;
}

export interface AnalyzeOptions {
  depth?: number;
  openingPlies?: number;
  recentPlies?: number;
  blunderThreshold?: number;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
}

const MATE_CP = 10000;
const CLAMP_CP = 1000;
const MISTAKE_THRESHOLD = 100;
const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

const clamp = (v: number) => Math.max(-CLAMP_CP, Math.min(CLAMP_CP, v));

const TIPS: Record<string, string> = {
  [WEAKNESS.opening]: 'Revise os princípios: desenvolva as peças, controle o centro e faça o roque cedo.',
  [WEAKNESS.tactics]: 'Antes de mover, confira se alguma peça ficou sem defesa e quais capturas o adversário tem.',
  [WEAKNESS.middlegame]: 'Calcule as respostas do adversário a cada lance e compare dois planos antes de decidir.',
  [WEAKNESS.endgame]: 'Treine finais básicos: oposição, regra do quadrado e finais de torre.',
  [WEAKNESS.kingSafety]: 'Verifique ameaças de xeque e mate antes de abrir linhas perto do seu rei.',
};

function nonPawnMaterial(fen: string): number {
  let total = 0;
  for (const ch of fen.split(' ')[0]) {
    const piece = ch.toLowerCase();
    if (piece !== 'p' && PIECE_VALUE[piece]) total += PIECE_VALUE[piece];
  }
  return total;
}

function phaseAt(ply: number, fen: string): GamePhase {
  if (ply < 20) return 'opening';
  return nonPawnMaterial(fen) <= 24 ? 'endgame' : 'middlegame';
}

interface Evaluation {
  cp: number;
  best?: string; 
}

async function evaluate(fen: string, engine: StockfishClient, depth: number): Promise<Evaluation> {
  const g = new Chess(fen);
  if (g.isCheckmate()) return { cp: g.turn() === 'w' ? -MATE_CP : MATE_CP };
  if (g.isGameOver()) return { cp: 0 };
  const r = await engine.search(fen, { depth });
  return { cp: r.cp, best: r.bestmove };
}

export function mergeWeaknesses(existing: string[] = [], found: string[] = []): string[] {
  return Array.from(new Set([...existing, ...found]));
}

export async function analyzeGame(
  input: AnalyzeInput,
  engine: StockfishClient,
  options: AnalyzeOptions = {},
): Promise<DiagnosticReport> {
  const {
    depth = 8,
    openingPlies = 20,
    recentPlies = 30,
    blunderThreshold = 200,
    signal,
    onProgress,
  } = options;

  const game = new Chess();
  if (input.pgn) game.loadPgn(input.pgn);
  else (input.moves ?? []).forEach((m) => game.move(m));
  const moves = game.history({ verbose: true });
  const n = moves.length;

  const empty: DiagnosticReport = {
    analyzedMoves: 0,
    averageCpLoss: 0,
    blunders: [],
    mistakes: 0,
    weaknesses: [],
    summary: 'Partida curta demais para gerar um diagnóstico.',
  };
  if (n === 0) return empty;

  const fens = [moves[0].before, ...moves.map((m) => m.after)];
  const wanted = new Set<number>();
  for (let i = 0; i <= Math.min(n, openingPlies); i++) wanted.add(i);
  for (let i = Math.max(0, n - recentPlies); i <= n; i++) wanted.add(i);
  const order = [...wanted].sort((a, b) => a - b);

  const evals = new Map<number, Evaluation>();
  for (let k = 0; k < order.length; k++) {
    if (signal?.aborted) break;
    evals.set(order[k], await evaluate(fens[order[k]], engine, depth));
    onProgress?.(k + 1, order.length);
  }

  const blunders: BlunderInfo[] = [];
  let mistakes = 0;
  let analyzedMoves = 0;
  let totalLoss = 0;

  for (let i = 0; i < n; i++) {
    const mv = moves[i];
    const before = evals.get(i);
    const after = evals.get(i + 1);
    if (mv.color !== input.playerColor || !before || !after) continue;

    const sign = mv.color === 'w' ? 1 : -1;
    const b = clamp(before.cp * sign);
    const a = clamp(after.cp * sign);
    const loss = Math.max(0, b - a);
    analyzedMoves++;
    totalLoss += loss;

    if (loss >= MISTAKE_THRESHOLD && loss < blunderThreshold) mistakes++;

    const isBlunder = loss >= blunderThreshold && b > -600 && a < 700;
    if (!isBlunder) continue;

    const phase = phaseAt(i, mv.before);
    const matedAfter = after.cp * sign <= -9000;

    let lostPiece: string | undefined;
    let bestReply: string | undefined;
    if (after.best && after.best !== '(none)') {
      try {
        const reply = new Chess(mv.after).move({
          from: after.best.slice(0, 2),
          to: after.best.slice(2, 4),
          promotion: after.best[4],
        });
        bestReply = reply.san;
        lostPiece = reply.captured;
      } catch {}
    }

    let category: string = WEAKNESS.middlegame;
    if (matedAfter) category = WEAKNESS.kingSafety;
    else if (phase === 'opening') category = WEAKNESS.opening;
    else if (phase === 'endgame') category = WEAKNESS.endgame;
    else if (lostPiece && lostPiece !== 'p') category = WEAKNESS.tactics;

    blunders.push({
      ply: i,
      moveNumber: Math.floor(i / 2) + 1,
      san: mv.san,
      fenBefore: mv.before,
      cpLoss: loss,
      phase,
      category,
      lostPiece,
      bestReply,
    });
  }

  const counts = new Map<string, number>();
  blunders.forEach((b) => counts.set(b.category, (counts.get(b.category) ?? 0) + 1));
  const weaknesses = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const summary = blunders.length
    ? `${blunders.length} erro(s) grave(s) detectado(s). Ponto fraco principal: ${weaknesses[0]}. ${TIPS[weaknesses[0]]}`
    : 'Nenhum erro grave nos lances analisados. Continue assim!';

  return {
    analyzedMoves,
    averageCpLoss: analyzedMoves ? Math.round(totalLoss / analyzedMoves) : 0,
    blunders,
    mistakes,
    weaknesses,
    summary,
  };
}